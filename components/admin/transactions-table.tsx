"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { SlidersHorizontal, Search, ChevronDown, Calendar } from "lucide-react";
import { toast } from "sonner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { Spinner } from "@/components/ui/spinner";
import {
  fetchAdminTransactions,
  type AdminTransaction,
  type TransactionFilters,
} from "@/app/(admin)/admin/actions";

const STATUS_OPTIONS = [
  { value: "", label: "כל הסטטוסים" },
  { value: "requested", label: "נשלח" },
  { value: "pending_practitioner_approval", label: "ממתין לאישור" },
  { value: "confirmed", label: "מאושר" },
  { value: "completed", label: "הושלם" },
  { value: "canceled", label: "בוטל" },
  { value: "declined", label: "נדחה" },
];

const TYPE_OPTIONS = [
  { value: "", label: "כל סוגי הטיפולים" },
  { value: "טיפול בודד", label: "טיפול בודד" },
];

const PAYMENT_OPTIONS = [
  { value: "", label: "כל התשלומים" },
  { value: "charged", label: "שולם" },
  { value: "pending", label: "ממתין לתשלום" },
  { value: "refunded", label: "הוחזר" },
];

function PaymentStatus({ status }: { status: string }) {
  if (status === "charged" || status === "credited")
    return <span className="text-[14px] text-green-600">שולם</span>;
  if (status === "refunded") return <span className="text-[14px] text-orange-500">הוחזר</span>;
  return <span className="text-[14px] text-destructive">לא שולם</span>;
}

function MiniAvatar({ name, src }: { name: string; src: string }) {
  return (
    <div className="flex items-center gap-2">
      <span className="text-black whitespace-nowrap">{name}</span>
      <div className="relative size-[28px] shrink-0 overflow-hidden rounded-full bg-muted/20">
        {src ? (
          <Image src={src} alt={name} fill className="object-cover" />
        ) : (
          <span className="flex size-full items-center justify-center text-[11px] font-medium text-muted">
            {name.slice(0, 1)}
          </span>
        )}
      </div>
    </div>
  );
}

function selectClass() {
  return "h-[44px] appearance-none rounded-[10px] border border-border-input bg-white pe-9 ps-4 text-[14px] text-foreground outline-none focus:border-primary";
}

export function TransactionsTable({
  initialTransactions,
  domains,
}: {
  initialTransactions: AdminTransaction[];
  domains: { id: string; name: string }[];
}) {
  const router = useRouter();
  const [rows, setRows] = useState<AdminTransaction[]>(initialTransactions);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState<TransactionFilters>({});
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState("");

  // Filter popover (payment + date)
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [popPayment, setPopPayment] = useState("");
  const [popDate, setPopDate] = useState("");
  const popoverRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(e.target as Node)) setPopoverOpen(false);
    }
    document.addEventListener("mousedown", onClickOutside);
    return () => document.removeEventListener("mousedown", onClickOutside);
  }, []);

  const load = async (next: TransactionFilters) => {
    setFilters(next);
    setLoading(true);
    const data = await fetchAdminTransactions(next);
    setRows(data);
    setLoading(false);
  };

  const onSelect = (key: keyof TransactionFilters, value: string) =>
    load({ ...filters, [key]: value || undefined });

  const applyPopover = () => {
    load({
      ...filters,
      paymentStatus: popPayment || undefined,
      dateFrom: popDate || undefined,
      dateTo: popDate || undefined,
    });
    setPopoverOpen(false);
  };

  const rowMenu = (t: AdminTransaction) => [
    { label: "ביטול טיפול", onClick: () => toast.info("פעולה זו תהיה זמינה בקרוב"), destructive: true },
    { label: "עדכון סטטוס תשלום", onClick: () => toast.info("פעולה זו תהיה זמינה בקרוב") },
    { label: "פרופיל מטפל", onClick: () => router.push(`/admin/practitioners/${t.therapistProfileId}`) },
    { label: "פרופיל מטופל", onClick: () => router.push(`/admin/patients/${t.patientId}`) },
  ];

  const visibleRows = typeFilter ? rows.filter((r) => r.typeOfTreatment === typeFilter) : rows;

  return (
    <div className="rounded-[16px] border border-border bg-white p-4 md:p-5">
      {/* Filter bar */}
      <div className="mb-5 flex flex-wrap items-center gap-3">
        {/* Filter popover trigger */}
        <div className="relative" ref={popoverRef}>
          <button
            type="button"
            onClick={() => setPopoverOpen((o) => !o)}
            className="flex size-[44px] items-center justify-center rounded-[10px] border border-border-input bg-white text-foreground hover:border-primary"
            aria-label="פילטרים"
          >
            <SlidersHorizontal className="size-5" />
          </button>
          {popoverOpen && (
            <div className="absolute top-full z-30 mt-2 w-[300px] rounded-[12px] border border-border bg-white p-4 shadow-xl">
              <p className="mb-4 text-right text-[18px] font-semibold text-black">פילטרים</p>
              <div className="relative mb-3">
                <select
                  value={popPayment}
                  onChange={(e) => setPopPayment(e.target.value)}
                  className={`w-full ${selectClass()}`}
                >
                  {PAYMENT_OPTIONS.map((o) => (
                    <option key={o.value} value={o.value}>הצג לפי: {o.label}</option>
                  ))}
                </select>
                <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              </div>
              <div className="relative mb-4">
                <input
                  type="date"
                  value={popDate}
                  onChange={(e) => setPopDate(e.target.value)}
                  className="h-[44px] w-full rounded-[10px] border border-border-input bg-white pe-10 ps-4 text-[14px] text-foreground outline-none focus:border-primary"
                />
                <Calendar className="pointer-events-none absolute end-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
              </div>
              <button
                type="button"
                onClick={applyPopover}
                className="h-[44px] w-full rounded-[10px] bg-primary text-[15px] font-medium text-white"
              >
                חיפוש
              </button>
            </div>
          )}
        </div>

        {/* Status */}
        <div className="relative">
          <select value={filters.status ?? ""} onChange={(e) => onSelect("status", e.target.value)} className={selectClass()}>
            {STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>הצג לפי: {o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>

        {/* Type (client-side filter) */}
        <div className="relative">
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} className={selectClass()}>
            {TYPE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>הצג לפי: {o.label}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>

        {/* Category */}
        <div className="relative">
          <select value={filters.domainId ?? ""} onChange={(e) => onSelect("domainId", e.target.value)} className={selectClass()}>
            <option value="">הצג לפי: כל הקטגוריות</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute start-3 top-1/2 size-4 -translate-y-1/2 text-muted" />
        </div>

        {/* Free search */}
        <div className="relative min-w-[200px] flex-1">
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && load({ ...filters, search: search || undefined })}
            placeholder="חיפוש חופשי..."
            className="h-[44px] w-full rounded-[10px] border border-border-input bg-white pe-10 ps-4 text-[14px] outline-none focus:border-primary"
          />
          <button
            type="button"
            onClick={() => load({ ...filters, search: search || undefined })}
            className="absolute start-3 top-1/2 -translate-y-1/2 text-muted hover:text-primary"
            aria-label="חיפוש"
          >
            <Search className="size-4" />
          </button>
        </div>
      </div>

      {/* Table */}
      {loading ? (
        <div className="flex min-h-[200px] items-center justify-center"><Spinner /></div>
      ) : visibleRows.length === 0 ? (
        <div className="py-16 text-center">
          <p className="text-[16px] font-medium text-black">לא נמצאו עסקאות</p>
          <p className="mt-1 text-[14px] text-muted">עסקאות יופיעו כאן ברגע שיתקיימו טיפולים במערכת</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-border text-[13px] text-muted">
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">סכום העסקה</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">סטטוס תשלום</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">סטטוס טיפול</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">סוג טיפול</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">תאריך טיפול</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">מטופל</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">מטפל</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">קטגוריה</th>
                <th className="whitespace-nowrap py-3 pe-4 text-right font-medium">מספר הזמנה</th>
                <th className="w-[40px] py-3"></th>
              </tr>
            </thead>
            <tbody>
              {visibleRows.map((t) => (
                <tr key={t.id} className="border-b border-border/50 last:border-0">
                  <td className="whitespace-nowrap py-3 pe-4 text-black">₪{t.amount.toLocaleString()}</td>
                  <td className="py-3 pe-4"><PaymentStatus status={t.paymentStatus} /></td>
                  <td className="py-3 pe-4">
                    <StatusBadge status={t.status as "requested" | "confirmed" | "completed" | "canceled" | "declined"} />
                  </td>
                  <td className="whitespace-nowrap py-3 pe-4 text-black">{t.typeOfTreatment}</td>
                  <td className="whitespace-nowrap py-3 pe-4 text-black">{t.treatmentDate}</td>
                  <td className="py-3 pe-4"><MiniAvatar name={t.patientName} src={t.patientAvatar} /></td>
                  <td className="py-3 pe-4"><MiniAvatar name={t.therapistName} src={t.therapistAvatar} /></td>
                  <td className="whitespace-nowrap py-3 pe-4 text-[#9f9f9f]">{t.category}</td>
                  <td className="whitespace-nowrap py-3 pe-4 text-black">{t.orderNumber}</td>
                  <td className="py-3"><ThreeDotsMenu items={rowMenu(t)} /></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
