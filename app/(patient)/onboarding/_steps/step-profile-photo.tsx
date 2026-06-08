"use client";

import { useState, useRef } from "react";
import Image from "next/image";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Camera, Upload } from "lucide-react";
import { saveProfilePhoto } from "../actions";
import { createClient } from "@/lib/supabase/client";

interface StepProfilePhotoProps {
  photoUrl: string | null;
  onNext: (url: string | null) => void;
  onBack: () => void;
}

export function StepProfilePhoto({
  photoUrl,
  onNext,
  onBack,
}: StepProfilePhotoProps) {
  const t = useTranslations("onboarding.patient");
  const [preview, setPreview] = useState<string | null>(photoUrl);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file
    if (!file.type.startsWith("image/")) {
      setError("יש לבחור קובץ תמונה");
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setError("גודל הקובץ חייב להיות עד 5MB");
      return;
    }

    setError("");
    setIsUploading(true);

    try {
      const supabase = createClient();
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        setError("לא מחובר");
        setIsUploading(false);
        return;
      }

      const ext = file.name.split(".").pop();
      const path = `${user.id}/avatar.${ext}`;

      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(path, file, { upsert: true });

      if (uploadError) {
        setError("שגיאה בהעלאת התמונה");
        setIsUploading(false);
        return;
      }

      const {
        data: { publicUrl },
      } = supabase.storage.from("avatars").getPublicUrl(path);

      setPreview(publicUrl);

      // Save to DB
      await saveProfilePhoto(publicUrl);
    } catch {
      setError("שגיאה בהעלאת התמונה");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col items-center">
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        {t("step4Title")}
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        הוסף תמונת פרופיל כדי שמטפלים יוכלו לזהות אותך
      </p>

      {/* Upload area */}
      <button
        type="button"
        onClick={() => fileInputRef.current?.click()}
        className="group mt-8 flex h-48 w-48 items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-border-input bg-white transition-colors hover:border-primary/40"
        disabled={isUploading}
      >
        {isUploading ? (
          <Spinner />
        ) : preview ? (
          <Image
            src={preview}
            alt="Profile photo"
            width={192}
            height={192}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="flex flex-col items-center gap-2 text-muted">
            <Camera className="h-10 w-10" />
            <span className="text-[14px]">{t("uploadPhoto")}</span>
          </div>
        )}
      </button>

      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileChange}
      />

      {preview && (
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          className="mt-3 flex items-center gap-1.5 text-[14px] text-primary hover:underline"
        >
          <Upload className="h-4 w-4" />
          החלף תמונה
        </button>
      )}

      {error && (
        <p className="mt-3 text-[14px] text-destructive">{error}</p>
      )}

      <div className="mt-10 flex w-full gap-3">
        <Button className="flex-1" onClick={() => onNext(preview)}>
          המשך
        </Button>
        <Button
          variant="secondary"
          className="bg-[#F4F7F7]"
          onClick={() => onNext(null)}
        >
          {t("skipPhoto")}
        </Button>
        <Button
          variant="secondary"
          className="bg-[#F4F7F7]"
          onClick={onBack}
        >
          חזור
        </Button>
      </div>
    </div>
  );
}
