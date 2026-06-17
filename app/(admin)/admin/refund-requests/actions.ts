"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface RefundRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientEmail: string;
  sourceCreditId: string | null;
  amount: number;
  reason: string;
  status: "pending" | "approved" | "rejected";
  adminNotes: string;
  createdAt: string;
  resolvedAt: string | null;
}

export async function fetchRefundRequests(
  statusFilter: RefundRequest["status"] = "pending"
): Promise<RefundRequest[]> {
  const supabase = await createClient();

  // Tolerate the case where the migration hasn't been applied yet —
  // admin sees an empty list instead of a 500.
  let requests: Array<Record<string, unknown>> | null = null;
  try {
    const { data } = await supabase
      .from("refund_requests")
      .select("id, patient_id, source_credit_id, amount, reason, status, admin_notes, created_at, resolved_at")
      .eq("status", statusFilter)
      .order("created_at", { ascending: false })
      .limit(100);
    requests = data;
  } catch {
    return [];
  }

  if (!requests || requests.length === 0) return [];

  const patientIds = [
    ...new Set(requests.map((r) => r.patient_id as string)),
  ];
  const { data: users } = await supabase
    .from("users")
    .select("id, full_name, email")
    .in("id", patientIds);

  const userMap: Record<string, { fullName: string; email: string }> = {};
  (users ?? []).forEach((u: { id: string; full_name: string; email: string }) => {
    userMap[u.id] = { fullName: u.full_name, email: u.email };
  });

  return requests.map((r: Record<string, unknown>) => {
    const patient = userMap[r.patient_id as string];
    return {
      id: r.id as string,
      patientId: r.patient_id as string,
      patientName: patient?.fullName ?? "מטופל",
      patientEmail: patient?.email ?? "",
      sourceCreditId: (r.source_credit_id as string | null) ?? null,
      amount: Number(r.amount),
      reason: (r.reason as string) ?? "",
      status: r.status as RefundRequest["status"],
      adminNotes: (r.admin_notes as string) ?? "",
      createdAt: r.created_at as string,
      resolvedAt: (r.resolved_at as string | null) ?? null,
    };
  });
}

// Approve a refund: mark the request approved + flip the linked credit to
// "refunded". The actual money transfer happens out-of-band (bank wire).
export async function approveRefundRequest(
  requestId: string,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: req } = await supabase
    .from("refund_requests")
    .select("id, source_credit_id, status")
    .eq("id", requestId)
    .single();
  if (!req) return { success: false, error: "בקשה לא נמצאה" };
  if (req.status !== "pending") {
    return { success: false, error: "ניתן לאשר רק בקשות ממתינות" };
  }

  const { error } = await supabase
    .from("refund_requests")
    .update({
      status: "approved",
      admin_notes: adminNotes ?? null,
      resolved_by_admin_id: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) return { success: false, error: "שגיאה באישור הבקשה" };

  // Flip the underlying credit to refunded so it no longer counts toward
  // the patient's active balance. Skip if the credit was somehow deleted.
  if (req.source_credit_id) {
    await supabase
      .from("credits")
      .update({ status: "refunded" })
      .eq("id", req.source_credit_id);
  }

  return { success: true };
}

export async function rejectRefundRequest(
  requestId: string,
  adminNotes?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: req } = await supabase
    .from("refund_requests")
    .select("id, status")
    .eq("id", requestId)
    .single();
  if (!req) return { success: false, error: "בקשה לא נמצאה" };
  if (req.status !== "pending") {
    return { success: false, error: "ניתן לדחות רק בקשות ממתינות" };
  }

  const { error } = await supabase
    .from("refund_requests")
    .update({
      status: "rejected",
      admin_notes: adminNotes ?? null,
      resolved_by_admin_id: user.id,
      resolved_at: new Date().toISOString(),
    })
    .eq("id", requestId);
  if (error) return { success: false, error: "שגיאה בדחיית הבקשה" };

  // Credit stays active — patient can still use it at checkout.
  return { success: true };
}

export async function fetchPendingRefundCount(): Promise<number> {
  const supabase = await createClient();
  const { count } = await supabase
    .from("refund_requests")
    .select("id", { count: "exact", head: true })
    .eq("status", "pending");
  return count ?? 0;
}
