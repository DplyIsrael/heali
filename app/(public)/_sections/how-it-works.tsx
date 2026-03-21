"use client";

import { Search, CalendarCheck, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
  {
    number: "01",
    icon: Search,
    titleKey: "step1Title" as const,
    descKey: "step1Desc" as const,
  },
  {
    number: "02",
    icon: CalendarCheck,
    titleKey: "step2Title" as const,
    descKey: "step2Desc" as const,
  },
  {
    number: "03",
    icon: Sparkles,
    titleKey: "step3Title" as const,
    descKey: "step3Desc" as const,
  },
];

export function HowItWorks() {
  const t = useTranslations("home.howItWorks");

  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
      <div className="mb-8 md:mb-12 text-center">
        <h2 className="text-[24px] md:text-[32px] font-medium text-foreground">
          {t("title")}
        </h2>
        <p className="mt-2 text-[14px] md:text-[16px] font-light text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 md:gap-8">
        {STEPS.map((step) => (
          <div
            key={step.number}
            className="relative flex flex-col items-center rounded-[20px] border border-border-input bg-white p-6 md:p-8 text-center"
          >
            <span className="absolute -top-4 start-6 rounded-full bg-accent px-4 py-1 font-poppins text-[14px] font-bold text-foreground">
              {step.number}
            </span>

            <div className="mb-5 flex size-16 items-center justify-center rounded-full bg-primary/10">
              <step.icon className="size-7 text-primary" />
            </div>

            <h3 className="text-[18px] md:text-[20px] font-semibold text-foreground">
              {t(step.titleKey)}
            </h3>
            <p className="mt-2 text-[14px] font-light leading-relaxed text-muted-foreground">
              {t(step.descKey)}
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}
