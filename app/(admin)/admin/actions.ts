"use server";

import { createAdminClient } from "@/lib/supabase/admin";

export async function fetchAdminStats() {
  const supabase = createAdminClient();

  const [usersRes, practRes, patientsRes, bookingsRes] = await Promise.all([
    supabase.from("users").select("id", { count: "exact", head: true }),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "practitioner"),
    supabase.from("users").select("id", { count: "exact", head: true }).eq("role", "patient"),
    supabase.from("bookings").select("id", { count: "exact", head: true }),
  ]);

  // Revenue
  const { data: completedBookings } = await supabase
    .from("bookings")
    .select("price_at_booking")
    .eq("status", "completed");

  const revenue = (completedBookings ?? []).reduce(
    (sum: number, b: { price_at_booking: string }) => sum + Number(b.price_at_booking || 0), 0
  );

  // Pending practitioners
  const { count: pendingPractitioners } = await supabase
    .from("practitioner_profiles")
    .select("id", { count: "exact", head: true })
    .eq("verification_status", "submitted");

  // Pending reviews
  const { count: pendingReviews } = await supabase
    .from("reviews")
    .select("id", { count: "exact", head: true })
    .eq("status", "submitted");

  return {
    totalUsers: usersRes.count ?? 0,
    totalPractitioners: practRes.count ?? 0,
    totalPatients: patientsRes.count ?? 0,
    totalBookings: bookingsRes.count ?? 0,
    totalRevenue: revenue,
    pendingPractitioners: pendingPractitioners ?? 0,
    pendingReviews: pendingReviews ?? 0,
  };
}
