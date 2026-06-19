import { Zap, CircleCheck, Users } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { fetchAdminStats, fetchAdminTransactions, fetchTreatmentDomains } from "./actions";
import { TransactionsTable } from "@/components/admin/transactions-table";

function greeting(): string {
  const hour = new Date().getHours();
  if (hour >= 6 && hour < 12) return "בוקר טוב";
  if (hour >= 12 && hour < 16) return "צהריים טובים";
  if (hour >= 16 && hour < 20) return "ערב טוב";
  return "לילה טוב";
}

export default async function AdminDashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  let name = "";
  if (user) {
    const { data } = await supabase.from("users").select("full_name").eq("id", user.id).single();
    name = data?.full_name ?? "";
  }

  const [stats, transactions, domains] = await Promise.all([
    fetchAdminStats(),
    fetchAdminTransactions({}),
    fetchTreatmentDomains(),
  ]);

  const kpis = [
    { label: "סה״כ הזמנות", value: stats.totalBookings, trend: stats.trends.bookings, icon: Zap, iconClass: "bg-accent/20 text-primary" },
    { label: "מטפלים הממתינים לאישור", value: stats.pendingPractitioners, trend: stats.trends.practitioners, icon: CircleCheck, iconClass: "bg-yellow-100 text-yellow-600" },
    { label: "סה״כ מטופלים", value: stats.totalPatients, trend: stats.trends.patients, icon: Users, iconClass: "bg-blue-100 text-blue-600" },
    { label: "סה״כ מטפלים", value: stats.totalPractitioners, trend: stats.trends.practitioners, icon: Users, iconClass: "bg-purple-100 text-purple-600" },
  ];

  return (
    <div className="flex flex-col gap-8">
      {/* Greeting */}
      <div className="text-right">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black">
          {greeting()} {name}!
        </h1>
        <p className="mt-1 text-[15px] text-muted-foreground">סקירה כללית של הפעילות במערכת Heali</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {kpis.map((kpi) => (
          <div key={kpi.label} className="rounded-[16px] border border-border bg-white p-5">
            <div className="flex items-start justify-between gap-2">
              <p className="text-[14px] leading-snug text-muted-foreground">{kpi.label}</p>
              <div className={`flex size-[48px] shrink-0 items-center justify-center rounded-[12px] ${kpi.iconClass}`}>
                <kpi.icon className="size-5" />
              </div>
            </div>
            <p className="mt-3 text-[28px] font-bold text-black">{kpi.value.toLocaleString()}</p>
            <p className="mt-2 text-[13px] text-muted-foreground">
              <span className={kpi.trend >= 0 ? "text-green-600" : "text-destructive"}>
                {kpi.trend >= 0 ? "+" : ""}{kpi.trend}%
              </span>{" "}
              מהחודש שעבר
            </p>
          </div>
        ))}
      </div>

      {/* Transactions table */}
      <TransactionsTable initialTransactions={transactions} domains={domains} />
    </div>
  );
}
