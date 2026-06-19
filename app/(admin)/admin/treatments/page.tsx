"use client";

import { useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  patientName: string;
  practitionerName: string;
  domain: string;
  domainId: string;
  scheduledDate: string;
  status: string;
  price: number;
}

const STATUS_TABS = [
  { key: "all", label: "הכל" },
  { key: "pending_practitioner_approval", label: "ממתינים לאישור" },
  { key: "confirmed", label: "מאושרים" },
  { key: "completed", label: "הושלמו" },
  { key: "canceled", label: "בוטלו" },
  { key: "declined", label: "נדחו" },
] as const;

export default function AdminTreatmentsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [domainFilter, setDomainFilter] = useState<string>("");
  const [dateFrom, setDateFrom] = useState<string>("");
  const [dateTo, setDateTo] = useState<string>("");

  const { data: bookings = [], isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-treatments"],
    queryFn: async (): Promise<Booking[]> => {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select(`
          id, scheduled_date, status, price_at_booking, domain_id,
          patient:users!bookings_patient_id_fkey(full_name),
          practitioner_profiles!inner(users!inner(full_name))
        `)
        .order("scheduled_date", { ascending: false })
        .limit(500);

      const domainIds = [...new Set((data ?? []).map((b: Record<string, unknown>) => b.domain_id as string).filter(Boolean))];
      let domainMap: Record<string, string> = {};
      if (domainIds.length > 0) {
        const { data: doms } = await supabase.from("treatment_domains").select("id, name").in("id", domainIds);
        domainMap = (doms ?? []).reduce((a: Record<string, string>, d: { id: string; name: string }) => { a[d.id] = d.name; return a; }, {});
      }

      return (data ?? []).map((b: Record<string, unknown>) => {
        const patient = b.patient as { full_name: string } | null;
        const profile = b.practitioner_profiles as unknown as { users: { full_name: string } };
        return {
          id: b.id as string,
          patientName: patient?.full_name ?? "",
          practitionerName: profile?.users?.full_name ?? "",
          domain: domainMap[b.domain_id as string] ?? "",
          domainId: (b.domain_id as string) ?? "",
          scheduledDate: b.scheduled_date as string,
          status: b.status as string,
          price: Number(b.price_at_booking || 0),
        };
      });
    },
  });

  // Distinct domains for the dropdown — derived from the loaded set so it
  // only shows domains that actually have bookings.
  const domainOptions = useMemo(() => {
    const seen = new Map<string, string>();
    for (const b of bookings) if (b.domainId && b.domain) seen.set(b.domainId, b.domain);
    return Array.from(seen.entries()).map(([id, name]) => ({ id, name })).sort((a, b) => a.name.localeCompare(b.name));
  }, [bookings]);

  const filtered = useMemo(() => {
    return bookings.filter((b) => {
      if (search) {
        const s = search.toLowerCase();
        if (!b.patientName.toLowerCase().includes(s) && !b.practitionerName.toLowerCase().includes(s)) return false;
      }
      if (statusFilter !== "all" && b.status !== statusFilter) return false;
      if (domainFilter && b.domainId !== domainFilter) return false;
      if (dateFrom && b.scheduledDate < dateFrom) return false;
      if (dateTo && b.scheduledDate > dateTo) return false;
      return true;
    });
  }, [bookings, search, statusFilter, domainFilter, dateFrom, dateTo]);

  const clearFilters = () => {
    setSearch("");
    setStatusFilter("all");
    setDomainFilter("");
    setDateFrom("");
    setDateTo("");
  };

  const hasActiveFilters =
    !!search || statusFilter !== "all" || !!domainFilter || !!dateFrom || !!dateTo;

  // Live totals across the filtered set
  const total = filtered.length;
  const totalRevenue = filtered.reduce((s, b) => s + b.price, 0);

  if (isError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-muted-foreground">שגיאה בטעינת הטיפולים</p>
        <Button onClick={() => void refetch()} variant="secondary" className="bg-[#f4f7f7]">נסה שוב</Button>
      </div>
    );

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">טיפולים</h1>

      {/* Status tabs */}
      <div className="flex flex-wrap gap-2 mb-4">
        {STATUS_TABS.map((tab) => (
          <button
            key={tab.key}
            type="button"
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-full text-[14px] transition-colors ${
              statusFilter === tab.key ? "bg-primary text-white" : "bg-white border border-border text-black hover:bg-muted/5"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Filter row */}
      <div className="flex flex-wrap items-end gap-3 mb-6">
        <div className="relative w-full max-w-[280px]">
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted-foreground" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש מטפל / מטופל..."
            className="pe-10 h-[44px]"
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-muted-foreground">תחום טיפול</label>
          <select
            value={domainFilter}
            onChange={(e) => setDomainFilter(e.target.value)}
            className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px] min-w-[160px]"
          >
            <option value="">כל התחומים</option>
            {domainOptions.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-muted-foreground">מתאריך</label>
          <Input type="date" value={dateFrom} onChange={(e) => setDateFrom(e.target.value)} className="h-[44px]" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[12px] text-muted-foreground">עד תאריך</label>
          <Input type="date" value={dateTo} onChange={(e) => setDateTo(e.target.value)} className="h-[44px]" />
        </div>

        {hasActiveFilters && (
          <button
            type="button"
            onClick={clearFilters}
            className="text-[14px] text-primary hover:underline"
          >
            נקה סינון
          </button>
        )}
      </div>

      {/* Live totals */}
      {!isLoading && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-6">
          <div className="rounded-[12px] border border-border bg-white p-4">
            <p className="text-[13px] text-muted-foreground">סך טיפולים בסינון</p>
            <p className="text-[22px] font-bold text-black">{total}</p>
          </div>
          <div className="rounded-[12px] border border-border bg-white p-4">
            <p className="text-[13px] text-muted-foreground">הכנסה מצטברת</p>
            <p className="text-[22px] font-bold text-black">₪{totalRevenue.toLocaleString("he-IL")}</p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex justify-center py-20"><Spinner /></div>
      ) : filtered.length === 0 ? (
        <div className="rounded-[12px] border border-border bg-white py-12 text-center text-muted-foreground">
          {hasActiveFilters ? "לא נמצאו טיפולים בסינון הנוכחי" : "אין טיפולים"}
        </div>
      ) : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead><tr className="border-b border-border text-[13px] text-muted-foreground">
              <th className="text-right py-3 px-4 font-medium">מטופל</th>
              <th className="text-right py-3 px-4 font-medium">מטפל</th>
              <th className="text-right py-3 px-4 font-medium">סוג טיפול</th>
              <th className="text-right py-3 px-4 font-medium">תאריך</th>
              <th className="text-right py-3 px-4 font-medium">סטטוס</th>
              <th className="text-right py-3 px-4 font-medium">סכום</th>
            </tr></thead>
            <tbody>
              {filtered.map((b) => (
                <tr key={b.id} className="border-b border-border/50 last:border-0">
                  <td className="py-3 px-4 text-black">{b.patientName}</td>
                  <td className="py-3 px-4 text-black">{b.practitionerName}</td>
                  <td className="py-3 px-4 text-muted-foreground">{b.domain}</td>
                  <td className="py-3 px-4 text-muted-foreground">{b.scheduledDate}</td>
                  <td className="py-3 px-4"><StatusBadge status={b.status as "requested" | "confirmed" | "completed" | "canceled" | "declined"} /></td>
                  <td className="py-3 px-4 text-black">₪{b.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
