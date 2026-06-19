"use server";

import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";

export interface PayoutGroup {
  practitionerId: string;
  practitionerUserId: string;
  practitionerName: string;
  bankName: string;
  bankAccountNumber: string;
  bankBranchNumber: string;
  bankNumber: string;
  bookingIds: string[];
  bookingCount: number;
  amountOwed: number;
  oldestUnpaidAt: string | null;
}

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Group unpaid completed bookings by practitioner so admin can see who
 * is owed how much. A booking is "unpaid" when it's been charged but
 * paid_out_at is still NULL.
 */
export async function fetchPendingPayouts(): Promise<PayoutGroup[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: bookings } = await supabase
    .from("bookings")
    .select(`
      id, practitioner_id, price_at_booking, scheduled_date,
      practitioner_profiles!inner (
        user_id,
        users!inner (full_name)
      )
    `)
    .eq("status", "completed")
    .eq("payment_status", "charged")
    .is("paid_out_at", null)
    .order("scheduled_date", { ascending: true });

  if (!bookings || bookings.length === 0) return [];

  const groups: Record<string, PayoutGroup> = {};
  for (const b of bookings) {
    const row = b as Record<string, unknown>;
    const profile = row.practitioner_profiles as unknown as {
      user_id: string;
      users: { full_name: string };
    };
    const id = row.practitioner_id as string;
    if (!groups[id]) {
      groups[id] = {
        practitionerId: id,
        practitionerUserId: profile.user_id,
        practitionerName: profile.users?.full_name ?? "",
        bankName: "",
        bankAccountNumber: "",
        bankBranchNumber: "",
        bankNumber: "",
        bookingIds: [],
        bookingCount: 0,
        amountOwed: 0,
        oldestUnpaidAt: null,
      };
    }
    groups[id].bookingIds.push(row.id as string);
    groups[id].bookingCount += 1;
    groups[id].amountOwed += Number(row.price_at_booking ?? 0);
    const scheduled = row.scheduled_date as string;
    if (!groups[id].oldestUnpaidAt || scheduled < groups[id].oldestUnpaidAt) {
      groups[id].oldestUnpaidAt = scheduled;
    }
  }

  // Bank details live in a separate admin-only table — merge them in.
  const ids = Object.keys(groups);
  if (ids.length > 0) {
    const { data: banks } = await supabase
      .from("practitioner_bank_details")
      .select("practitioner_id, bank_name, bank_account_number, bank_branch_number, bank_number")
      .in("practitioner_id", ids);
    for (const bk of banks ?? []) {
      const g = groups[bk.practitioner_id as string];
      if (g) {
        g.bankName = (bk.bank_name as string) ?? "";
        g.bankAccountNumber = (bk.bank_account_number as string) ?? "";
        g.bankBranchNumber = (bk.bank_branch_number as string) ?? "";
        g.bankNumber = (bk.bank_number as string) ?? "";
      }
    }
  }

  return Object.values(groups).sort((a, b) => b.amountOwed - a.amountOwed);
}

/**
 * Admin marks a payout group as paid — every booking in `bookingIds` gets
 * paid_out_at = now. Admin has already done the bank transfer outside the
 * platform.
 */
export async function markPayoutAsPaid(bookingIds: string[]): Promise<ActionResult> {
  await requireAdmin();
  if (bookingIds.length === 0) return { success: false, error: "אין טיפולים לסימון" };
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("bookings")
    .update({ paid_out_at: new Date().toISOString() })
    .in("id", bookingIds);
  if (error) return { success: false, error: "שגיאה בסימון תשלום" };
  return { success: true };
}
