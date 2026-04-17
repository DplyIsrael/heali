"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { FormField } from "@/components/ui/form-field";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface PatientProfile {
  name: string;
  email: string;
  phone: string;
  city: string;
  dateOfBirth: string;
  profilePhotoUrl: string;
}

export default function PatientProfilePage() {
  const [profile, setProfile] = useState<PatientProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [avatarUrl, setAvatarUrl] = useState("");
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  // Password
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isChangingPw, setIsChangingPw] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }

      const { data: userData } = await supabase.from("users").select("full_name, email").eq("id", user.id).single();

      // Try to get patient profile
      const { data: patientProfile } = await supabase.from("patient_profiles").select("*").eq("user_id", user.id).single();

      setProfile({
        name: userData?.full_name ?? "",
        email: userData?.email ?? "",
        phone: patientProfile?.phone ?? "",
        city: patientProfile?.city ?? "",
        dateOfBirth: patientProfile?.date_of_birth ?? "",
        profilePhotoUrl: patientProfile?.profile_photo_url ?? "",
      });
      setAvatarUrl(patientProfile?.profile_photo_url ?? "");
      setIsLoading(false);
    }
    load();
  }, []);

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setIsUploadingAvatar(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-avatar", { method: "POST", body: formData });
      const data = await res.json();
      if (res.ok && data.url) {
        setAvatarUrl(data.url);
        toast.success("התמונה עודכנה");
      } else {
        toast.error("שגיאה בהעלאת תמונה");
      }
    } catch {
      toast.error("שגיאה בהעלאת תמונה");
    }
    setIsUploadingAvatar(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("סיסמה חדשה חייבת להכיל לפחות 8 תווים"); return; }
    if (newPassword !== confirmPassword) { toast.error("הסיסמאות אינן תואמות"); return; }
    setIsChangingPw(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else { toast.success("הסיסמה שונתה בהצלחה"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setIsChangingPw(false);
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (!profile) return <div className="flex min-h-[60vh] items-center justify-center text-muted">פרופיל לא נמצא</div>;

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1100px] px-4 md:px-[50px] py-6 md:py-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-8">אזור אישי</h1>

        <div className="flex flex-col lg:flex-row gap-8">
          {/* Left column — avatar + basic info */}
          <div className="w-full lg:w-[300px] shrink-0">
            <div className="rounded-[12px] border border-border bg-white p-6 flex flex-col items-center">
              {/* Avatar upload */}
              <label className="relative size-[144px] rounded-[8px] bg-[#f4f7f7] border border-[rgba(177,181,185,0.25)] flex items-center justify-center cursor-pointer group mb-4 overflow-hidden">
                {avatarUrl ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={avatarUrl} alt="" className="w-full h-full object-cover" />
                ) : (
                  <Upload className="size-8 text-muted" />
                )}
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  {isUploadingAvatar ? <Spinner size="sm" className="border-white/30 border-t-white" /> : <Upload className="size-6 text-white" />}
                </div>
                <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleAvatarUpload} disabled={isUploadingAvatar} />
              </label>
              <Button variant="secondary" className="bg-white border border-black text-[14px] w-[141px]" onClick={() => document.querySelector<HTMLInputElement>('input[type=file]')?.click()}>
                העלאת תמונה
              </Button>

              {/* Name + email below avatar */}
              <div className="mt-6 w-full flex flex-col gap-4">
                <FormField label="שם מלא" htmlFor="patientName">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.name}
                  </div>
                </FormField>
                <FormField label="כתובת מייל" htmlFor="patientEmail">
                  <div className="h-[48px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                    {profile.email}
                  </div>
                </FormField>
              </div>
            </div>
          </div>

          {/* Right column — password change */}
          <div className="flex-1">
            <div className="rounded-[12px] border border-border bg-white p-6">
              <h2 className="text-[22px] font-medium text-black mb-6">שינוי סיסמה</h2>

              <div className="flex flex-col gap-4 max-w-[400px]">
                <FormField label="סיסמה נוכחית" htmlFor="curPw">
                  <Input id="curPw" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="הקלד/י כאן..." />
                </FormField>
                <FormField label="סיסמה חדשה" htmlFor="newPw">
                  <Input id="newPw" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="הקלד/י כאן..." />
                </FormField>
                <FormField label="אימות סיסמה חדשה" htmlFor="confPw">
                  <Input id="confPw" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="הקלד/י כאן..." />
                </FormField>

                <button
                  onClick={handleChangePassword}
                  disabled={isChangingPw}
                  className="text-[16px] text-primary font-medium self-start hover:underline mt-1"
                >
                  {isChangingPw ? "מעדכן..." : "החלפת סיסמה"}
                </button>
              </div>
            </div>

            {/* Save / Cancel */}
            <div className="flex gap-3 mt-6">
              <Button className="w-[136px] bg-accent text-black">שמירת שינויים</Button>
              <Button variant="secondary" className="w-[136px] bg-[#f4f7f7]">ביטול שינויים</Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
