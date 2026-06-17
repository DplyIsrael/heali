"use server";

import { createClient } from "@/lib/supabase/server";
import { sendEmail } from "@/lib/email/client";
import { practitionerNewBookingEmail } from "@/lib/email/templates";
import { isCardcomEnabled, createLowProfile } from "@/lib/payments/cardcom";
import { checkRateLimit } from "@/lib/rate-limit";

interface ActionResult {
  success: boolean;
  error?: string;
  bookingId?: string;
  /** When CardCom is enabled, the client should redirect here to enter card details. */
  redirectUrl?: string;
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

// Returns the patient's currently-active credit balance. Used by the booking
// summary step to decide whether to show the "use my credits" toggle.
export async function fetchActiveCreditBalance(): Promise<number> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return 0;
  const { data } = await supabase
    .from("credits")
    .select("amount")
    .eq("patient_id", user.id)
    .eq("status", "active");
  const total = (data ?? []).reduce(
    (s: number, c: { amount: string | number }) => s + Number(c.amount),
    0
  );
  return Number(total.toFixed(2));
}

export async function createBooking(
  practitionerId: string,
  domainId: string,
  scheduledDate: string,
  scheduledTime: string,
  priceAtBooking: number,
  applyCredits: boolean = false
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // 10 booking attempts per user per minute — generous enough for legit
  // retries on slot conflicts, prevents scripted reservation abuse.
  const rl = await checkRateLimit({
    bucket: "booking-create",
    max: 10,
    windowSeconds: 60,
    identifier: user.id,
  });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

  // Reject blocked patients up front so they can't book a treatment.
  const { data: caller } = await supabase
    .from("users")
    .select("is_blocked")
    .eq("id", user.id)
    .single();
  if (caller?.is_blocked) {
    return { success: false, error: "החשבון שלך חסום, אנא צור קשר עם התמיכה" };
  }

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

  // Credit application — server-authoritative. The client passes a boolean
  // intent flag; we fetch active credits oldest-first, apply up to the
  // listed price, and store the post-credit amount as price_at_booking.
  // Credits deduct from the listed (pre-VAT) price to stay consistent with
  // how price_at_booking is used elsewhere in the codebase (CardCom charge,
  // confirmation email, etc.). The last partially-consumed credit is split:
  // its existing row is marked spent at the used amount, and a new active
  // credit row is inserted with the leftover.
  let priceAfterCredit = priceAtBooking;
  const creditsToConsumeFully: string[] = [];
  let partialCredit:
    | { id: string; usedAmount: number; leftover: number }
    | null = null;
  let appliedCreditAmount = 0;

  if (applyCredits) {
    const { data: activeCredits } = await supabase
      .from("credits")
      .select("id, amount")
      .eq("patient_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: true });

    let remaining = priceAtBooking;
    for (const c of activeCredits ?? []) {
      if (remaining <= 0) break;
      const amt = Number(c.amount);
      if (amt <= remaining) {
        creditsToConsumeFully.push(c.id as string);
        appliedCreditAmount += amt;
        remaining -= amt;
      } else {
        partialCredit = {
          id: c.id as string,
          usedAmount: remaining,
          leftover: Number((amt - remaining).toFixed(2)),
        };
        appliedCreditAmount += remaining;
        remaining = 0;
      }
    }
    priceAfterCredit = Math.max(0, Number((priceAtBooking - appliedCreditAmount).toFixed(2)));
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
      price_at_booking: priceAfterCredit,
      status: "pending_practitioner_approval",
      payment_status: "pending",
    })
    .select("id")
    .single();

  if (error) {
    console.error("Create booking error:", error);
    return { success: false, error: "שגיאה ביצירת ההזמנה" };
  }

  // Now that the booking row exists, consume the credits. If any of these
  // writes fail we log but don't roll back — better to have a confirmed
  // booking with an audit gap than to lose the slot. The credit walk above
  // was bounded by listedPrice so we can't over-spend.
  if (applyCredits && appliedCreditAmount > 0) {
    if (creditsToConsumeFully.length > 0) {
      const { error: spentErr } = await supabase
        .from("credits")
        .update({ status: "used" })
        .in("id", creditsToConsumeFully);
      if (spentErr) console.error("[createBooking] credit-spent update failed:", spentErr);
    }
    if (partialCredit) {
      const { error: partialErr } = await supabase
        .from("credits")
        .update({ amount: partialCredit.usedAmount, status: "used" })
        .eq("id", partialCredit.id);
      if (partialErr) console.error("[createBooking] partial-credit update failed:", partialErr);
      const { error: splitErr } = await supabase.from("credits").insert({
        patient_id: user.id,
        amount: partialCredit.leftover,
        status: "active",
        source_booking_id: null,
      });
      if (splitErr) console.error("[createBooking] split-credit insert failed:", splitErr);
    }
  }

  // If CardCom is on, open a hosted Low Profile session so the patient
  // can enter their card. We tokenize only — the actual charge runs
  // when the practitioner approves. Until CARDCOM_ENABLED=true the
  // mock-payment behavior is preserved (booking is created as before).
  let redirectUrl: string | undefined;
  if (isCardcomEnabled()) {
    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heali.co.il";
    const { data: patientUserRow } = await supabase
      .from("users")
      .select("full_name, email")
      .eq("id", user.id)
      .single();

    const lp = await createLowProfile({
      amount: priceAfterCredit,
      returnValue: data.id,
      productName: "טיפול בHeali",
      successRedirectUrl: `${siteUrl}/api/cardcom/success`,
      failedRedirectUrl: `${siteUrl}/api/cardcom/failure?ReturnValue=${data.id}`,
      webHookUrl: `${siteUrl}/api/cardcom/webhook`,
      operation: "CreateTokenOnly",
      customer: {
        fullName: patientUserRow?.full_name ?? undefined,
        email: patientUserRow?.email ?? undefined,
      },
    });
    if (!lp.success) {
      // Roll the booking back so the slot reopens and the patient can retry.
      await supabase.from("bookings").delete().eq("id", data.id);
      return { success: false, error: lp.error };
    }
    redirectUrl = lp.data.url;
    await supabase
      .from("bookings")
      .update({ payment_low_profile_id: lp.data.lowProfileId })
      .eq("id", data.id);
  }

  // Best-effort: notify the practitioner that a new booking is waiting for
  // their approval. Failure here doesn't block the booking.
  try {
    const { data: pracProfile } = await supabase
      .from("practitioner_profiles")
      .select("user_id")
      .eq("id", practitionerId)
      .single();
    if (pracProfile) {
      const [{ data: pracUser }, { data: patientUser }, { data: domain }] = await Promise.all([
        supabase.from("users").select("full_name, email").eq("id", pracProfile.user_id).single(),
        supabase.from("users").select("full_name").eq("id", user.id).single(),
        supabase.from("treatment_domains").select("name").eq("id", domainId).single(),
      ]);
      if (pracUser?.email) {
        const { subject, html } = practitionerNewBookingEmail({
          practitionerName: pracUser.full_name ?? "",
          patientName: patientUser?.full_name ?? "",
          domain: domain?.name ?? "",
          date: scheduledDate,
          time: scheduledTime,
        });
        await sendEmail({ to: pracUser.email, subject, html });
      }
    }
  } catch (err) {
    console.error("[createBooking] practitioner email failed:", err);
  }

  return { success: true, bookingId: data.id, redirectUrl };
}
