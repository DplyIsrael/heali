"use server";

import { createClient } from "@/lib/supabase/server";

export interface WalletCredit {
  id: string;
  amount: number;
  status: "active" | "spent" | "expired";
  createdAt: string;
  sourceLabel: string;
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
    };
  });

  return {
    activeBalance: Number(activeBalance.toFixed(2)),
    credits: mapped,
  };
}
