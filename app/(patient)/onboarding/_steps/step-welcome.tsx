"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";

interface StepWelcomeProps {
  onNext: () => void;
}

export function StepWelcome({ onNext }: StepWelcomeProps) {
  const t = useTranslations("onboarding.patient");

  return (
    <div className="flex flex-col items-center text-center">
      {/* Illustration */}
      <div className="mb-8 flex h-32 w-32 items-center justify-center rounded-full bg-accent/20">
        <Heart className="h-16 w-16 text-primary" />
      </div>

      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        {t("step1Title")}
      </h1>
      <p className="mt-4 text-[18px] font-light leading-relaxed text-[#666]">
        הפלטפורמה שלנו עוזרת לך למצוא את המטפל שמתאים לך באופן אישי, כי ריפוי
        מתחיל בחיבור נכון.
      </p>

      <Button className="mt-10 w-full max-w-[320px]" onClick={onNext}>
        בואו נתחיל
      </Button>
    </div>
  );
}
