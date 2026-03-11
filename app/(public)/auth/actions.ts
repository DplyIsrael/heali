"use server";

import { createClient } from "@/lib/supabase/server";
import { redirect } from "next/navigation";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function signIn(
  email: string,
  password: string
): Promise<ActionResult> {
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

  // Fetch role for redirect
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
      redirect("/admin");
    } else if (profile?.role === "practitioner") {
      redirect("/dashboard");
    } else if (profile?.role === "patient" && !profile.onboarding_completed) {
      redirect("/onboarding");
    }
  }

  redirect("/");
}

export async function signUpPatient(
  fullName: string,
  email: string,
  password: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "patient" },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { success: false, error: "כתובת מייל זו כבר רשומה במערכת" };
    }
    return { success: false, error: authError.message };
  }

  if (authData.user) {
    // Create user row in our users table
    const { error: insertError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: "patient",
      onboarding_completed: false,
    });

    if (insertError) {
      return { success: false, error: "שגיאה ביצירת החשבון" };
    }
  }

  return { success: true };
}

export async function signUpPractitioner(
  fullName: string,
  email: string,
  password: string,
  phone: string,
  city: string
): Promise<ActionResult> {
  const supabase = await createClient();

  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: { full_name: fullName, role: "practitioner" },
    },
  });

  if (authError) {
    if (authError.message.includes("already registered")) {
      return { success: false, error: "כתובת מייל זו כבר רשומה במערכת" };
    }
    return { success: false, error: authError.message };
  }

  if (authData.user) {
    // Create user row
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      full_name: fullName,
      role: "practitioner",
      onboarding_completed: false,
    });

    if (userError) {
      return { success: false, error: "שגיאה ביצירת החשבון" };
    }

    // Create practitioner profile with draft status
    const { error: profileError } = await supabase
      .from("practitioner_profiles")
      .insert({
        user_id: authData.user.id,
        phone,
        city,
        verification_status: "draft",
      });

    if (profileError) {
      return { success: false, error: "שגיאה ביצירת פרופיל מטפל" };
    }
  }

  return { success: true };
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

  const { data, error } = await supabase.auth.signInWithOAuth({
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
  const supabase = await createClient();
  await supabase.auth.signOut();
  redirect("/login");
}
