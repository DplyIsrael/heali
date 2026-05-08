import { AdminHeader } from "@/components/admin/admin-header";
import { createClient } from "@/lib/supabase/server";

export default async function AdminLayout({
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
        .select("full_name, profile_photo_url")
        .eq("id", user.id)
        .single();

      userName = userData?.full_name ?? "";
      userAvatarUrl = userData?.profile_photo_url ?? "";
    }
  } catch {
    // Silently fail — header shows fallback
  }

  return (
    <>
      <AdminHeader userName={userName} userAvatarUrl={userAvatarUrl} userId={userId} />
      <main className="mx-auto max-w-[1440px] px-[50px] py-8">
        {children}
      </main>
    </>
  );
}
