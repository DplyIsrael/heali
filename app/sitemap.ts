import type { MetadataRoute } from "next";
import { createClient } from "@supabase/supabase-js";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://heali.vercel.app";

  const staticRoutes: MetadataRoute.Sitemap = [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "weekly", priority: 1 },
    { url: `${baseUrl}/discovery`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/articles`, lastModified: new Date(), changeFrequency: "daily", priority: 0.8 },
    { url: `${baseUrl}/packages`, lastModified: new Date(), changeFrequency: "weekly", priority: 0.7 },
  ];

  // Dynamic practitioner profiles
  let practitionerRoutes: MetadataRoute.Sitemap = [];
  let articleRoutes: MetadataRoute.Sitemap = [];

  try {
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );

    const { data: practitioners } = await supabase
      .from("practitioner_profiles")
      .select("id, updated_at")
      .eq("verification_status", "approved")
      .eq("is_publicly_visible", true);

    practitionerRoutes = (practitioners ?? []).map((p) => ({
      url: `${baseUrl}/practitioners/${p.id}`,
      lastModified: new Date(p.updated_at),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }));

    const { data: articles } = await supabase
      .from("articles")
      .select("slug, updated_at")
      .eq("status", "approved");

    articleRoutes = (articles ?? []).map((a) => ({
      url: `${baseUrl}/articles/${a.slug}`,
      lastModified: new Date(a.updated_at),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    }));
  } catch {
    // Sitemap generation fails gracefully if Supabase is unavailable
  }

  return [...staticRoutes, ...practitionerRoutes, ...articleRoutes];
}
