"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data: booking } = await supabase
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

  return { success: true };
}
