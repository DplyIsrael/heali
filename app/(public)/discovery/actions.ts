"use server";

import { createClient } from "@/lib/supabase/server";

export interface PractitionerSearchParams {
  search?: string;
  domainId?: string;
  specialtyId?: string;
  city?: string;
  gender?: string;
  language?: string;
  minPrice?: number;
  maxPrice?: number;
  minRating?: number;
  sortBy?: "rating" | "price_asc" | "price_desc" | "newest";
  page?: number;
  limit?: number;
}

export interface PractitionerListItem {
  id: string;
  userId: string;
  name: string;
  domainNames: string[];
  price: number;
  pricingModel: string;
  city: string;
  rating: string;
  reviews: number;
  available: boolean;
  bio: string;
  image: string;
  languages: string[];
}

export interface PractitionerSearchResult {
  practitioners: PractitionerListItem[];
  total: number;
  page: number;
  totalPages: number;
}

export async function searchPractitioners(
  params: PractitionerSearchParams = {}
): Promise<PractitionerSearchResult> {
  const supabase = await createClient();
  const page = params.page ?? 1;
  const limit = params.limit ?? 12;
  const offset = (page - 1) * limit;

  // Build query for approved, publicly visible practitioners
  let query = supabase
    .from("practitioner_profiles")
    .select(`
      id,
      user_id,
      domain_ids,
      specialty_ids,
      price,
      pricing_model,
      city,
      area,
      average_rating,
      total_reviews,
      bio,
      profile_photo_url,
      languages,
      is_publicly_visible,
      verification_status,
      created_at,
      display_name
    `, { count: "exact" })
    .eq("verification_status", "approved")
    .eq("is_publicly_visible", true);

  // Filter by city
  if (params.city) {
    query = query.eq("city", params.city);
  }

  // Filter by language
  if (params.language) {
    query = query.contains("languages", [params.language]);
  }

  // Filter by price range
  if (params.minPrice !== undefined) {
    query = query.gte("price", params.minPrice);
  }
  if (params.maxPrice !== undefined) {
    query = query.lte("price", params.maxPrice);
  }

  // Filter by minimum rating
  if (params.minRating !== undefined) {
    query = query.gte("average_rating", params.minRating);
  }

  // Filter by domain
  if (params.domainId) {
    query = query.contains("domain_ids", [params.domainId]);
  }

  // Filter by specialty
  if (params.specialtyId) {
    query = query.contains("specialty_ids", [params.specialtyId]);
  }

  // Sorting
  switch (params.sortBy) {
    case "rating":
      query = query.order("average_rating", { ascending: false });
      break;
    case "price_asc":
      query = query.order("price", { ascending: true });
      break;
    case "price_desc":
      query = query.order("price", { ascending: false });
      break;
    case "newest":
      query = query.order("created_at", { ascending: false });
      break;
    default:
      query = query.order("average_rating", { ascending: false });
  }

  // Pagination
  query = query.range(offset, offset + limit - 1);

  const { data, count, error } = await query;

  if (error) {
    console.error("Search practitioners error:", error);
    return { practitioners: [], total: 0, page, totalPages: 0 };
  }

  // Fetch domain names for display
  const allDomainIds = [...new Set((data ?? []).flatMap((p: Record<string, unknown>) => (p.domain_ids as string[]) || []))];
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

  const practitioners: PractitionerListItem[] = (data ?? []).map((p: Record<string, unknown>) => {
    const domainIds = (p.domain_ids as string[]) || [];

    return {
      id: p.id as string,
      userId: p.user_id as string,
      name: (p.display_name as string) ?? "",
      domainNames: domainIds.map((id: string) => domainMap[id] ?? "").filter(Boolean),
      price: Number(p.price) || 0,
      pricingModel: p.pricing_model as string,
      city: (p.city as string) ?? "",
      rating: `${Number(p.average_rating || 0).toFixed(1)}/5`,
      reviews: (p.total_reviews as number) ?? 0,
      available: true, // TODO: compute from availability schedule
      bio: (p.bio as string) ?? "",
      image: (p.profile_photo_url as string) ?? "/images/practitioners/practitioner-1.jpg",
      languages: (p.languages as string[]) ?? [],
    };
  });

  const total = count ?? 0;

  return {
    practitioners,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
}

export async function fetchFilterOptions() {
  const supabase = await createClient();

  const [domainsRes, citiesRes] = await Promise.all([
    supabase
      .from("treatment_domains")
      .select("id, name")
      .eq("is_active", true)
      .order("name"),
    supabase
      .from("practitioner_profiles")
      .select("city")
      .eq("verification_status", "approved")
      .eq("is_publicly_visible", true)
      .not("city", "is", null),
  ]);

  const domains = domainsRes.data ?? [];
  const cities = [...new Set((citiesRes.data ?? []).map((c: { city: string }) => c.city).filter(Boolean))].sort();

  return { domains, cities };
}
