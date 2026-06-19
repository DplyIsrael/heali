"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useEffect, useState } from "react";
import { Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

interface AdminProfile {
  fullName: string;
  email: string;
  profilePhotoUrl: string;
}

export default function AdminSettingsPage() {
  const [profile, setProfile] = useState<AdminProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    async function load() {
      const supabase = createClient();
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) { setIsLoading(false); return; }
      const { data: row } = await supabase
        .from("users")
        .select("full_name, email, profile_photo_url")
        .eq("id", user.id)
        .single();
      if (row) {
        setProfile({
          fullName: row.full_name ?? "",
          email: row.email ?? "",
          profilePhotoUrl: row.profile_photo_url ?? "",
        });
      }
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
        setProfile((p) => (p ? { ...p, profilePhotoUrl: data.url } : p));
        toast.success("התמונה עודכנה");
      } else {
        toast.error(data.error ?? "שגיאה בהעלאת תמונה");
      }
    } catch {
      toast.error("שגיאה בהעלאת תמונה");
    }
    setIsUploadingAvatar(false);
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("סיסמה חדשה חייבת להכיל לפחות 8 תווים"); return; }
    if (newPassword !== confirmPassword) { toast.error("הסיסמאות אינן תואמות"); return; }

    setIsSaving(true);
    const supabase = createClient();

    // Verify the current password before letting them set a new one.
    if (profile?.email) {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email: profile.email,
        password: currentPassword,
      });
      if (signInError) {
        toast.error("הסיסמה הנוכחית שגויה");
        setIsSaving(false);
        return;
      }
    }

    const { error } = await supabase.auth.updateUser({ password: newPassword });
    if (error) toast.error(error.message);
    else {
      toast.success("הסיסמה שונתה בהצלחה");
      setCurrentPassword(""); setNewPassword(""); setConfirmPassword("");
    }
    setIsSaving(false);
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">אזור אישי</h1>

      <div className="max-w-[500px] flex flex-col gap-6">
        {/* Identity card */}
        <div className="rounded-[12px] border border-border bg-white p-6">
          <div className="flex items-start gap-4">
            <label className="relative size-[100px] rounded-full bg-muted/20 flex items-center justify-center text-[28px] font-medium text-muted-foreground overflow-hidden cursor-pointer group shrink-0">
              {profile?.profilePhotoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={profile.profilePhotoUrl} alt="" className="w-full h-full object-cover" />
              ) : (
                profile?.fullName.slice(0, 2)
              )}
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

            <div className="flex-1 flex flex-col gap-3">
              <FormField label="שם מלא" htmlFor="adminName">
                <div className="h-[44px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                  {profile?.fullName || "—"}
                </div>
              </FormField>
              <FormField label="אימייל" htmlFor="adminEmail">
                <div className="h-[44px] rounded-[10px] border border-border-input bg-[#f9f9f9] px-3 flex items-center text-[14px] text-black">
                  {profile?.email || "—"}
                </div>
              </FormField>
            </div>
          </div>
        </div>

        {/* Password change */}
        <div className="rounded-[12px] border border-border bg-white p-6">
          <h2 className="text-[20px] font-semibold text-black mb-6">שינוי סיסמה</h2>

          <div className="flex flex-col gap-4">
            <FormField label="סיסמה נוכחית" htmlFor="current">
              <Input id="current" type="password" value={currentPassword} onChange={(e) => setCurrentPassword(e.target.value)} placeholder="הקלד/י כאן..." />
            </FormField>
            <FormField label="סיסמה חדשה" htmlFor="new">
              <Input id="new" type="password" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} placeholder="הקלד/י כאן..." />
            </FormField>
            <FormField label="אישור סיסמה חדשה" htmlFor="confirm">
              <Input id="confirm" type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} placeholder="הקלד/י כאן..." />
            </FormField>

            <div className="flex gap-3 mt-2">
              <Button onClick={handleChangePassword} disabled={isSaving} className="bg-accent text-black">
                {isSaving ? <Spinner size="sm" /> : "שמירת שינויים"}
              </Button>
              <Button variant="secondary" className="bg-[#f4f7f7]" onClick={() => { setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }}>
                ביטול שינויים
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
