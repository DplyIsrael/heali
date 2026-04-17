"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

interface ActionResult {
  success: boolean;
  error?: string;
}

// Helper: get current user ID via server client, write via admin client
async function getAuthUserId(): Promise<string | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  return user?.id ?? null;
}

export async function saveDomains(domainIds: string[]): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ domain_ids: domainIds, onboarding_step: 2 })
    .eq("user_id", userId);

  if (error) return { success: false, error: "שגיאה בשמירת תחומי טיפול" };
  return { success: true };
}

export async function saveSpecialties(specialtyIds: string[]): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ specialty_ids: specialtyIds, onboarding_step: 3 })
    .eq("user_id", userId);

  if (error) return { success: false, error: "שגיאה בשמירת התמחויות" };
  return { success: true };
}

export async function savePricing(
  pricingModel: string,
  price: string
): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ pricing_model: pricingModel, price, onboarding_step: 4 })
    .eq("user_id", userId);

  if (error) return { success: false, error: "שגיאה בשמירת תמחור" };
  return { success: true };
}

export async function saveLanguages(languages: string[]): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ languages, onboarding_step: 6 })
    .eq("user_id", userId);

  if (error) return { success: false, error: "שגיאה בשמירת שפות" };
  return { success: true };
}

export async function saveBio(
  bio: string,
  _certificationDescription?: string
): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ bio, onboarding_step: 7 })
    .eq("user_id", userId);

  if (error) return { success: false, error: "שגיאה בשמירת ביוגרפיה" };
  return { success: true };
}

export async function saveAgreement(): Promise<ActionResult> {
  const userId = await getAuthUserId();
  if (!userId) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ agreement_signed_at: new Date().toISOString(), onboarding_step: 8 })
    .eq("user_id", userId);

  if (error) return { success: false, error: "שגיאה בשמירת הסכם" };
  return { success: true };
}

export async function submitForApproval(): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Use admin client for DB updates to bypass RLS
  const admin = createAdminClient();

  // Update verification status
  const { error: profileError } = await admin
    .from("practitioner_profiles")
    .update({ verification_status: "submitted" })
    .eq("user_id", user.id);

  if (profileError) return { success: false, error: "שגיאה בשליחת הפרופיל" };

  // Mark onboarding as complete
  const { error: userError } = await admin
    .from("users")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (userError) return { success: false, error: "שגיאה בהשלמת ההרשמה" };

  // Create admin notification — send to all admin users
  const { data: admins } = await admin
    .from("users")
    .select("id")
    .eq("role", "admin");

  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a: { id: string }) => ({
        user_id: a.id,
        type: "new_practitioner",
        payload: { practitionerName: user.user_metadata?.full_name ?? "", userId: user.id },
      }))
    );
  }

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
  if (domainIds.length === 0) return [];
  const { data } = await supabase
    .from("specialties")
    .select("id, name, domain_id")
    .in("domain_id", domainIds)
    .eq("is_active", true)
    .order("name");
  return data ?? [];
}

export async function addCustomDomain(name: string): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("treatment_domains")
    .select("id")
    .ilike("name", name)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, id: existing[0].id };
  }

  const { data, error } = await supabase
    .from("treatment_domains")
    .insert({ name, is_active: true })
    .select("id")
    .single();

  if (error) return { success: false, error: "שגיאה בהוספת תחום טיפול" };
  return { success: true, id: data.id };
}

export async function addCustomSpecialty(
  name: string,
  domainId: string
): Promise<{ success: boolean; id?: string; error?: string }> {
  const supabase = await createClient();

  // Check if already exists
  const { data: existing } = await supabase
    .from("specialties")
    .select("id")
    .ilike("name", name)
    .eq("domain_id", domainId)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, id: existing[0].id };
  }

  const { data, error } = await supabase
    .from("specialties")
    .insert({ name, domain_id: domainId, is_active: true })
    .select("id")
    .single();

  if (error) return { success: false, error: "שגיאה בהוספת התמחות" };
  return { success: true, id: data.id };
}

export async function uploadCertificate(
  base64Data: string,
  fileExt: string,
  mimeType: string
): Promise<{ success: boolean; url?: string; error?: string }> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  // Use admin client for storage upload to bypass RLS
  const admin = createAdminClient();
  const path = `${user.id}/${Date.now()}.${fileExt}`;
  const buffer = Buffer.from(base64Data, "base64");

  const { error: uploadError } = await admin.storage
    .from("certificates")
    .upload(path, buffer, { contentType: mimeType });

  if (uploadError) {
    console.error("Certificate upload error:", uploadError);
    return { success: false, error: uploadError.message };
  }

  const { data: { publicUrl } } = admin.storage.from("certificates").getPublicUrl(path);
  return { success: true, url: publicUrl };
}
