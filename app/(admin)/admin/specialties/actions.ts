"use server";

import { createAdminClient } from "@/lib/supabase/admin";

interface PendingSpecialty {
  id: string;
  name: string;
  domainName: string;
  createdAt: string;
}

export async function fetchPendingSpecialties(): Promise<PendingSpecialty[]> {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("specialties")
    .select("id, name, domain_id, created_at")
    .eq("is_active", false)
    .order("created_at", { ascending: false });

  if (!data || data.length === 0) return [];

  const domainIds = Array.from(new Set(data.map((s: { domain_id: string }) => s.domain_id)));
  const { data: domains } = await supabase
    .from("treatment_domains")
    .select("id, name")
    .in("id", domainIds);
  const domainMap: Record<string, string> = {};
  for (const d of domains ?? []) domainMap[(d as { id: string }).id] = (d as { name: string }).name;

  return data.map((s: { id: string; name: string; domain_id: string; created_at: string }) => ({
    id: s.id,
    name: s.name,
    domainName: domainMap[s.domain_id] ?? "—",
    createdAt: s.created_at,
  }));
}

export async function approvePendingSpecialty(
  specialtyId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Load the pending row to get its name
  const { data: row, error: rowErr } = await supabase
    .from("specialties")
    .select("id, name, domain_id, is_active")
    .eq("id", specialtyId)
    .single();
  if (rowErr || !row) return { success: false, error: "ההתמחות לא נמצאה" };
  if (row.is_active) return { success: true }; // already approved

  // Activate the original row
  const { error: updateErr } = await supabase
    .from("specialties")
    .update({ is_active: true })
    .eq("id", specialtyId);
  if (updateErr) return { success: false, error: "שגיאה באישור ההתמחות" };

  // Propagate: ensure this specialty exists active under every active domain so
  // it shows up regardless of which domain a practitioner picks.
  const { data: domains } = await supabase
    .from("treatment_domains")
    .select("id")
    .eq("is_active", true);

  for (const d of domains ?? []) {
    const domainId = (d as { id: string }).id;
    if (domainId === row.domain_id) continue;
    const { data: exists } = await supabase
      .from("specialties")
      .select("id")
      .eq("name", row.name)
      .eq("domain_id", domainId)
      .limit(1);
    if (exists && exists.length > 0) continue;
    await supabase
      .from("specialties")
      .insert({ name: row.name, domain_id: domainId, is_active: true });
  }

  return { success: true };
}

export async function rejectPendingSpecialty(
  specialtyId: string
): Promise<{ success: boolean; error?: string }> {
  const supabase = createAdminClient();

  // Remove this specialty from every practitioner profile that selected it,
  // then delete the row.
  const { data: profiles } = await supabase
    .from("practitioner_profiles")
    .select("id, specialty_ids")
    .contains("specialty_ids", [specialtyId]);

  for (const p of profiles ?? []) {
    const profile = p as { id: string; specialty_ids: string[] };
    const cleaned = (profile.specialty_ids ?? []).filter((id) => id !== specialtyId);
    await supabase
      .from("practitioner_profiles")
      .update({ specialty_ids: cleaned })
      .eq("id", profile.id);
  }

  const { error } = await supabase.from("specialties").delete().eq("id", specialtyId);
  if (error) return { success: false, error: "שגיאה בדחיית ההתמחות" };
  return { success: true };
}
