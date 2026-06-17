"use server";

import { createClient } from "@/lib/supabase/server";

export interface MatchedPractitioner {
  id: string;
  name: string;
  domain: string;
  city: string;
  rating: number;
  reviewCount: number;
  price: number;
  profilePhotoUrl: string;
}

/**
 * Surface real approved+visible practitioners after onboarding finishes.
 * Ranking:
 *   1. Same city as the patient (when patient has a city on file)
 *   2. Highest average_rating
 *   3. Most total_reviews
 * Cap defaults to 6 so the screen feels curated, not a discovery dump.
 */
export async function fetchMatchedPractitioners(
  limit: number = 6
): Promise<MatchedPractitioner[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  // Resolve the patient's city — used as the primary ranking signal.
  let patientCity = "";
  if (user) {
    const { data: pat } = await supabase
      .from("patient_profiles")
      .select("city")
      .eq("user_id", user.id)
      .single();
    patientCity = (pat?.city as string) ?? "";
  }

  // Pull the top candidates ordered by rating then review count.
  const { data: profiles } = await supabase
    .from("practitioner_profiles")
    .select(`
      id,
      city,
      price,
      profile_photo_url,
      average_rating,
      total_reviews,
      domain_ids,
      users!inner ( full_name )
    `)
    .eq("verification_status", "approved")
    .eq("is_publicly_visible", true)
    .order("average_rating", { ascending: false, nullsFirst: false })
    .order("total_reviews", { ascending: false, nullsFirst: false })
    .limit(Math.max(limit * 3, 12)); // overfetch so the city-rank can re-sort

  if (!profiles || profiles.length === 0) return [];

  // Resolve domain names for whichever domain_ids appear across candidates.
  const allDomainIds = [
    ...new Set(
      (profiles as Record<string, unknown>[]).flatMap(
        (p) => (p.domain_ids as string[] | null) ?? []
      )
    ),
  ];
  let domainNameMap: Record<string, string> = {};
  if (allDomainIds.length > 0) {
    const { data: domains } = await supabase
      .from("treatment_domains")
      .select("id, name")
      .in("id", allDomainIds);
    domainNameMap = (domains ?? []).reduce(
      (acc: Record<string, string>, d: { id: string; name: string }) => {
        acc[d.id] = d.name;
        return acc;
      },
      {}
    );
  }

  // Map to the wire shape + apply city-first ranking.
  const mapped: MatchedPractitioner[] = (profiles as Record<string, unknown>[]).map((p) => {
    const u = p.users as { full_name?: string } | undefined;
    const domainIds = (p.domain_ids as string[] | null) ?? [];
    const firstDomain = domainIds.map((id) => domainNameMap[id]).find(Boolean) ?? "";
    return {
      id: p.id as string,
      name: u?.full_name ?? "מטפל/ת",
      domain: firstDomain,
      city: (p.city as string) ?? "",
      rating: Number(p.average_rating ?? 0),
      reviewCount: Number(p.total_reviews ?? 0),
      price: Number(p.price ?? 0),
      profilePhotoUrl: (p.profile_photo_url as string) ?? "",
    };
  });

  // Stable sort: same-city first (when patientCity is known) — otherwise
  // preserve the rating-driven order from the SQL fetch.
  if (patientCity) {
    mapped.sort((a, b) => {
      const aSame = a.city === patientCity ? 0 : 1;
      const bSame = b.city === patientCity ? 0 : 1;
      return aSame - bSame;
    });
  }

  return mapped.slice(0, limit);
}
