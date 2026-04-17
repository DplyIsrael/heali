"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Star, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { fetchSurveyBooking, submitReview, type SurveyBookingInfo } from "./actions";

const RATING_LABELS = ["רע מאוד", "גרוע", "ממוצע", "טוב מאוד", "אהבתי מאוד"];

export default function SurveyPage() {
  const params = useParams();
  const bookingId = params.bookingId as string;

  const [bookingInfo, setBookingInfo] = useState<SurveyBookingInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);

  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [isAnonymous, setIsAnonymous] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    async function load() {
      const info = await fetchSurveyBooking(bookingId);
      if (!info) {
        setNotFound(true);
      } else {
        setBookingInfo(info);
      }
      setIsLoading(false);
    }
    load();
  }, [bookingId]);

  const handleSubmit = async () => {
    if (rating === 0) {
      toast.error("יש לבחור דירוג");
      return;
    }
    setIsSubmitting(true);
    const result = await submitReview(bookingId, rating, comment, isAnonymous);
    if (result.success) {
      setSubmitted(true);
    } else {
      toast.error(result.error);
    }
    setIsSubmitting(false);
  };

  if (isLoading) {
    return <div className="flex min-h-screen items-center justify-center"><Spinner /></div>;
  }

  if (notFound) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="text-center">
          <h1 className="text-[24px] font-bold text-black mb-2">סקר לא זמין</h1>
          <p className="text-[16px] text-muted">הסקר אינו זמין — ייתכן שכבר דירגת טיפול זה או שהקישור אינו תקין.</p>
        </div>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="flex min-h-screen items-center justify-center px-4">
        <div className="flex flex-col items-center text-center max-w-[400px]">
          <div className="size-[120px] rounded-full bg-[#e0ffed] flex items-center justify-center mb-6">
            <div className="size-[70px] rounded-full bg-accent flex items-center justify-center">
              <Check className="size-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-[24px] font-bold text-black mb-3">תודה על הדירוג!</h1>
          <p className="text-[16px] text-muted">המשוב שלך עוזר לנו ולמטפלים להשתפר.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-[600px] rounded-[16px] bg-white p-6 md:p-8 shadow-lg">
        <h1 className="text-[22px] md:text-[26px] font-semibold text-black mb-2">
          איך הייתה החוויה שלך עם {bookingInfo?.practitionerName}?
        </h1>
        <p className="text-[16px] text-muted mb-6">
          {bookingInfo?.domain} · {bookingInfo?.scheduledDate}
        </p>

        {/* Star rating */}
        <div className="flex flex-wrap gap-3 mb-6">
          {RATING_LABELS.map((label, i) => {
            const value = 5 - i; // RTL: best first
            return (
              <button
                key={value}
                onClick={() => setRating(value)}
                className={`flex flex-col items-center gap-1.5 w-[100px] py-3 rounded-[8px] border transition-colors ${
                  rating === value
                    ? "border-[#f5a623] bg-[#fff8e7]"
                    : "border-[#cddbdb] bg-white hover:bg-muted/5"
                }`}
              >
                <Star
                  className={`size-[32px] ${
                    rating === value
                      ? "fill-[#f5a623] text-[#f5a623]"
                      : "fill-gray-200 text-gray-200"
                  }`}
                />
                <span className="text-[13px] text-black">{label}</span>
              </button>
            );
          })}
        </div>

        {/* Comment */}
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="הוספת תגובה..."
          className="w-full min-h-[120px] rounded-[10px] border border-[#cddbdb] bg-white px-3 py-2 text-[14px] resize-none mb-4"
        />

        {/* Anonymous toggle */}
        <label className="flex items-center gap-2 mb-6 cursor-pointer">
          <input
            type="checkbox"
            checked={isAnonymous}
            onChange={(e) => setIsAnonymous(e.target.checked)}
            className="size-[20px] rounded accent-primary"
          />
          <span className="text-[14px] text-black">שלח כאנונימי</span>
        </label>

        {/* Submit */}
        <Button
          onClick={handleSubmit}
          disabled={isSubmitting || rating === 0}
          className="w-full h-[48px] bg-accent text-black text-[16px]"
        >
          {isSubmitting ? <Spinner size="sm" /> : "שליחת דירוג"}
        </Button>
      </div>
    </div>
  );
}
