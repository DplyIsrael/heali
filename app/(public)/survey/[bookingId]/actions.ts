"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import { practitionerReviewReceivedEmail } from "@/lib/email/templates";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface SurveyBookingInfo {
  practitionerName: string;
  domain: string;
  scheduledDate: string;
}

export async function fetchSurveyBooking(bookingId: string): Promise<SurveyBookingInfo | null> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: booking } = await admin
    .from("bookings")
    .select(`
      id,
      patient_id,
      scheduled_date,
      status,
      domain_id,
      practitioner_profiles!inner (
        users!inner (full_name)
      )
    `)
    .eq("id", bookingId)
    .single();

  if (!booking) return null;
  if (booking.patient_id !== user.id) return null;
  if (booking.status !== "completed") return null;

  // Check if already reviewed
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .limit(1);

  if (existing && existing.length > 0) return null;

  const profile = booking.practitioner_profiles as unknown as { users: { full_name: string } };

  // Get domain name
  let domainName = "";
  if (booking.domain_id) {
    const { data: domain } = await supabase
      .from("treatment_domains")
      .select("name")
      .eq("id", booking.domain_id)
      .single();
    domainName = domain?.name ?? "";
  }

  return {
    practitionerName: profile.users.full_name,
    domain: domainName,
    scheduledDate: booking.scheduled_date,
  };
}

export async function submitReview(
  bookingId: string,
  rating: number,
  comment: string,
  isAnonymous: boolean
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Server-side validation: rating must be an integer 1–5; cap comment length.
  if (!Number.isInteger(rating) || rating < 1 || rating > 5) {
    return { success: false, error: "דירוג חייב להיות מספר שלם בין 1 ל-5" };
  }
  if (comment && comment.length > 2000) {
    return { success: false, error: "התגובה ארוכה מדי (עד 2000 תווים)" };
  }

  // Validate booking belongs to user and is completed
  const { data: booking } = await supabase
    .from("bookings")
    .select("id, patient_id, status")
    .eq("id", bookingId)
    .single();

  if (!booking || booking.patient_id !== user.id) {
    return { success: false, error: "הזמנה לא נמצאה" };
  }
  if (booking.status !== "completed") {
    return { success: false, error: "ניתן לדרג רק טיפולים שהושלמו" };
  }

  // Check not already reviewed
  const { data: existing } = await supabase
    .from("reviews")
    .select("id")
    .eq("booking_id", bookingId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: false, error: "כבר דירגת טיפול זה" };
  }

  // Get reviewer first name
  const { data: userData } = await supabase
    .from("users")
    .select("full_name")
    .eq("id", user.id)
    .single();

  const firstName = userData?.full_name?.split(" ")[0] ?? "מטופל";

  const { error } = await supabase.from("reviews").insert({
    booking_id: bookingId,
    rating,
    comment: comment || null,
    is_anonymous: isAnonymous,
    reviewer_first_name: firstName,
    status: "submitted",
  });

  if (error) {
    console.error("Submit review error:", error);
    return { success: false, error: "שגיאה בשליחת הדירוג" };
  }

  // Create admin notification — send to all admin users
  const admin = createAdminClient();
  const { data: admins } = await admin
    .from("users")
    .select("id")
    .eq("role", "admin");

  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a: { id: string }) => ({
        user_id: a.id,
        type: "new_review",
        payload: { bookingId, rating, reviewerName: firstName },
      }))
    );
  }

  // Notify the practitioner — in-app row + email. Best-effort: failure here
  // doesn't roll back the review (already written).
  try {
    // Resolve practitioner_id from booking → user_id.
    const { data: bookingFull } = await admin
      .from("bookings")
      .select("practitioner_id")
      .eq("id", bookingId)
      .single();
    if (bookingFull?.practitioner_id) {
      const { data: pracProfile } = await admin
        .from("practitioner_profiles")
        .select("user_id")
        .eq("id", bookingFull.practitioner_id)
        .single();

      if (pracProfile?.user_id) {
        const reviewerName = isAnonymous ? "מטופל אנונימי" : firstName;

        // In-app notification (matches the existing new_review type — the
        // notifications panel already renders this case).
        await admin.from("notifications").insert({
          user_id: pracProfile.user_id,
          type: "new_review",
          payload: { bookingId, rating, reviewerName },
        });

        // Email — only fires if the practitioner has an email on file.
        const { data: pracUser } = await admin
          .from("users")
          .select("full_name, email")
          .eq("id", pracProfile.user_id)
          .single();
        if (pracUser?.email) {
          const { subject, html } = practitionerReviewReceivedEmail({
            practitionerName: pracUser.full_name ?? "",
            rating,
            reviewerName,
          });
          await sendEmail({ to: pracUser.email, subject, html });
        }
      }
    }
  } catch (err) {
    console.error("[submitReview] practitioner notify failed:", err);
  }

  return { success: true };
}
