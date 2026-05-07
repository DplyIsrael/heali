import { PatientHeader } from "@/components/patient/patient-header";
import { PublicFooter } from "@/components/shared/public-footer";
import { createClient } from "@/lib/supabase/server";

export default async function PatientLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  let userName = "";
  let userAvatarUrl = "";
  let userId = "";

  try {
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (user) {
      userId = user.id;
      const { data: userData } = await supabase
        .from("users")
        .select("full_name")
        .eq("id", user.id)
        .single();

      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("profile_photo_url")
        .eq("user_id", user.id)
        .single();

      userName = userData?.full_name ?? "";
      userAvatarUrl = profile?.profile_photo_url ?? "";
    }
  } catch {
    // Silently fail — header shows fallback
  }

  return (
    <>
      <PatientHeader userName={userName} userAvatarUrl={userAvatarUrl} userId={userId} />
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
