"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PractitionerProfileData {
  name: string;
  email: string;
  phone: string;
  city: string;
  clinicCities: string[];
  domainNames: string[];
  specialtyNames: string[];
  price: number;
  pricingModel: string;
  languages: string[];
  bio: string;
  qrCodeUrl: string;
  profilePhotoUrl: string;
  certificates: { name: string; url: string; size: string }[];
}

export async function fetchProfileData(): Promise<PractitionerProfileData | null> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const admin = createAdminClient();

  const { data: profile } = await admin
    .from("practitioner_profiles")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (!profile) return null;

  const { data: userData } = await admin
    .from("users")
    .select("full_name, email")
    .eq("id", user.id)
    .single();

  // Fetch domain/specialty names
  const domainIds = (profile.domain_ids as string[]) ?? [];
  const specialtyIds = (profile.specialty_ids as string[]) ?? [];
  let domainNames: string[] = [];
  let specialtyNames: string[] = [];

  if (domainIds.length > 0) {
    const { data } = await admin.from("treatment_domains").select("name").in("id", domainIds);
    domainNames = (data ?? []).map((d: { name: string }) => d.name);
  }
  if (specialtyIds.length > 0) {
    const { data } = await admin.from("specialties").select("name").in("id", specialtyIds);
    specialtyNames = (data ?? []).map((s: { name: string }) => s.name);
  }

  // Fetch certificates from storage
  const certificates: { name: string; url: string; size: string }[] = [];
  const { data: files } = await admin.storage.from("certificates").list(user.id);
  if (files) {
    for (const file of files) {
      const { data: urlData } = admin.storage.from("certificates").getPublicUrl(`${user.id}/${file.name}`);
      const sizeStr = file.metadata?.size
        ? file.metadata.size > 1024 * 1024
          ? `${(file.metadata.size / (1024 * 1024)).toFixed(1)} MB`
          : `${Math.round(file.metadata.size / 1024)} KB`
        : "";
      certificates.push({ name: file.name, url: urlData.publicUrl, size: sizeStr });
    }
  }

  return {
    name: userData?.full_name ?? "",
    email: userData?.email ?? "",
    phone: profile.phone ?? "",
    city: profile.city ?? "",
    clinicCities: (profile.clinic_cities as string[]) ?? [],
    domainNames,
    specialtyNames,
    price: Number(profile.price),
    pricingModel: profile.pricing_model,
    languages: (profile.languages as string[]) ?? [],
    bio: profile.bio ?? "",
    qrCodeUrl: profile.qr_code_url ?? "",
    profilePhotoUrl: profile.profile_photo_url ?? "",
    certificates,
  };
}

export async function updatePrice(price: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const { error } = await admin
    .from("practitioner_profiles")
    .update({ price, updated_at: new Date().toISOString() })
    .eq("user_id", user.id);

  if (error) return { success: false, error: "שגיאה בעדכון המחיר" };
  return { success: true };
}

export async function uploadAvatar(base64Data: string, fileExt: string, mimeType: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const admin = createAdminClient();
  const path = `${user.id}/avatar.${fileExt}`;
  const buffer = Buffer.from(base64Data, "base64");

  // Create avatars bucket if needed
  await admin.storage.createBucket("avatars", { public: true }).catch(() => {});

  // Upload (overwrite existing)
  const { error: uploadError } = await admin.storage
    .from("avatars")
    .upload(path, buffer, { contentType: mimeType, upsert: true });

  if (uploadError) return { success: false, error: uploadError.message };

  const { data: { publicUrl } } = admin.storage.from("avatars").getPublicUrl(path);

  // Update profile
  await admin.from("practitioner_profiles").update({
    profile_photo_url: publicUrl,
    updated_at: new Date().toISOString(),
  }).eq("user_id", user.id);

  return { success: true, url: publicUrl };
}

export async function updatePassword(currentPassword: string, newPassword: string) {
  const supabase = await createClient();

  // Verify current password by trying to sign in
  const { data: { user } } = await supabase.auth.getUser();
  if (!user?.email) return { success: false, error: "לא מחובר" };

  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email,
    password: currentPassword,
  });

  if (signInError) return { success: false, error: "הסיסמה הנוכחית שגויה" };

  const { error } = await supabase.auth.updateUser({ password: newPassword });
  if (error) return { success: false, error: error.message };
  return { success: true };
}
