"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface ArticleItem {
  id: string;
  title: string;
  content: string;
  categoryName: string;
  status: string;
  backgroundImageUrl: string;
  createdAt: string;
}

export async function fetchMyArticles(): Promise<ArticleItem[]> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return [];

  // Get practitioner profile ID
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return [];

  const { data: articles } = await supabase
    .from("articles")
    .select("id, title, content, category_id, status, background_image_url, created_at")
    .eq("practitioner_id", profile.id)
    .order("created_at", { ascending: false });

  if (!articles) return [];

  // Fetch category names
  const categoryIds = [...new Set(articles.map((a: Record<string, unknown>) => a.category_id as string).filter(Boolean))];
  let categoryMap: Record<string, string> = {};
  if (categoryIds.length > 0) {
    const { data: cats } = await supabase.from("categories").select("id, name").in("id", categoryIds);
    categoryMap = (cats ?? []).reduce((acc: Record<string, string>, c: { id: string; name: string }) => { acc[c.id] = c.name; return acc; }, {});
  }

  return articles.map((a: Record<string, unknown>) => ({
    id: a.id as string,
    title: (a.title as string) ?? "",
    content: (a.content as string) ?? "",
    categoryName: categoryMap[a.category_id as string] ?? "",
    status: (a.status as string) ?? "draft",
    backgroundImageUrl: (a.background_image_url as string) ?? "",
    createdAt: (a.created_at as string) ?? "",
  }));
}

export async function createArticle(
  title: string,
  content: string,
  categoryId: string,
  backgroundImageUrl?: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  // Generate slug from title
  const slug = title
    .toLowerCase()
    .replace(/[^\w\s\u0590-\u05FF]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 60) + "-" + Date.now().toString(36);

  const { error } = await supabase.from("articles").insert({
    title,
    content,
    slug,
    category_id: categoryId || null,
    practitioner_id: profile.id,
    author_id: user.id,
    status: "submitted",
    background_image_url: backgroundImageUrl ?? null,
  });

  if (error) {
    console.error("Create article error:", error);
    return { success: false, error: "שגיאה ביצירת המאמר" };
  }

  return { success: true };
}

export async function deleteArticle(articleId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מורשה" };

  // Authors can only delete their own articles. Admins go through a
  // separate admin route, so this is a strict author-only check.
  const { data, error } = await supabase
    .from("articles")
    .delete()
    .eq("id", articleId)
    .eq("author_id", user.id)
    .select("id")
    .maybeSingle();

  if (error) return { success: false, error: "שגיאה במחיקת המאמר" };
  if (!data) return { success: false, error: "לא מורשה" };
  return { success: true };
}

export async function fetchCategories() {
  const supabase = await createClient();
  const { data } = await supabase.from("categories").select("id, name").order("name");
  return data ?? [];
}
