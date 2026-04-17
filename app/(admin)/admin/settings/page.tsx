"use client";

import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { createClient } from "@/lib/supabase/client";

export default function AdminSettingsPage() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isSaving, setIsSaving] = useState(false);

  const handleChangePassword = async () => {
    if (newPassword.length < 8) { toast.error("סיסמה חדשה חייבת להכיל לפחות 8 תווים"); return; }
    if (newPassword !== confirmPassword) { toast.error("הסיסמאות אינן תואמות"); return; }

    setIsSaving(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password: newPassword });

    if (error) toast.error(error.message);
    else { toast.success("הסיסמה שונתה בהצלחה"); setCurrentPassword(""); setNewPassword(""); setConfirmPassword(""); }
    setIsSaving(false);
  };

  return (
    <div>
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-6">אזור אישי</h1>

      <div className="max-w-[500px]">
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
