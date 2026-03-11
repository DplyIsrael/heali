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
  practitionerRegisterSchema,
  type PractitionerRegisterValues,
} from "@/lib/validations/auth";
import { signUpPractitioner } from "../../auth/actions";

export default function PractitionerRegisterPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<PractitionerRegisterValues>({
    resolver: zodResolver(practitionerRegisterSchema),
  });

  const onSubmit = async (values: PractitionerRegisterValues) => {
    setIsLoading(true);
    setServerError("");

    const result = await signUpPractitioner(
      values.fullName,
      values.email,
      values.password,
      values.phone,
      values.city
    );

    if (result.success) {
      router.push("/verify-email");
    } else {
      setServerError(result.error ?? "שגיאה לא צפויה");
      setIsLoading(false);
    }
  };

  return (
    <AuthLayout progress={25}>
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        שמחים שבחרת להצטרף אלינו!
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        זה יכול להיות מגע, איזון, או רגע אחד של שקט באמצע כל הרעש
      </p>

      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField
          label="שם מלא"
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

        <FormField
          label="סיסמה"
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

        <FormField
          label="מספר נייד"
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

        <FormField
          label="עיר מגורים"
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
            onClick={() => router.push("/register")}
          >
            חזור
          </Button>
        </div>
      </form>
    </AuthLayout>
  );
}
