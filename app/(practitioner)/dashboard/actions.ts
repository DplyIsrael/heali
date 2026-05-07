"use server";

import { createClient } from "@/lib/supabase/server";

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
  const { data, error } = await supabase
    .from("bookings")
    .update({ status: "confirmed", payment_status: "charged", updated_at: new Date().toISOString() })
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
