"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

const BUCKET = "client-documents";
const SIGNED_URL_TTL_SECONDS = 60 * 60; // 1 hour

/**
 * Issue a short-lived signed URL for a private client-documents object.
 *
 * Access policy:
 *   - Admins can sign URLs for any object.
 *   - Practitioners can sign URLs for objects under their own user-id prefix.
 *   - Everyone else is denied.
 *
 * Backward compat: if the column already contains a full http(s) URL (legacy
 * data from when the bucket was public), it's returned as-is. New rows store
 * just the storage path (e.g., "invoices/<user-id>/<ts>.pdf").
 */
export async function getSignedClientDocumentUrl(
  pathOrUrl: string
): Promise<{ url: string | null; error?: string }> {
  if (!pathOrUrl) return { url: null, error: "missing path" };

  // Legacy: full URL → return unchanged. Anything written after the bucket
  // migration is a pure path with no scheme.
  if (pathOrUrl.startsWith("http://") || pathOrUrl.startsWith("https://")) {
    return { url: pathOrUrl };
  }

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { url: null, error: "not authenticated" };

  // Authorization
  const { data: caller } = await supabase
    .from("users")
    .select("role")
    .eq("id", user.id)
    .single();
  const isAdmin = caller?.role === "admin";

  // Path shape: "<subpath>/<owner-user-id>/<filename>"
  const ownerId = pathOrUrl.split("/")[1];
  if (!isAdmin && ownerId !== user.id) {
    return { url: null, error: "not authorized" };
  }

  const admin = createAdminClient();
  const { data, error } = await admin.storage
    .from(BUCKET)
    .createSignedUrl(pathOrUrl, SIGNED_URL_TTL_SECONDS);

  if (error || !data) {
    console.error("[getSignedClientDocumentUrl] sign failed:", error);
    return { url: null, error: "sign failed" };
  }
  return { url: data.signedUrl };
}
