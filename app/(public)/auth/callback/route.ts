import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { NextResponse } from "next/server";

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get("code");

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const { data: profile } = await supabase
          .from("users")
          .select("id, role, onboarding_completed")
          .eq("id", user.id)
          .single();

        if (!profile) {
          // New OAuth user — create patient by default. Insert via the
          // service-role client: the public users INSERT policy is intentionally
          // omitted so a user can't self-assign role at signup.
          const admin = createAdminClient();
          await admin.from("users").insert({
            id: user.id,
            email: user.email!,
            full_name:
              user.user_metadata?.full_name ?? user.email?.split("@")[0] ?? "",
            role: "patient",
            onboarding_completed: false,
          });
          return NextResponse.redirect(`${origin}/onboarding`);
        }

        // Redirect based on role and onboarding status
        if (profile.role === "admin") {
          return NextResponse.redirect(`${origin}/admin`);
        }
        if (profile.role === "practitioner") {
          if (!profile.onboarding_completed) {
            return NextResponse.redirect(`${origin}/practitioner-onboarding`);
          }
          return NextResponse.redirect(`${origin}/dashboard`);
        }
        if (profile.role === "patient") {
          if (!profile.onboarding_completed) {
            return NextResponse.redirect(`${origin}/onboarding`);
          }
          return NextResponse.redirect(`${origin}/`);
        }
      }

      return NextResponse.redirect(`${origin}/`);
    }
  }

  return NextResponse.redirect(`${origin}/login?error=auth`);
}
