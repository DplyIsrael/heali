"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Pencil } from "lucide-react";
import { submitForApproval } from "../actions";
import type { BioValues } from "@/lib/validations/practitioner-onboarding";

interface StepReviewProps {
  domainNames: string[];
  specialtyNames: string[];
  pricing: { pricingModel: string; price: string } | null;
  languages: string[];
  bio: BioValues | null;
  certificateCount: number;
  invoiceCount: number;
  onSubmit: () => void;
  onBack: () => void;
  onEditStep: (step: number) => void;
}

const PRICING_LABELS: Record<string, string> = {
  per_treatment: "מחיר לטיפול",
  per_hour: "לפי שעה",
  per_package: "לפי חבילה",
};

export function StepReview({
  domainNames,
  specialtyNames,
  pricing,
  languages,
  bio,
  certificateCount,
  invoiceCount,
  onSubmit,
  onBack,
  onEditStep,
}: StepReviewProps) {
  const t = useTranslations("onboarding.practitioner");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");
    const result = await submitForApproval();
    if (result.success) {
      onSubmit();
    } else {
      setError(result.error ?? "שגיאה");
    }
    setIsLoading(false);
  };

  const sections = [
    {
      title: t("step1Title"),
      step: 1,
      content: domainNames.join(", ") || "לא נבחרו",
    },
    {
      title: t("step2Title"),
      step: 2,
      content: specialtyNames.join(", ") || "לא נבחרו",
    },
    {
      title: t("step3Title"),
      step: 3,
      content: pricing
        ? `${PRICING_LABELS[pricing.pricingModel] ?? pricing.pricingModel} — ₪${pricing.price}`
        : "לא הוגדר",
    },
    {
      title: t("step4Title"),
      step: 4,
      content: `${certificateCount} תעודות הועלו`,
    },
    {
      title: "חשבוניות טיפול של לקוחות",
      step: 5,
      content: `${invoiceCount} חשבוניות הועלו`,
    },
    {
      // i18n key step5Title still describes "Languages" — kept since the
      // content didn't change, only the step number shifted.
      title: t("step5Title"),
      step: 6,
      content: languages.join(", ") || "לא נבחרו",
    },
    {
      title: t("step6Title"),
      step: 7,
      content: bio?.bio
        ? bio.bio.length > 100
          ? bio.bio.substring(0, 100) + "..."
          : bio.bio
        : "לא נכתב",
    },
  ];

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        סקירה ושליחה
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        בדוק שכל הפרטים נכונים לפני שליחה לאישור
      </p>

      <div className="mt-8 flex flex-col gap-4">
        {sections.map((section) => (
          <div
            key={section.step}
            className="rounded-[10px] border border-border-input bg-white p-5"
          >
            <div className="flex items-center justify-between">
              <h3 className="text-[16px] font-medium text-foreground">
                {section.title}
              </h3>
              <button
                type="button"
                onClick={() => onEditStep(section.step)}
                className="flex items-center gap-1 text-[14px] text-primary hover:underline"
              >
                <Pencil className="h-3.5 w-3.5" />
                עריכה
              </button>
            </div>
            <p className="mt-2 text-[14px] text-[#666]">{section.content}</p>
          </div>
        ))}
      </div>

      {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}

      <div className="mt-8 flex gap-3">
        <Button className="flex-1" disabled={isLoading} onClick={handleSubmit}>
          {isLoading ? (
            <Spinner size="sm" className="border-white/30 border-t-white" />
          ) : (
            t("submitForApproval")
          )}
        </Button>
        <Button variant="secondary" className="bg-[#F4F7F7]" onClick={onBack}>
          חזור
        </Button>
      </div>
    </div>
  );
}
