"use client";

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight, Plus, Ban, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { FormField } from "@/components/ui/form-field";
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";
import { addCreditToPatient, setPatientBlocked } from "./actions";

interface PatientDetail {
  id: string;
  name: string;
  email: string;
  createdAt: string;
  isBlocked: boolean;
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

  // Modals + busy state for admin actions
  const [showCreditModal, setShowCreditModal] = useState(false);
  const [creditAmount, setCreditAmount] = useState("");
  const [isAddingCredit, setIsAddingCredit] = useState(false);
  const [showBlockConfirm, setShowBlockConfirm] = useState(false);
  const [isTogglingBlock, setIsTogglingBlock] = useState(false);

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["admin-patient-detail", id],
    queryFn: async (): Promise<{ patient: PatientDetail; bookings: PatientBooking[]; creditBalance: number } | null> => {
      const supabase = createClient();

      const { data: user } = await supabase.from("users").select("id, full_name, email, created_at, is_blocked").eq("id", id).single();
      if (!user) return null;

      const patient: PatientDetail = {
        id: user.id,
        name: user.full_name,
        email: user.email,
        createdAt: user.created_at,
        isBlocked: user.is_blocked ?? false,
      };

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

      const bookings: PatientBooking[] = (bks ?? []).map((b: Record<string, unknown>) => {
        const profile = b.practitioner_profiles as unknown as { users: { full_name: string } };
        return {
          id: b.id as string,
          practitionerName: profile?.users?.full_name ?? "",
          domain: domainMap[b.domain_id as string] ?? "",
          scheduledDate: b.scheduled_date as string,
          status: b.status as string,
          price: Number(b.price_at_booking || 0),
        };
      });

      // Fetch credits
      const { data: credits } = await supabase.from("credits").select("amount").eq("patient_id", id).eq("status", "active");
      const creditBalance = (credits ?? []).reduce((sum: number, c: { amount: string }) => sum + Number(c.amount || 0), 0);

      return { patient, bookings, creditBalance };
    },
  });

  const patient = data?.patient ?? null;
  const bookings = data?.bookings ?? [];
  const creditBalance = data?.creditBalance ?? 0;

  const handleAddCredit = async () => {
    if (!patient) return;
    const amount = Number(creditAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      toast.error("סכום לא תקין");
      return;
    }
    setIsAddingCredit(true);
    const result = await addCreditToPatient(patient.id, amount);
    setIsAddingCredit(false);
    if (result.success) {
      toast.success(`נוסף זיכוי של ₪${amount}`);
      setCreditAmount("");
      setShowCreditModal(false);
      void refetch();
    } else {
      toast.error(result.error ?? "שגיאה");
    }
  };

  const handleToggleBlock = async () => {
    if (!patient) return;
    setIsTogglingBlock(true);
    const result = await setPatientBlocked(patient.id, !patient.isBlocked);
    setIsTogglingBlock(false);
    if (result.success) {
      toast.success(patient.isBlocked ? "המטופל שוחרר" : "המטופל נחסם");
      setShowBlockConfirm(false);
      void refetch();
    } else {
      toast.error(result.error ?? "שגיאה");
    }
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (isError)
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-muted-foreground">שגיאה בטעינת המטופל</p>
        <Button onClick={() => void refetch()} variant="secondary" className="bg-[#f4f7f7]">נסה שוב</Button>
      </div>
    );
  if (!patient) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">מטופל לא נמצא</div>;

  return (
    <div>
      <button onClick={() => router.push("/admin/patients")} className="flex items-center gap-2 text-muted-foreground hover:text-black mb-6">
        <ArrowRight className="size-4" /> חזרה לרשימת מטופלים
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Patient info */}
        <div className="flex-1">
          <div className="rounded-[12px] border border-border bg-white p-6 mb-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[24px] font-bold text-black">{patient.name}</h1>
              {patient.isBlocked && (
                <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 text-destructive text-[12px] font-medium px-3 py-1">
                  <Ban className="size-3" /> חסום
                </span>
              )}
            </div>
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
              <p className="text-muted-foreground text-[14px]">אין טיפולים</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-[14px]">
                  <thead><tr className="border-b border-border text-[13px] text-muted-foreground">
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
                        <td className="py-3 px-4 text-muted-foreground">{b.domain}</td>
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
            <p className="text-[14px] text-muted-foreground mt-1">יתרה פעילה בארנק</p>
            <Button
              type="button"
              onClick={() => setShowCreditModal(true)}
              className="w-full mt-4 bg-accent text-black gap-2"
            >
              <Plus className="size-4" />
              הוספת זיכוי
            </Button>
          </div>

          <div className="rounded-[12px] border border-border bg-white p-6 mt-4">
            <h2 className="text-[18px] font-semibold text-black mb-2">סטטיסטיקה</h2>
            <div className="flex flex-col gap-2 text-[14px]">
              <div className="flex justify-between"><span className="text-muted-foreground">סה״כ טיפולים</span><span className="text-black font-medium">{bookings.length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">הושלמו</span><span className="text-black font-medium">{bookings.filter((b) => b.status === "completed").length}</span></div>
              <div className="flex justify-between"><span className="text-muted-foreground">בוטלו</span><span className="text-black font-medium">{bookings.filter((b) => b.status === "canceled").length}</span></div>
            </div>
          </div>

          {/* Block / unblock action */}
          <div className="rounded-[12px] border border-border bg-white p-6 mt-4">
            <h2 className="text-[18px] font-semibold text-black mb-2">סטטוס חשבון</h2>
            <p className="text-[13px] text-muted-foreground mb-3">
              {patient.isBlocked
                ? "המטופל חסום וחסום מהזמנת טיפולים."
                : "המטופל פעיל ויכול להזמין טיפולים."}
            </p>
            <Button
              type="button"
              onClick={() => setShowBlockConfirm(true)}
              variant={patient.isBlocked ? "secondary" : "destructive"}
              className="w-full gap-2"
            >
              {patient.isBlocked ? <ShieldCheck className="size-4" /> : <Ban className="size-4" />}
              {patient.isBlocked ? "ביטול חסימה" : "חסימת מטופל"}
            </Button>
          </div>
        </div>
      </div>

      {/* Add credit modal */}
      <Dialog open={showCreditModal} onOpenChange={setShowCreditModal}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>הוספת זיכוי</DialogTitle>
          </DialogHeader>
          <FormField label="סכום (₪)" htmlFor="creditAmount">
            <Input
              id="creditAmount"
              type="number"
              min="1"
              step="1"
              value={creditAmount}
              onChange={(e) => setCreditAmount(e.target.value)}
              placeholder="הקלד/י סכום..."
              autoFocus
            />
          </FormField>
          <DialogFooter>
            <Button
              type="button"
              variant="secondary"
              onClick={() => { setShowCreditModal(false); setCreditAmount(""); }}
            >
              ביטול
            </Button>
            <Button
              type="button"
              onClick={handleAddCredit}
              disabled={isAddingCredit || !creditAmount}
              className="bg-accent text-black"
            >
              {isAddingCredit ? <Spinner size="sm" /> : "הוספה"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmDialog
        open={showBlockConfirm}
        onOpenChange={setShowBlockConfirm}
        title={patient.isBlocked ? "ביטול חסימה" : "חסימת מטופל"}
        description={
          patient.isBlocked
            ? `לבטל את חסימת ${patient.name}? המטופל יוכל להזמין טיפולים שוב.`
            : `לחסום את ${patient.name}? המטופל לא יוכל להזמין טיפולים חדשים.`
        }
        confirmLabel={isTogglingBlock ? "מעדכן..." : patient.isBlocked ? "ביטול חסימה" : "חסימה"}
        onConfirm={handleToggleBlock}
        destructive={!patient.isBlocked}
      />
    </div>
  );
}
