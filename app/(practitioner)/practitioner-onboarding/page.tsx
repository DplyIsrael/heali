"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Spinner } from "@/components/ui/spinner";
import { StepDomains } from "./_steps/step-domains";
import { StepSpecialties } from "./_steps/step-specialties";
import { StepPricing } from "./_steps/step-pricing";
import { StepCertificates } from "./_steps/step-certificates";
import { StepClientInvoices } from "./_steps/step-client-invoices";
import { StepLanguages } from "./_steps/step-languages";
import { StepBio } from "./_steps/step-bio";
import { StepAgreement } from "./_steps/step-agreement";
import { StepReview } from "./_steps/step-review";
import {
  fetchDomains,
  fetchPractitionerProfile,
  fetchCertificates,
  deleteCertificate,
  fetchClientInvoices,
  type ClientInvoiceRow,
} from "./actions";
import type { BioValues } from "@/lib/validations/practitioner-onboarding";

const TOTAL_STEPS = 9;

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

  const [isInitializing, setIsInitializing] = useState(true);
  const [currentStep, setCurrentStep] = useState(1);
  const [lastFilledStep, setLastFilledStep] = useState(0);
  const [allDomains, setAllDomains] = useState<Domain[]>([]);

  // Step data
  const [selectedDomainIds, setSelectedDomainIds] = useState<string[]>([]);
  const [selectedSpecialtyIds, setSelectedSpecialtyIds] = useState<string[]>([]);
  const [pricing, setPricing] = useState<{ pricingModel: string; price: string } | null>(null);
  const [certificates, setCertificates] = useState<UploadedFile[]>([]);
  const [clientInvoices, setClientInvoices] = useState<ClientInvoiceRow[]>([]);
  const [languages, setLanguages] = useState<string[]>([]);
  const [bio, setBio] = useState<BioValues | null>(null);

  // Step labels are not displayed (only the dot count is rendered), so we
  // just keep this aligned with TOTAL_STEPS to avoid hitting missing i18n keys
  // for the new client-invoices step.
  const stepLabels = Array.from({ length: TOTAL_STEPS });

  // Load domains + resume from saved step
  useEffect(() => {
    async function init() {
      const [domains, profile, savedCerts, savedInvoices] = await Promise.all([
        fetchDomains(),
        fetchPractitionerProfile(),
        fetchCertificates(),
        fetchClientInvoices(),
      ]);
      setAllDomains(domains);
      if (savedCerts.length) setCertificates(savedCerts);
      if (savedInvoices.length) setClientInvoices(savedInvoices);

      if (profile) {
        // Resume from saved step
        if (profile.domain_ids?.length) setSelectedDomainIds(profile.domain_ids);
        if (profile.specialty_ids?.length) setSelectedSpecialtyIds(profile.specialty_ids);
        if (profile.price) setPricing({ pricingModel: profile.pricing_model, price: profile.price });
        if (profile.languages?.length) setLanguages(profile.languages);
        if (profile.bio) {
          setBio({
            bio: profile.bio,
            certificationDescription: profile.certification_description ?? "",
          });
        }

        // Resume from step 1 so user can review their pre-filled answers
        // and naturally progress to the first unfilled step.
        // `onboarding_step` from DB = next step to fill, so prior steps are filled.
        const savedStep = profile.onboarding_step ?? 1;
        setLastFilledStep(Math.min(savedStep - 1, TOTAL_STEPS));
        setCurrentStep(1);
      }

      setIsInitializing(false);
    }
    init();
  }, []);

  const progress = Math.round((Math.max(currentStep, lastFilledStep) / TOTAL_STEPS) * 100);
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
        {stepLabels.map((_, i) => {
          const stepNum = i + 1;
          const isCompleted = stepNum < currentStep || stepNum <= lastFilledStep;
          const isCurrent = stepNum === currentStep;
          const canJumpTo = stepNum <= lastFilledStep + 1;
          return (
            <div key={i} className="flex items-center gap-1.5">
              <button
                type="button"
                onClick={() => canJumpTo && setCurrentStep(stepNum)}
                disabled={!canJumpTo}
                className={`flex h-7 w-7 items-center justify-center rounded-full text-[12px] font-medium transition-colors ${
                  isCurrent
                    ? "bg-primary text-white"
                    : isCompleted
                      ? "bg-accent text-foreground"
                      : "bg-muted/20 text-muted"
                } ${canJumpTo && !isCurrent ? "cursor-pointer hover:opacity-80" : ""} ${!canJumpTo ? "cursor-not-allowed" : ""}`}
              >
                {stepNum}
              </button>
              {i < stepLabels.length - 1 && (
                <div
                  className={`h-px w-4 ${
                    stepNum <= lastFilledStep || stepNum < currentStep ? "bg-accent" : "bg-muted/30"
                  }`}
                />
              )}
            </div>
          );
        })}
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
            // Capture the in-progress selection on back so re-entering this
            // step shows the same chips. Each step does a best-effort DB save
            // before calling this so the data also survives a page refresh.
            onBack={(ids) => {
              setSelectedSpecialtyIds(ids);
              goBack();
            }}
          />
        )}
        {currentStep === 3 && (
          <StepPricing
            initialValues={pricing}
            onNext={(values) => {
              setPricing({ pricingModel: values.pricingModel, price: values.price });
              setCurrentStep(4);
            }}
            onBack={(values) => {
              if (values.pricingModel || values.price) {
                setPricing({
                  pricingModel: values.pricingModel ?? pricing?.pricingModel ?? "per_treatment",
                  price: values.price ?? pricing?.price ?? "",
                });
              }
              goBack();
            }}
          />
        )}
        {currentStep === 4 && (
          <StepCertificates
            initialFiles={certificates}
            onRemove={(url) => deleteCertificate(url)}
            onNext={(files) => {
              setCertificates(files);
              setCurrentStep(5);
            }}
            onBack={(files) => {
              setCertificates(files);
              goBack();
            }}
          />
        )}
        {currentStep === 5 && (
          <StepClientInvoices
            initialSlots={clientInvoices}
            onNext={(slots) => {
              setClientInvoices(slots);
              setCurrentStep(6);
            }}
            onBack={(slots) => {
              setClientInvoices(slots);
              goBack();
            }}
          />
        )}
        {currentStep === 6 && (
          <StepLanguages
            initialSelected={languages}
            onNext={(langs) => {
              setLanguages(langs);
              setCurrentStep(7);
            }}
            onBack={(langs) => {
              setLanguages(langs);
              goBack();
            }}
          />
        )}
        {currentStep === 7 && (
          <StepBio
            initialValues={bio}
            onNext={(values) => {
              setBio(values);
              setCurrentStep(8);
            }}
            onBack={(values) => {
              if (values.bio !== undefined || values.certificationDescription !== undefined) {
                setBio({
                  bio: values.bio ?? bio?.bio ?? "",
                  certificationDescription:
                    values.certificationDescription ?? bio?.certificationDescription ?? "",
                });
              }
              goBack();
            }}
          />
        )}
        {currentStep === 8 && (
          <StepAgreement
            onNext={() => setCurrentStep(9)}
            onBack={goBack}
          />
        )}
        {currentStep === 9 && (
          <StepReview
            domainNames={domainNames}
            specialtyNames={[]} // Would need specialty names fetch — uses IDs for now
            pricing={pricing}
            languages={languages}
            bio={bio}
            certificateCount={certificates.length}
            invoiceCount={clientInvoices.length}
            onSubmit={() => router.push("/practitioner-onboarding/pending")}
            onBack={goBack}
            onEditStep={(step) => setCurrentStep(step)}
          />
        )}
      </div>
    </div>
  );
}
