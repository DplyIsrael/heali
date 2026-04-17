"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { CheckCircle } from "lucide-react";

export default function AccountApprovedPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      <div className="flex max-w-[460px] flex-col items-center text-center">
        {/* Illustration */}
        <div className="mb-8 flex h-44 w-44 items-center justify-center rounded-full bg-accent/20">
          <CheckCircle className="h-20 w-20 text-primary" />
        </div>

        <h1 className="text-[40px] font-semibold leading-tight text-foreground">
          החשבון שלך אושר
        </h1>
        <p className="mt-4 text-[18px] font-light leading-relaxed text-[#666]">
          החשבון שלך אושר בהצלחה, תוכל להוריד כעת את הברקוד לסריקה עבור המטופל בסוף
          כל טיפול בשביל שנוכל לאמת את התשלום
        </p>

        {/* QR download link */}
        <a
          href="/api/practitioner-qr"
          target="_blank"
          rel="noopener noreferrer"
          className="mt-6 text-[18px] font-bold text-[#2563EB] underline hover:text-[#2563EB]/80"
        >
          הורדת קוד QR בקובץ PDF
        </a>

        <Button
          variant="accent"
          className="mt-8 w-[331px]"
          onClick={() => router.push("/dashboard")}
        >
          כניסה למערכת
        </Button>
      </div>
    </div>
  );
}
