"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Search, MoreVertical } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { EmptyState } from "@/components/shared/empty-state";
import { toast } from "sonner";
import { fetchDashboardData, approveBooking, declineBooking, type RecentBooking } from "../dashboard/actions";

export default function MyPatientsPage() {
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState("");

  const loadData = async () => {
    const data = await fetchDashboardData();
    setBookings(data.recentBookings);
    setIsLoading(false);
  };

  useEffect(() => { void loadData(); }, []);

  const handleApprove = async (id: string) => {
    const res = await approveBooking(id);
    if (res.success) { toast.success("הטיפול אושר"); loadData(); }
    else toast.error(res.error);
  };

  const handleDecline = async (id: string) => {
    const res = await declineBooking(id);
    if (res.success) { toast.success("הטיפול נדחה"); loadData(); }
    else toast.error(res.error);
  };

  const filtered = bookings.filter((b) =>
    !search || b.patientName.includes(search) || b.domain.includes(search)
  );

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  }

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">המטופלים שלי</h1>

      {/* Search */}
      <div className="flex items-center gap-3 mb-6">
        <div className="relative flex-1 max-w-[400px]">
          <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="חיפוש..."
            className="pe-10 h-[50px]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="אין מטופלים" description="כשמטופלים יזמינו טיפולים, הם יופיעו כאן" />
      ) : (
        <div className="rounded-[12px] border border-border bg-white overflow-x-auto">
          <table className="w-full text-[14px]">
            <thead>
              <tr className="border-b border-border text-[13px] text-muted">
                <th className="text-right py-3 px-4 font-medium">שם המטופל</th>
                <th className="text-right py-3 px-4 font-medium">סוג טיפול</th>
                <th className="text-right py-3 px-4 font-medium">תאריך טיפול</th>
                <th className="text-right py-3 px-4 font-medium">סטטוס טיפול</th>
                <th className="text-right py-3 px-4 font-medium">תשלומים</th>
                <th className="py-3 px-2 w-[40px]"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((b) => {
                const isPending = ["requested", "pending_practitioner_approval"].includes(b.status);
                return (
                  <tr key={b.id} className="border-b border-border/50 last:border-0">
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-2">
                        <div className="size-[32px] rounded-full bg-muted/20 flex items-center justify-center text-[12px] font-medium text-muted shrink-0">
                          {b.patientName[0]}
                        </div>
                        <span className="text-black">{b.patientName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 text-[#9f9f9f]">{b.domain}</td>
                    <td className="py-3 px-4 text-black">{b.scheduledDate}</td>
                    <td className="py-3 px-4">
                      <StatusBadge status={b.status as "requested" | "confirmed" | "completed" | "canceled" | "declined"} />
                    </td>
                    <td className="py-3 px-4 text-black">₪{b.price}</td>
                    <td className="py-3 px-2">
                      {isPending ? (
                        <ThreeDotsMenu
                          items={[
                            { label: "אישור טיפול", onClick: () => handleApprove(b.id) },
                            { label: "דחיית טיפול", onClick: () => handleDecline(b.id), destructive: true },
                          ]}
                        />
                      ) : (
                        <MoreVertical className="size-4 text-muted opacity-30" />
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
