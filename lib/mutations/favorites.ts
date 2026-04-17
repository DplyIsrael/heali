"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
  isFavorite?: boolean;
}

export async function toggleFavorite(practitionerId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "לא מחובר" };

  // Check if already favorited
  const { data: existing } = await supabase
    .from("favorites")
    .select("id")
    .eq("patient_id", user.id)
    .eq("practitioner_id", practitionerId)
    .single();

  if (existing) {
    // Remove favorite
    const { error } = await supabase
      .from("favorites")
      .delete()
      .eq("id", existing.id);

    if (error) return { success: false, error: "שגיאה בהסרה מהמועדפים" };
    return { success: true, isFavorite: false };
  } else {
    // Add favorite
    const { error } = await supabase
      .from("favorites")
      .insert({
        patient_id: user.id,
        practitioner_id: practitionerId,
      });

    if (error) return { success: false, error: "שגיאה בהוספה למועדפים" };
    return { success: true, isFavorite: true };
  }
}

export async function fetchFavoriteIds(): Promise<string[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data } = await supabase
    .from("favorites")
    .select("practitioner_id")
    .eq("patient_id", user.id);

  return (data ?? []).map((f: { practitioner_id: string }) => f.practitioner_id);
}

export async function fetchFavoritePractitioners() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return [];

  const { data: favs } = await supabase
    .from("favorites")
    .select("practitioner_id")
    .eq("patient_id", user.id);

  if (!favs || favs.length === 0) return [];

  const practitionerIds = favs.map((f: { practitioner_id: string }) => f.practitioner_id);

  const { data: practitioners } = await supabase
    .from("practitioner_profiles")
    .select(`
      id,
      user_id,
      domain_ids,
      price,
      city,
      average_rating,
      total_reviews,
      bio,
      profile_photo_url,
      users!inner (
        full_name
      )
    `)
    .in("id", practitionerIds);

  // Fetch domain names
  const allDomainIds = [...new Set((practitioners ?? []).flatMap((p: Record<string, unknown>) => (p.domain_ids as string[]) || []))];
  let domainMap: Record<string, string> = {};

  if (allDomainIds.length > 0) {
    const { data: domains } = await supabase
      .from("treatment_domains")
      .select("id, name")
      .in("id", allDomainIds);
    domainMap = (domains ?? []).reduce((acc: Record<string, string>, d: { id: string; name: string }) => {
      acc[d.id] = d.name;
      return acc;
    }, {});
  }

  return (practitioners ?? []).map((p: Record<string, unknown>) => {
    const users = p.users as { full_name: string };
    const pDomainIds = (p.domain_ids as string[]) || [];
    return {
      id: p.id as string,
      name: users.full_name,
      domain: pDomainIds.map((id: string) => domainMap[id] ?? "").filter(Boolean)[0] ?? "",
      price: Number(p.price),
      city: (p.city as string) ?? "",
      rating: `${Number(p.average_rating || 0).toFixed(1)}/5`,
      reviews: (p.total_reviews as number) ?? 0,
      available: true,
      bio: (p.bio as string) ?? "",
      image: (p.profile_photo_url as string) ?? "/images/practitioners/practitioner-1.jpg",
      isFavorite: true,
    };
  });
}
