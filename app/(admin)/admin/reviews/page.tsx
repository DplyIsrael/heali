"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Star, Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  fetchPendingReviews,
  approveReview,
  rejectReview,
  type PendingReview,
} from "./actions";

const TABS = [
  { key: "submitted" as const, label: "ממתינים" },
  { key: "approved" as const, label: "מאושרים" },
  { key: "rejected" as const, label: "נדחו" },
];

function formatHebrewDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StarRow({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-0.5" dir="ltr">
      {[1, 2, 3, 4, 5].map((s) => (
        <Star
          key={s}
          className={`size-4 ${
            s <= rating ? "fill-[#f5c518] text-[#f5c518]" : "text-muted/30"
          }`}
        />
      ))}
      <span className="ms-2 text-[14px] text-[#666]">{rating}/5</span>
    </div>
  );
}

export default function AdminReviewsPage() {
  const [statusFilter, setStatusFilter] =
    useState<"submitted" | "approved" | "rejected">("submitted");
  const [reviews, setReviews] = useState<PendingReview[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchPendingReviews(statusFilter);
    setReviews(data);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    const result = await approveReview(id);
    if (result.success) {
      toast.success("הדירוג אושר");
      await loadData();
    } else {
      toast.error(result.error ?? "שגיאה");
    }
    setBusyId(null);
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    const result = await rejectReview(id);
    if (result.success) {
      toast.success("הדירוג נדחה");
      await loadData();
    } else {
      toast.error(result.error ?? "שגיאה");
    }
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">
        דירוגים ותגובות
      </h1>
      <p className="text-[16px] text-muted mb-6">
        ניהול דירוגים שהוגשו על ידי מטופלים — דירוגים מאושרים יופיעו בפרופיל המטפל ויעדכנו את הממוצע
      </p>

      {/* Tabs */}
      <div className="flex rounded-[10px] bg-white p-[6px] mb-6 w-full max-w-[500px]">
        {TABS.map((tab) => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`flex-1 py-2.5 rounded-[8px] text-[15px] transition-colors ${
              statusFilter === tab.key
                ? "bg-accent font-normal text-black"
                : "font-light text-black"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {isLoading ? (
        <div className="flex justify-center py-20">
          <Spinner />
        </div>
      ) : reviews.length === 0 ? (
        <div className="rounded-[16px] border border-border bg-white py-16 text-center text-[15px] text-muted">
          {statusFilter === "submitted"
            ? "אין דירוגים ממתינים לאישור"
            : statusFilter === "approved"
              ? "אין דירוגים מאושרים"
              : "אין דירוגים שנדחו"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {reviews.map((r) => (
            <div
              key={r.id}
              className="rounded-[12px] border border-border bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-[16px] font-medium text-black truncate">
                    <span className="text-[#666]">דירוג מ-</span>
                    {r.isAnonymous ? "אנונימי" : r.reviewerFirstName || "מטופל"}
                    <span className="text-[#666]"> על </span>
                    {r.practitionerName || "מטפל"}
                  </p>
                  <p className="text-[13px] text-[#9F9F9F]">
                    {formatHebrewDate(r.createdAt)}
                  </p>
                </div>
                <StarRow rating={r.rating} />
              </div>

              {r.comment ? (
                <p className="text-[15px] text-foreground bg-[#f4f7f7] rounded-[8px] p-3 mb-3 whitespace-pre-wrap">
                  {r.comment}
                </p>
              ) : (
                <p className="text-[14px] text-muted italic mb-3">
                  ללא תגובה כתובה
                </p>
              )}

              <div className="flex gap-2">
                {statusFilter === "submitted" && (
                  <>
                    <Button
                      onClick={() => handleApprove(r.id)}
                      disabled={busyId === r.id}
                      className="bg-accent text-black hover:bg-accent/90"
                    >
                      <Check className="size-4 me-1" /> אשר ופרסם
                    </Button>
                    <Button
                      onClick={() => handleReject(r.id)}
                      disabled={busyId === r.id}
                      variant="secondary"
                      className="bg-[#ffe0e2] text-destructive hover:bg-[#ffd0d3]"
                    >
                      <X className="size-4 me-1" /> דחה
                    </Button>
                  </>
                )}
                {statusFilter === "approved" && (
                  <Button
                    onClick={() => handleReject(r.id)}
                    disabled={busyId === r.id}
                    variant="secondary"
                    className="bg-[#ffe0e2] text-destructive hover:bg-[#ffd0d3]"
                  >
                    <X className="size-4 me-1" /> הסר מהפרופיל
                  </Button>
                )}
                {statusFilter === "rejected" && (
                  <Button
                    onClick={() => handleApprove(r.id)}
                    disabled={busyId === r.id}
                    className="bg-accent text-black hover:bg-accent/90"
                  >
                    <Check className="size-4 me-1" /> שחזר ואשר
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
