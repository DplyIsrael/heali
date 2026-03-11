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
  forgotPasswordSchema,
  type ForgotPasswordValues,
} from "@/lib/validations/auth";
import { resetPassword } from "../auth/actions";

export default function ForgotPasswordPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<ForgotPasswordValues>({
    resolver: zodResolver(forgotPasswordSchema),
  });

  const onSubmit = async (values: ForgotPasswordValues) => {
    setIsLoading(true);
    setServerError("");

    const result = await resetPassword(values.email);

    if (result.success) {
      setEmailSent(true);
    } else {
      setServerError(result.error ?? "שגיאה לא צפויה");
    }
    setIsLoading(false);
  };

  if (emailSent) {
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
                d="M21.75 6.75v10.5a2.25 2.25 0 01-2.25 2.25h-15a2.25 2.25 0 01-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25m19.5 0v.243a2.25 2.25 0 01-1.07 1.916l-7.5 4.615a2.25 2.25 0 01-2.36 0L3.32 8.91a2.25 2.25 0 01-1.07-1.916V6.75"
              />
            </svg>
          </div>

          <h1 className="text-[40px] font-semibold leading-tight text-foreground">
            שלחנו לך מייל
          </h1>
          <p className="mt-3 text-[18px] font-light text-[#666]">
            בדוק את תיבת הדואר שלך ולחץ על הקישור לאיפוס הסיסמה
          </p>

          <Button
            className="mt-8 w-full max-w-[360px]"
            onClick={() => router.push("/login")}
          >
            חזרה להתחברות
          </Button>
        </div>
      </AuthLayout>
    );
  }

  return (
    <AuthLayout>
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        שכחת את הסיסמה?
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        הזן את כתובת המייל שלך ונשלח לך קישור לאיפוס הסיסמה
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField
          label="כתובת מייל"
          htmlFor="email"
          error={errors.email?.message}
          required
        >
          <Input
            id="email"
            type="email"
            placeholder="הקלד/י כאן את כתובת המייל שלך"
            {...register("email")}
            aria-invalid={!!errors.email}
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
              "שלח קישור לאיפוס"
            )}
          </Button>
          <Button
            type="button"
            variant="secondary"
            className="bg-[#F4F7F7]"
            onClick={() => router.push("/login")}
          >
            חזור
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
