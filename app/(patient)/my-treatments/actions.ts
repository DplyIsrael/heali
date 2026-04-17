"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface BookingItem {
  id: string;
  orderNumber: string;
  practitionerName: string;
  practitionerImage: string;
  domain: string;
  scheduledDate: string;
  scheduledTime: string;
  city: string;
  price: number;
  status: string;
}

export async function fetchMyBookings(): Promise<{
  active: BookingItem[];
  completed: BookingItem[];
  canceled: BookingItem[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { active: [], completed: [], canceled: [] };

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id,
      scheduled_date,
      scheduled_time,
      status,
      price_at_booking,
      domain_id,
      practitioner_id,
      practitioner_profiles!inner (
        city,
        profile_photo_url,
        domain_ids,
        users!inner (
          full_name
        )
      )
    `)
    .eq("patient_id", user.id)
    .order("scheduled_date", { ascending: false });

  if (!bookings) return { active: [], completed: [], canceled: [] };

  // Fetch domain names
  const allDomainIds = [...new Set(bookings.flatMap((b: Record<string, unknown>) => {
    const profile = b.practitioner_profiles as Record<string, unknown>;
    return (profile?.domain_ids as string[]) ?? [];
  }))];

  let domainMap: Record<string, string> = {};
  if (allDomainIds.length > 0) {
    const { data: domains } = await supabase
      .from("treatment_domains")
      .select("id, name")
      .in("id", allDomainIds);
    domainMap = (domains ?? []).reduce((acc: Record<string, string>, d: { id: string; name: string }) => {
      acc[d.id] = d.name;
      return acc;
    }, {});
  }

  const mapBooking = (b: Record<string, unknown>): BookingItem => {
    const profile = b.practitioner_profiles as Record<string, unknown>;
    const practUser = profile?.users as { full_name: string };
    const domainIds = (profile?.domain_ids as string[]) ?? [];

    return {
      id: b.id as string,
      orderNumber: (b.id as string).slice(0, 8).toUpperCase(),
      practitionerName: practUser?.full_name ?? "",
      practitionerImage: (profile?.profile_photo_url as string) ?? "/images/practitioners/practitioner-1.jpg",
      domain: domainIds.map((id: string) => domainMap[id]).filter(Boolean)[0] ?? "",
      scheduledDate: b.scheduled_date as string,
      scheduledTime: b.scheduled_time as string,
      city: (profile?.city as string) ?? "",
      price: Number(b.price_at_booking),
      status: b.status as string,
    };
  };

  const active = bookings
    .filter((b: Record<string, unknown>) => ["requested", "pending_practitioner_approval", "confirmed"].includes(b.status as string))
    .map(mapBooking);

  const completed = bookings
    .filter((b: Record<string, unknown>) => b.status === "completed")
    .map(mapBooking);

  const canceled = bookings
    .filter((b: Record<string, unknown>) => ["canceled", "declined"].includes(b.status as string))
    .map(mapBooking);

  return { active, completed, canceled };
}

export async function cancelBooking(bookingId: string, reason?: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Fetch booking to validate
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, patient_id, scheduled_date, scheduled_time, price_at_booking, status")
    .eq("id", bookingId)
    .single();

  if (!booking) return { success: false, error: "הזמנה לא נמצאה" };
  if (booking.patient_id !== user.id) return { success: false, error: "אין הרשאה" };
  if (!["requested", "pending_practitioner_approval", "confirmed"].includes(booking.status)) {
    return { success: false, error: "לא ניתן לבטל הזמנה זו" };
  }

  // Check 24h rule
  const scheduledDateTime = new Date(`${booking.scheduled_date}T${booking.scheduled_time}`);
  const now = new Date();
  const hoursUntil = (scheduledDateTime.getTime() - now.getTime()) / (1000 * 60 * 60);

  if (hoursUntil < 24) {
    return { success: false, error: "לא ניתן לבטל טיפול פחות מ-24 שעות לפני מועד הטיפול" };
  }

  // Cancel booking
  const { error: cancelError } = await supabase
    .from("bookings")
    .update({
      status: "canceled",
      cancellation_reason: reason ?? "",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId);

  if (cancelError) return { success: false, error: "שגיאה בביטול ההזמנה" };

  // Add credit to patient wallet
  await supabase.from("credits").insert({
    patient_id: user.id,
    amount: booking.price_at_booking,
    source_booking_id: bookingId,
    status: "active",
  });

  return { success: true };
}
