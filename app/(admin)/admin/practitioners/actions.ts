"use server";

import QRCode from "qrcode";
import { createAdminClient } from "@/lib/supabase/admin";
import { requireAdmin } from "@/lib/auth/require-admin";
import { sendEmail } from "@/lib/email/client";
import { practitionerApprovedEmail, practitionerRejectedEmail } from "@/lib/email/templates";

// Hebrew labels for fields that can be edited during admin review.
// Used in the approval email when changes are made.
const FIELD_LABELS: Record<string, string> = {
  phone: "טלפון",
  city: "עיר",
  clinic_cities: "ערי קליניקה",
  clinic_addresses: "כתובות קליניקה",
  home_visits: "טיפולי בית",
  domain_ids: "תחומי טיפול",
  specialty_ids: "התמחויות",
  pricing_model: "מודל תמחור",
  price: "מחיר",
  languages: "שפות",
  bio: "ביוגרפיה",
};

export interface PractitionerEdits {
  phone?: string;
  city?: string;
  clinic_cities?: string[];
  clinic_addresses?: string[];
  home_visits?: boolean;
  domain_ids?: string[];
  specialty_ids?: string[];
  pricing_model?: string;
  price?: string;
  languages?: string[];
  bio?: string;
}

export interface AdminPractitioner {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  domainNames: string[];
  status: string;
  createdAt: string;
  isPubliclyVisible: boolean;
}

export async function fetchAllPractitioners(statusFilter?: string): Promise<AdminPractitioner[]> {
  await requireAdmin();
  const supabase = createAdminClient();

  let query = supabase
    .from("practitioner_profiles")
    .select(`
      id, user_id, phone, city, domain_ids, verification_status,
      is_publicly_visible, created_at,
      users!inner (full_name, email)
    `)
    .order("created_at", { ascending: false });

  if (statusFilter && statusFilter !== "all") {
    query = query.eq("verification_status", statusFilter);
  }

  const { data } = await query;

  const allDomainIds = [...new Set((data ?? []).flatMap((p: Record<string, unknown>) => (p.domain_ids as string[]) || []))];
  let domainMap: Record<string, string> = {};
  if (allDomainIds.length > 0) {
    const { data: domains } = await supabase.from("treatment_domains").select("id, name").in("id", allDomainIds);
    domainMap = (domains ?? []).reduce((acc: Record<string, string>, d: { id: string; name: string }) => { acc[d.id] = d.name; return acc; }, {});
  }

  return (data ?? []).map((p: Record<string, unknown>) => {
    const user = p.users as unknown as { full_name: string; email: string };
    const domainIds = (p.domain_ids as string[]) || [];
    return {
      id: p.id as string,
      userId: p.user_id as string,
      name: user.full_name,
      email: user.email,
      phone: (p.phone as string) ?? "",
      city: (p.city as string) ?? "",
      domainNames: domainIds.map((id: string) => domainMap[id]).filter(Boolean),
      status: p.verification_status as string,
      createdAt: p.created_at as string,
      isPubliclyVisible: p.is_publicly_visible as boolean,
    };
  });
}

/**
 * Approve a practitioner. Persists any admin field edits, computes the diff
 * vs the practitioner's last submitted values, generates a unique QR token,
 * and sends an email with the QR + (if applicable) the list of changed fields.
 */
export async function approvePractitioner(
  practitionerId: string,
  edits: PractitionerEdits = {}
) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from("practitioner_profiles")
    .select("*, users!inner(full_name, email)")
    .eq("id", practitionerId)
    .single();
  if (!before) return { success: false, error: "מטפל לא נמצא" };

  // Compute which submitted fields admin actually changed
  const changedKeys: string[] = [];
  const updates: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(edits)) {
    if (value === undefined) continue;
    const current = (before as Record<string, unknown>)[key];
    const isEqual = Array.isArray(current) && Array.isArray(value)
      ? current.length === value.length && current.every((c, i) => c === value[i])
      : String(current ?? "") === String(value ?? "");
    if (!isEqual) {
      updates[key] = value;
      changedKeys.push(key);
    }
  }

  // Generate a stable per-practitioner QR token if not yet set.
  // Uses the global Web Crypto API (available in Node 19+ and edge runtimes)
  // to avoid the unprefixed "crypto" import that Turbopack is strict about.
  const qrToken = (before.qr_code_url as string | null) ?? crypto.randomUUID();
  updates.qr_code_url = qrToken;
  updates.verification_status = "approved";
  updates.is_publicly_visible = true;
  updates.updated_at = new Date().toISOString();

  const { error } = await supabase
    .from("practitioner_profiles")
    .update(updates)
    .eq("id", practitionerId);
  if (error) return { success: false, error: "שגיאה באישור המטפל" };

  await supabase.from("users").update({ onboarding_completed: true }).eq("id", before.user_id);

  // Generate QR PNG (data URL) for the email
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heali.app";
  const scanUrl = `${siteUrl}/scan/${qrToken}`;
  const qrPngDataUrl = await QRCode.toDataURL(scanUrl, {
    width: 480,
    margin: 2,
    color: { dark: "#21544E", light: "#FFFFFF" },
  });

  const user = before.users as unknown as { full_name: string; email: string };
  const changedFieldLabels = changedKeys.map((k) => FIELD_LABELS[k] ?? k);

  const { subject, html } = practitionerApprovedEmail({
    practitionerName: user.full_name,
    qrPngDataUrl,
    scanUrl,
    changedFieldLabels,
  });
  await sendEmail({ to: user.email, subject, html });

  return { success: true, changedFieldLabels };
}

export async function rejectPractitioner(practitionerId: string, reason: string) {
  await requireAdmin();
  const supabase = createAdminClient();

  const { data: before } = await supabase
    .from("practitioner_profiles")
    .select("user_id, users!inner(full_name, email)")
    .eq("id", practitionerId)
    .single();
  if (!before) return { success: false, error: "מטפל לא נמצא" };

  const { error } = await supabase
    .from("practitioner_profiles")
    .update({
      verification_status: "rejected",
      rejection_reason: reason,
      is_publicly_visible: false,
      updated_at: new Date().toISOString(),
    })
    .eq("id", practitionerId);
  if (error) return { success: false, error: "שגיאה בדחיית המטפל" };

  const user = before.users as unknown as { full_name: string; email: string };
  const { subject, html } = practitionerRejectedEmail({
    practitionerName: user.full_name,
    reason,
  });
  await sendEmail({ to: user.email, subject, html });

  return { success: true };
}
