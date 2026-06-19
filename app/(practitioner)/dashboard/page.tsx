"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState, useMemo } from "react";
import { Activity, Users, DollarSign, TrendingUp, MoreVertical, ChevronDown } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ThreeDotsMenu } from "@/components/shared/three-dots-menu";
import { toast } from "sonner";
import {
  fetchDashboardData,
  approveBooking,
  declineBooking,
  type DashboardStats,
  type RecentBooking,
} from "./actions";

function getGreeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 16) return "צהריים טובים";
  if (hour >= 16 && hour < 20) return "ערב טוב";
  return "לילה טוב";
}

export default function PractitionerDashboardPage() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [bookings, setBookings] = useState<RecentBooking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterType, setFilterType] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [userName, setUserName] = useState("");
  const greeting = useMemo(() => getGreeting(), []);

  const loadData = async () => {
    const data = await fetchDashboardData();
    setStats(data.stats);
    setBookings(data.recentBookings);
    setUserName(data.practitionerName);
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

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  }

  const kpis = [
    { label: "סה״כ טיפולים סגורים", value: stats?.totalClosed ?? 0, icon: Activity, color: "bg-blue-100 text-blue-600" },
    { label: "סה״כ טיפולים פעילים", value: stats?.totalActive ?? 0, icon: TrendingUp, color: "bg-yellow-100 text-yellow-600" },
    { label: "סה״כ מטופלים", value: stats?.totalPatients ?? 0, icon: Users, color: "bg-green-100 text-green-600" },
    { label: "סה״כ הכנסות", value: `₪${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "bg-purple-100 text-purple-600" },
  ];

  const filteredBookings = bookings.filter((b) => {
    if (filterType && b.domain !== filterType) return false;
    if (filterStatus && b.status !== filterStatus) return false;
    return true;
  });

  const domainOptions = [...new Set(bookings.map((b) => b.domain).filter(Boolean))];

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">
        {greeting}, <span className="text-primary">{userName}</span>
      </h1>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[12px] border border-border bg-white p-5 flex items-center gap-4">
            <div className={`size-[48px] rounded-full flex items-center justify-center shrink-0 ${kpi.color}`}>
              <kpi.icon className="size-5" />
            </div>
            <div>
              <p className="text-[13px] text-muted-foreground">{kpi.label}</p>
              <p className="text-[22px] font-bold text-black">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Patients Table */}
      <div className="rounded-[12px] border border-border bg-white p-5">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-4">
          <h2 className="text-[20px] font-semibold text-black">המטופלים האחרונים שלי</h2>
          <div className="flex gap-2">
            <div className="relative">
              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="h-[38px] rounded-[8px] border border-border bg-white pe-7 ps-3 text-[13px] appearance-none"
              >
                <option value="">מיון לפי סוג טיפול</option>
                {domainOptions.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
              <ChevronDown className="absolute top-1/2 left-2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            </div>
            <div className="relative">
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="h-[38px] rounded-[8px] border border-border bg-white pe-7 ps-3 text-[13px] appearance-none"
              >
                <option value="">מיון לפי סטטוס</option>
                <option value="requested">ממתין</option>
                <option value="pending_practitioner_approval">ממתין לאישור</option>
                <option value="confirmed">מאושר</option>
                <option value="completed">הושלם</option>
                <option value="canceled">בוטל</option>
              </select>
              <ChevronDown className="absolute top-1/2 left-2 -translate-y-1/2 size-3.5 text-muted-foreground pointer-events-none" />
            </div>
          </div>
        </div>

        {filteredBookings.length === 0 ? (
          <p className="text-[16px] text-muted-foreground py-6 text-center">אין טיפולים עדיין</p>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-[14px]">
              <thead>
                <tr className="border-b border-border text-[13px] text-muted-foreground">
                  <th className="text-right py-3 pe-4 font-medium">שם המטופל</th>
                  <th className="text-right py-3 pe-4 font-medium">סוג טיפול</th>
                  <th className="text-right py-3 pe-4 font-medium">תאריך טיפול</th>
                  <th className="text-right py-3 pe-4 font-medium">סטטוס טיפול</th>
                  <th className="text-right py-3 pe-4 font-medium">סכום הטיפול</th>
                  <th className="py-3 w-[40px]"></th>
                </tr>
              </thead>
              <tbody>
                {filteredBookings.map((b) => {
                  const isPending = ["requested", "pending_practitioner_approval"].includes(b.status);
                  return (
                    <tr key={b.id} className="border-b border-border/50 last:border-0">
                      <td className="py-3 pe-4">
                        <div className="flex items-center gap-2">
                          <div className="size-[32px] rounded-full bg-muted/20 flex items-center justify-center text-[12px] font-medium text-muted-foreground shrink-0">
                            {b.patientName[0]}
                          </div>
                          <span className="text-black">{b.patientName}</span>
                        </div>
                      </td>
                      <td className="py-3 pe-4 text-[#9f9f9f]">{b.domain}</td>
                      <td className="py-3 pe-4 text-black">{b.scheduledDate}</td>
                      <td className="py-3 pe-4">
                        <StatusBadge status={b.status as "requested" | "confirmed" | "completed" | "canceled" | "declined"} />
                      </td>
                      <td className="py-3 pe-4 text-black">₪{b.price}</td>
                      <td className="py-3">
                        {isPending ? (
                          <ThreeDotsMenu
                            items={[
                              { label: "אישור טיפול", onClick: () => handleApprove(b.id) },
                              { label: "דחיית טיפול", onClick: () => handleDecline(b.id), destructive: true },
                            ]}
                          />
                        ) : (
                          <MoreVertical className="size-4 text-muted-foreground opacity-30" />
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
    </div>
  );
}
