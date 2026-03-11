"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import {
  resetPasswordSchema,
  type ResetPasswordValues,
} from "@/lib/validations/auth";
import { updatePassword } from "../actions";

export default function ResetPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
  });

  const onSubmit = async (values: ResetPasswordValues) => {
    setIsLoading(true);
    setServerError("");

    const result = await updatePassword(values.password);

    if (result.success) {
      setSuccess(true);
    } else {
      setServerError(result.error ?? "שגיאה לא צפויה");
    }
    setIsLoading(false);
  };

  if (success) {
    return (
      <AuthLayout>
        <div className="flex flex-col items-center text-center">
          <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
            <svg
              className="h-10 w-10 text-primary"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={1.5}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          </div>

          <h1 className="text-[40px] font-semibold leading-tight text-foreground">
            הסיסמה עודכנה בהצלחה
          </h1>
          <p className="mt-3 text-[18px] font-light text-[#666]">
            כעת ניתן להתחבר עם הסיסמה החדשה
          </p>

          <Button
            className="mt-8 w-full max-w-[360px]"
            onClick={() => router.push("/login")}
          >
            המשך להתחברות
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        איפוס סיסמה
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        הזן סיסמה חדשה עבור החשבון שלך
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField
          label="סיסמה חדשה"
          htmlFor="password"
          error={errors.password?.message}
          required
        >
          <Input
            id="password"
            type="password"
            placeholder="הקלד/י כאן..."
            {...register("password")}
            aria-invalid={!!errors.password}
          />
        </FormField>

        <FormField
          label="אישור סיסמה"
          htmlFor="confirmPassword"
          error={errors.confirmPassword?.message}
          required
        >
          <Input
            id="confirmPassword"
            type="password"
            placeholder="הקלד/י כאן..."
            {...register("confirmPassword")}
            aria-invalid={!!errors.confirmPassword}
          />
        </FormField>

        {serverError && (
          <p className="text-[14px] text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="mt-4 w-full" disabled={isLoading}>
          {isLoading ? (
            <Spinner size="sm" className="border-white/30 border-t-white" />
          ) : (
            "עדכן סיסמה"
          )}
        </Button>
      </form>
    </AuthLayout>
  );
}
