"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { Suspense, useEffect, useRef, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { verifyEmailOtp, resendEmailOtp } from "@/app/(public)/auth/actions";

// Accept any 4–10 digit numeric code so the page doesn't break when
// Supabase's "Mailer OTP Length" dashboard setting is changed. Submit
// enables once the user has typed at least MIN_CODE_LENGTH characters.
const MIN_CODE_LENGTH = 4;
const MAX_CODE_LENGTH = 10;

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [code, setCode] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Cooldown timer ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // Auto-focus input on mount
  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  const handleChange = (value: string) => {
    const cleaned = value.replace(/\D/g, "").slice(0, MAX_CODE_LENGTH);
    setCode(cleaned);
  };

  const submit = async (codeOverride?: string) => {
    const c = codeOverride ?? code;
    if (c.length < MIN_CODE_LENGTH) return;
    if (!email) {
      toast.error("חסר אימייל בכתובת");
      return;
    }
    setIsSubmitting(true);
    const result = await verifyEmailOtp(email, c);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("האימייל אומת");
      router.push("/login?verified=1");
    } else {
      toast.error(result.error ?? "שגיאה");
      setCode("");
      inputRef.current?.focus();
    }
  };

  const handleResend = async () => {
    if (!email) {
      toast.error("חסר אימייל");
      return;
    }
    setIsResending(true);
    const result = await resendEmailOtp(email);
    setIsResending(false);
    if (result.success) {
      toast.success("נשלח קוד חדש");
      setResendCooldown(60);
    } else {
      toast.error(result.error ?? "שגיאה");
    }
  };

  return (
    <AuthLayout progress={100}>
      <div className="flex flex-col items-center text-center">
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-[36px] md:text-[40px] font-semibold leading-tight text-foreground">
          הזן את הקוד שנשלח
        </h1>
        <p className="mt-3 text-[16px] md:text-[18px] font-light text-[#666]">
          שלחנו קוד אימות לכתובת
          {email ? <><br /><strong className="text-foreground">{email}</strong></> : null}
        </p>

        <div className="mt-8 w-full max-w-[360px]" dir="ltr">
          <input
            ref={inputRef}
            type="text"
            inputMode="numeric"
            autoComplete="one-time-code"
            maxLength={MAX_CODE_LENGTH}
            value={code}
            onChange={(e) => handleChange(e.target.value)}
            disabled={isSubmitting}
            placeholder="——————"
            className="w-full h-[64px] rounded-[10px] border-2 border-border-input bg-white text-center text-[28px] font-semibold tracking-[0.5em] text-foreground focus:border-primary focus:outline-none disabled:opacity-50 placeholder:text-muted/40 placeholder:tracking-normal"
          />
        </div>

        <div className="mt-8 w-full max-w-[360px] space-y-3">
          <Button
            className="w-full"
            disabled={isSubmitting || code.length < MIN_CODE_LENGTH}
            onClick={() => void submit()}
          >
            {isSubmitting ? <Spinner size="sm" className="border-white/30 border-t-white" /> : "אימות"}
          </Button>

          <Button
            type="button"
            variant="secondary"
            className="w-full bg-[#F4F7F7]"
            disabled={isResending || resendCooldown > 0}
            onClick={handleResend}
          >
            {isResending
              ? <Spinner size="sm" />
              : resendCooldown > 0
                ? `שלח קוד חדש (${resendCooldown})`
                : "שלח קוד חדש"}
          </Button>
        </div>

        <p className="mt-6 text-[14px] text-[#666]/60">
          לא קיבלת מייל? בדוק את תיקיית הספאם
        </p>
      </div>
    </AuthLayout>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyInner />
    </Suspense>
  );
}
