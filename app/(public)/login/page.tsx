"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useTranslations } from "next-intl";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { FormField } from "@/components/ui/form-field";
import { Spinner } from "@/components/ui/spinner";
import { loginSchema, type LoginValues } from "@/lib/validations/auth";
import { signIn, signInWithGoogle } from "../auth/actions";

export default function LoginPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
  });

  const onSubmit = async (values: LoginValues) => {
    setIsLoading(true);
    setServerError("");
    const result = await signIn(values.email, values.password);
    if (result.success && result.redirectTo) {
      router.push(result.redirectTo);
    } else if (!result.success && result.error) {
      setServerError(result.error);
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch {
      setServerError("שגיאה בהתחברות עם Google");
    }
  };

  return (
    <AuthLayout>
      {/* Tab switcher */}
      <div className="mb-8 flex rounded-[10px] bg-[#F7F7F7] p-1">
        <div className="flex-1 rounded-[8px] bg-accent py-2.5 text-center text-[16px] font-medium text-foreground">
          {t("login")}
        </div>
        <Link
          href="/register"
          className="flex-1 rounded-[8px] py-2.5 text-center text-[16px] text-foreground transition-colors hover:bg-white/50"
        >
          {t("register")}
        </Link>
      </div>

      {/* Title */}
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        ברוכים הבאים לHeali
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        הזן את פרטי ההתחברות שלך כדי לקבל גישה לחשבון שלך במערכת
      </p>

      {/* Form */}
      <form onSubmit={handleSubmit(onSubmit)} className="mt-8 flex flex-col gap-5">
        <FormField label="כתובת מייל" htmlFor="email" error={errors.email?.message}>
          <Input
            id="email"
            type="email"
            placeholder="הקלד/י כאן את כתובת המייל שלך"
            {...register("email")}
            aria-invalid={!!errors.email}
          />
        </FormField>

        <FormField label="סיסמה" htmlFor="password" error={errors.password?.message}>
          <Input
            id="password"
            type="password"
            placeholder="הקלד/י כאן את הסיסמה שלך"
            {...register("password")}
            aria-invalid={!!errors.password}
          />
        </FormField>

        <Link
          href="/forgot-password"
          className="self-start text-[16px] font-light text-[#666] hover:underline"
        >
          {t("forgotPassword")}
        </Link>

        {serverError && (
          <p className="text-[14px] text-destructive">{serverError}</p>
        )}

        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading ? <Spinner size="sm" className="border-white/30 border-t-white" /> : t("login")}
        </Button>
      </form>

      {/* Divider */}
      <div className="my-6 flex items-center gap-4">
        <div className="h-px flex-1 bg-border-input" />
        <span className="text-[14px] text-muted-foreground">או</span>
        <div className="h-px flex-1 bg-border-input" />
      </div>

      {/* Social login */}
      <div className="flex gap-3">
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-border-input bg-[#F7F7F7] text-[14px] font-normal"
          onClick={handleGoogleSignIn}
        >
          {t("googleSignIn")}
        </Button>
        <Button
          type="button"
          variant="outline"
          className="flex-1 border-border-input bg-[#F7F7F7] text-[14px] font-normal"
        >
          {t("emailSignIn")}
        </Button>
      </div>

      {/* Legal text */}
      <p className="mt-8 text-center text-[14px] text-[#666]/40">
        בהמשך השימוש, אתה מסכים ל
        <Link href="/terms" className="font-bold underline">
          תנאי השימוש ולמדיניות הפרטיות
        </Link>{" "}
        של Heali
      </p>
    </AuthLayout>
  );
}
