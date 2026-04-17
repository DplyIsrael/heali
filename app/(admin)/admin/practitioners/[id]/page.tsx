"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowRight } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { StatusBadge } from "@/components/shared/status-badge";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface PractitionerDetail {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  clinicCities: string[];
  domainNames: string[];
  specialtyNames: string[];
  price: string;
  pricingModel: string;
  languages: string[];
  bio: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
}

export default function AdminPractitionerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [practitioner, setPractitioner] = useState<PractitionerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [editPrice, setEditPrice] = useState("");
  const [editBio, setEditBio] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: profile } = await supabase
        .from("practitioner_profiles")
        .select("*, users!inner(full_name, email)")
        .eq("id", id)
        .single();

      if (!profile) { setIsLoading(false); return; }

      const domainIds = (profile.domain_ids as string[]) ?? [];
      const specialtyIds = (profile.specialty_ids as string[]) ?? [];
      let domainNames: string[] = [];
      let specialtyNames: string[] = [];

      if (domainIds.length > 0) {
        const { data } = await supabase.from("treatment_domains").select("name").in("id", domainIds);
        domainNames = (data ?? []).map((d: { name: string }) => d.name);
      }
      if (specialtyIds.length > 0) {
        const { data } = await supabase.from("specialties").select("name").in("id", specialtyIds);
        specialtyNames = (data ?? []).map((s: { name: string }) => s.name);
      }

      const users = profile.users as unknown as { full_name: string; email: string };

      setPractitioner({
        id: profile.id,
        userId: profile.user_id,
        name: users.full_name,
        email: users.email,
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        clinicCities: (profile.clinic_cities as string[]) ?? [],
        domainNames,
        specialtyNames,
        price: String(profile.price),
        pricingModel: profile.pricing_model,
        languages: (profile.languages as string[]) ?? [],
        bio: profile.bio ?? "",
        status: profile.verification_status,
        rejectionReason: profile.rejection_reason ?? "",
        createdAt: profile.created_at,
      });
      setEditPrice(String(profile.price));
      setEditBio(profile.bio ?? "");
      setIsLoading(false);
    }
    load();
  }, [id]);

  const handleApprove = async () => {
    const supabase = createClient();
    await supabase.from("practitioner_profiles").update({ verification_status: "approved", is_publicly_visible: true, updated_at: new Date().toISOString() }).eq("id", id);
    await supabase.from("users").update({ onboarding_completed: true }).eq("id", practitioner?.userId);
    toast.success("המטפל אושר");
    router.push("/admin/practitioners");
  };

  const handleReject = async () => {
    if (!rejectReason.trim()) { toast.error("יש להזין סיבת דחייה"); return; }
    const supabase = createClient();
    await supabase.from("practitioner_profiles").update({ verification_status: "rejected", rejection_reason: rejectReason, is_publicly_visible: false, updated_at: new Date().toISOString() }).eq("id", id);
    toast.success("המטפל נדחה");
    router.push("/admin/practitioners");
  };

  const handleSave = async () => {
    setIsSaving(true);
    const supabase = createClient();
    await supabase.from("practitioner_profiles").update({ price: editPrice, bio: editBio, updated_at: new Date().toISOString() }).eq("id", id);
    toast.success("הפרטים עודכנו");
    setIsSaving(false);
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (!practitioner) return <div className="flex min-h-[60vh] items-center justify-center text-muted">מטפל לא נמצא</div>;

  const isPending = ["submitted", "pending_approval"].includes(practitioner.status);

  return (
    <div>
      <button onClick={() => router.push("/admin/practitioners")} className="flex items-center gap-2 text-muted hover:text-black mb-6">
        <ArrowRight className="size-4" /> חזרה לרשימת מטפלים
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        {/* Main info */}
        <div className="flex-1">
          <div className="rounded-[12px] border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[24px] font-bold text-black">{practitioner.name}</h1>
              <StatusBadge status={practitioner.status as "draft" | "submitted" | "approved" | "rejected"} />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="אימייל" htmlFor="email">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{practitioner.email}</div>
              </FormField>
              <FormField label="טלפון" htmlFor="phone">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{practitioner.phone || "—"}</div>
              </FormField>
              <FormField label="מיקום קליניקה" htmlFor="cities">
                <div className="min-h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 py-2 flex flex-wrap gap-1 items-center text-[14px]">
                  {practitioner.clinicCities.length > 0
                    ? practitioner.clinicCities.map((c) => <span key={c} className="bg-primary/10 text-primary rounded-full px-2 py-0.5 text-[12px]">{c}</span>)
                    : practitioner.city || "—"}
                </div>
              </FormField>
              <FormField label="תאריך הצטרפות" htmlFor="date">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{new Date(practitioner.createdAt).toLocaleDateString("he-IL")}</div>
              </FormField>
              <FormField label="תחומי טיפול" htmlFor="domains">
                <div className="min-h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 py-2 flex flex-wrap gap-1 items-center text-[14px]">
                  {practitioner.domainNames.length > 0 ? practitioner.domainNames.join(", ") : "—"}
                </div>
              </FormField>
              <FormField label="התמחויות" htmlFor="specialties">
                <div className="min-h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 py-2 flex flex-wrap gap-1 items-center text-[14px]">
                  {practitioner.specialtyNames.length > 0 ? practitioner.specialtyNames.join(", ") : "—"}
                </div>
              </FormField>
              <FormField label="שפות" htmlFor="langs">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{practitioner.languages.join(", ") || "—"}</div>
              </FormField>
              <FormField label="מודל תמחור" htmlFor="model">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">
                  {practitioner.pricingModel === "per_treatment" ? "לפי טיפול" : practitioner.pricingModel === "per_package" ? "לפי חבילה" : practitioner.pricingModel === "per_heali_package" ? "חבילה דרך Heali" : practitioner.pricingModel}
                </div>
              </FormField>
            </div>

            {/* Editable fields */}
            <div className="mt-6 flex flex-col gap-5">
              <FormField label="מחיר (₪)" htmlFor="editPrice">
                <Input id="editPrice" type="number" value={editPrice} onChange={(e) => setEditPrice(e.target.value)} />
              </FormField>
              <FormField label="ביוגרפיה" htmlFor="editBio">
                <textarea value={editBio} onChange={(e) => setEditBio(e.target.value)} className="min-h-[100px] w-full rounded-[10px] border border-border-input px-3 py-2 text-[14px] resize-none" />
              </FormField>
              <Button onClick={handleSave} disabled={isSaving} className="w-[160px] bg-accent text-black">
                {isSaving ? <Spinner size="sm" /> : "שמירת שינויים"}
              </Button>
            </div>
          </div>
        </div>

        {/* Actions sidebar */}
        <div className="w-full lg:w-[350px] shrink-0">
          {isPending && (
            <div className="rounded-[12px] border border-border bg-white p-6 mb-4">
              <h2 className="text-[18px] font-semibold text-black mb-4">אישור / דחייה</h2>
              <Button onClick={handleApprove} className="w-full mb-3 bg-accent text-black">אישור מטפל</Button>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="סיבת דחייה..."
                className="w-full min-h-[80px] rounded-[10px] border border-border-input px-3 py-2 text-[14px] resize-none mb-3"
              />
              <Button onClick={handleReject} variant="destructive" className="w-full">דחיית מטפל</Button>
            </div>
          )}

          {practitioner.rejectionReason && (
            <div className="rounded-[12px] border border-destructive/30 bg-red-50 p-4">
              <p className="text-[14px] font-medium text-destructive mb-1">סיבת דחייה:</p>
              <p className="text-[14px] text-black">{practitioner.rejectionReason}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
