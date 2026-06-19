"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Link2, Trash2, Upload, Package } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FormField } from "@/components/ui/form-field";
import { ConfirmDialog } from "@/components/shared/confirm-dialog";
import { toast } from "sonner";
import {
  fetchProfileData,
  updatePrice,
  updatePassword,
  uploadAvatar,
  joinHealiPackages,
  updateBankDetails,
  type PractitionerProfileData,
} from "./actions";

export default function PractitionerProfilePage() {
  const [profile, setProfile] = useState<PractitionerProfileData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"business" | "personal">("business");
  const [price, setPrice] = useState("");
  const [isSaving, setIsSaving] = useState(false);
  const [showJoinPackagesDialog, setShowJoinPackagesDialog] = useState(false);
  const [isJoiningPackages, setIsJoiningPackages] = useState(false);

  // Avatar
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Bank details
  const [bankName, setBankName] = useState("");
  const [bankAccountNumber, setBankAccountNumber] = useState("");
  const [bankBranchNumber, setBankBranchNumber] = useState("");
  const [bankNumber, setBankNumber] = useState("");
  const [isSavingBank, setIsSavingBank] = useState(false);

  // Password change
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPassword, setIsChangingPassword] = useState(false);

  useEffect(() => {
    async function load() {
      const data = await fetchProfileData();
      setProfile(data);
      if (data) {
        setPrice(String(data.price));
        setAvatarUrl(data.profilePhotoUrl);
        setBankName(data.bankName);
        setBankAccountNumber(data.bankAccountNumber);
        setBankBranchNumber(data.bankBranchNumber);
        setBankNumber(data.bankNumber);
      }
      setIsLoading(false);
    }
    load();
  }, []);

  const handleSaveBank = async () => {
    setIsSavingBank(true);
    const result = await updateBankDetails({
      bankName,
      bankAccountNumber,
      bankBranchNumber,
      bankNumber,
    });
    if (result.success) toast.success("פרטי הבנק עודכנו");
    else toast.error(result.error);
    setIsSavingBank(false);
  };

  const handleResetBank = () => {
    if (!profile) return;
    setBankName(profile.bankName);
    setBankAccountNumber(profile.bankAccountNumber);
    setBankBranchNumber(profile.bankBranchNumber);
    setBankNumber(profile.bankNumber);
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const reader = new FileReader();
      reader.onload = async () => {
        const result = reader.result as string;
        const base64 = result.split(",")[1];
        const ext = file.name.split(".").pop() ?? "jpg";
        const res = await uploadAvatar(base64, ext, file.type);
        if (res.success && res.url) {
          setAvatarUrl(res.url);
          toast.success("תמונת הפרופיל עודכנה");
        } else {
          toast.error(res.error ?? "שגיאה בהעלאת תמונה");
        }
        setIsUploadingAvatar(false);
      };
      reader.readAsDataURL(file);
    } catch {
      toast.error("שגיאה בהעלאת תמונה");
      setIsUploadingAvatar(false);
    }
  };

  const handleSavePrice = async () => {
    setIsSaving(true);
    const result = await updatePrice(price);
    if (result.success) toast.success("המחיר עודכן");
    else toast.error(result.error);
    setIsSaving(false);
  };

  const handleJoinPackages = async () => {
    setIsJoiningPackages(true);
    const result = await joinHealiPackages();
    if (result.success) {
      toast.success("הצטרפת לחבילות Heali");
      // Reload profile so the CTA disappears and the new pricing model
      // shows in the form.
      const data = await fetchProfileData();
      setProfile(data);
      if (data) setPrice(String(data.price));
    } else {
      toast.error(result.error);
    }
    setIsJoiningPackages(false);
    setShowJoinPackagesDialog(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("סיסמה חדשה חייבת להכיל לפחות 8 תווים"); return; }
    if (newPassword !== confirmPassword) { toast.error("הסיסמאות אינן תואמות"); return; }
    setIsChangingPassword(true);
    const result = await updatePassword(currentPassword, newPassword);
    if (result.success) {
      toast.success("הסיסמה שונתה בהצלחה");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } else {
      toast.error(result.error);
    }
    setIsChangingPassword(false);
  };

  if (isLoading) {
    return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  }

  if (!profile) {
    return <div className="flex min-h-[60vh] items-center justify-center text-muted-foreground">פרופיל לא נמצא</div>;
  }

  const pricingLabel = profile.pricingModel === "per_hour" ? "לפי שעה"
    : profile.pricingModel === "per_package" ? "לפי חבילה"
    : profile.pricingModel === "per_heali_package" ? "חבילה דרך Heali"
    : "לפי טיפול";

  return (
    <div className="mx-auto max-w-[1100px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">הפרופיל שלי</h1>

      {/* Tab switcher */}
      <div className="flex rounded-[10px] bg-white p-[6px] mb-8 w-full max-w-[567px]">
        <button
          onClick={() => setActiveTab("business")}
          className={`flex-1 py-2.5 rounded-[8px] text-[18px] transition-colors ${
            activeTab === "business" ? "bg-accent font-normal text-black" : "font-light text-black"
          }`}
        >
          פרטי העסק
        </button>
        <button
          onClick={() => setActiveTab("personal")}
          className={`flex-1 py-2.5 rounded-[8px] text-[18px] transition-colors ${
            activeTab === "personal" ? "bg-accent font-normal text-black" : "font-light text-black"
          }`}
        >
          פרטים אישיים
        </button>
      </div>

      {/* ═══ BUSINESS TAB ═══ */}
      {activeTab === "business" && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Right column — business form */}
          <div className="flex-1 max-w-[499px]">
            <div className="rounded-[12px] border border-border bg-white p-6">
              <h2 className="text-[22px] font-semibold text-black mb-6">פרטי העסק</h2>

              <div className="flex flex-col gap-5">
                <FormField label="תחום טיפול" htmlFor="domain">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.domainNames.join(", ") || "לא הוגדר"}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">לשינוי, צור קשר עם תמיכה</p>
                </FormField>

                <FormField label="תחום התמחות" htmlFor="specialty">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.specialtyNames.join(", ") || "לא הוגדר"}
                  </div>
                  <p className="text-[12px] text-muted-foreground mt-1">לשינוי, צור קשר עם תמיכה</p>
                </FormField>

                {/* Editable price + model */}
                <FormField label="מחיר לטיפול" htmlFor="price">
                  <div className="flex gap-2">
                    <Input
                      id="price"
                      type="number"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      placeholder="₪"
                      className="flex-1"
                    />
                    <div className="h-[48px] w-[147px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-muted-foreground">
                      {pricingLabel}
                    </div>
                  </div>
                </FormField>

                {/* Heali-package opt-in — only shown to practitioners who didn't
                    pick the package model during onboarding. Tapping it flips the
                    pricing_model to per_heali_package and the price to the flat
                    140₪ rate. */}
                {profile.pricingModel !== "per_heali_package" && (
                  <div className="rounded-[10px] border border-accent/40 bg-accent/5 p-4">
                    <div className="flex items-start gap-3 mb-3">
                      <Package className="size-5 text-primary shrink-0 mt-0.5" />
                      <div>
                        <h3 className="text-[15px] font-semibold text-black mb-1">
                          הצטרפות לחבילות הטיפולים של Heali
                        </h3>
                        <p className="text-[13px] font-light leading-snug text-[#666]">
                          מטפלים בחבילות הטיפול של Heali מקבלים הרבה יותר מטופלים. כל המטפלים בחבילות הם במחיר אחיד של 140 ש&quot;ח פלוס מע&quot;מ.
                        </p>
                      </div>
                    </div>
                    <Button
                      type="button"
                      onClick={() => setShowJoinPackagesDialog(true)}
                      className="bg-accent text-black w-full"
                    >
                      הצטרפות לחבילות
                    </Button>
                  </div>
                )}

                {/* Add treatment area link */}
                <button className="text-[16px] text-black underline self-start hover:text-primary transition-colors">
                  הוספת תחום טיפול נוסף +
                </button>

                {/* Certification section */}
                <div className="mt-2">
                  <h3 className="text-[20px] font-bold text-black mb-3">תעודת הסמכה</h3>
                  {profile.certificates.length > 0 ? (
                    <div className="flex flex-col gap-2">
                      {profile.certificates.map((cert, i) => (
                        <div key={i} className="flex items-center justify-between rounded-[8px] border border-border-input bg-white px-3 py-2.5">
                          <div className="flex items-center gap-2">
                            <Link2 className="size-4 text-primary" />
                            <span className="text-[14px] text-primary">{cert.name}</span>
                            <span className="text-[14px] text-[#666]">{cert.size}</span>
                          </div>
                          <Trash2 className="size-4 text-muted-foreground hover:text-destructive cursor-pointer" />
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-[14px] text-muted-foreground">לא הועלו תעודות</p>
                  )}
                </div>

                {/* QR Code */}
                {profile.qrCodeUrl && (
                  <div className="mt-4 text-center">
                    <a href={profile.qrCodeUrl} className="text-[18px] font-bold text-[#2563EB] underline">
                      הורדת קוד QR בקובץ PDF
                    </a>
                  </div>
                )}
              </div>

              {/* Save / Cancel */}
              <div className="flex gap-3 mt-8">
                <Button onClick={handleSavePrice} disabled={isSaving} className="w-[136px] bg-accent text-black">
                  {isSaving ? <Spinner size="sm" /> : "שמירת שינויים"}
                </Button>
                <Button variant="secondary" className="w-[136px] bg-[#f4f7f7]" onClick={() => setPrice(String(profile.price))}>
                  ביטול שינויים
                </Button>
              </div>
            </div>
          </div>

          {/* Left column — bank details */}
          <div className="w-full lg:w-[417px] shrink-0">
            <div className="rounded-[12px] border border-border bg-white p-6">
              <h2 className="text-[22px] md:text-[26px] font-medium text-black mb-6">פרטי חשבון בנק</h2>

              <div className="flex flex-col gap-5">
                <FormField label="שם הבנק" htmlFor="bankName">
                  <Input
                    id="bankName"
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    placeholder="הקלד/י כאן..."
                  />
                </FormField>

                <FormField label="מספר חשבון בנק" htmlFor="accountNumber">
                  <Input
                    id="accountNumber"
                    inputMode="numeric"
                    value={bankAccountNumber}
                    onChange={(e) => setBankAccountNumber(e.target.value.replace(/\D/g, ""))}
                    placeholder="הקלד/י כאן..."
                  />
                </FormField>

                <div className="flex gap-3">
                  <div className="flex-1">
                    <FormField label="מספר סניף" htmlFor="branchNumber">
                      <Input
                        id="branchNumber"
                        inputMode="numeric"
                        value={bankBranchNumber}
                        onChange={(e) => setBankBranchNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="הקלד/י כאן..."
                      />
                    </FormField>
                  </div>
                  <div className="flex-1">
                    <FormField label="מספר בנק" htmlFor="bankNumber">
                      <Input
                        id="bankNumber"
                        inputMode="numeric"
                        value={bankNumber}
                        onChange={(e) => setBankNumber(e.target.value.replace(/\D/g, ""))}
                        placeholder="הקלד/י כאן..."
                      />
                    </FormField>
                  </div>
                </div>

                <p className="text-[12px] text-muted-foreground">פרטי בנק ישמשו לצורך העברת תשלומים. ניתן לעדכן בכל עת.</p>

                <div className="flex gap-3 mt-2">
                  <Button onClick={handleSaveBank} disabled={isSavingBank} className="bg-accent text-black w-[136px]">
                    {isSavingBank ? <Spinner size="sm" /> : "שמירת שינויים"}
                  </Button>
                  <Button variant="secondary" className="bg-[#f4f7f7] w-[136px]" onClick={handleResetBank}>
                    ביטול שינויים
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ═══ PERSONAL TAB ═══ */}
      {activeTab === "personal" && (
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Right column — personal details */}
          <div className="flex-1">
            <div className="rounded-[12px] border border-border bg-white p-6">
              <h2 className="text-[22px] font-semibold text-black mb-6">פרטים אישיים</h2>

              {/* Avatar with upload */}
              <div className="flex items-center gap-4 mb-6">
                <label className="relative size-[100px] rounded-full bg-muted/20 flex items-center justify-center text-[28px] font-medium text-muted-foreground overflow-hidden cursor-pointer group">
                  {avatarUrl ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    profile.name.slice(0, 2)
                  )}
                  {/* Upload overlay */}
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-full">
                    {isUploadingAvatar ? (
                      <Spinner size="sm" className="border-white/30 border-t-white" />
                    ) : (
                      <Upload className="size-6 text-white" />
                    )}
                  </div>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="hidden"
                    onChange={handleAvatarUpload}
                    disabled={isUploadingAvatar}
                  />
                </label>
                <div>
                  <p className="text-[18px] font-medium text-black">{profile.name}</p>
                  <p className="text-[14px] text-muted-foreground">{profile.email}</p>
                  <p className="text-[12px] text-primary mt-1">לחץ על התמונה לעדכון</p>
                </div>
              </div>

              <div className="flex flex-col gap-5">
                <FormField label="שם מלא" htmlFor="name">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.name}
                  </div>
                </FormField>

                <FormField label="כתובת מייל" htmlFor="email">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.email}
                  </div>
                </FormField>

                <FormField label="מספר נייד" htmlFor="phone">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.phone || "—"}
                  </div>
                </FormField>

                <FormField label="מיקום קליניקה" htmlFor="city">
                  <div className="min-h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 py-2 flex flex-wrap gap-2 items-center text-[14px] text-black">
                    {profile.clinicCities.length > 0
                      ? profile.clinicCities.map((c) => (
                          <span key={c} className="bg-primary/10 text-primary rounded-full px-3 py-0.5 text-[13px]">{c}</span>
                        ))
                      : profile.city || "—"
                    }
                  </div>
                </FormField>

                <FormField label="שפות" htmlFor="languages">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.languages.join(", ") || "—"}
                  </div>
                </FormField>

                <p className="text-[14px] text-muted-foreground">לשינוי פרטים אישיים, צור קשר עם תמיכה</p>
              </div>
            </div>
          </div>

          {/* Left column — password change */}
          <div className="w-full lg:w-[417px] shrink-0">
            <div className="rounded-[12px] border border-border bg-white p-6">
              <h2 className="text-[22px] font-medium text-black mb-6">שינוי סיסמה</h2>

              <div className="flex flex-col gap-4">
                <FormField label="סיסמה נוכחית" htmlFor="currentPw">
                  <Input
                    id="currentPw"
                    type="password"
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="הקלד/י כאן..."
                  />
                </FormField>

                <FormField label="סיסמה חדשה" htmlFor="newPw">
                  <Input
                    id="newPw"
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="הקלד/י כאן..."
                  />
                </FormField>

                <FormField label="אימות סיסמה חדשה" htmlFor="confirmPw">
                  <Input
                    id="confirmPw"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="הקלד/י כאן..."
                  />
                </FormField>

                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPassword}
                  className="text-[16px] text-primary font-medium self-start hover:underline transition-colors mt-1"
                >
                  {isChangingPassword ? "מעדכן..." : "החלפת סיסמה"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <ConfirmDialog
        open={showJoinPackagesDialog}
        onOpenChange={setShowJoinPackagesDialog}
        title="להצטרף לחבילות Heali?"
        description={`לאחר ההצטרפות מודל התמחור יעודכן ל"חבילה דרך Heali" והמחיר יוגדר ל-140 ש"ח. ניתן יהיה לחזור ולערוך בהמשך.`}
        confirmLabel={isJoiningPackages ? "מעדכן..." : "הצטרפות"}
        onConfirm={handleJoinPackages}
      />
    </div>
  );
}
