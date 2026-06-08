"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Pencil } from "lucide-react";
import type { PersonalDetailsValues } from "@/lib/validations/onboarding";

interface StepConfirmationProps {
  personalDetails: PersonalDetailsValues | null;
  photoUrl: string | null;
  onNext: () => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

const GENDER_LABELS: Record<string, string> = {
  male: "זכר",
  female: "נקבה",
  other: "אחר",
};

export function StepConfirmation({
  personalDetails,
  photoUrl,
  onNext,
  onBack,
  onEditStep,
}: StepConfirmationProps) {
  const t = useTranslations("onboarding.patient");

  const fields = personalDetails
    ? [
        { label: t("fullName"), value: personalDetails.fullName },
        { label: t("dateOfBirth"), value: personalDetails.dateOfBirth },
        {
          label: t("gender"),
          value: GENDER_LABELS[personalDetails.gender] ?? personalDetails.gender,
        },
        { label: t("city"), value: personalDetails.city },
        { label: t("phone"), value: personalDetails.phone },
      ]
    : [];

  return (
    <div className="flex flex-col">
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        {t("step5Title")}
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        בדוק שכל הפרטים נכונים לפני שנמשיך
      </p>

      {/* Personal details summary */}
      <div className="mt-8 rounded-[10px] border border-border-input bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-medium text-foreground">
            {t("step3Title")}
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(3)}
            className="flex items-center gap-1 text-[14px] text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            עריכה
          </button>
        </div>

        <div className="mt-4 flex flex-col gap-3">
          {fields.map((field, i) => (
            <div key={i} className="flex justify-between text-[15px]">
              <span className="text-[#666]">{field.label}</span>
              <span className="font-medium text-foreground">{field.value}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Photo summary */}
      <div className="mt-4 rounded-[10px] border border-border-input bg-white p-6">
        <div className="flex items-center justify-between">
          <h3 className="text-[18px] font-medium text-foreground">
            {t("step4Title")}
          </h3>
          <button
            type="button"
            onClick={() => onEditStep(4)}
            className="flex items-center gap-1 text-[14px] text-primary hover:underline"
          >
            <Pencil className="h-3.5 w-3.5" />
            עריכה
          </button>
        </div>

        <div className="mt-4">
          {photoUrl ? (
            <div className="flex items-center gap-3">
              <div className="h-16 w-16 overflow-hidden rounded-full bg-muted/20">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={photoUrl}
                  alt="Profile"
                  className="h-full w-full object-cover"
                />
              </div>
              <span className="text-[15px] text-foreground">תמונה הועלתה</span>
            </div>
          ) : (
            <span className="text-[15px] text-[#666]">לא הועלתה תמונה</span>
          )}
        </div>
      </div>

      <div className="mt-8 flex gap-3">
        <Button className="flex-1" onClick={onNext}>
          אישור והמשך
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
