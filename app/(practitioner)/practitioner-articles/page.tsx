"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Plus, Search, X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { RichTextEditor } from "@/components/shared/rich-text-editor";
import { stripHtmlToText } from "@/lib/utils/html-sanitize";
import { toast } from "sonner";
import {
  fetchMyArticles,
  createArticle,
  deleteArticle,
  fetchCategories,
  type ArticleItem,
} from "./actions";

export default function PractitionerArticlesPage() {
  const [articles, setArticles] = useState<ArticleItem[]>([]);
  const [categories, setCategories] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [showCreate, setShowCreate] = useState(false);

  // Create form
  const [newTitle, setNewTitle] = useState("");
  const [newContent, setNewContent] = useState("");
  const [newCategoryId, setNewCategoryId] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadData = async () => {
    const [arts, cats] = await Promise.all([fetchMyArticles(), fetchCategories()]);
    setArticles(arts);
    setCategories(cats);
    setIsLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleCreate = async () => {
    if (!newTitle.trim() || !newContent.trim()) {
      toast.error("יש למלא שם ותוכן המאמר");
      return;
    }
    setIsCreating(true);
    const result = await createArticle(newTitle, newContent, newCategoryId);
    if (result.success) {
      toast.success("המאמר נשלח לאישור");
      setShowCreate(false);
      setNewTitle("");
      setNewContent("");
      setNewCategoryId("");
      loadData();
    } else {
      toast.error(result.error);
    }
    setIsCreating(false);
  };

  const handleDelete = async (id: string) => {
    const result = await deleteArticle(id);
    if (result.success) {
      toast.success("המאמר נמחק");
      setArticles((prev) => prev.filter((a) => a.id !== id));
    } else {
      toast.error(result.error);
    }
  };

  const filtered = articles.filter((a) =>
    !search || a.title.includes(search) || a.categoryName.includes(search)
  );

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black">המאמרים שלי</h1>
        <Button onClick={() => setShowCreate(true)} className="bg-accent text-black">
          <Plus className="size-4 me-1" /> העלאת מאמר חדש
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-[520px] mb-6">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש חופשי..."
          className="pe-10 h-[50px]"
        />
      </div>

      {/* Articles grid */}
      {filtered.length === 0 ? (
        <EmptyState title="אין מאמרים" description="צור מאמר חדש כדי לשתף את הידע שלך" />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
          {filtered.map((article) => (
            <div key={article.id} className="rounded-[16px] border border-border bg-white overflow-hidden shadow-sm">
              {/* Image */}
              <div
                className="h-[140px] bg-muted/20"
                style={article.backgroundImageUrl ? {
                  backgroundImage: `url(${article.backgroundImageUrl})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                } : undefined}
              />

              {/* Body */}
              <div className="p-3 relative">
                <div className="absolute top-2 left-2">
                  <ThreeDotsMenu
                    items={[
                      { label: "עריכת מאמר", onClick: () => { setNewTitle(article.title); setNewContent(article.content); setShowCreate(true); } },
                      { label: "מחיקת מאמר", onClick: () => handleDelete(article.id), destructive: true },
                    ]}
                  />
                </div>

                <div className="flex gap-2 mb-2">
                  {article.categoryName && (
                    <span className="text-[11px] px-2 py-0.5 rounded-full border border-muted/30 text-muted-foreground">
                      {article.categoryName}
                    </span>
                  )}
                  <StatusBadge status={article.status as "submitted" | "approved" | "rejected" | "draft"} />
                </div>

                <h3 className="text-[15px] font-medium text-black line-clamp-2 mb-1">{article.title}</h3>
                <p className="text-[13px] font-light text-[#9f9f9f] line-clamp-2">{stripHtmlToText(article.content)}</p>
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
              <button onClick={() => setShowCreate(false)}>
                <X className="size-6 text-muted-foreground" />
              </button>
            </div>

            <div className="flex flex-col gap-5">
              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">סוג קטגוריה</label>
                <select
                  value={newCategoryId}
                  onChange={(e) => setNewCategoryId(e.target.value)}
                  className="h-[50px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]"
                >
                  <option value="">בחירה</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">שם המאמר</label>
                <Input
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="הקלד/י כאן..."
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[16px] text-black">תוכן המאמר</label>
                <RichTextEditor
                  value={newContent}
                  onChange={setNewContent}
                  placeholder="הקלד/י כאן..."
                />
              </div>

              <Button
                onClick={handleCreate}
                disabled={isCreating}
                className="w-full h-[48px] bg-accent text-black text-[16px]"
              >
                {isCreating ? <Spinner size="sm" /> : "יצירת מאמר"}
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
