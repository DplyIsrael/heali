"use server";

import { createClient } from "@/lib/supabase/server";
import type { PersonalDetailsValues } from "@/lib/validations/onboarding";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function savePersonalDetails(
  values: PersonalDetailsValues
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "לא מחובר" };
  }

  // Update user full name
  const { error: userError } = await supabase
    .from("users")
    .update({ full_name: values.fullName })
    .eq("id", user.id);

  if (userError) {
    return { success: false, error: "שגיאה בעדכון פרטים" };
  }

  // Upsert patient profile
  const { error: profileError } = await supabase
    .from("patient_profiles")
    .upsert(
      {
        user_id: user.id,
        date_of_birth: values.dateOfBirth,
        gender: values.gender,
        city: values.city,
        phone: values.phone,
      },
      { onConflict: "user_id" }
    );

  if (profileError) {
    return { success: false, error: "שגיאה בעדכון פרופיל" };
  }

  return { success: true };
}

export async function saveProfilePhoto(
  photoUrl: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "לא מחובר" };
  }

  const { error } = await supabase
    .from("patient_profiles")
    .upsert(
      { user_id: user.id, profile_photo_url: photoUrl },
      { onConflict: "user_id" }
    );

  if (error) {
    return { success: false, error: "שגיאה בשמירת תמונה" };
  }

  return { success: true };
}

export async function saveQuestionnaireResponses(
  responses: Record<string, string>
): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "לא מחובר" };
  }

  const { error } = await supabase
    .from("patient_profiles")
    .upsert(
      { user_id: user.id, questionnaire_responses: responses },
      { onConflict: "user_id" }
    );

  if (error) {
    return { success: false, error: "שגיאה בשמירת תשובות" };
  }

  return { success: true };
}

export async function completeOnboarding(): Promise<ActionResult> {
  const supabase = await createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "לא מחובר" };
  }

  const { error } = await supabase
    .from("users")
    .update({ onboarding_completed: true })
    .eq("id", user.id);

  if (error) {
    return { success: false, error: "שגיאה בהשלמת ההרשמה" };
  }

  return { success: true };
}
