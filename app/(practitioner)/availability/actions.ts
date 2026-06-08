"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface AvailabilitySlot {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface BlockedDate {
  id: string;
  blockedDate: string;
}

export async function fetchAvailability(): Promise<{
  slots: AvailabilitySlot[];
  blocks: BlockedDate[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { slots: [], blocks: [] };

  // Get practitioner profile ID
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { slots: [], blocks: [] };

  const [slotsRes, blocksRes] = await Promise.all([
    supabase
      .from("practitioner_availability")
      .select("id, weekday, start_time, end_time")
      .eq("practitioner_id", profile.id)
      .order("weekday")
      .order("start_time"),
    supabase
      .from("availability_blocks")
      .select("id, blocked_date")
      .eq("practitioner_id", profile.id)
      .order("blocked_date"),
  ]);

  return {
    slots: (slotsRes.data ?? []).map((s) => ({
      id: s.id,
      weekday: s.weekday,
      startTime: s.start_time,
      endTime: s.end_time,
    })),
    blocks: (blocksRes.data ?? []).map((b) => ({
      id: b.id,
      blockedDate: b.blocked_date,
    })),
  };
}

export async function saveAvailabilitySlot(
  weekday: number,
  startTime: string,
  endTime: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  const { error } = await supabase
    .from("practitioner_availability")
    .insert({
      practitioner_id: profile.id,
      weekday,
      start_time: startTime,
      end_time: endTime,
    });

  if (error) return { success: false, error: "שגיאה בשמירת זמינות" };
  return { success: true };
}

export async function deleteAvailabilitySlot(slotId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מורשה" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return { success: false, error: "לא מורשה" };

  // Scope the delete to the caller's practitioner_id so a logged-in user
  // can't drop someone else's slots by guessing IDs.
  const { data, error } = await supabase
    .from("practitioner_availability")
    .delete()
    .eq("id", slotId)
    .eq("practitioner_id", profile.id)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: "שגיאה במחיקת זמינות" };
  if (!data) return { success: false, error: "לא מורשה" };
  return { success: true };
}

export async function addBlockedDate(date: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  const { error } = await supabase
    .from("availability_blocks")
    .insert({
      practitioner_id: profile.id,
      blocked_date: date,
    });

  if (error) return { success: false, error: "שגיאה בחסימת תאריך" };
  return { success: true };
}

export async function removeBlockedDate(blockId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מורשה" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return { success: false, error: "לא מורשה" };

  const { data, error } = await supabase
    .from("availability_blocks")
    .delete()
    .eq("id", blockId)
    .eq("practitioner_id", profile.id)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: "שגיאה בהסרת חסימה" };
  if (!data) return { success: false, error: "לא מורשה" };
  return { success: true };
}

// ── Daily view (Screen 29) — bookings overlay for the /availability "Daily View" tab.
// Reads scope to the caller's practitioner_profile so a logged-in non-owner
// can't pull someone else's schedule.

export interface BookingForCalendar {
  id: string;
  scheduledDate: string;
  scheduledTime: string;
  status: "confirmed" | "pending_practitioner_approval";
  patientName: string;
  domainName: string;
  priceAtBooking: number;
}

async function getPractitionerProfileId(): Promise<string | null> {
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

export async function fetchBookingsForRange(
  startDate: string,
  endDate: string
): Promise<BookingForCalendar[]> {
  const practitionerId = await getPractitionerProfileId();
  if (!practitionerId) return [];

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`
      id, scheduled_date, scheduled_time, status, price_at_booking,
      users!bookings_patient_id_fkey ( full_name ),
      treatment_domains!bookings_domain_id_fkey ( name )
    `)
    .eq("practitioner_id", practitionerId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .in("status", ["confirmed", "pending_practitioner_approval"])
    .order("scheduled_date")
    .order("scheduled_time");

  return (data ?? []).map((b: Record<string, unknown>) => {
    const patient = b.users as { full_name: string } | null;
    const domain = b.treatment_domains as { name: string } | null;
    return {
      id: b.id as string,
      scheduledDate: b.scheduled_date as string,
      scheduledTime: b.scheduled_time as string,
      status: b.status as "confirmed" | "pending_practitioner_approval",
      patientName: patient?.full_name ?? "מטופל",
      domainName: domain?.name ?? "טיפול",
      priceAtBooking: Number(b.price_at_booking ?? 0),
    };
  });
}

export async function fetchUpcomingBookingsForPractitioner(
  limit: number = 3
): Promise<BookingForCalendar[]> {
  const practitionerId = await getPractitionerProfileId();
  if (!practitionerId) return [];

  const today = new Date().toISOString().split("T")[0];

  const supabase = await createClient();
  const { data } = await supabase
    .from("bookings")
    .select(`
      id, scheduled_date, scheduled_time, status, price_at_booking,
      users!bookings_patient_id_fkey ( full_name ),
      treatment_domains!bookings_domain_id_fkey ( name )
    `)
    .eq("practitioner_id", practitionerId)
    .gte("scheduled_date", today)
    .in("status", ["confirmed", "pending_practitioner_approval"])
    .order("scheduled_date")
    .order("scheduled_time")
    .limit(limit);

  return (data ?? []).map((b: Record<string, unknown>) => {
    const patient = b.users as { full_name: string } | null;
    const domain = b.treatment_domains as { name: string } | null;
    return {
      id: b.id as string,
      scheduledDate: b.scheduled_date as string,
      scheduledTime: b.scheduled_time as string,
      status: b.status as "confirmed" | "pending_practitioner_approval",
      patientName: patient?.full_name ?? "מטופל",
      domainName: domain?.name ?? "טיפול",
      priceAtBooking: Number(b.price_at_booking ?? 0),
    };
  });
}
