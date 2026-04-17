"use client";

import { useEffect, useState } from "react";
import { Search } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { createClient } from "@/lib/supabase/client";

interface Booking {
  id: string;
  patientName: string;
  practitionerName: string;
  domain: string;
  scheduledDate: string;
  status: string;
  price: number;
}

export default function AdminTreatmentsPage() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data } = await supabase
        .from("bookings")
        .select(`
          id, scheduled_date, status, price_at_booking, domain_id,
          patient:users!bookings_patient_id_fkey(full_name),
          practitioner_profiles!inner(users!inner(full_name))
        `)
        .order("scheduled_date", { ascending: false })
        .limit(100);

      // Fetch domain names
      const domainIds = [...new Set((data ?? []).map((b: Record<string, unknown>) => b.domain_id as string).filter(Boolean))];
      let domainMap: Record<string, string> = {};
      if (domainIds.length > 0) {
        const { data: doms } = await supabase.from("treatment_domains").select("id, name").in("id", domainIds);
        domainMap = (doms ?? []).reduce((a: Record<string, string>, d: { id: string; name: string }) => { a[d.id] = d.name; return a; }, {});
      }

      setBookings((data ?? []).map((b: Record<string, unknown>) => {
        const patient = b.patient as { full_name: string } | null;
        const profile = b.practitioner_profiles as unknown as { users: { full_name: string } };
        return {
          id: b.id as string,
          patientName: patient?.full_name ?? "",
          practitionerName: profile?.users?.full_name ?? "",
          domain: domainMap[b.domain_id as string] ?? "",
          scheduledDate: b.scheduled_date as string,
          status: b.status as string,
          price: Number(b.price_at_booking || 0),
        };
      }));
      setIsLoading(false);
    }
    load();
  }, []);

  const filtered = bookings.filter((b) =>
    !search || b.patientName.includes(search) || b.practitionerName.includes(search)
  );

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">טיפולים</h1>

      <div className="relative max-w-[400px] mb-6">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted" />
        <Input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="חיפוש..." className="pe-10 h-[50px]" />
      </div>

      {isLoading ? <div className="flex justify-center py-20"><Spinner /></div> : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead><tr className="border-b border-border text-[13px] text-muted">
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
                  <td className="py-3 px-4 text-muted">{b.domain}</td>
                  <td className="py-3 px-4 text-muted">{b.scheduledDate}</td>
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
