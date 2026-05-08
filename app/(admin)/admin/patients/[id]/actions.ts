"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface ActionResult {
  success: boolean;
  error?: string;
}

/**
 * Add a one-off site credit to a patient's wallet. Recorded in the
 * `credits` table with no source booking — admins can reference it
 * later via createdAt + amount.
 */
export async function addCreditToPatient(
  patientId: string,
  amount: number
): Promise<ActionResult> {
  if (!Number.isFinite(amount) || amount <= 0) {
    return { success: false, error: "סכום לא תקין" };
  }
  const supabase = createAdminClient();
  const { error } = await supabase.from("credits").insert({
    patient_id: patientId,
    amount: amount.toFixed(2),
    status: "active",
  });
  if (error) return { success: false, error: "שגיאה בהוספת זיכוי" };
  return { success: true };
}

export async function setPatientBlocked(
  patientId: string,
  blocked: boolean
): Promise<ActionResult> {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("users")
    .update({ is_blocked: blocked, updated_at: new Date().toISOString() })
    .eq("id", patientId);
  if (error) return { success: false, error: "שגיאה בעדכון סטטוס" };
  return { success: true };
}
