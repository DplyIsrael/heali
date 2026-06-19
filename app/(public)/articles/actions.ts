"use server";

import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

export interface PublicArticle {
  id: string;
  title: string;
  content: string;
  slug: string;
  categoryName: string;
  authorName: string;
  backgroundImageUrl: string;
  createdAt: string;
}

export async function fetchPublicArticles(params?: {
  search?: string;
  categoryId?: string;
  page?: number;
  limit?: number;
}): Promise<{ articles: PublicArticle[]; total: number }> {
  const supabase = await createClient();
  const admin = createAdminClient();
  const page = params?.page ?? 1;
  const limit = params?.limit ?? 12;
  const offset = (page - 1) * limit;

  let query = supabase
    .from("articles")
    .select(`
      id, title, content, slug, category_id, background_image_url, created_at, author_id
    `, { count: "exact" })
    .eq("status", "approved")
    .order("created_at", { ascending: false })
    .range(offset, offset + limit - 1);

  if (params?.categoryId) {
    query = query.eq("category_id", params.categoryId);
  }

  if (params?.search) {
    query = query.or(`title.ilike.%${params.search}%,content.ilike.%${params.search}%`);
  }

  const { data, count, error } = await query;
  if (error) return { articles: [], total: 0 };

  // Fetch category names
  const catIds = [...new Set((data ?? []).map((a: Record<string, unknown>) => a.category_id as string).filter(Boolean))];
  let catMap: Record<string, string> = {};
  if (catIds.length > 0) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("id", catIds);
    catMap = (cats ?? []).reduce((acc: Record<string, string>, c: { id: string; name: string }) => { acc[c.id] = c.name; return acc; }, {});
  }

  // Fetch author names via admin client (authors may be admins or non-approved
  // practitioners with no anon read policy on users)
  const authorIds = [...new Set((data ?? []).map((a: Record<string, unknown>) => a.author_id as string).filter(Boolean))];
  let authorMap: Record<string, string> = {};
  if (authorIds.length > 0) {
    const { data: authors } = await admin.from("users").select("id, full_name").in("id", authorIds);
    authorMap = (authors ?? []).reduce((acc: Record<string, string>, u: { id: string; full_name: string }) => { acc[u.id] = u.full_name; return acc; }, {});
  }

  const articles: PublicArticle[] = (data ?? []).map((a: Record<string, unknown>) => {
    return {
      id: a.id as string,
      title: a.title as string,
      content: a.content as string,
      slug: a.slug as string,
      categoryName: catMap[a.category_id as string] ?? "",
      authorName: authorMap[a.author_id as string] ?? "",
      backgroundImageUrl: (a.background_image_url as string) ?? "",
      createdAt: a.created_at as string,
    };
  });

  return { articles, total: count ?? 0 };
}

export async function fetchArticleBySlug(slug: string): Promise<PublicArticle | null> {
  const supabase = await createClient();
  const admin = createAdminClient();

  const { data, error } = await supabase
    .from("articles")
    .select(`
      id, title, content, slug, category_id, background_image_url, created_at, author_id
    `)
    .eq("slug", slug)
    .eq("status", "approved")
    .single();

  if (error || !data) return null;

  let categoryName = "";
  if (data.category_id) {
    const { data: cat } = await supabase.from("categories").select("name").eq("id", data.category_id).single();
    categoryName = cat?.name ?? "";
  }

  // Fetch author name via admin client (authors may be admins or non-approved
  // practitioners with no anon read policy on users)
  let authorName = "";
  if (data.author_id) {
    const { data: author } = await admin.from("users").select("full_name").eq("id", data.author_id).single();
    authorName = author?.full_name ?? "";
  }

  return {
    id: data.id,
    title: data.title,
    content: data.content,
    slug: data.slug,
    categoryName,
    authorName,
    backgroundImageUrl: data.background_image_url ?? "",
    createdAt: data.created_at,
  };
}

export async function fetchArticleCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name").order("name");
  return data ?? [];
}
