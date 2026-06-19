import { createClient } from "@/lib/supabase/server";

/**
 * Authorization guard for admin server actions.
 *
 * Verifies the caller is authenticated AND has role 'admin', read via the
 * RLS-respecting server client tied to the request session. Throws on failure.
 *
 * Call `await requireAdmin()` at the TOP of every admin server action, BEFORE
 * any privileged (service-role) work. Middleware only gates page navigation;
 * Server Actions are independently-invocable endpoints and must self-authorize.
 */
export async function requireAdmin() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) throw new Error("unauthorized");

  const { data, error } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();

  if (error || data?.role !== "admin") throw new Error("forbidden");
  return user;
}
