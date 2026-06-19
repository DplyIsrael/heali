"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Check, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  fetchRefundRequests,
  approveRefundRequest,
  rejectRefundRequest,
  type RefundRequest,
} from "./actions";

const TABS = [
  { key: "pending" as const, label: "ממתינים" },
  { key: "approved" as const, label: "אושרו" },
  { key: "rejected" as const, label: "נדחו" },
];

function formatHebrewDate(iso: string) {
  return new Date(iso).toLocaleDateString("he-IL", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export default function AdminRefundRequestsPage() {
  const [statusFilter, setStatusFilter] =
    useState<"pending" | "approved" | "rejected">("pending");
  const [requests, setRequests] = useState<RefundRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [busyId, setBusyId] = useState<string | null>(null);
  // Per-row admin-notes field, keyed by request id.
  const [notes, setNotes] = useState<Record<string, string>>({});

  const loadData = async () => {
    setIsLoading(true);
    const data = await fetchRefundRequests(statusFilter);
    setRequests(data);
    setIsLoading(false);
  };

  useEffect(() => {
    void loadData();
  }, [statusFilter]);

  const handleApprove = async (id: string) => {
    setBusyId(id);
    const result = await approveRefundRequest(id, notes[id]);
    if (result.success) {
      toast.success("הבקשה אושרה והזיכוי סומן כהוחזר");
      await loadData();
    } else {
      toast.error(result.error ?? "שגיאה");
    }
    setBusyId(null);
  };

  const handleReject = async (id: string) => {
    setBusyId(id);
    const result = await rejectRefundRequest(id, notes[id]);
    if (result.success) {
      toast.success("הבקשה נדחתה");
      await loadData();
    } else {
      toast.error(result.error ?? "שגיאה");
    }
    setBusyId(null);
  };

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">
        בקשות החזר
      </h1>
      <p className="text-[16px] text-muted-foreground mb-6">
        בקשות מטופלים להמיר זיכוי בארנק להחזר כספי. אישור מסמן את הזיכוי כהוחזר ופותח את הצורך בהעברה בנקאית ידנית.
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
      ) : requests.length === 0 ? (
        <div className="rounded-[16px] border border-border bg-white py-16 text-center text-[15px] text-muted-foreground">
          {statusFilter === "pending"
            ? "אין בקשות החזר ממתינות"
            : statusFilter === "approved"
              ? "אין בקשות שאושרו"
              : "אין בקשות שנדחו"}
        </div>
      ) : (
        <div className="flex flex-col gap-3">
          {requests.map((r) => (
            <div
              key={r.id}
              className="rounded-[12px] border border-border bg-white p-5"
            >
              <div className="flex items-start justify-between gap-4 mb-3">
                <div className="flex flex-col gap-1 min-w-0">
                  <p className="text-[16px] font-medium text-black truncate">
                    {r.patientName}
                  </p>
                  <p className="text-[13px] text-[#9F9F9F]">
                    {r.patientEmail} · {formatHebrewDate(r.createdAt)}
                  </p>
                </div>
                <div className="text-left shrink-0">
                  <span className="text-[22px] font-bold text-black">
                    ₪{r.amount.toFixed(2)}
                  </span>
                </div>
              </div>

              {r.reason ? (
                <div className="mb-3 rounded-[8px] bg-[#f4f7f7] p-3">
                  <p className="text-[12px] text-[#666] mb-1">סיבת הבקשה:</p>
                  <p className="text-[15px] text-foreground whitespace-pre-wrap">
                    {r.reason}
                  </p>
                </div>
              ) : (
                <p className="mb-3 text-[14px] text-muted-foreground italic">ללא סיבה כתובה</p>
              )}

              {statusFilter === "pending" ? (
                <>
                  <textarea
                    value={notes[r.id] ?? ""}
                    onChange={(e) =>
                      setNotes((prev) => ({ ...prev, [r.id]: e.target.value }))
                    }
                    placeholder="הערות למטופל (אופציונלי) — למשל מספר אסמכתא להעברה הבנקאית"
                    rows={2}
                    className="w-full rounded-[8px] border border-border-input bg-white p-2.5 text-[14px] text-foreground placeholder:text-muted-foreground mb-3 resize-none"
                  />
                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApprove(r.id)}
                      disabled={busyId === r.id}
                      className="bg-accent text-black hover:bg-accent/90"
                    >
                      <Check className="size-4 me-1" /> אשר והעבר
                    </Button>
                    <Button
                      onClick={() => handleReject(r.id)}
                      disabled={busyId === r.id}
                      variant="secondary"
                      className="bg-[#ffe0e2] text-destructive hover:bg-[#ffd0d3]"
                    >
                      <X className="size-4 me-1" /> דחה
                    </Button>
                  </div>
                </>
              ) : (
                r.adminNotes && (
                  <div className="rounded-[8px] bg-[#f4f7f7] p-3">
                    <p className="text-[12px] text-[#666] mb-1">הערות אדמין:</p>
                    <p className="text-[14px] text-foreground whitespace-pre-wrap">
                      {r.adminNotes}
                    </p>
                  </div>
                )
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
