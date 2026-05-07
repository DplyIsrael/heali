"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";

interface ActionResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
  canResume?: boolean;
}

export async function signIn(
  email: string,
  password: string
): Promise<ActionResult & { redirectTo?: string }> {
  const supabase = await createClient();

  const { error } = await supabase.auth.signInWithPassword({ email, password });

  if (error) {
    if (error.message.includes("Invalid login")) {
      return { success: false, error: "פרטי התחברות שגויים" };
    }
    if (error.message.includes("Email not confirmed")) {
      return { success: false, error: "יש לאמת את כתובת המייל לפני ההתחברות" };
    }
    return { success: false, error: error.message };
  }

  // Fetch role to determine redirect
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (user) {
    const { data: profile } = await supabase
      .from("users")
      .select("role, onboarding_completed")
      .eq("id", user.id)
      .single();

    if (profile?.role === "admin") {
      return { success: true, redirectTo: "/admin" };
    } else if (profile?.role === "practitioner") {
      if (!profile.onboarding_completed) {
        return { success: true, redirectTo: "/practitioner-onboarding" };
      }
      return { success: true, redirectTo: "/dashboard" };
    } else if (profile?.role === "patient" && !profile.onboarding_completed) {
      return { success: true, redirectTo: "/onboarding" };
    }
  }

  return { success: true, redirectTo: "/" };
}

export async function signUpPatient(
  fullName: string,
  email: string,
  password: string
): Promise<ActionResult> {
  const admin = createAdminClient();

  // Check if user already exists
  const { data: existingUsers } = await admin.from("users").select("id, onboarding_completed").eq("email", email).limit(1);
  if (existingUsers && existingUsers.length > 0) {
    return { success: false, error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר." };
  }

  // Use admin API — still requires email verification
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // Require email verification
    user_metadata: { full_name: fullName, role: "patient" },
  });

  if (authError) {
    if (authError.message.includes("already been registered") || authError.message.includes("already exists")) {
      return { success: false, error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר." };
    }
    return { success: false, error: authError.message };
  }

  if (authData.user) {
    const { error: insertError } = await admin.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: "patient",
      onboarding_completed: false,
    });

    if (insertError) {
      console.error("Patient insert error:", insertError);
      return { success: false, error: `DB error: ${insertError.message}` };
    }

    // Send verification email
    const supabase = await createClient();
    await supabase.auth.resend({ type: "signup", email });
  }

  return { success: true, needsVerification: true };
}

export async function signUpPractitioner(
  fullName: string,
  email: string,
  password: string,
  phone: string,
  clinicAddresses: { city: string; street: string }[],
  homeVisits: boolean,
  gender: string
): Promise<ActionResult> {
  const cities = Array.from(new Set(clinicAddresses.map((a) => a.city).filter(Boolean)));
  const formattedAddresses = clinicAddresses
    .filter((a) => a.city && a.street)
    .map((a) => `${a.city} - ${a.street}`);
  const admin = createAdminClient();

  // Check if user already exists with incomplete onboarding
  const { data: existingUsers } = await admin.from("users").select("id, onboarding_completed, role").eq("email", email).limit(1);
  if (existingUsers && existingUsers.length > 0) {
    const existing = existingUsers[0];
    if (existing.role === "practitioner" && !existing.onboarding_completed) {
      // Allow them to resume — sign them in
      return {
        success: false,
        canResume: true,
        error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר כדי להמשיך את תהליך ההרשמה.",
      };
    }
    return { success: false, error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר." };
  }

  // Use regular signUp to trigger the confirmation email automatically
  const supabase = await createClient();
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "practitioner", gender },
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://heali.vercel.app"}/auth/callback`,
    },
  });

  if (authError) {
    if (authError.message.includes("already registered") || authError.message.includes("rate limit")) {
      return {
        success: false,
        canResume: true,
        error: "כתובת מייל זו כבר רשומה במערכת או שהגעת למגבלת שליחות. נסה להתחבר.",
      };
    }
    return { success: false, error: authError.message };
  }

  // Supabase returns user with empty identities if email already taken
  if (authData.user && authData.user.identities?.length === 0) {
    return {
      success: false,
      canResume: true,
      error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר כדי להמשיך את תהליך ההרשמה.",
    };
  }

  if (authData.user) {
    // Use admin client for DB inserts (bypasses RLS)
    const { error: userError } = await admin.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: "practitioner",
      onboarding_completed: false,
    });

    if (userError) {
      console.error("Practitioner user insert error:", userError);
      return { success: false, error: `DB user error: ${userError.message}` };
    }

    // Create practitioner profile with draft status
    const { error: profileError } = await admin
      .from("practitioner_profiles")
      .insert({
        user_id: authData.user.id,
        phone,
        city: cities[0] ?? "",
        clinic_cities: cities,
        clinic_addresses: formattedAddresses,
        home_visits: homeVisits,
        verification_status: "draft",
      });

    if (profileError) {
      console.error("Practitioner profile insert error:", profileError);
      return { success: false, error: `DB profile error: ${profileError.message}` };
    }
  }

  return { success: true, needsVerification: true };
}

export async function resetPassword(email: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/reset-password`,
  });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function updatePassword(password: string): Promise<ActionResult> {
  const supabase = await createClient();

  const { error } = await supabase.auth.updateUser({ password });

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true };
}

export async function signInWithGoogle(): Promise<void> {
  const supabase = await createClient();

  const { data } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  });

  if (data.url) {
    redirect(data.url);
  }
}

export async function signOut(): Promise<void> {
  // Don't let a transient Supabase error keep the user signed in. We log
  // and still redirect to /login — the worst case is a stale cookie that
  // middleware will clear on the next request.
  try {
    const supabase = await createClient();
    await supabase.auth.signOut();
  } catch (err) {
    console.error("[signOut] supabase.auth.signOut failed:", err);
  }
  redirect("/login");
}
