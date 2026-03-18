"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function saveDomains(domainIds: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({ domain_ids: domainIds, onboarding_step: 2 })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בשמירת תחומי טיפול" };
  return { success: true };
}

export async function saveSpecialties(specialtyIds: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({ specialty_ids: specialtyIds, onboarding_step: 3 })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בשמירת התמחויות" };
  return { success: true };
}

export async function savePricing(
  pricingModel: string,
  price: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({ pricing_model: pricingModel, price, onboarding_step: 4 })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בשמירת תמחור" };
  return { success: true };
}

export async function saveLanguages(languages: string[]): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({ languages, onboarding_step: 6 })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בשמירת שפות" };
  return { success: true };
}

export async function saveBio(
  bio: string,
  certificationDescription?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({ bio, onboarding_step: 7 })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בשמירת ביוגרפיה" };
  return { success: true };
}

export async function saveAgreement(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({ agreement_signed_at: new Date().toISOString(), onboarding_step: 8 })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בשמירת הסכם" };
  return { success: true };
}

export async function submitForApproval(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Update verification status
  const { error: profileError } = await supabase
    .from("practitioner_profiles")
    .update({ verification_status: "submitted" })
    .eq("user_id", user.id);

  if (profileError) return { success: false, error: "שגיאה בשליחת הפרופיל" };

  // Mark onboarding as complete
  const { error: userError } = await supabase
    .from("users")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (userError) return { success: false, error: "שגיאה בהשלמת ההרשמה" };

  // Create admin notification
  await supabase.from("notifications").insert({
    user_id: "00000000-0000-0000-0000-000000000001", // admin
    type: "new_practitioner",
    payload: { practitionerName: user.user_metadata?.full_name ?? "", userId: user.id },
  });

  return { success: true };
}

export async function fetchPractitionerProfile() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("practitioner_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  return data;
}

export async function fetchDomains() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("treatment_domains")
    .select("id, name")
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

export async function fetchSpecialties(domainIds: string[]) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("specialties")
    .select("id, name, domain_id")
    .in("domain_id", domainIds)
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}
