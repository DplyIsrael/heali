"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface WalletCredit {
  id: string;
  amount: number;
  status: "active" | "used" | "refunded";
  createdAt: string;
  sourceLabel: string;
  /** true when there's a refund_request with status="pending" pointing at this credit */
  hasPendingRefundRequest: boolean;
}

export interface WalletData {
  activeBalance: number;
  credits: WalletCredit[];
}

export async function fetchWalletData(): Promise<WalletData> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { activeBalance: 0, credits: [] };

  const { data: credits } = await supabase
    .from("credits")
    .select("id, amount, status, source_booking_id, created_at")
    .eq("patient_id", user.id)
    .order("created_at", { ascending: false });

  // refund_requests table may not exist yet on environments where the
  // migration (db/migrations/2026-06-refund-requests.sql) hasn't been
  // applied. Tolerate that — credits still render; pending badges just
  // won't appear until the migration lands.
  let pendingCreditIds = new Set<string>();
  try {
    const { data: pendingRefunds } = await supabase
      .from("refund_requests")
      .select("source_credit_id")
      .eq("patient_id", user.id)
      .eq("status", "pending");
    pendingCreditIds = new Set(
      (pendingRefunds ?? [])
        .map((r: { source_credit_id: string | null }) => r.source_credit_id)
        .filter(Boolean) as string[]
    );
  } catch {
    // Table doesn't exist yet — treat as no pending refunds.
  }

  let activeBalance = 0;
  const mapped: WalletCredit[] = (credits ?? []).map((c: Record<string, unknown>) => {
    const amount = Number(c.amount);
    const status = c.status as WalletCredit["status"];
    if (status === "active") activeBalance += amount;
    return {
      id: c.id as string,
      amount,
      status,
      createdAt: c.created_at as string,
      // source_booking_id present ⇒ refund from a cancelled booking.
      // null ⇒ admin manually granted credit (no source booking).
      sourceLabel: c.source_booking_id ? "החזר על ביטול טיפול" : "זיכוי מהצוות",
      hasPendingRefundRequest: pendingCreditIds.has(c.id as string),
    };
  });

  return {
    activeBalance: Number(activeBalance.toFixed(2)),
    credits: mapped,
  };
}

// Patient requests a cash refund for one specific active credit. The credit
// stays active until admin approves the request (at which point its status
// flips to "refunded" and an external wire transfer is initiated by admin).
export async function requestRefund(
  creditId: string,
  reason: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Validate credit belongs to caller and is currently active.
  const { data: credit } = await supabase
    .from("credits")
    .select("id, patient_id, amount, status")
    .eq("id", creditId)
    .single();
  if (!credit) return { success: false, error: "זיכוי לא נמצא" };
  if (credit.patient_id !== user.id) return { success: false, error: "לא מורשה" };
  if (credit.status !== "active") {
    return { success: false, error: "ניתן לבקש החזר רק על זיכויים זמינים" };
  }

  // Reject duplicate pending requests for the same credit (unique partial
  // index also enforces this at the DB level — this just gives a friendly error).
  const { data: existing } = await supabase
    .from("refund_requests")
    .select("id")
    .eq("source_credit_id", creditId)
    .eq("status", "pending")
    .limit(1);
  if (existing && existing.length > 0) {
    return { success: false, error: "בקשת החזר על זיכוי זה כבר ממתינה לטיפול" };
  }

  const { error } = await supabase.from("refund_requests").insert({
    patient_id: user.id,
    source_credit_id: creditId,
    amount: credit.amount,
    reason: reason.trim() || null,
    status: "pending",
  });

  if (error) {
    console.error("[requestRefund] insert failed:", error);
    return { success: false, error: "שגיאה בשליחת הבקשה" };
  }
  return { success: true };
}
