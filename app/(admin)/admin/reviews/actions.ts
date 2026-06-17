"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface PendingReview {
  id: string;
  rating: number;
  comment: string;
  isAnonymous: boolean;
  reviewerFirstName: string;
  status: "submitted" | "approved" | "rejected" | "removed";
  createdAt: string;
  bookingId: string;
  practitionerId: string;
  practitionerName: string;
}

// Two-step fetch (reviews → bookings → practitioner_profiles → users) instead
// of a triple-nested PostgREST join — clearer, doesn't depend on FK constraint
// names matching Drizzle's auto-generated form.
export async function fetchPendingReviews(
  statusFilter: PendingReview["status"] = "submitted"
): Promise<PendingReview[]> {
  const supabase = await createClient();

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, is_anonymous, reviewer_first_name, status, created_at, booking_id")
    .eq("status", statusFilter)
    .order("created_at", { ascending: false })
    .limit(100);

  if (!reviews || reviews.length === 0) return [];

  const bookingIds = reviews.map((r: { booking_id: string }) => r.booking_id);
  const { data: bookings } = await supabase
    .from("bookings")
    .select("id, practitioner_id")
    .in("id", bookingIds);

  const bookingToPrac: Record<string, string> = {};
  (bookings ?? []).forEach((b: { id: string; practitioner_id: string }) => {
    bookingToPrac[b.id] = b.practitioner_id;
  });

  const practitionerIds = [...new Set(Object.values(bookingToPrac))];
  let pracNameMap: Record<string, string> = {};
  if (practitionerIds.length > 0) {
    const { data: profiles } = await supabase
      .from("practitioner_profiles")
      .select("id, user_id")
      .in("id", practitionerIds);

    const userIds = (profiles ?? []).map((p: { user_id: string }) => p.user_id);
    let userMap: Record<string, string> = {};
    if (userIds.length > 0) {
      const { data: users } = await supabase
        .from("users")
        .select("id, full_name")
        .in("id", userIds);
      userMap = (users ?? []).reduce(
        (acc: Record<string, string>, u: { id: string; full_name: string }) => {
          acc[u.id] = u.full_name;
          return acc;
        },
        {}
      );
    }
    pracNameMap = (profiles ?? []).reduce(
      (acc: Record<string, string>, p: { id: string; user_id: string }) => {
        acc[p.id] = userMap[p.user_id] ?? "";
        return acc;
      },
      {}
    );
  }

  return reviews.map((r: Record<string, unknown>) => {
    const bookingId = r.booking_id as string;
    const practitionerId = bookingToPrac[bookingId] ?? "";
    return {
      id: r.id as string,
      rating: r.rating as number,
      comment: (r.comment as string) ?? "",
      isAnonymous: r.is_anonymous as boolean,
      reviewerFirstName: (r.reviewer_first_name as string) ?? "",
      status: r.status as PendingReview["status"],
      createdAt: r.created_at as string,
      bookingId,
      practitionerId,
      practitionerName: pracNameMap[practitionerId] ?? "",
    };
  });
}

// Recompute the practitioner's average_rating and total_reviews from the
// CURRENT set of approved reviews tied to their bookings. Called any time a
// review's status changes — handles first-time approval, re-approval after
// rejection, and demotion of a previously-approved review.
async function recalcPractitionerRating(practitionerId: string): Promise<void> {
  const supabase = await createClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select("id")
    .eq("practitioner_id", practitionerId);

  let avg = 0;
  let count = 0;

  if (bookings && bookings.length > 0) {
    const bookingIds = bookings.map((b: { id: string }) => b.id);
    const { data: reviews } = await supabase
      .from("reviews")
      .select("rating")
      .in("booking_id", bookingIds)
      .eq("status", "approved");

    count = reviews?.length ?? 0;
    if (count > 0) {
      const sum = (reviews ?? []).reduce(
        (s: number, r: { rating: number }) => s + r.rating,
        0
      );
      avg = sum / count;
    }
  }

  await supabase
    .from("practitioner_profiles")
    .update({
      average_rating: Number(avg.toFixed(2)),
      total_reviews: count,
      updated_at: new Date().toISOString(),
    })
    .eq("id", practitionerId);
}

export async function approveReview(reviewId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("id, booking_id")
    .eq("id", reviewId)
    .single();
  if (!review) return { success: false, error: "דירוג לא נמצא" };

  const { error } = await supabase
    .from("reviews")
    .update({ status: "approved", updated_at: new Date().toISOString() })
    .eq("id", reviewId);
  if (error) return { success: false, error: "שגיאה באישור הדירוג" };

  const { data: booking } = await supabase
    .from("bookings")
    .select("practitioner_id")
    .eq("id", review.booking_id)
    .single();
  if (booking) await recalcPractitionerRating(booking.practitioner_id);

  return { success: true };
}

export async function rejectReview(reviewId: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: review } = await supabase
    .from("reviews")
    .select("id, booking_id, status")
    .eq("id", reviewId)
    .single();
  if (!review) return { success: false, error: "דירוג לא נמצא" };

  const { error } = await supabase
    .from("reviews")
    .update({ status: "rejected", updated_at: new Date().toISOString() })
    .eq("id", reviewId);
  if (error) return { success: false, error: "שגיאה בדחיית הדירוג" };

  // Only need to recalc if we just removed a previously-counted review.
  if (review.status === "approved") {
    const { data: booking } = await supabase
      .from("bookings")
      .select("practitioner_id")
      .eq("id", review.booking_id)
      .single();
    if (booking) await recalcPractitionerRating(booking.practitioner_id);
  }

  return { success: true };
}

export async function fetchPendingReviewsCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "submitted");
  return count ?? 0;
}
