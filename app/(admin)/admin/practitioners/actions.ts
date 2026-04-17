"use server";

import { createAdminClient } from "@/lib/supabase/admin";

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

export async function approvePractitioner(practitionerId: string) {
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("practitioner_profiles")
    .update({
      verification_status: "approved",
      is_publicly_visible: true,
      updated_at: new Date().toISOString(),
    })
    .eq("id", practitionerId);

  if (error) return { success: false, error: "שגיאה באישור המטפל" };

  // Mark onboarding as complete
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("user_id")
    .eq("id", practitionerId)
    .single();

  if (profile) {
    await supabase.from("users").update({ onboarding_completed: true }).eq("id", profile.user_id);
  }

  return { success: true };
}

export async function rejectPractitioner(practitionerId: string, reason: string) {
  const supabase = createAdminClient();
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
  return { success: true };
}
