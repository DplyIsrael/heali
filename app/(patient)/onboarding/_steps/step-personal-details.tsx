"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import {
  personalDetailsSchema,
  type PersonalDetailsValues,
} from "@/lib/validations/onboarding";
import { savePersonalDetails } from "../actions";

interface StepPersonalDetailsProps {
  initialValues: PersonalDetailsValues | null;
  onNext: (values: PersonalDetailsValues) => void;
  onBack: () => void;
}

const GENDER_OPTIONS = [
  { value: "male" as const, label: "זכר" },
  { value: "female" as const, label: "נקבה" },
  { value: "other" as const, label: "אחר" },
];

export function StepPersonalDetails({
  initialValues,
  onNext,
  onBack,
}: StepPersonalDetailsProps) {
  const t = useTranslations("onboarding.patient");
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PersonalDetailsValues>({
    resolver: zodResolver(personalDetailsSchema),
    defaultValues: initialValues ?? undefined,
  });

  const selectedGender = watch("gender");

  const onSubmit = async (values: PersonalDetailsValues) => {
    setIsLoading(true);
    setServerError("");

    const result = await savePersonalDetails(values);

    if (result.success) {
      onNext(values);
    } else {
      setServerError(result.error ?? "שגיאה לא צפויה");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        {t("step3Title")}
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        מלא את הפרטים הבאים כדי שנוכל להתאים לך מטפלים
      </p>

      <form
        onSubmit={handleSubmit(onSubmit)}
        className="mt-8 flex flex-col gap-5"
      >
        <FormField
          label={t("fullName")}
          htmlFor="fullName"
          error={errors.fullName?.message}
          required
        >
          <Input
            id="fullName"
            placeholder="הקלד/י כאן..."
            {...register("fullName")}
            aria-invalid={!!errors.fullName}
          />
        </FormField>

        <FormField
          label={t("dateOfBirth")}
          htmlFor="dateOfBirth"
          error={errors.dateOfBirth?.message}
          required
        >
          <Input
            id="dateOfBirth"
            type="date"
            {...register("dateOfBirth")}
            aria-invalid={!!errors.dateOfBirth}
          />
        </FormField>

        <FormField
          label={t("gender")}
          htmlFor="gender"
          error={errors.gender?.message}
          required
        >
          <div className="flex gap-3">
            {GENDER_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                onClick={() => setValue("gender", opt.value, { shouldValidate: true })}
                className={`flex-1 rounded-[10px] border px-4 py-3 text-[15px] transition-colors ${
                  selectedGender === opt.value
                    ? "border-primary bg-primary/5 font-medium text-primary"
                    : "border-border-input bg-white text-foreground hover:border-primary/40"
                }`}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </FormField>

        <FormField
          label={t("city")}
          htmlFor="city"
          error={errors.city?.message}
          required
        >
          <Input
            id="city"
            placeholder="הקלד/י כאן..."
            {...register("city")}
            aria-invalid={!!errors.city}
          />
        </FormField>

        <FormField
          label={t("phone")}
          htmlFor="phone"
          error={errors.phone?.message}
          required
        >
          <Input
            id="phone"
            type="tel"
            placeholder="הקלד/י כאן..."
            {...register("phone")}
            aria-invalid={!!errors.phone}
          />
        </FormField>

        {serverError && (
          <p className="text-[14px] text-destructive">{serverError}</p>
        )}

        <div className="mt-4 flex gap-3">
          <Button type="submit" className="flex-1" disabled={isLoading}>
            {isLoading ? (
              <Spinner size="sm" className="border-white/30 border-t-white" />
            ) : (
              "המשך"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="bg-[#F4F7F7]"
            onClick={onBack}
          >
            חזור
          </Button>
        </div>
      </form>
    </div>
  );
}
