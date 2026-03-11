"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { StepWelcome } from "./_steps/step-welcome";
import { StepAbout } from "./_steps/step-about";
import { StepPersonalDetails } from "./_steps/step-personal-details";
import { StepProfilePhoto } from "./_steps/step-profile-photo";
import { StepConfirmation } from "./_steps/step-confirmation";
import { StepQuestionnaire } from "./_steps/step-questionnaire";
import type { PersonalDetailsValues } from "@/lib/validations/onboarding";

const TOTAL_STEPS = 6;

export default function OnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding.patient");
  const [currentStep, setCurrentStep] = useState(1);
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetailsValues | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const stepLabels = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
    t("step5Title"),
    t("step6Title"),
  ];

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleComplete = () => {
    router.push("/onboarding/results");
  };

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Progress bar */}
      <div className="h-1 w-full bg-muted/30">
        <div
          className="h-full bg-accent transition-all duration-500"
          style={{ width: `${progress}%` }}
        />
      </div>

      {/* Step indicator */}
      <div className="mx-auto mt-6 flex w-full max-w-[600px] items-center justify-center gap-2 px-6">
        {stepLabels.map((label, i) => (
          <div key={i} className="flex items-center gap-2">
            <div
              className={`flex h-8 w-8 items-center justify-center rounded-full text-[13px] font-medium transition-colors ${
                i + 1 === currentStep
                  ? "bg-primary text-white"
                  : i + 1 < currentStep
                    ? "bg-accent text-foreground"
                    : "bg-muted/20 text-muted"
              }`}
            >
              {i + 1}
            </div>
            {i < stepLabels.length - 1 && (
              <div
                className={`h-px w-6 ${
                  i + 1 < currentStep ? "bg-accent" : "bg-muted/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mx-auto w-full max-w-[560px] flex-1 px-6 py-10">
        {currentStep === 1 && <StepWelcome onNext={goNext} />}
        {currentStep === 2 && <StepAbout onNext={goNext} onBack={goBack} />}
        {currentStep === 3 && (
          <StepPersonalDetails
            initialValues={personalDetails}
            onNext={(values) => {
              setPersonalDetails(values);
              goNext();
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <StepProfilePhoto
            photoUrl={photoUrl}
            onNext={(url) => {
              setPhotoUrl(url);
              goNext();
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 5 && (
          <StepConfirmation
            personalDetails={personalDetails}
            photoUrl={photoUrl}
            onNext={goNext}
            onBack={goBack}
            onEditStep={(step) => setCurrentStep(step)}
          />
        )}
        {currentStep === 6 && (
          <StepQuestionnaire
            onComplete={handleComplete}
            onBack={goBack}
          />
        )}
      </div>
    </div>
  );
}
