"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

function daysAgoIso(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString();
}

function pctChange(last: number, prev: number): number {
  if (prev === 0) return last > 0 ? 100 : 0;
  return Math.round(((last - prev) / prev) * 100);
}

export async function fetchAdminStats() {
  await requireAdmin();
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

  // Month-over-month trends (last 30d vs prior 30d) by created_at.
  const d30 = daysAgoIso(30);
  const d60 = daysAgoIso(60);
  const since = (table: string, sinceIso: string, untilIso?: string, role?: string) => {
    let q = supabase.from(table).select("id", { count: "exact", head: true }).gte("created_at", sinceIso);
    if (untilIso) q = q.lt("created_at", untilIso);
    if (role) q = q.eq("role", role);
    return q;
  };
  const [bL, bP, ptL, ptP, prL, prP] = await Promise.all([
    since("bookings", d30), since("bookings", d60, d30),
    since("users", d30, undefined, "patient"), since("users", d60, d30, "patient"),
    since("users", d30, undefined, "practitioner"), since("users", d60, d30, "practitioner"),
  ]);

  return {
    totalUsers: usersRes.count ?? 0,
    totalPractitioners: practRes.count ?? 0,
    totalPatients: patientsRes.count ?? 0,
    totalBookings: bookingsRes.count ?? 0,
    totalRevenue: revenue,
    pendingPractitioners: pendingPractitioners ?? 0,
    pendingReviews: pendingReviews ?? 0,
    trends: {
      bookings: pctChange(bL.count ?? 0, bP.count ?? 0),
      patients: pctChange(ptL.count ?? 0, ptP.count ?? 0),
      practitioners: pctChange(prL.count ?? 0, prP.count ?? 0),
    },
  };
}

export interface AdminTransaction {
  id: string;
  amount: number;
  paymentStatus: string;
  status: string;
  typeOfTreatment: string;
  treatmentDate: string;
  patientName: string;
  patientAvatar: string;
  therapistName: string;
  therapistAvatar: string;
  therapistProfileId: string;
  patientId: string;
  category: string;
  orderNumber: string;
}

export interface TransactionFilters {
  status?: string;
  paymentStatus?: string;
  domainId?: string;
  dateFrom?: string;
  dateTo?: string;
  search?: string;
}

export async function fetchAdminTransactions(
  filters: TransactionFilters = {}
): Promise<AdminTransaction[]> {
  await requireAdmin();
  try {
    const supabase = createAdminClient();

    let q = supabase
      .from("bookings")
      .select(
        "id, price_at_booking, payment_status, status, scheduled_date, payment_reference, patient_id, practitioner_id, domain_id, created_at"
      )
      .order("created_at", { ascending: false })
      .limit(100);

    if (filters.status) q = q.eq("status", filters.status);
    if (filters.paymentStatus) q = q.eq("payment_status", filters.paymentStatus);
    if (filters.domainId) q = q.eq("domain_id", filters.domainId);
    if (filters.dateFrom) q = q.gte("scheduled_date", filters.dateFrom);
    if (filters.dateTo) q = q.lte("scheduled_date", filters.dateTo);

    const { data: rows, error } = await q;
    if (error || !rows?.length) return [];

    const patientIds = [...new Set(rows.map((r) => r.patient_id))];
    const practIds = [...new Set(rows.map((r) => r.practitioner_id))];
    const domainIds = [...new Set(rows.map((r) => r.domain_id))];

    const [patientsRes, practRes, domainsRes] = await Promise.all([
      supabase.from("users").select("id, full_name, profile_photo_url").in("id", patientIds),
      supabase.from("practitioner_profiles").select("id, user_id, profile_photo_url").in("id", practIds),
      supabase.from("treatment_domains").select("id, name").in("id", domainIds),
    ]);

    const practUserIds = [...new Set((practRes.data ?? []).map((p) => p.user_id))];
    const { data: practUsers } = await supabase
      .from("users")
      .select("id, full_name, profile_photo_url")
      .in("id", practUserIds.length ? practUserIds : ["00000000-0000-0000-0000-000000000000"]);

    const patientMap = new Map((patientsRes.data ?? []).map((u) => [u.id, u]));
    const domainMap = new Map((domainsRes.data ?? []).map((d) => [d.id, d.name]));
    const practUserMap = new Map((practUsers ?? []).map((u) => [u.id, u]));
    const practMap = new Map(
      (practRes.data ?? []).map((p) => [p.id, { user: practUserMap.get(p.user_id), photo: p.profile_photo_url }])
    );

    let result: AdminTransaction[] = rows.map((r) => {
      const pat = patientMap.get(r.patient_id);
      const pr = practMap.get(r.practitioner_id);
      return {
        id: r.id,
        amount: Number(r.price_at_booking || 0),
        paymentStatus: r.payment_status,
        status: r.status,
        typeOfTreatment: "טיפול בודד",
        treatmentDate: r.scheduled_date,
        patientName: pat?.full_name ?? "—",
        patientAvatar: pat?.profile_photo_url ?? "",
        therapistName: pr?.user?.full_name ?? "—",
        therapistAvatar: pr?.user?.profile_photo_url ?? pr?.photo ?? "",
        therapistProfileId: r.practitioner_id,
        patientId: r.patient_id,
        category: domainMap.get(r.domain_id) ?? "—",
        orderNumber: r.payment_reference ?? r.id.slice(0, 8).toUpperCase(),
      };
    });

    if (filters.search) {
      const s = filters.search.toLowerCase();
      result = result.filter(
        (t) =>
          t.patientName.toLowerCase().includes(s) ||
          t.therapistName.toLowerCase().includes(s) ||
          t.orderNumber.toLowerCase().includes(s) ||
          t.category.toLowerCase().includes(s)
      );
    }

    return result;
  } catch (err) {
    console.error("[fetchAdminTransactions]", err);
    return [];
  }
}

export async function fetchTreatmentDomains(): Promise<{ id: string; name: string }[]> {
  await requireAdmin();
  try {
    const supabase = createAdminClient();
    const { data } = await supabase.from("treatment_domains").select("id, name").order("name");
    return data ?? [];
  } catch {
    return [];
  }
}
