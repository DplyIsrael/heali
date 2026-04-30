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

export async function fetchSpecialties(domainIds: string[], includeIds: string[] = []) {
  const supabase = await createClient();
  if (domainIds.length === 0 && includeIds.length === 0) return [];

  // Active specialties for the practitioner's chosen domains
  let active: { id: string; name: string; domain_id: string }[] = [];
  if (domainIds.length > 0) {
    const { data } = await supabase
      .from("specialties")
      .select("id, name, domain_id")
      .in("domain_id", domainIds)
      .eq("is_active", true)
      .order("name");
    active = data ?? [];
  }

  // Always include any specialties the practitioner has already saved — even
  // pending ones they submitted that haven't been approved yet
  let mine: { id: string; name: string; domain_id: string }[] = [];
  if (includeIds.length > 0) {
    const { data } = await supabase
      .from("specialties")
      .select("id, name, domain_id")
      .in("id", includeIds);
    mine = data ?? [];
  }

  // Dedupe by name — same specialty seeded across multiple domains shows once
  const seen = new Set<string>();
  return [...active, ...mine].filter((s) => {
    if (seen.has(s.name)) return false;
    seen.add(s.name);
    return true;
  });
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

  // Reuse any existing row by this name, regardless of domain or active state.
  // Active match → instantly usable. Pending match → still tied to original
  // submitter's approval queue.
  const { data: existing } = await supabase
    .from("specialties")
    .select("id")
    .ilike("name", name)
    .limit(1);

  if (existing && existing.length > 0) {
    return { success: true, id: existing[0].id };
  }

  // New custom submission — insert as pending (is_active=false). Admin must
  // approve before it appears for other practitioners.
  const { data, error } = await supabase
    .from("specialties")
    .insert({ name, domain_id: domainId, is_active: false })
    .select("id")
    .single();

  if (error) return { success: false, error: "שגיאה בהוספת התמחות" };

  // Notify admins so they see something to review
  const admin = createAdminClient();
  const { data: admins } = await admin.from("users").select("id").eq("role", "admin");
  if (admins && admins.length > 0) {
    await admin.from("notifications").insert(
      admins.map((a: { id: string }) => ({
        user_id: a.id,
        type: "new_specialty_pending",
        payload: { specialtyId: data.id, name },
      }))
    );
  }

  return { success: true, id: data.id };
}

export async function fetchCertificates(): Promise<{ name: string; size: string; url: string }[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return [];

  const { data: docs } = await supabase
    .from("practitioner_documents")
    .select("file_url, file_name")
    .eq("practitioner_id", profile.id)
    .order("uploaded_at", { ascending: true });

  return (docs ?? []).map((d: { file_url: string; file_name: string }) => ({
    name: d.file_name,
    size: "",
    url: d.file_url,
  }));
}

export async function deleteCertificate(fileUrl: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { data: profile } = await admin
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();
  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  const { error } = await admin
    .from("practitioner_documents")
    .delete()
    .eq("practitioner_id", profile.id)
    .eq("file_url", fileUrl);

  if (error) return { success: false, error: "שגיאה במחיקת הקובץ" };
  return { success: true };
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
