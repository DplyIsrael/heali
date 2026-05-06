"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { pricingSchema } from "@/lib/validations/practitioner-onboarding";
type PricingValues = { pricingModel: "per_treatment" | "per_heali_package"; price: string };
import { savePricing } from "../actions";

interface StepPricingProps {
  initialValues: { pricingModel: string; price: string } | null;
  onNext: (values: PricingValues) => void;
  onBack: () => void;
}

const PRICING_MODELS = [
  {
    value: "per_treatment",
    label: "מחיר לטיפול",
    description:
      "עלות הטיפול בהילי לא יכול לעלות על התמחור בקליניקה הפרטית שלך",
  },
  {
    value: "per_heali_package",
    label: "אני רוצה להופיע בחבילות הטיפולים של הילי.",
    description:
      'מטפלים שנמצאים בחבילות הטיפול של הילי מקבלים הרבה יותר מטופלים. כל המטפלים בחבילות הטיפול של הילי הם במחיר אחיד של 140ש"ח פלוס מעמ.',
  },
];

export function StepPricing({ initialValues, onNext, onBack }: StepPricingProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState("");

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<PricingValues>({
    resolver: zodResolver(pricingSchema),
    defaultValues: initialValues
      ? { pricingModel: initialValues.pricingModel as PricingValues["pricingModel"], price: initialValues.price }
      : undefined,
  });

  const selectedModel = watch("pricingModel");

  const onSubmit = async (values: PricingValues) => {
    setIsLoading(true);
    setServerError("");
    const result = await savePricing(values.pricingModel, values.price);
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
        תמחור הטיפולים שלך
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        הגדירו את מודל התמחור והמחיר שלך
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField
          label="מודל תמחור"
          htmlFor="pricingModel"
          error={errors.pricingModel?.message}
          required
        >
          <div className="flex flex-col gap-4">
            {PRICING_MODELS.map((model, idx) => (
              <div key={model.value} className="flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setValue("pricingModel", model.value as PricingValues["pricingModel"], {
                      shouldValidate: true,
                    })
                  }
                  className={`w-full rounded-[10px] border px-4 py-3 text-[15px] transition-colors ${
                    selectedModel === model.value
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-border-input bg-white text-foreground hover:border-primary/40"
                  }`}
                >
                  {model.label}
                </button>
                <p className="text-[13px] font-light leading-snug text-[#666]">
                  {model.description}
                </p>
                {/* Price field rendered between the first and second options
                    so it sits in the middle of the form rather than at the bottom. */}
                {idx === 0 && (
                  <FormField
                    label="מחיר (₪)"
                    htmlFor="price"
                    error={errors.price?.message}
                    required
                  >
                    <Input
                      id="price"
                      type="number"
                      min="0"
                      step="1"
                      placeholder="הקלד/י כאן..."
                      {...register("price")}
                      aria-invalid={!!errors.price}
                    />
                  </FormField>
                )}
              </div>
            ))}
          </div>
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
