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

const CODE_LENGTH = 6;

function VerifyInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const email = searchParams.get("email") ?? "";

  const [digits, setDigits] = useState<string[]>(() => Array(CODE_LENGTH).fill(""));
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Cooldown timer ticker
  useEffect(() => {
    if (resendCooldown <= 0) return;
    const id = setTimeout(() => setResendCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [resendCooldown]);

  // Auto-focus first input on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  const handleChange = (i: number, value: string) => {
    const cleaned = value.replace(/\D/g, "");
    if (!cleaned) {
      setDigits((prev) => prev.map((d, idx) => (idx === i ? "" : d)));
      return;
    }
    // Support paste of the full code
    if (cleaned.length === CODE_LENGTH) {
      setDigits(cleaned.split(""));
      inputs.current[CODE_LENGTH - 1]?.focus();
      void submit(cleaned);
      return;
    }
    const next = cleaned.charAt(0);
    setDigits((prev) => prev.map((d, idx) => (idx === i ? next : d)));
    if (i < CODE_LENGTH - 1) inputs.current[i + 1]?.focus();
  };

  const handleKeyDown = (i: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !digits[i] && i > 0) {
      inputs.current[i - 1]?.focus();
    }
  };

  const submit = async (codeOverride?: string) => {
    const code = codeOverride ?? digits.join("");
    if (code.length < CODE_LENGTH) return;
    if (!email) {
      toast.error("חסר אימייל בכתובת");
      return;
    }
    setIsSubmitting(true);
    const result = await verifyEmailOtp(email, code);
    setIsSubmitting(false);
    if (result.success) {
      toast.success("האימייל אומת");
      router.push("/login?verified=1");
    } else {
      toast.error(result.error ?? "שגיאה");
      setDigits(Array(CODE_LENGTH).fill(""));
      inputs.current[0]?.focus();
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
          שלחנו קוד בן 6 ספרות לכתובת
          {email ? <><br /><strong className="text-foreground">{email}</strong></> : null}
        </p>

        <div className="mt-8 flex gap-2 justify-center" dir="ltr">
          {digits.map((digit, i) => (
            <input
              key={i}
              ref={(el) => { inputs.current[i] = el; }}
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              maxLength={CODE_LENGTH}
              value={digit}
              onChange={(e) => handleChange(i, e.target.value)}
              onKeyDown={(e) => handleKeyDown(i, e)}
              disabled={isSubmitting}
              className="size-[52px] md:size-[60px] rounded-[10px] border-2 border-border-input bg-white text-center text-[24px] font-semibold text-foreground focus:border-primary focus:outline-none disabled:opacity-50"
            />
          ))}
        </div>

        <div className="mt-8 w-full max-w-[360px] space-y-3">
          <Button
            className="w-full"
            disabled={isSubmitting || digits.join("").length < CODE_LENGTH}
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
