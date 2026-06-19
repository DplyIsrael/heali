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
import { approvePractitioner, rejectPractitioner, type PractitionerEdits } from "../actions";

interface PractitionerDetail {
  id: string;
  userId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  clinicCities: string[];
  clinicAddresses: string[];
  homeVisits: boolean;
  domainNames: string[];
  specialtyNames: string[];
  price: string;
  pricingModel: string;
  languages: string[];
  bio: string;
  status: string;
  rejectionReason: string;
  createdAt: string;
  documents: { name: string; url: string }[];
}

const PRICING_MODELS = [
  { value: "per_treatment", label: "לפי טיפול" },
  { value: "per_heali_package", label: "חבילה דרך Heali" },
];

export default function AdminPractitionerDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;

  const [practitioner, setPractitioner] = useState<PractitionerDetail | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [rejectReason, setRejectReason] = useState("");

  // Editable field state — what admin can override
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [clinicCitiesText, setClinicCitiesText] = useState("");
  const [clinicAddressesText, setClinicAddressesText] = useState("");
  const [homeVisits, setHomeVisits] = useState(false);
  const [pricingModel, setPricingModel] = useState("per_treatment");
  const [price, setPrice] = useState("");
  const [languagesText, setLanguagesText] = useState("");
  const [bio, setBio] = useState("");

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

      const { data: docs } = await supabase
        .from("practitioner_documents")
        .select("file_name, file_url")
        .eq("practitioner_id", id);

      const users = profile.users as unknown as { full_name: string; email: string };

      const detail: PractitionerDetail = {
        id: profile.id,
        userId: profile.user_id,
        name: users.full_name,
        email: users.email,
        phone: profile.phone ?? "",
        city: profile.city ?? "",
        clinicCities: (profile.clinic_cities as string[]) ?? [],
        clinicAddresses: (profile.clinic_addresses as string[]) ?? [],
        homeVisits: profile.home_visits ?? false,
        domainNames,
        specialtyNames,
        price: String(profile.price),
        pricingModel: profile.pricing_model,
        languages: (profile.languages as string[]) ?? [],
        bio: profile.bio ?? "",
        status: profile.verification_status,
        rejectionReason: profile.rejection_reason ?? "",
        createdAt: profile.created_at,
        documents: (docs ?? []).map((d: { file_name: string; file_url: string }) => ({
          name: d.file_name,
          url: d.file_url,
        })),
      };
      setPractitioner(detail);

      // Seed editable state with current values
      setPhone(detail.phone);
      setCity(detail.city);
      setClinicCitiesText(detail.clinicCities.join(", "));
      setClinicAddressesText(detail.clinicAddresses.join("\n"));
      setHomeVisits(detail.homeVisits);
      setPricingModel(detail.pricingModel);
      setPrice(detail.price);
      setLanguagesText(detail.languages.join(", "));
      setBio(detail.bio);

      setIsLoading(false);
    }
    load();
  }, [id]);

  const handleApprove = async () => {
    if (!practitioner) return;
    setIsSubmitting(true);
    const edits: PractitionerEdits = {
      phone,
      city,
      clinic_cities: clinicCitiesText.split(",").map((s) => s.trim()).filter(Boolean),
      clinic_addresses: clinicAddressesText.split("\n").map((s) => s.trim()).filter(Boolean),
      home_visits: homeVisits,
      pricing_model: pricingModel,
      price,
      languages: languagesText.split(",").map((s) => s.trim()).filter(Boolean),
      bio,
    };
    const res = await approvePractitioner(practitioner.id, edits);
    setIsSubmitting(false);
    if (res.success) {
      const changes = res.changedFieldLabels ?? [];
      toast.success(
        changes.length === 0
          ? "המטפל אושר ונשלח אימייל"
          : `המטפל אושר. עודכנו: ${changes.join(", ")}`
      );
      router.push("/admin/practitioners");
    } else {
      toast.error(res.error);
    }
  };

  const handleReject = async () => {
    if (!practitioner) return;
    if (!rejectReason.trim()) { toast.error("יש להזין סיבת דחייה"); return; }
    setIsSubmitting(true);
    const res = await rejectPractitioner(practitioner.id, rejectReason);
    setIsSubmitting(false);
    if (res.success) {
      toast.success("המטפל נדחה ונשלח אימייל");
      router.push("/admin/practitioners");
    } else {
      toast.error(res.error);
    }
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (!practitioner) return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">מטפל לא נמצא</div>;

  const isPending = ["submitted", "pending_approval"].includes(practitioner.status);

  return (
    <div>
      <button onClick={() => router.push("/admin/practitioners")} className="flex items-center gap-2 text-muted-foreground hover:text-black mb-6">
        <ArrowRight className="size-4" /> חזרה לרשימת מטפלים
      </button>

      <div className="flex flex-col lg:flex-row gap-8">
        <div className="flex-1">
          <div className="rounded-[12px] border border-border bg-white p-6">
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-[24px] font-bold text-black">{practitioner.name}</h1>
              <StatusBadge status={practitioner.status as "draft" | "submitted" | "approved" | "rejected"} />
            </div>

            {/* Read-only identity */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
              <FormField label="אימייל" htmlFor="email">
                <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px]">{practitioner.email}</div>
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
            </div>

            {/* Editable fields — admin checklist */}
            <h2 className="text-[16px] font-semibold text-black mb-3">פרטים לעריכה ואישור</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <FormField label="טלפון" htmlFor="phone">
                <Input id="phone" value={phone} onChange={(e) => setPhone(e.target.value)} />
              </FormField>
              <FormField label="עיר" htmlFor="city">
                <Input id="city" value={city} onChange={(e) => setCity(e.target.value)} />
              </FormField>
              <FormField label="ערי קליניקה (מופרדות בפסיק)" htmlFor="clinicCities">
                <Input id="clinicCities" value={clinicCitiesText} onChange={(e) => setClinicCitiesText(e.target.value)} />
              </FormField>
              <FormField label="שפות (מופרדות בפסיק)" htmlFor="languages">
                <Input id="languages" value={languagesText} onChange={(e) => setLanguagesText(e.target.value)} />
              </FormField>
              <FormField label="מודל תמחור" htmlFor="pricingModel">
                <select
                  id="pricingModel"
                  value={pricingModel}
                  onChange={(e) => setPricingModel(e.target.value)}
                  className="h-[48px] w-full rounded-[10px] border border-border-input bg-white px-3 text-[14px]"
                >
                  {PRICING_MODELS.map((m) => (
                    <option key={m.value} value={m.value}>{m.label}</option>
                  ))}
                </select>
              </FormField>
              <FormField label="מחיר (₪)" htmlFor="price">
                <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
              </FormField>
            </div>

            <div className="mt-5 flex flex-col gap-5">
              <FormField label="כתובות קליניקה (כתובת בכל שורה)" htmlFor="clinicAddresses">
                <textarea
                  id="clinicAddresses"
                  value={clinicAddressesText}
                  onChange={(e) => setClinicAddressesText(e.target.value)}
                  className="min-h-[80px] w-full rounded-[10px] border border-border-input px-3 py-2 text-[14px] resize-none"
                />
              </FormField>
              <label className="flex items-center gap-2 text-[14px]">
                <input
                  type="checkbox"
                  checked={homeVisits}
                  onChange={(e) => setHomeVisits(e.target.checked)}
                  className="size-4"
                />
                מבצע ביקורי בית
              </label>
              <FormField label="ביוגרפיה" htmlFor="bio">
                <textarea
                  id="bio"
                  value={bio}
                  onChange={(e) => setBio(e.target.value)}
                  className="min-h-[120px] w-full rounded-[10px] border border-border-input px-3 py-2 text-[14px] resize-none"
                />
              </FormField>
            </div>

            {practitioner.documents.length > 0 && (
              <div className="mt-6">
                <h2 className="text-[16px] font-semibold text-black mb-3">תעודות</h2>
                <ul className="flex flex-col gap-2">
                  {practitioner.documents.map((d, i) => (
                    <li key={i}>
                      <a href={d.url} target="_blank" rel="noreferrer" className="text-primary underline text-[14px]">
                        {d.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>
        </div>

        <div className="w-full lg:w-[350px] shrink-0">
          {isPending && (
            <div className="rounded-[12px] border border-border bg-white p-6 mb-4">
              <h2 className="text-[18px] font-semibold text-black mb-2">סיום הבדיקה</h2>
              <p className="text-[13px] text-muted-foreground mb-4">
                בלחיצה על אישור — שדות שעודכנו ייכללו במייל ההודעה למטפל יחד עם קוד QR ייעודי.
              </p>
              <Button onClick={handleApprove} disabled={isSubmitting} className="w-full mb-3 bg-accent text-black">
                {isSubmitting ? <Spinner size="sm" /> : "אישור מטפל"}
              </Button>
              <textarea
                value={rejectReason}
                onChange={(e) => setRejectReason(e.target.value)}
                placeholder="סיבת דחייה..."
                className="w-full min-h-[80px] rounded-[10px] border border-border-input px-3 py-2 text-[14px] resize-none mb-3"
              />
              <Button onClick={handleReject} disabled={isSubmitting} variant="destructive" className="w-full">
                דחיית מטפל
              </Button>
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
