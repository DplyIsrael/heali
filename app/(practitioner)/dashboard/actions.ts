"use server";

import { createClient } from "@/lib/supabase/server";
import { isCardcomEnabled, chargeToken } from "@/lib/payments/cardcom";

export interface DashboardStats {
  totalClosed: number;
  totalActive: number;
  totalPatients: number;
  totalRevenue: number;
}

export interface RecentBooking {
  id: string;
  patientName: string;
  patientImage: string;
  domain: string;
  scheduledDate: string;
  status: string;
  price: number;
}

export async function fetchDashboardData(): Promise<{
  stats: DashboardStats;
  recentBookings: RecentBooking[];
  practitionerName: string;
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { stats: { totalClosed: 0, totalActive: 0, totalPatients: 0, totalRevenue: 0 }, recentBookings: [], practitionerName: "" };

  // Get user name
  const { data: userData } = await supabase.from("users").select("full_name").eq("id", user.id).single();

  // Get practitioner profile
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { stats: { totalClosed: 0, totalActive: 0, totalPatients: 0, totalRevenue: 0 }, recentBookings: [], practitionerName: userData?.full_name ?? "" };

  // Fetch all bookings for this practitioner
  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      patient_id,
      scheduled_date,
      scheduled_time,
      status,
      price_at_booking,
      domain_id,
      users!bookings_patient_id_fkey (
        full_name
      )
    `)
    .eq("practitioner_id", profile.id)
    .order("scheduled_date", { ascending: false });

  const allBookings = bookings ?? [];

  // Compute stats
  const active = allBookings.filter((b: Record<string, unknown>) =>
    ["requested", "pending_practitioner_approval", "confirmed"].includes(b.status as string)
  );
  const closed = allBookings.filter((b: Record<string, unknown>) => b.status === "completed");
  const uniquePatients = new Set(allBookings.map((b: Record<string, unknown>) => b.patient_id as string));
  const revenue = closed.reduce((sum: number, b: Record<string, unknown>) => sum + Number(b.price_at_booking || 0), 0);

  // Fetch domain names for recent bookings
  const recentRaw = allBookings.slice(0, 10);
  const domainIds = [...new Set(recentRaw.map((b: Record<string, unknown>) => b.domain_id as string).filter(Boolean))];
  let domainMap: Record<string, string> = {};
  if (domainIds.length > 0) {
    const { data: domains } = await supabase.from("treatment_domains").select("id, name").in("id", domainIds);
    domainMap = (domains ?? []).reduce((acc: Record<string, string>, d: { id: string; name: string }) => { acc[d.id] = d.name; return acc; }, {});
  }

  const recentBookings: RecentBooking[] = recentRaw.map((b: Record<string, unknown>) => {
    const patientUser = b.users as { full_name: string } | null;
    return {
      id: b.id as string,
      patientName: patientUser?.full_name ?? "מטופל",
      patientImage: "",
      domain: domainMap[b.domain_id as string] ?? "",
      scheduledDate: b.scheduled_date as string,
      status: b.status as string,
      price: Number(b.price_at_booking || 0),
    };
  });

  return {
    stats: {
      totalClosed: closed.length,
      totalActive: active.length,
      totalPatients: uniquePatients.size,
      totalRevenue: revenue,
    },
    recentBookings,
    practitionerName: userData?.full_name ?? "",
  };
}

// Resolve the practitioner_profile.id for the current user, or null if the
// caller isn't authenticated as a practitioner. Used by ownership-scoped
// mutations below so a logged-in non-owner can't approve/decline arbitrary
// bookings.
async function currentPractitionerId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return profile?.id ?? null;
}

export async function approveBooking(bookingId: string) {
  const practitionerId = await currentPractitionerId();
  if (!practitionerId) return { success: false, error: "לא מורשה" };

  const supabase = await createClient();

  // Load the booking so we have token + price for the CardCom charge.
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, practitioner_id, price_at_booking, payment_token, payment_status, patient_id")
    .eq("id", bookingId)
    .eq("practitioner_id", practitionerId)
    .maybeSingle();
  if (!booking) return { success: false, error: "לא מורשה" };

  // When CardCom is on, charge the tokenized card now. If we don't have a
  // token (e.g. the patient never completed the payment page) we surface a
  // friendly error and keep the booking pending so they can retry.
  let transactionId: string | null = null;
  if (isCardcomEnabled()) {
    if (!booking.payment_token) {
      return { success: false, error: "התשלום עדיין לא הושלם על ידי המטופל" };
    }
    if (booking.payment_status !== "tokenized") {
      // Already charged or in a terminal state — don't double-charge.
      if (booking.payment_status === "charged") {
        // Just confirm the booking; don't re-run a charge.
      } else {
        return { success: false, error: "סטטוס התשלום לא תקין לחיוב" };
      }
    } else {
      // Fetch patient identity for the receipt.
      const { data: patientUser } = await supabase
        .from("users")
        .select("full_name, email")
        .eq("id", booking.patient_id)
        .single();
      const charge = await chargeToken({
        token: booking.payment_token,
        amount: Number(booking.price_at_booking),
        returnValue: booking.id,
        productName: "טיפול בHeali",
        createInvoice: true,
        customer: {
          fullName: patientUser?.full_name ?? undefined,
          email: patientUser?.email ?? undefined,
        },
      });
      if (!charge.success) {
        await supabase
          .from("bookings")
          .update({ payment_status: "failed", payment_failure_reason: charge.error })
          .eq("id", booking.id);
        return { success: false, error: `שגיאה בחיוב: ${charge.error}` };
      }
      transactionId = charge.data.transactionId;
    }
  }

  const { data, error } = await supabase
    .from("bookings")
    .update({
      status: "confirmed",
      payment_status: "charged",
      payment_transaction_id: transactionId ?? undefined,
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    .eq("practitioner_id", practitionerId)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, error: "שגיאה באישור הטיפול" };
  if (!data) return { success: false, error: "לא מורשה" };
  return { success: true };
}

export async function declineBooking(bookingId: string) {
  const practitionerId = await currentPractitionerId();
  if (!practitionerId) return { success: false, error: "לא מורשה" };

  const supabase = await createClient();
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "declined", updated_at: new Date().toISOString() })
    .eq("id", bookingId)
    .eq("practitioner_id", practitionerId)
    .select("id")
    .maybeSingle();
  if (error) return { success: false, error: "שגיאה בדחיית הטיפול" };
  if (!data) return { success: false, error: "לא מורשה" };
  return { success: true };
}
