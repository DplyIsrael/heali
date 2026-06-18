import { PublicHeader } from "@/components/shared/public-header";
import { PublicFooter } from "@/components/shared/public-footer";
import { PatientHeader } from "@/components/patient/patient-header";
import { PractitionerHeader } from "@/components/practitioner/practitioner-header";
import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";

// Public pages (discovery, articles, packages, about, contact, …) are shared
// between guests and logged-in users. Render the role-appropriate header so a
// signed-in user keeps their own chrome (avatar + nav) instead of seeing the
// marketing login/register header. Falls back to PublicHeader for guests.
async function resolveHeader() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) return <PublicHeader />;

    const { data: userData } = await supabase
      .from("users")
      .select("full_name, role, profile_photo_url")
      .eq("id", user.id)
      .single();

    const name = userData?.full_name ?? "";

    if (userData?.role === "patient") {
      const { data: profile } = await supabase
        .from("patient_profiles")
        .select("profile_photo_url")
        .eq("user_id", user.id)
        .single();
      return <PatientHeader userName={name} userAvatarUrl={profile?.profile_photo_url ?? ""} userId={user.id} />;
    }

    if (userData?.role === "practitioner") {
      const { data: profile } = await supabase
        .from("practitioner_profiles")
        .select("profile_photo_url")
        .eq("user_id", user.id)
        .single();
      return <PractitionerHeader userName={name} userAvatarUrl={profile?.profile_photo_url ?? ""} userId={user.id} />;
    }

    if (userData?.role === "admin") {
      return <AdminHeader userName={name} userAvatarUrl={userData?.profile_photo_url ?? ""} userId={user.id} />;
    }

    return <PublicHeader />;
  } catch {
    // Never block public pages on an auth hiccup.
    return <PublicHeader />;
  }
}

export default async function PublicLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const header = await resolveHeader();

  return (
    <>
      {header}
      <main>{children}</main>
      <PublicFooter />
    </>
  );
}
