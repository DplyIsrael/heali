"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import Link from "next/link";
import { Wallet, ArrowLeft } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { fetchWalletData, type WalletCredit, type WalletData } from "./actions";

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
    spent: { label: "נוצל", className: "bg-[#f4f7f7] text-[#9F9F9F]" },
    expired: { label: "פג תוקף", className: "bg-[#ffe0e2] text-destructive" },
  }[status];
  return (
    <span
      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

export default function WalletPage() {
  const [data, setData] = useState<WalletData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchWalletData().then((d) => {
      setData(d);
      setIsLoading(false);
    });
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
              className="rounded-[12px] border border-border bg-white p-4 flex items-center justify-between gap-3"
            >
              <div className="min-w-0">
                <p className="text-[15px] font-medium text-black truncate">
                  {c.sourceLabel}
                </p>
                <p className="text-[13px] text-[#9F9F9F]">
                  {formatHebrewDate(c.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span
                  className={`text-[18px] font-semibold ${
                    c.status === "active" ? "text-black" : "text-[#9F9F9F]"
                  }`}
                >
                  ₪{c.amount.toFixed(2)}
                </span>
                <StatusBadge status={c.status} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
