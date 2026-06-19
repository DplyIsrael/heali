"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Calendar, Clock, MapPin, Wallet, X, RotateCw, MessageSquare, Star } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { EmptyState } from "@/components/shared/empty-state";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import { fetchMyBookings, cancelBooking, type BookingItem } from "./actions";

const TABS = [
  { key: "active", label: "פעילים" },
  { key: "completed", label: "הושלמו" },
  { key: "canceled", label: "בוטלו" },
] as const;

type TabKey = typeof TABS[number]["key"];

export default function MyTreatmentsPage() {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<TabKey>("active");
  const [cancelTarget, setCancelTarget] = useState<BookingItem | null>(null);
  const [rateTarget, setRateTarget] = useState<BookingItem | null>(null);
  const [rating, setRating] = useState(0);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);

  const { data, isLoading } = useQuery({
    queryKey: ["my-bookings"],
    queryFn: fetchMyBookings,
  });

  const { mutate: doCancel, isPending: isCanceling } = useMutation({
    mutationFn: (bookingId: string) => cancelBooking(bookingId),
    onSuccess: (result) => {
      if (result.success) {
        toast.success("ביטול אושר, הסכום זוכה לארנק שלך");
        queryClient.invalidateQueries({ queryKey: ["my-bookings"] });
      } else {
        toast.error(result.error);
      }
      setCancelTarget(null);
    },
  });

  const bookings = data?.[activeTab] ?? [];
  const counts = {
    active: data?.active.length ?? 0,
    completed: data?.completed.length ?? 0,
    canceled: data?.canceled.length ?? 0,
  };

  return (
    <div className="min-h-screen bg-[#fafafa]">
      <div className="mx-auto max-w-[900px] px-4 md:px-[30px] py-6 md:py-10">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-[24px] md:text-[30px] font-semibold text-black">הטיפולים שלי</h1>
          <p className="mt-1 text-[16px] font-light text-[#9f9f9f]">
            מעקב אחר טיפולים פעילים, טיפולים שהושלמו בצורה מסודרת ונוחה.
          </p>
        </div>

        {/* Tabs */}
        <div className="flex rounded-[10px] bg-white p-[6px] mb-6 w-full max-w-[849px]">
          {TABS.map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex-1 py-2.5 rounded-[8px] text-[16px] md:text-[18px] tracking-[-0.36px] transition-colors ${
                activeTab === tab.key
                  ? "bg-accent font-normal text-black"
                  : "font-light text-black"
              }`}
            >
              {tab.label} ({counts[tab.key]})
            </button>
          ))}
        </div>

        {/* Loading */}
        {isLoading && (
          <div className="flex justify-center py-20">
            <Spinner />
          </div>
        )}

        {/* Bookings list */}
        {!isLoading && bookings.length > 0 && (
          <div className="flex flex-col gap-4">
            {bookings.map((booking) => (
              <BookingCard
                key={booking.id}
                booking={booking}
                tab={activeTab}
                onCancel={() => setCancelTarget(booking)}
                onRate={() => { setRateTarget(booking); setRating(0); setRatingComment(""); }}
              />
            ))}
          </div>
        )}

        {/* Empty state */}
        {!isLoading && bookings.length === 0 && (
          <EmptyState
            title={activeTab === "active" ? "אין טיפולים פעילים" : activeTab === "completed" ? "אין טיפולים שהושלמו" : "אין טיפולים שבוטלו"}
            description="כשתזמינו טיפול, הוא יופיע כאן"
          />
        )}

        {/* Rating modal */}
        {rateTarget && (
          <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
            <div className="w-full max-w-[560px] rounded-[16px] bg-white p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[22px] font-semibold text-black">
                  איך הייתה החוויה שלך עם {rateTarget.practitionerName}?
                </h2>
                <button onClick={() => setRateTarget(null)}><X className="size-5 text-muted-foreground" /></button>
              </div>

              <div className="flex gap-3 mb-6">
                {[5, 4, 3, 2, 1].map((value) => (
                  <button
                    key={value}
                    onClick={() => setRating(value)}
                    className={`flex flex-col items-center gap-1 flex-1 py-3 rounded-[8px] border transition-colors ${
                      rating === value ? "border-[#f5a623] bg-[#fff8e7]" : "border-[#cddbdb] hover:bg-muted/5"
                    }`}
                  >
                    <Star className={`size-8 ${rating === value ? "fill-[#f5a623] text-[#f5a623]" : "fill-gray-200 text-gray-200"}`} />
                    <span className="text-[12px] text-black">
                      {value === 5 ? "מעולה" : value === 4 ? "טוב מאוד" : value === 3 ? "ממוצע" : value === 2 ? "גרוע" : "רע מאוד"}
                    </span>
                  </button>
                ))}
              </div>

              <textarea
                value={ratingComment}
                onChange={(e) => setRatingComment(e.target.value)}
                placeholder="הוספת תגובה..."
                className="w-full min-h-[120px] rounded-[10px] border border-[#cddbdb] px-3 py-2 text-[14px] resize-none mb-4"
              />

              <button
                onClick={async () => {
                  if (rating === 0) { toast.error("יש לבחור דירוג"); return; }
                  setIsSubmittingRating(true);
                  const { submitReview } = await import("@/app/(public)/survey/[bookingId]/actions");
                  const result = await submitReview(rateTarget.id, rating, ratingComment, false);
                  if (result.success) { toast.success("הדירוג נשלח בהצלחה!"); setRateTarget(null); }
                  else toast.error(result.error);
                  setIsSubmittingRating(false);
                }}
                disabled={isSubmittingRating || rating === 0}
                className="w-full h-[48px] rounded-[8px] bg-accent text-[16px] text-black disabled:opacity-50"
              >
                {isSubmittingRating ? "שולח..." : "שליחת דירוג"}
              </button>
            </div>
          </div>
        )}

        {/* Cancel dialog */}
        {cancelTarget && (
          <ConfirmDialog
            open
            onOpenChange={() => setCancelTarget(null)}
            title="ביטול טיפול"
            description={`האם אתה בטוח שאתה רוצה לבטל את הטיפול עם ${cancelTarget.practitionerName}?`}
            confirmLabel={isCanceling ? "מבטל..." : "ביטול טיפול"}
            onConfirm={() => doCancel(cancelTarget.id)}
            destructive
          />
        )}
      </div>
    </div>
  );
}

function BookingCard({
  booking,
  tab,
  onCancel,
  onRate,
}: {
  booking: BookingItem;
  tab: TabKey;
  onCancel?: () => void;
  onRate?: () => void;
}) {
  return (
    <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 rounded-[10px] border border-[#cddbdb] bg-white px-4 sm:px-5 py-4">
      {/* Practitioner info */}
      <div className="flex items-center gap-3 flex-1 min-w-0">
        <div className="relative size-[70px] sm:size-[90px] rounded-[10px] overflow-hidden shrink-0" style={{ background: "linear-gradient(to bottom, #ebecec 4%, white 120%)" }}>
          <Image src={booking.practitionerImage} alt={booking.practitionerName} fill className="object-cover" />
        </div>
        <div className="flex flex-col gap-1.5 min-w-0">
          <p className={`text-[12px] ${tab === "canceled" ? "text-destructive" : "text-[#9f9f9f]"}`}>
            {tab === "canceled" ? "מספר הזמנה שבוטלה" : "מספר הזמנה"}: {booking.orderNumber}
          </p>
          <p className="text-[18px] sm:text-[20px] font-medium text-black truncate">{booking.practitionerName}</p>
          <p className="text-[14px] text-[#9f9f9f]">{booking.domain}</p>
          <div className="flex flex-wrap items-center gap-3 text-[13px] text-black">
            <span className="flex items-center gap-1">
              <Calendar className="size-[16px] text-accent" />
              {booking.scheduledDate}
            </span>
            <span className="flex items-center gap-1">
              <Clock className="size-[16px] text-accent" />
              {booking.scheduledTime}
            </span>
            <span className="flex items-center gap-1">
              <MapPin className="size-[16px] text-accent" />
              {booking.city}
            </span>
            <span className="flex items-center gap-1">
              <Wallet className="size-[16px] text-accent" />
              סה״כ שולם ₪{booking.price}
            </span>
          </div>
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-row sm:flex-col gap-2 w-full sm:w-[160px] shrink-0">
        {tab === "active" && (
          <>
            <button
              onClick={onCancel}
              className="flex items-center justify-center gap-1.5 flex-1 sm:w-full h-[40px] rounded-[8px] bg-[#ffe0e2] text-[14px] text-destructive"
            >
              <X className="size-3.5" />
              ביטול טיפול
            </button>
            <button className="flex items-center justify-center gap-1.5 flex-1 sm:w-full h-[40px] rounded-[8px] bg-[#f4f7f7] text-[14px] text-black">
              <MessageSquare className="size-3.5" />
              שליחת הודעה
            </button>
          </>
        )}
        {tab === "completed" && (
          <>
            <button
              onClick={onRate}
              className="flex items-center justify-center gap-1.5 flex-1 sm:w-full h-[40px] rounded-[8px] bg-accent text-[14px] text-black"
            >
              <Star className="size-3.5" />
              דרג את הטיפול
            </button>
            <Link
              href={`/practitioners/${booking.id}/book`}
              className="flex items-center justify-center gap-1.5 flex-1 sm:w-full h-[40px] rounded-[8px] bg-primary text-[14px] text-white"
            >
              <RotateCw className="size-3.5" />
              הזמנה חוזרת
            </Link>
            <button className="flex items-center justify-center gap-1.5 flex-1 sm:w-full h-[40px] rounded-[8px] bg-[#f4f7f7] text-[14px] text-black">
              <MessageSquare className="size-3.5" />
              שליחת הודעה
            </button>
          </>
        )}
        {tab === "canceled" && (
          <>
            <Link
              href="/discovery"
              className="flex items-center justify-center gap-1.5 flex-1 sm:w-full h-[40px] rounded-[8px] bg-primary text-[14px] text-white"
            >
              <RotateCw className="size-3.5" />
              הזמנה חוזרת
            </Link>
            <div className="flex items-center justify-center flex-1 sm:w-full h-[40px] text-[14px] text-black">
              יתרת זכות: ₪{booking.price}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
