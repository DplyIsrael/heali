"use client";

import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Search, CalendarCheck, Sparkles } from "lucide-react";

interface StepAboutProps {
  onNext: () => void;
  onBack: () => void;
}

const steps = [
  {
    icon: Search,
    titleKey: "חפש מטפלים",
    desc: "גלה מטפלים מתאימים לפי תחום, מיקום והעדפות אישיות",
  },
  {
    icon: CalendarCheck,
    titleKey: "קבע תור",
    desc: "בחר תאריך ושעה שמתאימים לך ושלח בקשה למטפל",
  },
  {
    icon: Sparkles,
    titleKey: "התחל טיפול",
    desc: "הגע לטיפול, דרג את החוויה שלך ובנה קשר טיפולי מתמשך",
  },
];

export function StepAbout({ onNext, onBack }: StepAboutProps) {
  const t = useTranslations("onboarding.patient");

  return (
    <div className="flex flex-col">
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        {t("step2Title")}
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        שלושה שלבים פשוטים למציאת המטפל המושלם
      </p>

      <div className="mt-8 flex flex-col gap-6">
        {steps.map((step, i) => (
          <div key={i} className="flex items-start gap-4">
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-accent/20">
              <step.icon className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-[18px] font-medium text-foreground">
                {step.titleKey}
              </h3>
              <p className="mt-1 text-[15px] font-light text-[#666]">
                {step.desc}
              </p>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-10 flex gap-3">
        <Button className="flex-1" onClick={onNext}>
          המשך
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
