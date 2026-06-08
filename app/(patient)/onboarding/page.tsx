"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { AuthLayout } from "@/components/shared/auth-layout";
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
  const [currentStep, setCurrentStep] = useState(1);
  const [personalDetails, setPersonalDetails] =
    useState<PersonalDetailsValues | null>(null);
  const [photoUrl, setPhotoUrl] = useState<string | null>(null);

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);

  const goNext = () => setCurrentStep((s) => Math.min(s + 1, TOTAL_STEPS));
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  const handleComplete = () => {
    router.push("/onboarding/results");
  };

  return (
    <AuthLayout progress={progress}>
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
        <StepQuestionnaire onComplete={handleComplete} onBack={goBack} />
      )}
    </AuthLayout>
  );
}
