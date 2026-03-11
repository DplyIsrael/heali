"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { Mail } from "lucide-react";

export default function VerifyEmailPage() {
  const router = useRouter();
  const [resent, setResent] = useState(false);

  return (
    <AuthLayout progress={100}>
      <div className="flex flex-col items-center text-center">
        {/* Icon */}
        <div className="mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-accent/20">
          <Mail className="h-10 w-10 text-primary" />
        </div>

        <h1 className="text-[40px] font-semibold leading-tight text-foreground">
          בדוק את המייל שלך
        </h1>
        <p className="mt-3 text-[18px] font-light text-[#666]">
          שלחנו לך מייל עם קישור לאימות החשבון שלך.
          <br />
          לחץ על הקישור במייל כדי להשלים את ההרשמה.
        </p>

        <div className="mt-8 w-full max-w-[360px] space-y-3">
          <Button
            className="w-full"
            onClick={() => router.push("/login")}
          >
            חזרה להתחברות
          </Button>

          <Button
            variant="secondary"
            className="w-full bg-[#F4F7F7]"
            disabled={resent}
            onClick={() => setResent(true)}
          >
            {resent ? "המייל נשלח מחדש ✓" : "שלח מייל מחדש"}
          </Button>
        </div>

        <p className="mt-6 text-[14px] text-[#666]/60">
          לא קיבלת מייל? בדוק את תיקיית הספאם או נסה שוב
        </p>
      </div>
    </AuthLayout>
  );
}
