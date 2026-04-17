"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { FormField } from "@/components/ui/form-field";
import { createClient } from "@/lib/supabase/client";

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
}

interface PatientBooking {
  id: string;
  practitionerName: string;
  domain: string;
  scheduledDate: string;
  status: string;
  price: number;
}

export default function AdminPatientDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [patient, setPatient] = useState<PatientDetail | null>(null);
  const [bookings, setBookings] = useState<PatientBooking[]>([]);
  const [creditBalance, setCreditBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const supabase = createClient();

      const { data: user } = await supabase.from("users").select("id, full_name, email, created_at").eq("id", id).single();
      if (!user) { setIsLoading(false); return; }

      setPatient({ id: user.id, name: user.full_name, email: user.email, createdAt: user.created_at });

      // Fetch bookings
      const { data: bks } = await supabase
        .from("bookings")
        .select("id, scheduled_date, status, price_at_booking, domain_id, practitioner_profiles!inner(users!inner(full_name))")
        .eq("patient_id", id)
        .order("scheduled_date", { ascending: false });

      const domainIds = [...new Set((bks ?? []).map((b: Record<string, unknown>) => b.domain_id as string).filter(Boolean))];
      let domainMap: Record<string, string> = {};
      if (domainIds.length > 0) {
        const { data: doms } = await supabase.from("treatment_domains").select("id, name").in("id", domainIds);
        domainMap = (doms ?? []).reduce((a: Record<string, string>, d: { id: string; name: string }) => { a[d.id] = d.name; return a; }, {});
      }

      setBookings((bks ?? []).map((b: Record<string, unknown>) => {
        const profile = b.practitioner_profiles as unknown as { users: { full_name: string } };
        return {
          id: b.id as string,
          practitionerName: profile?.users?.full_name ?? "",
          domain: domainMap[b.domain_id as string] ?? "",
          scheduledDate: b.scheduled_date as string,
          status: b.status as string,
          price: Number(b.price_at_booking || 0),
        };
      }));

      // Fetch credits
      const { data: credits } = await supabase.from("credits").select("amount").eq("patient_id", id).eq("status", "active");
      const total = (credits ?? []).reduce((sum: number, c: { amount: string }) => sum + Number(c.amount || 0), 0);
      setCreditBalance(total);

      setIsLoading(false);
    }
    load();
  }, [id]);

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (!patient) return <div className="flex min-h-[60vh] items-center justify-center text-muted">מטופל לא נמצא</div>;

  return (
    <div>
      <button onClick={() => router.push("/admin/patients")} className="flex items-center gap-2 text-muted hover:text-black mb-6">
        <ArrowRight className="size-4" /> חזרה לרשימת מטופלים
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Patient info */}
        <div className="flex-1">
          <div className="rounded-[12px] border border-border bg-white p-6 mb-6">
            <h1 className="text-[24px] font-bold text-black mb-6">{patient.name}</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="אימייל" htmlFor="email">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{patient.email}</div>
              </FormField>
              <FormField label="תאריך הצטרפות" htmlFor="date">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{new Date(patient.createdAt).toLocaleDateString("he-IL")}</div>
              </FormField>
            </div>
          </div>

          {/* Treatment history */}
          <div className="rounded-[12px] border border-border bg-white p-6">
            <h2 className="text-[20px] font-semibold text-black mb-4">היסטוריית טיפולים</h2>
            {bookings.length === 0 ? (
              <p className="text-muted text-[14px]">אין טיפולים</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead><tr className="border-b border-border text-[13px] text-muted">
                    <th className="text-right py-3 px-4 font-medium">מטפל</th>
                    <th className="text-right py-3 px-4 font-medium">סוג טיפול</th>
                    <th className="text-right py-3 px-4 font-medium">תאריך</th>
                    <th className="text-right py-3 px-4 font-medium">סטטוס</th>
                    <th className="text-right py-3 px-4 font-medium">סכום</th>
                  </tr></thead>
                  <tbody>
                    {bookings.map((b) => (
                      <tr key={b.id} className="border-b border-border/50 last:border-0">
                        <td className="py-3 px-4 text-black">{b.practitionerName}</td>
                        <td className="py-3 px-4 text-muted">{b.domain}</td>
                        <td className="py-3 px-4 text-black">{b.scheduledDate}</td>
                        <td className="py-3 px-4"><StatusBadge status={b.status as "requested" | "confirmed" | "completed" | "canceled" | "declined"} /></td>
                        <td className="py-3 px-4 text-black">₪{b.price}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>

        {/* Credits sidebar */}
        <div className="w-full lg:w-[300px] shrink-0">
          <div className="rounded-[12px] border border-border bg-white p-6">
            <h2 className="text-[18px] font-semibold text-black mb-4">יתרת זכות</h2>
            <p className="text-[36px] font-bold text-primary">₪{creditBalance}</p>
            <p className="text-[14px] text-muted mt-1">יתרה פעילה בארנק</p>
          </div>

          <div className="rounded-[12px] border border-border bg-white p-6 mt-4">
            <h2 className="text-[18px] font-semibold text-black mb-2">סטטיסטיקה</h2>
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between"><span className="text-muted">סה״כ טיפולים</span><span className="text-black font-medium">{bookings.length}</span></div>
              <div className="flex justify-between"><span className="text-muted">הושלמו</span><span className="text-black font-medium">{bookings.filter((b) => b.status === "completed").length}</span></div>
              <div className="flex justify-between"><span className="text-muted">בוטלו</span><span className="text-black font-medium">{bookings.filter((b) => b.status === "canceled").length}</span></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
