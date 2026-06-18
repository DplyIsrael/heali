"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { redirect } from "next/navigation";
import { checkRateLimit } from "@/lib/rate-limit";

interface ActionResult {
  success: boolean;
  error?: string;
  needsVerification?: boolean;
  canResume?: boolean;
}

/**
 * Recover an orphan unconfirmed auth user so a fresh signup can proceed.
 * Returns true when we found-and-deleted the orphan (caller should retry the
 * signup). Returns false when no orphan was found, OR the orphan IS confirmed
 * (a real duplicate — caller should surface the duplicate-email error).
 *
 * The "orphan" scenarios this handles:
 *   - auth.users has the email, email_confirmed_at IS NULL — abandoned signup
 *   - public.users may or may not have a mirror row; we delete both to be safe
 */
async function recoverOrphanUnconfirmedAuthUser(
  admin: ReturnType<typeof createAdminClient>,
  email: string
): Promise<boolean> {
  try {
    // listUsers is paginated; the lowest-pain way to find by email is the
    // page-1 default which Supabase sorts by created_at desc. Most orphans
    // sit on the first page; fall back to no-op if not found there.
    const { data: list } = await admin.auth.admin.listUsers({ page: 1, perPage: 200 });
    const lower = email.trim().toLowerCase();
    const orphan = list?.users?.find(
      (u) => (u.email ?? "").toLowerCase() === lower
    );
    if (!orphan) return false;
    if (orphan.email_confirmed_at) return false; // genuine confirmed user — don't delete
    // Drop the public.users mirror first (FKs cascade from auth.users delete
    // for some tables but not all — be explicit).
    await admin.from("users").delete().eq("id", orphan.id);
    await admin.auth.admin.deleteUser(orphan.id);
    return true;
  } catch (err) {
    console.error("[recoverOrphanUnconfirmedAuthUser] failed:", err);
    return false;
  }
}

export async function signIn(
  email: string,
  password: string
): Promise<ActionResult & { redirectTo?: string }> {
  // 5 attempts / minute per IP for login — blunts credential stuffing.
  const rl = await checkRateLimit({ bucket: "auth-signin", max: 5, windowSeconds: 60 });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

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
  // 3 signups / 5 min per IP — light enough not to bother real users,
  // stops scripted abuse.
  const rl = await checkRateLimit({ bucket: "auth-signup", max: 3, windowSeconds: 300 });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

  const admin = createAdminClient();

  // NOTE: we used to pre-check `public.users` here and short-circuit when a
  // row existed. That false-positived on orphan rows from earlier signups
  // that never completed verification — the row was in public.users but the
  // corresponding auth.users entry was unconfirmed (or even missing), so the
  // user couldn't sign up AND couldn't log in. We now let Supabase be the
  // source of truth, and on "already registered" we try to recover stale
  // unconfirmed rows so the user isn't permanently locked out by their own
  // earlier abandonment.

  // Use admin API — still requires email verification
  const { data: authData, error: authError } = await admin.auth.admin.createUser({
    email,
    password,
    email_confirm: false, // Require email verification
    user_metadata: { full_name: fullName, role: "patient" },
  });

  if (authError) {
    const msg = (authError.message ?? "").toLowerCase();
    // RATE LIMIT — Supabase's own per-IP / per-project signup throttle.
    // This is NOT a duplicate; surface it as such instead of misclassifying.
    if (msg.includes("rate limit") || msg.includes("too many")) {
      return {
        success: false,
        error: "הגעת למגבלת הרשמות במערכת. נסה שוב בעוד כמה דקות.",
      };
    }
    // EMAIL VALIDATION — invalid format, bounced domain, etc.
    if (msg.includes("invalid") && msg.includes("email")) {
      return { success: false, error: "כתובת המייל אינה תקינה" };
    }
    // DUPLICATE — try orphan recovery first.
    if (msg.includes("already been registered") || msg.includes("already exists") || msg.includes("already registered")) {
      const recovered = await recoverOrphanUnconfirmedAuthUser(admin, email);
      if (recovered) {
        const retry = await admin.auth.admin.createUser({
          email,
          password,
          email_confirm: false,
          user_metadata: { full_name: fullName, role: "patient" },
        });
        if (retry.error) {
          console.error("[signUpPatient] retry after recovery failed:", retry.error);
          return { success: false, error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר." };
        }
        if (retry.data.user) {
          const { error: insertError } = await admin.from("users").insert({
            id: retry.data.user.id,
            email,
            full_name: fullName,
            role: "patient",
            onboarding_completed: false,
          });
          if (insertError) {
            console.error("[signUpPatient] insert after recovery failed:", insertError);
            return { success: false, error: `DB error: ${insertError.message}` };
          }
          const supabase = await createClient();
          await supabase.auth.resend({ type: "signup", email });
        }
        return { success: true, needsVerification: true };
      }
      return { success: false, error: "כתובת מייל זו כבר רשומה ומאומתת במערכת. נסה להתחבר." };
    }
    // UNKNOWN — log everything we have, surface the raw message so it's
    // actionable instead of pretending it's a duplicate.
    console.error("[signUpPatient] unhandled auth error:", authError);
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
  // Shares the auth-signup bucket with patient signups.
  const rl = await checkRateLimit({ bucket: "auth-signup", max: 3, windowSeconds: 300 });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

  const cities = Array.from(new Set(clinicAddresses.map((a) => a.city).filter(Boolean)));
  const formattedAddresses = clinicAddresses
    .filter((a) => a.city && a.street)
    .map((a) => `${a.city} - ${a.street}`);
  const admin = createAdminClient();

  // See note on the patient path. We previously pre-checked public.users and
  // false-positived on orphan rows from incomplete signups. Now we let
  // Supabase decide and recover unconfirmed orphans below.

  // Use regular signUp to trigger the confirmation email automatically.
  // Wrapped in a helper so we can retry once after orphan recovery.
  const supabase = await createClient();
  const doSignUp = () =>
    supabase.auth.signUp({
      email,
      password,
      options: {
        data: { full_name: fullName, role: "practitioner", gender },
        emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL ?? "https://heali.vercel.app"}/auth/callback`,
      },
    });

  let { data: authData, error: authError } = await doSignUp();

  // First check explicit auth errors — separating rate-limit (which is a
  // real server-side signup throttle) from "already registered" (real
  // duplicate). My earlier version conflated them and triggered orphan
  // recovery on rate limits, then surfaced the wrong message when no
  // orphan existed.
  if (authError) {
    const msg = (authError.message ?? "").toLowerCase();
    if (msg.includes("rate limit") || msg.includes("too many")) {
      return {
        success: false,
        error: "הגעת למגבלת הרשמות במערכת. נסה שוב בעוד כמה דקות.",
      };
    }
    if (msg.includes("invalid") && msg.includes("email")) {
      return { success: false, error: "כתובת המייל אינה תקינה" };
    }
    if (!msg.includes("already registered") && !msg.includes("already exists")) {
      console.error("[signUpPractitioner] unhandled auth error:", authError);
      return { success: false, error: authError.message };
    }
    // Fall through to duplicate-handling below.
  }

  // Now check the duplicate signal: explicit "already registered" auth
  // error OR a user object with an empty identities array (Supabase's
  // privacy-preserving "dupe but unconfirmed" signal).
  const isAlreadyRegisteredError =
    authError &&
    ((authError.message ?? "").toLowerCase().includes("already registered") ||
      (authError.message ?? "").toLowerCase().includes("already exists"));
  const isEmptyIdentities =
    !!authData?.user && authData.user.identities?.length === 0;

  if (isAlreadyRegisteredError || isEmptyIdentities) {
    const recovered = await recoverOrphanUnconfirmedAuthUser(admin, email);
    if (recovered) {
      const retry = await doSignUp();
      authData = retry.data;
      authError = retry.error;
      if (authError) {
        console.error("[signUpPractitioner] retry after recovery failed:", authError);
        return { success: false, error: authError.message };
      }
    } else {
      return {
        success: false,
        canResume: true,
        error: "כתובת מייל זו כבר רשומה ומאומתת במערכת. נסה להתחבר.",
      };
    }
  }

  if (authData?.user && authData.user.identities?.length === 0) {
    // Recovery didn't fully clear it (rare) — log + surface canResume hint.
    console.error("[signUpPractitioner] still empty identities after recovery:", { email });
    return {
      success: false,
      canResume: true,
      error: "כתובת מייל זו כבר רשומה במערכת. נסה להתחבר.",
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

/**
 * Verify the 6-digit OTP from the signup confirmation email. Requires
 * the Supabase email template "Confirm signup" to use {{ .Token }}
 * (the OTP code) instead of {{ .ConfirmationURL }}.
 */
export async function verifyEmailOtp(email: string, token: string): Promise<ActionResult> {
  if (!email || !token) return { success: false, error: "חסר אימייל או קוד" };
  // 10 verification attempts per email per 5 min — generous but blocks brute force.
  const rl = await checkRateLimit({
    bucket: "auth-verify",
    max: 10,
    windowSeconds: 300,
    identifier: email.toLowerCase(),
  });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

  const supabase = await createClient();
  const { error } = await supabase.auth.verifyOtp({ email, token, type: "email" });
  if (error) {
    if (error.message.toLowerCase().includes("expired")) {
      return { success: false, error: "הקוד פג תוקף, נא לבקש קוד חדש" };
    }
    return { success: false, error: "הקוד שגוי או פג תוקף" };
  }
  return { success: true };
}

export async function resendEmailOtp(email: string): Promise<ActionResult> {
  if (!email) return { success: false, error: "חסר אימייל" };
  // 1 resend per email per 60s — enough breathing room for legit users
  // without enabling abuse of the mail server.
  const rl = await checkRateLimit({
    bucket: "auth-resend",
    max: 1,
    windowSeconds: 60,
    identifier: email.toLowerCase(),
  });
  if (!rl.success) {
    return { success: false, error: `נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }
  const supabase = await createClient();
  const { error } = await supabase.auth.resend({ type: "signup", email });
  if (error) return { success: false, error: error.message };
  return { success: true };
}

export async function resetPassword(email: string): Promise<ActionResult> {
  // Cap forgot-password to 3 per IP per 5 min so we don't spam users with
  // reset mails or open an enumeration surface.
  const rl = await checkRateLimit({ bucket: "auth-reset", max: 3, windowSeconds: 300 });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

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
