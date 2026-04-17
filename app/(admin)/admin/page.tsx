"use client";

import { useEffect, useState } from "react";
import { Users, UserCheck, Calendar, DollarSign, Clock, MessageSquare } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { fetchAdminStats } from "./actions";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Awaited<ReturnType<typeof fetchAdminStats>> | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchAdminStats().then((s) => { setStats(s); setIsLoading(false); });
  }, []);

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;

  const kpis = [
    { label: "סה״כ משתמשים", value: stats?.totalUsers ?? 0, icon: Users, color: "bg-blue-100 text-blue-600" },
    { label: "מטפלים", value: stats?.totalPractitioners ?? 0, icon: UserCheck, color: "bg-green-100 text-green-600" },
    { label: "מטופלים", value: stats?.totalPatients ?? 0, icon: Users, color: "bg-purple-100 text-purple-600" },
    { label: "סה״כ הזמנות", value: stats?.totalBookings ?? 0, icon: Calendar, color: "bg-yellow-100 text-yellow-600" },
    { label: "סה״כ הכנסות", value: `₪${(stats?.totalRevenue ?? 0).toLocaleString()}`, icon: DollarSign, color: "bg-emerald-100 text-emerald-600" },
    { label: "מטפלים ממתינים", value: stats?.pendingPractitioners ?? 0, icon: Clock, color: "bg-orange-100 text-orange-600" },
    { label: "דירוגים ממתינים", value: stats?.pendingReviews ?? 0, icon: MessageSquare, color: "bg-red-100 text-red-600" },
  ];

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">דשבורד</h1>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[12px] border border-border bg-white p-5 flex items-center gap-4">
            <div className={`size-[48px] rounded-full flex items-center justify-center shrink-0 ${kpi.color}`}>
              <kpi.icon className="size-5" />
            </div>
            <div>
              <p className="text-[13px] text-muted">{kpi.label}</p>
              <p className="text-[22px] font-bold text-black">{kpi.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
