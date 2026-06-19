"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { stripHtmlToText } from "@/lib/utils/html-sanitize";
import { fetchPublicArticles, fetchArticleCategories, type PublicArticle } from "./actions";

export default function ArticlesPage() {
  const [search, setSearch] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [submittedSearch, setSubmittedSearch] = useState("");

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["public-articles", submittedSearch, categoryId],
    queryFn: async () => {
      const [result, cats] = await Promise.all([
        fetchPublicArticles({
          search: submittedSearch || undefined,
          categoryId: categoryId || undefined,
        }),
        fetchArticleCategories(),
      ]);
      return { articles: result.articles, total: result.total, categories: cats };
    },
  });

  const articles = data?.articles ?? [];
  const categories = data?.categories ?? [];
  const total = data?.total ?? 0;

  const handleSearch = () => setSubmittedSearch(search);
  const handleCategoryChange = (id: string) => setCategoryId(id);

  if (isError) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-muted-foreground">שגיאה בטעינת המאמרים</p>
        <Button onClick={() => void refetch()} variant="secondary" className="bg-[#f4f7f7]">נסה שוב</Button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">מרכז הידע שלנו</h1>
        <p className="text-[16px] text-muted-foreground mb-6">{total} מאמרים</p>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3 mb-8">
          <div className="relative flex-1 max-w-[400px]">
            <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted-foreground" />
            <Input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
              placeholder="חיפוש מאמרים..."
              className="pe-10 h-[50px]"
            />
          </div>
          <div className="relative w-full sm:w-[220px]">
            <select
              value={categoryId}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full h-[50px] rounded-[10px] border border-border-input bg-white px-3 pe-8 text-[14px] appearance-none"
            >
              <option value="">כל הקטגוריות</option>
              {categories.map((c) => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
        </div>

        {isLoading && (
          <div className="flex justify-center py-20"><Spinner /></div>
        )}

        {!isLoading && articles.length === 0 && (
          <EmptyState title="אין מאמרים" description="מאמרים חדשים יופיעו כאן לאחר אישור" />
        )}

        {!isLoading && articles.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {articles.map((article) => (
              <ArticleCard key={article.id} article={article} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function ArticleCard({ article }: { article: PublicArticle }) {
  const date = new Date(article.createdAt).toLocaleDateString("he-IL");

  return (
    <Link href={`/articles/${article.slug}`} className="group">
      <div className="rounded-[16px] border border-border bg-white overflow-hidden shadow-sm hover:shadow-md transition-shadow">
        {/* Image */}
        <div className="relative h-[160px] bg-muted/20 overflow-hidden">
          {article.backgroundImageUrl ? (
            <Image src={article.backgroundImageUrl} alt={article.title} fill className="object-cover group-hover:scale-105 transition-transform" />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/20 to-accent/20" />
          )}
          <div className="absolute bottom-2 right-2 flex gap-1.5">
            {article.categoryName && (
              <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#9f9f9f]/40 bg-white/90 text-black">
                {article.categoryName}
              </span>
            )}
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-[#9f9f9f]/40 bg-white/90 text-black">
              {date}
            </span>
          </div>
        </div>

        {/* Body */}
        <div className="p-3">
          <h3 className="text-[15px] font-medium text-black line-clamp-2 mb-1">{article.title}</h3>
          <p className="text-[13px] font-light text-[#9f9f9f] line-clamp-2 mb-2">{stripHtmlToText(article.content)}</p>
          <p className="text-[12px] text-black">פורסם ע״י {article.authorName}</p>
        </div>
      </div>
    </Link>
  );
}
