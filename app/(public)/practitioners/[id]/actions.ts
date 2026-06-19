"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PractitionerProfile {
  id: string;
  userId: string;
  name: string;
  domainNames: string[];
  specialtyNames: string[];
  price: number;
  pricingModel: string;
  city: string;
  area: string;
  rating: string;
  reviews: number;
  bio: string;
  image: string;
  languages: string[];
  domainIds: string[];
  isHighlyRated: boolean;
}

export interface PractitionerReview {
  id: string;
  reviewerName: string;
  rating: number;
  comment: string;
  createdAt: string;
  isAnonymous: boolean;
}

export async function fetchPractitionerById(id: string): Promise<PractitionerProfile | null> {
  const supabase = await createClient();

  const { data, error } = await supabase
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
      verification_status,
      display_name
    `)
    .eq("id", id)
    .single();

  if (error || !data) return null;

  // Fetch domain names
  const domainIds = (data.domain_ids as string[]) || [];
  const specialtyIds = (data.specialty_ids as string[]) || [];
  let domainNames: string[] = [];
  let specialtyNames: string[] = [];

  if (domainIds.length > 0) {
    const { data: domains } = await supabase
      .from("treatment_domains")
      .select("id, name")
      .in("id", domainIds);
    domainNames = (domains ?? []).map((d: { name: string }) => d.name);
  }

  if (specialtyIds.length > 0) {
    const { data: specialties } = await supabase
      .from("specialties")
      .select("id, name")
      .in("id", specialtyIds);
    specialtyNames = (specialties ?? []).map((s: { name: string }) => s.name);
  }

  const avgRating = Number(data.average_rating || 0);

  return {
    id: data.id,
    userId: data.user_id,
    name: (data.display_name as string) ?? "",
    domainNames,
    specialtyNames,
    price: Number(data.price),
    pricingModel: data.pricing_model,
    city: data.city ?? "",
    area: data.area ?? "",
    rating: `${avgRating.toFixed(1)}/5`,
    reviews: data.total_reviews ?? 0,
    bio: data.bio ?? "",
    image: data.profile_photo_url ?? "/images/practitioners/practitioner-1.jpg",
    languages: (data.languages as string[]) ?? [],
    domainIds: (data.domain_ids as string[]) ?? [],
    isHighlyRated: avgRating >= 4.5,
  };
}

export async function fetchPractitionerReviews(practitionerId: string): Promise<PractitionerReview[]> {
  const supabase = await createClient();
  const admin = createAdminClient();

  // Get bookings for this practitioner, then their reviews
  const { data: bookings } = await admin
    .from("bookings")
    .select("id")
    .eq("practitioner_id", practitionerId);

  if (!bookings || bookings.length === 0) return [];

  const bookingIds = bookings.map((b: { id: string }) => b.id);

  const { data: reviews } = await supabase
    .from("reviews")
    .select("id, rating, comment, reviewer_first_name, is_anonymous, created_at")
    .in("booking_id", bookingIds)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(10);

  return (reviews ?? []).map((r: Record<string, unknown>) => ({
    id: r.id as string,
    reviewerName: (r.is_anonymous ? "אנונימי" : r.reviewer_first_name ?? "מטופל") as string,
    rating: r.rating as number,
    comment: (r.comment as string) ?? "",
    createdAt: r.created_at as string,
    isAnonymous: r.is_anonymous as boolean,
  }));
}

export async function fetchSimilarPractitioners(practitionerId: string, domainIds: string[]) {
  const supabase = await createClient();

  if (domainIds.length === 0) return [];

  const { data } = await supabase
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
      display_name
    `)
    .eq("verification_status", "approved")
    .eq("is_publicly_visible", true)
    .neq("id", practitionerId)
    .overlaps("domain_ids", domainIds)
    .limit(3);

  // Fetch domain names
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

  return (data ?? []).map((p: Record<string, unknown>) => {
    const pDomainIds = (p.domain_ids as string[]) || [];
    return {
      id: p.id as string,
      name: (p.display_name as string) ?? "",
      domain: pDomainIds.map((id: string) => domainMap[id] ?? "").filter(Boolean)[0] ?? "",
      price: Number(p.price),
      city: (p.city as string) ?? "",
      rating: `${Number(p.average_rating || 0).toFixed(1)}/5`,
      reviews: (p.total_reviews as number) ?? 0,
      available: true,
      bio: (p.bio as string) ?? "",
      image: (p.profile_photo_url as string) ?? "/images/practitioners/practitioner-1.jpg",
    };
  });
}

export async function fetchPractitionerCertificates(practitionerId: string) {
  const supabase = await createClient();
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("user_id")
    .eq("id", practitionerId)
    .single();

  if (!profile) return [];

  const { data: files } = await supabase.storage.from("certificates").list(profile.user_id);
  if (!files || files.length === 0) return [];

  return files.map((f) => {
    const { data: urlData } = supabase.storage.from("certificates").getPublicUrl(`${profile.user_id}/${f.name}`);
    return { name: f.name, url: urlData.publicUrl };
  });
}

export async function fetchPractitionerArticles(practitionerId: string) {
  const supabase = await createClient();
  const { data } = await supabase
    .from("articles")
    .select("id, title, slug, background_image_url, created_at, category_id")
    .eq("practitioner_id", practitionerId)
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .limit(3);

  if (!data || data.length === 0) return [];

  const catIds = [...new Set(data.map((a) => a.category_id).filter(Boolean))];
  let catMap: Record<string, string> = {};
  if (catIds.length > 0) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("id", catIds as string[]);
    catMap = (cats ?? []).reduce((acc: Record<string, string>, c: { id: string; name: string }) => { acc[c.id] = c.name; return acc; }, {});
  }

  return data.map((a) => ({
    id: a.id,
    title: a.title,
    slug: a.slug,
    image: a.background_image_url ?? "",
    category: catMap[a.category_id ?? ""] ?? "",
    date: new Date(a.created_at).toLocaleDateString("he-IL"),
  }));
}
