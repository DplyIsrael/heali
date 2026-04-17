"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
  bookingId?: string;
}

export interface AvailableSlot {
  time: string;
  period: "morning" | "afternoon" | "evening";
}

export interface DayAvailability {
  date: string;
  weekday: number;
  hasSlots: boolean;
}

export async function fetchPractitionerAvailability(practitionerId: string, startDate: string, endDate: string) {
  const supabase = await createClient();

  // Get weekly schedule
  const { data: weeklySlots } = await supabase
    .from("practitioner_availability")
    .select("weekday, start_time, end_time")
    .eq("practitioner_id", practitionerId)
    .order("weekday")
    .order("start_time");

  // Get blocked dates in range
  const { data: blockedDates } = await supabase
    .from("availability_blocks")
    .select("blocked_date")
    .eq("practitioner_id", practitionerId)
    .gte("blocked_date", startDate)
    .lte("blocked_date", endDate);

  // Get existing bookings in range
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("scheduled_date, scheduled_time")
    .eq("practitioner_id", practitionerId)
    .gte("scheduled_date", startDate)
    .lte("scheduled_date", endDate)
    .in("status", ["requested", "pending_practitioner_approval", "confirmed"]);

  const blocked = new Set((blockedDates ?? []).map((b: { blocked_date: string }) => b.blocked_date));
  const booked = new Set(
    (existingBookings ?? []).map(
      (b: { scheduled_date: string; scheduled_time: string }) => `${b.scheduled_date}_${b.scheduled_time}`
    )
  );

  return {
    weeklySlots: weeklySlots ?? [],
    blockedDates: blocked,
    bookedSlots: booked,
  };
}

export async function getTimeSlotsForDate(
  practitionerId: string,
  date: string,
  weekday: number
): Promise<AvailableSlot[]> {
  const supabase = await createClient();

  // Get weekly slots for this weekday
  const { data: slots } = await supabase
    .from("practitioner_availability")
    .select("start_time, end_time")
    .eq("practitioner_id", practitionerId)
    .eq("weekday", weekday);

  if (!slots || slots.length === 0) return [];

  // Check if date is blocked
  const { data: blocked } = await supabase
    .from("availability_blocks")
    .select("id")
    .eq("practitioner_id", practitionerId)
    .eq("blocked_date", date)
    .limit(1);

  if (blocked && blocked.length > 0) return [];

  // Get existing bookings for this date
  const { data: existingBookings } = await supabase
    .from("bookings")
    .select("scheduled_time")
    .eq("practitioner_id", practitionerId)
    .eq("scheduled_date", date)
    .in("status", ["requested", "pending_practitioner_approval", "confirmed"]);

  const bookedTimes = new Set(
    (existingBookings ?? []).map((b: { scheduled_time: string }) => b.scheduled_time)
  );

  // Generate 30-minute slots from availability ranges
  const timeSlots: AvailableSlot[] = [];

  for (const slot of slots) {
    const [startH, startM] = slot.start_time.split(":").map(Number);
    const [endH, endM] = slot.end_time.split(":").map(Number);
    let current = startH * 60 + startM;
    const end = endH * 60 + endM;

    while (current < end) {
      const h = Math.floor(current / 60);
      const m = current % 60;
      const timeStr = `${h.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")}`;

      if (!bookedTimes.has(timeStr)) {
        let period: "morning" | "afternoon" | "evening" = "morning";
        if (h >= 17) period = "evening";
        else if (h >= 12) period = "afternoon";

        timeSlots.push({ time: timeStr, period });
      }

      current += 30;
    }
  }

  return timeSlots.sort((a, b) => a.time.localeCompare(b.time));
}

export async function createBooking(
  practitionerId: string,
  domainId: string,
  scheduledDate: string,
  scheduledTime: string,
  priceAtBooking: number
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Validate the slot is still available
  const { data: existing } = await supabase
    .from("bookings")
    .select("id")
    .eq("practitioner_id", practitionerId)
    .eq("scheduled_date", scheduledDate)
    .eq("scheduled_time", scheduledTime)
    .in("status", ["requested", "pending_practitioner_approval", "confirmed"])
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "התור כבר תפוס, אנא בחר שעה אחרת" };
  }

  // Create the booking (payment is mocked — goes straight to pending approval)
  const { data, error } = await supabase
    .from("bookings")
    .insert({
      patient_id: user.id,
      practitioner_id: practitionerId,
      domain_id: domainId,
      scheduled_date: scheduledDate,
      scheduled_time: scheduledTime,
      price_at_booking: priceAtBooking,
      status: "pending_practitioner_approval",
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Create booking error:", error);
    return { success: false, error: "שגיאה ביצירת ההזמנה" };
  }

  // TODO: Trigger payment via Grow when credentials available
  // TODO: Send email to practitioner via Resend

  return { success: true, bookingId: data.id };
}
