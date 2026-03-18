"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { Spinner } from "@/components/ui/spinner";
import { StepDomains } from "./_steps/step-domains";
import { StepSpecialties } from "./_steps/step-specialties";
import { StepPricing } from "./_steps/step-pricing";
import { StepCertificates } from "./_steps/step-certificates";
import { StepLanguages } from "./_steps/step-languages";
import { StepBio } from "./_steps/step-bio";
import { StepAgreement } from "./_steps/step-agreement";
import { StepReview } from "./_steps/step-review";
import { fetchDomains, fetchPractitionerProfile } from "./actions";
import type { PricingValues, BioValues } from "@/lib/validations/practitioner-onboarding";

const TOTAL_STEPS = 8;

interface Domain {
  id: string;
  name: string;
}

interface UploadedFile {
  name: string;
  size: string;
  url: string;
}

export default function PractitionerOnboardingPage() {
  const router = useRouter();
  const t = useTranslations("onboarding.practitioner");

  const [isInitializing, setIsInitializing] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);

  // Step data
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
  const [pricing, setPricing] = useState<{ pricingModel: string; price: string } | null>(null);
  const [certificates, setCertificates] = useState<UploadedFile[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState<BioValues | null>(null);

  const stepLabels = [
    t("step1Title"),
    t("step2Title"),
    t("step3Title"),
    t("step4Title"),
    t("step5Title"),
    t("step6Title"),
    t("step7Title"),
    t("step8Title"),
  ];

  // Load domains + resume from saved step
  useEffect(() => {
    async function init() {
      const [domains, profile] = await Promise.all([
        fetchDomains(),
        fetchPractitionerProfile(),
      ]);
      setAllDomains(domains);

      if (profile) {
        // Resume from saved step
        if (profile.domain_ids?.length) setSelectedDomainIds(profile.domain_ids);
        if (profile.specialty_ids?.length) setSelectedSpecialtyIds(profile.specialty_ids);
        if (profile.price) setPricing({ pricingModel: profile.pricing_model, price: profile.price });
        if (profile.languages?.length) setLanguages(profile.languages);
        if (profile.bio) setBio({ bio: profile.bio });

        // Resume to saved step
        const savedStep = profile.onboarding_step ?? 1;
        setCurrentStep(Math.min(savedStep, TOTAL_STEPS));
      }

      setIsInitializing(false);
    }
    init();
  }, []);

  const progress = Math.round((currentStep / TOTAL_STEPS) * 100);
  const goBack = () => setCurrentStep((s) => Math.max(s - 1, 1));

  // Domain names for review screen
  const domainNames = allDomains
    .filter((d) => selectedDomainIds.includes(d.id))
    .map((d) => d.name);

  if (isInitializing) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

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
      <div className="mx-auto mt-6 flex w-full max-w-[700px] items-center justify-center gap-1.5 px-6">
        {stepLabels.map((_, i) => (
          <div key={i} className="flex items-center gap-1.5">
            <div
              className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium transition-colors ${
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
                className={`h-px w-4 ${
                  i + 1 < currentStep ? "bg-accent" : "bg-muted/30"
                }`}
              />
            )}
          </div>
        ))}
      </div>

      {/* Step content */}
      <div className="mx-auto w-full max-w-[560px] flex-1 px-6 py-10">
        {currentStep === 1 && (
          <StepDomains
            domains={allDomains}
            initialSelected={selectedDomainIds}
            onNext={(ids) => {
              setSelectedDomainIds(ids);
              setCurrentStep(2);
            }}
          />
        )}
        {currentStep === 2 && (
          <StepSpecialties
            domainIds={selectedDomainIds}
            initialSelected={selectedSpecialtyIds}
            onNext={(ids) => {
              setSelectedSpecialtyIds(ids);
              setCurrentStep(3);
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 3 && (
          <StepPricing
            initialValues={pricing}
            onNext={(values) => {
              setPricing({ pricingModel: values.pricingModel, price: values.price });
              setCurrentStep(4);
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 4 && (
          <StepCertificates
            initialFiles={certificates}
            onNext={(files) => {
              setCertificates(files);
              setCurrentStep(5);
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 5 && (
          <StepLanguages
            initialSelected={languages}
            onNext={(langs) => {
              setLanguages(langs);
              setCurrentStep(6);
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 6 && (
          <StepBio
            initialValues={bio}
            onNext={(values) => {
              setBio(values);
              setCurrentStep(7);
            }}
            onBack={goBack}
          />
        )}
        {currentStep === 7 && (
          <StepAgreement
            onNext={() => setCurrentStep(8)}
            onBack={goBack}
          />
        )}
        {currentStep === 8 && (
          <StepReview
            domainNames={domainNames}
            specialtyNames={[]} // Would need specialty names fetch — uses IDs for now
            pricing={pricing}
            languages={languages}
            bio={bio}
            certificateCount={certificates.length}
            onSubmit={() => router.push("/onboarding/pending")}
            onBack={goBack}
            onEditStep={(step) => setCurrentStep(step)}
          />
        )}
      </div>
    </div>
  );
}
