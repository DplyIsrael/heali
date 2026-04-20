"use client";

import { useState, useCallback } from "react";
import { SlidersHorizontal, ChevronDown } from "lucide-react";
import { PractitionerCard, type PractitionerCardData } from "@/components/shared/practitioner-card";
import { DiscoveryFilters, type FilterValues } from "@/components/shared/discovery-filters";
import { EmptyState } from "@/components/shared/empty-state";
import { Spinner } from "@/components/ui/spinner";
import { Button } from "@/components/ui/button";
import { usePractitioners, useFilterOptions } from "@/lib/queries/practitioners";
import type { PractitionerSearchParams } from "./actions";

const SORT_OPTIONS = [
  { value: "rating", label: "דירוג" },
  { value: "price_asc", label: "מחיר: מנמוך לגבוה" },
  { value: "price_desc", label: "מחיר: מגבוה לנמוך" },
  { value: "newest", label: "חדש ביותר" },
];

export default function DiscoveryPage() {
  const [searchParams, setSearchParams] = useState<PractitionerSearchParams>({
    page: 1,
    limit: 12,
    sortBy: "rating",
  });
  const [showMobileFilters, setShowMobileFilters] = useState(false);

  const { data, isLoading } = usePractitioners(searchParams);
  const { data: filterOptions } = useFilterOptions();

  const practitioners = data?.practitioners ?? [];
  const total = data?.total ?? 0;
  const totalPages = data?.totalPages ?? 0;
  const currentPage = data?.page ?? 1;

  const handleFilterApply = useCallback((filters: FilterValues) => {
    setSearchParams((prev) => ({
      ...prev,
      search: filters.search || undefined,
      domainId: filters.domainId || undefined,
      city: filters.city || undefined,
      gender: filters.gender || undefined,
      language: filters.language || undefined,
      minPrice: filters.minPrice > 0 ? filters.minPrice : undefined,
      maxPrice: filters.maxPrice < 500 ? filters.maxPrice : undefined,
      minRating: filters.minRating > 0 ? filters.minRating : undefined,
      page: 1,
    }));
  }, []);

  const handleSortChange = (sortBy: string) => {
    setSearchParams((prev) => ({
      ...prev,
      sortBy: sortBy as PractitionerSearchParams["sortBy"],
      page: 1,
    }));
  };

  const handlePageChange = (page: number) => {
    setSearchParams((prev) => ({ ...prev, page }));
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const mapToCardData = (p: typeof practitioners[0]): PractitionerCardData => ({
    id: p.id,
    name: p.name,
    domain: p.domainNames[0] ?? "",
    price: p.price,
    city: p.city,
    rating: p.rating,
    reviews: p.reviews,
    available: p.available,
    bio: p.bio,
    image: p.image,
  });

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[30px] py-6 md:py-10">
        {/* Page header */}
        <div className="mb-6 md:mb-8">
          <h1 className="text-[28px] md:text-[36px] font-bold text-black">חיפוש מטפלים</h1>
          <p className="mt-1 text-[16px] text-muted">
            {total > 0 ? `${total} מטפלים נמצאו` : "חפשו את המטפל המושלם עבורכם"}
          </p>
        </div>

        {/* Mobile filter toggle */}
        <div className="lg:hidden mb-4 flex items-center gap-3">
          <Button
            variant="secondary"
            onClick={() => setShowMobileFilters(true)}
            className="flex items-center gap-2 bg-white border border-border"
          >
            <SlidersHorizontal className="size-4" />
            פילטרים
          </Button>

          {/* Sort dropdown mobile */}
          <div className="relative flex-1">
            <select
              value={searchParams.sortBy ?? "rating"}
              onChange={(e) => handleSortChange(e.target.value)}
              className="w-full h-[44px] rounded-[10px] border border-border bg-white px-3 pe-8 text-[14px] appearance-none"
            >
              {SORT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-muted pointer-events-none" />
          </div>
        </div>

        {/* Mobile filter overlay */}
        {showMobileFilters && (
          <div className="fixed inset-0 z-50 bg-black/50 lg:hidden">
            <div className="absolute inset-y-0 right-0 w-[85%] max-w-[380px] bg-white p-6 overflow-y-auto">
              <DiscoveryFilters
                domains={filterOptions?.domains ?? []}
                cities={filterOptions?.cities ?? []}
                onApply={handleFilterApply}
                isMobile
                onClose={() => setShowMobileFilters(false)}
              />
            </div>
          </div>
        )}

        <div className="flex gap-8">
          {/* Main content — placed first in DOM so it sits on the RIGHT in RTL */}
          <main className="flex-1 min-w-0">
            {/* Desktop sort bar */}
            <div className="hidden lg:flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <span className="text-[14px] text-muted">מיין לפי:</span>
                {SORT_OPTIONS.map((opt) => (
                  <button
                    key={opt.value}
                    onClick={() => handleSortChange(opt.value)}
                    className={`px-3 py-1.5 rounded-full text-[14px] transition-colors ${
                      searchParams.sortBy === opt.value
                        ? "bg-primary text-white"
                        : "bg-white border border-border text-black hover:bg-muted/10"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
              <span className="text-[14px] text-muted">{total} תוצאות</span>
            </div>

            {/* Loading */}
            {isLoading && (
              <div className="flex items-center justify-center py-20">
                <Spinner />
              </div>
            )}

            {/* Results grid */}
            {!isLoading && practitioners.length > 0 && (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {practitioners.map((p) => (
                    <PractitionerCard key={p.id} practitioner={mapToCardData(p)} />
                  ))}
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="flex items-center justify-center gap-2 mt-10">
                    <Button
                      variant="secondary"
                      disabled={currentPage <= 1}
                      onClick={() => handlePageChange(currentPage - 1)}
                      className="bg-white border border-border"
                    >
                      הקודם
                    </Button>
                    {Array.from({ length: totalPages }, (_, i) => i + 1)
                      .filter((p) => {
                        // Show first, last, current, and neighbors
                        if (p === 1 || p === totalPages) return true;
                        if (Math.abs(p - currentPage) <= 1) return true;
                        return false;
                      })
                      .map((p, i, arr) => {
                        const showEllipsis = i > 0 && p - arr[i - 1] > 1;
                        return (
                          <span key={p} className="flex items-center gap-1">
                            {showEllipsis && <span className="text-muted px-1">...</span>}
                            <button
                              onClick={() => handlePageChange(p)}
                              className={`size-[36px] rounded-full text-[14px] transition-colors ${
                                p === currentPage
                                  ? "bg-primary text-white"
                                  : "bg-white border border-border text-black hover:bg-muted/10"
                              }`}
                            >
                              {p}
                            </button>
                          </span>
                        );
                      })}
                    <Button
                      variant="secondary"
                      disabled={currentPage >= totalPages}
                      onClick={() => handlePageChange(currentPage + 1)}
                      className="bg-white border border-border"
                    >
                      הבא
                    </Button>
                  </div>
                )}
              </>
            )}

            {/* Empty state */}
            {!isLoading && practitioners.length === 0 && (
              <EmptyState
                title="לא נמצאו מטפלים"
                description="נסו לשנות את הפילטרים או לחפש מחדש"
              />
            )}
          </main>

          {/* Desktop sidebar filters — placed last in DOM so it sits on the LEFT in RTL */}
          <aside className="hidden lg:block w-[345px] shrink-0">
            <div className="sticky top-[100px] rounded-[16px] border border-border bg-white p-5">
              <DiscoveryFilters
                domains={filterOptions?.domains ?? []}
                cities={filterOptions?.cities ?? []}
                onApply={handleFilterApply}
              />
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
}
