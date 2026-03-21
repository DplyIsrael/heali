"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { bioSchema, type BioValues } from "@/lib/validations/practitioner-onboarding";
import { saveBio } from "../actions";

interface StepBioProps {
  initialValues: { bio: string; certificationDescription?: string } | null;
  onNext: (values: BioValues) => void;
  onBack: () => void;
}

export function StepBio({ initialValues, onNext, onBack }: StepBioProps) {
  const t = useTranslations("onboarding.practitioner");
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<BioValues>({
    resolver: zodResolver(bioSchema),
    defaultValues: initialValues ?? { bio: "", certificationDescription: "" },
  });

  const bioLength = watch("bio")?.length ?? 0;

  const onSubmit = async (values: BioValues) => {
    setIsLoading(true);
    setServerError("");
    const result = await saveBio(values.bio, values.certificationDescription);
    if (result.success) {
      onNext(values);
    } else {
      setServerError(result.error ?? "שגיאה");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        הפרטים האלו יעזרו למשתמשים אחרים להכיר אותך
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        כתוב קצת על עצמך ועל ההכשרה שלך
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField
          label="אודות"
          htmlFor="bio"
          error={errors.bio?.message}
          required
        >
          <textarea
            id="bio"
            placeholder={t("bioPlaceholder")}
            {...register("bio")}
            className="min-h-[157px] w-full rounded-[10px] border border-border-input bg-white px-4 py-3 text-[15px] placeholder:font-poppins placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            aria-invalid={!!errors.bio}
          />
          <span className={`text-[13px] ${bioLength < 50 ? "text-[#666]" : "text-accent"}`}>
            {bioLength}/50 תווים מינימום
          </span>
        </FormField>

        <FormField
          label="תיאור הסמכה"
          htmlFor="certificationDescription"
          error={errors.certificationDescription?.message}
        >
          <textarea
            id="certificationDescription"
            placeholder="הקלד/י כאן..."
            {...register("certificationDescription")}
            className="min-h-[157px] w-full rounded-[10px] border border-border-input bg-white px-4 py-3 text-[15px] placeholder:font-poppins placeholder:text-muted focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
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
          <Button type="button" variant="secondary" className="bg-[#F4F7F7]" onClick={onBack}>
            חזור
          </Button>
        </div>
      </form>
    </div>
  );
}
