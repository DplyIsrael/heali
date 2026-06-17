"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, ArrowLeft, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  fetchWalletData,
  requestRefund,
  type WalletCredit,
  type WalletData,
} from "./actions";

function formatHebrewDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

function StatusBadge({ status }: { status: WalletCredit["status"] }) {
  const config = {
    active: { label: "זמין", className: "bg-[#e0ffed] text-[#13D464]" },
    used: { label: "נוצל", className: "bg-[#f4f7f7] text-[#9F9F9F]" },
    refunded: { label: "הוחזר", className: "bg-[#f4f7f7] text-[#9F9F9F]" },
  }[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

// Patient-side modal for submitting a cash-refund request on one specific
// active credit. Closes on success.
function RefundRequestModal({
  credit,
  onClose,
  onSubmitted,
}: {
  credit: WalletCredit;
  onClose: () => void;
  onSubmitted: () => void;
}) {
  const [reason, setReason] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async () => {
    setIsSubmitting(true);
    const result = await requestRefund(credit.id, reason);
    if (result.success) {
      toast.success("הבקשה נשלחה לבדיקה");
      onSubmitted();
    } else {
      toast.error(result.error ?? "שגיאה");
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40"
        onClick={onClose}
        aria-hidden="true"
      />
      <div className="relative w-full max-w-[480px] rounded-[16px] bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-[20px] font-semibold text-black mb-1">
              בקשת החזר כספי
            </h2>
            <p className="text-[14px] text-muted">
              סכום ההחזר: <strong>₪{credit.amount.toFixed(2)}</strong>
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="סגור"
            className="text-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </div>

        <p className="text-[14px] font-light text-[#666] mb-3">
          הצוות יבדוק את הבקשה ויעדכן אותך במייל. ההעברה הבנקאית תבוצע תוך 7 ימי עסקים מאישור.
        </p>

        <label className="block text-[14px] text-black mb-2">
          סיבת הבקשה (אופציונלי)
        </label>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="למשל: לא אוכל להשתמש בזיכוי, אעדיף החזר לחשבון..."
          rows={4}
          className="w-full rounded-[10px] border border-border-input bg-white p-3 text-[14px] text-foreground placeholder:text-muted mb-4 resize-none"
        />

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={isSubmitting}
            className="flex-1 bg-accent text-black hover:bg-accent/90"
          >
            {isSubmitting ? <Spinner size="sm" /> : "שלח בקשה"}
          </Button>
          <Button
            type="button"
            variant="secondary"
            onClick={onClose}
            disabled={isSubmitting}
            className="bg-[#f4f7f7]"
          >
            ביטול
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [refundCredit, setRefundCredit] = useState<WalletCredit | null>(null);

  const loadData = async () => {
    const d = await fetchWalletData();
    setData(d);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner />
      </div>
    );
  }
  if (!data) return null;

  return (
    <div className="mx-auto max-w-[800px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">
        הארנק שלי
      </h1>
      <p className="text-[15px] text-muted mb-6">
        זיכויים שצברת מביטולי טיפולים או זיכויים שהוענקו על ידי הצוות
      </p>

      {/* Balance card */}
      <div className="rounded-[20px] bg-gradient-to-br from-[#21544E] to-[#2d7a6f] text-white p-6 md:p-8 mb-8 shadow-lg">
        <div className="flex items-center gap-3 mb-3">
          <Wallet className="size-5" />
          <span className="text-[14px] font-light text-white/80">
            יתרת זיכויים זמינה
          </span>
        </div>
        <p className="text-[40px] md:text-[48px] font-bold tracking-tight leading-none">
          ₪{data.activeBalance.toFixed(2)}
        </p>
        {data.activeBalance > 0 ? (
          <Link
            href="/discovery"
            className="mt-5 inline-flex items-center gap-2 rounded-[10px] bg-white/15 hover:bg-white/25 transition-colors px-4 py-2 text-[14px] font-medium"
          >
            הזמן טיפול והשתמש בזיכויים
            <ArrowLeft className="size-4" />
          </Link>
        ) : (
          <p className="text-[13px] font-light text-white/70 mt-3">
            הזיכויים יופיעו כאן לאחר ביטול טיפול או זיכוי מהצוות
          </p>
        )}
      </div>

      {/* History */}
      <h2 className="text-[20px] font-semibold text-black mb-4">היסטוריית זיכויים</h2>
      {data.credits.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white py-16 text-center text-[15px] text-muted">
          אין עדיין זיכויים בארנק
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {data.credits.map((c) => (
            <div
              key={c.id}
              className="rounded-[12px] border border-border bg-white p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-black truncate">
                  {c.sourceLabel}
                </p>
                <p className="text-[13px] text-[#9F9F9F]">
                  {formatHebrewDate(c.createdAt)}
                </p>
              </div>
              <div className="flex items-center justify-between gap-3 shrink-0 sm:flex-row-reverse">
                <span
                  className={`text-[18px] font-semibold ${
                    c.status === "active" ? "text-black" : "text-[#9F9F9F]"
                  }`}
                >
                  ₪{c.amount.toFixed(2)}
                </span>
                {c.status === "active" && c.hasPendingRefundRequest ? (
                  <span className="inline-flex items-center rounded-full bg-[#FFF4D6] text-[#9A6700] px-3 py-1 text-[12px] font-medium">
                    בקשת החזר ממתינה
                  </span>
                ) : (
                  <StatusBadge status={c.status} />
                )}
                {c.status === "active" && !c.hasPendingRefundRequest && (
                  <button
                    type="button"
                    onClick={() => setRefundCredit(c)}
                    className="text-[13px] text-primary underline hover:text-primary/80 transition-colors whitespace-nowrap"
                  >
                    בקש החזר כספי
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {refundCredit && (
        <RefundRequestModal
          credit={refundCredit}
          onClose={() => setRefundCredit(null)}
          onSubmitted={() => {
            setRefundCredit(null);
            void loadData();
          }}
        />
      )}
    </div>
  );
}
