"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Image from "next/image";
import { Search, Plus, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface Article { id: string; title: string; content: string; authorName: string; status: string; backgroundImageUrl: string; categoryName: string; createdAt: string; }

export default function AdminArticlesPage() {
  const [articles, setArticles] = useState<Article[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [practitioners, setPractitioners] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [newPractitionerId, setNewPractitionerId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("articles")
      .select("id, title, content, status, background_image_url, category_id, created_at, users!articles_author_id_fkey(full_name)")
      .order("created_at", { ascending: false });

    const catIds = [...new Set((data ?? []).map((a: Record<string, unknown>) => a.category_id as string).filter(Boolean))];
    let catMap: Record<string, string> = {};
    if (catIds.length > 0) {
      const { data: cats } = await supabase.from("categories").select("id, name").in("id", catIds);
      catMap = (cats ?? []).reduce((acc: Record<string, string>, c: { id: string; name: string }) => { acc[c.id] = c.name; return acc; }, {});
    }

    setArticles((data ?? []).map((a: Record<string, unknown>) => {
      const author = a.users as unknown as { full_name: string } | null;
      return {
        id: a.id as string, title: a.title as string, content: (a.content as string) ?? "",
        authorName: author?.full_name ?? "", status: a.status as string,
        backgroundImageUrl: (a.background_image_url as string) ?? "",
        categoryName: catMap[a.category_id as string] ?? "",
        createdAt: a.created_at as string,
      };
    }));

    // Load categories + practitioners for create modal
    const { data: cats } = await supabase.from("categories").select("id, name").order("name");
    setCategories(cats ?? []);

    const { data: pracs } = await supabase
      .from("practitioner_profiles")
      .select("id, users!inner(full_name)")
      .eq("verification_status", "approved");
    setPractitioners((pracs ?? []).map((p: Record<string, unknown>) => {
      const u = p.users as unknown as { full_name: string };
      return { id: p.id as string, name: u.full_name };
    }));

    setIsLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleApprove = async (id: string) => {
    const supabase = createClient();
    await supabase.from("articles").update({ status: "approved", updated_at: new Date().toISOString() }).eq("id", id);
    toast.success("המאמר אושר"); loadData();
  };

  const handleReject = async (id: string) => {
    const supabase = createClient();
    await supabase.from("articles").update({ status: "rejected", updated_at: new Date().toISOString() }).eq("id", id);
    toast.success("המאמר נדחה"); loadData();
  };

  const handleDelete = async (id: string) => {
    const supabase = createClient();
    await supabase.from("articles").delete().eq("id", id);
    toast.success("המאמר נמחק"); loadData();
  };

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) { toast.error("יש למלא שם ותוכן"); return; }
    setIsCreating(true);
    const supabase = createClient();
    const slug = newTitle.toLowerCase().replace(/[^\w\s\u0590-\u05FF]/g, "").replace(/\s+/g, "-").slice(0, 60) + "-" + Date.now().toString(36);
    // Admin gets auto-approved
    const { data: { user } } = await supabase.auth.getUser();
    await supabase.from("articles").insert({
      title: newTitle, content: newContent, slug,
      category_id: newCategoryId || null,
      practitioner_id: newPractitionerId || null,
      author_id: user?.id,
      status: "approved",
    });
    toast.success("המאמר נוצר"); setShowCreate(false); setNewTitle(""); setNewContent(""); loadData();
    setIsCreating(false);
  };

  const filtered = articles.filter((a) => !search || a.title.includes(search) || a.authorName.includes(search));

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black">מאמרים</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-accent text-black"><Plus className="size-4 me-1" /> העלאת מאמר חדש</Button>
      </div>

      <div className="relative max-w-[400px] mb-6">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="pe-10 h-[50px]" />
      </div>

      {/* Card grid */}
      {filtered.length === 0 ? (
        <p className="text-center text-muted py-20">אין מאמרים</p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((article) => (
            <div key={article.id} className="rounded-[16px] border border-border bg-white overflow-hidden shadow-sm">
              <div className="relative h-[140px] bg-muted/20 overflow-hidden">
                {article.backgroundImageUrl ? (
                  <Image src={article.backgroundImageUrl} alt={article.title} fill className="object-cover" />
                ) : (
                  <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
                )}
                <div className="absolute bottom-2 right-2 flex gap-1.5">
                  {article.categoryName && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#9f9f9f]/40 bg-white/90 text-black">{article.categoryName}</span>
                  )}
                  <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#9f9f9f]/40 bg-white/90 text-black">
                    {new Date(article.createdAt).toLocaleDateString("he-IL")}
                  </span>
                </div>
              </div>
              <div className="p-3 relative">
                <div className="absolute top-2 left-2">
                  <ThreeDotsMenu items={[
                    ...(article.status === "submitted" ? [{ label: "אישור", onClick: () => handleApprove(article.id) }] : []),
                    ...(article.status === "submitted" ? [{ label: "דחייה", onClick: () => handleReject(article.id) }] : []),
                    { label: "מחיקת מאמר", onClick: () => handleDelete(article.id), destructive: true },
                  ]} />
                </div>
                <div className="flex gap-2 mb-2">
                  <StatusBadge status={article.status as "submitted" | "approved" | "rejected" | "draft"} />
                </div>
                <h3 className="text-[15px] font-medium text-black line-clamp-2 mb-1">{article.title}</h3>
                <p className="text-[13px] font-light text-[#9f9f9f] line-clamp-2 mb-2">{article.content}</p>
                <p className="text-[12px] text-black">פורסם ע״י {article.authorName}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create article modal */}
      {showCreate && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
          <div className="w-full max-w-[636px] rounded-[20px] bg-white p-6 md:p-8 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-[26px] md:text-[30px] font-bold text-black">יצירת מאמר חדש</h2>
              <button onClick={() => setShowCreate(false)}><X className="size-6 text-muted" /></button>
            </div>
            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">סוג קטגוריה</label>
                <select value={newCategoryId} onChange={(e) => setNewCategoryId(e.target.value)} className="h-[50px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  <option value="">בחירה</option>
                  {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">שיוך למטפל</label>
                <select value={newPractitionerId} onChange={(e) => setNewPractitionerId(e.target.value)} className="h-[50px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  <option value="">בחירה (אופציונלי)</option>
                  {practitioners.map((p) => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">שם המאמר</label>
                <Input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} placeholder="הקלד/י כאן..." />
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">תוכן המאמר</label>
                <textarea value={newContent} onChange={(e) => setNewContent(e.target.value)} placeholder="הקלד/י כאן..." className="min-h-[300px] rounded-[10px] border border-border-input bg-white px-3 py-2 text-[14px] resize-none" />
              </div>
              <Button onClick={handleCreate} disabled={isCreating} className="w-full h-[48px] bg-accent text-black text-[16px]">
                {isCreating ? <Spinner size="sm" /> : "יצירת מאמר"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
