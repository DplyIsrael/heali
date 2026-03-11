"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { useTranslations } from "next-intl";
import { Search, User } from "lucide-react";
import { AuthLayout } from "@/components/shared/auth-layout";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Role = "patient" | "practitioner";

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<Role | null>(null);

  return (
    <AuthLayout progress={30}>
      {/* Tab switcher */}
      <div className="mb-8 flex rounded-[10px] bg-[#F7F7F7] p-1">
        <Link
          href="/login"
          className="flex-1 rounded-[8px] py-2.5 text-center text-[16px] text-foreground transition-colors hover:bg-white/50"
        >
          {t("login")}
        </Link>
        <div className="flex-1 rounded-[8px] bg-accent py-2.5 text-center text-[16px] font-medium text-foreground">
          {t("register")}
        </div>
      </div>

      {/* Title */}
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        ברוכים הבאים לHeali
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        בשביל לתת לך את ההצעות הכי טובות, נשמח להכיר אותך קצת
      </p>

      {/* Role selection cards */}
      <div className="mt-8 flex flex-col gap-4">
        <button
          type="button"
          onClick={() => setSelectedRole("patient")}
          className={cn(
            "flex items-center gap-4 rounded-[16px] p-6 text-right shadow-[0px_4px_24px_rgba(0,0,0,0.08)] transition-all",
            selectedRole === "patient"
              ? "border-2 border-accent"
              : "border-2 border-transparent"
          )}
        >
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-accent/20 ring-4 ring-accent/10">
            <Search className="size-7 text-accent" />
          </div>
          <div>
            <p className="text-[20px] font-medium text-foreground">
              {t("rolePatient")}
            </p>
            <p className="mt-1 text-[16px] font-light text-[#666]">
              חיפוש מטפלים, קביעת טיפולים וניהול הבריאות שלך
            </p>
          </div>
        </button>

        <button
          type="button"
          onClick={() => setSelectedRole("practitioner")}
          className={cn(
            "flex items-center gap-4 rounded-[16px] p-6 text-right shadow-[0px_4px_24px_rgba(0,0,0,0.08)] transition-all",
            selectedRole === "practitioner"
              ? "border-2 border-[#AD7FFF]"
              : "border-2 border-transparent"
          )}
        >
          <div className="flex size-16 shrink-0 items-center justify-center rounded-full bg-[#AD7FFF]/20 ring-4 ring-[#AD7FFF]/10">
            <User className="size-7 text-[#AD7FFF]" />
          </div>
          <div>
            <p className="text-[20px] font-medium text-foreground">
              {t("rolePractitioner")}
            </p>
            <p className="mt-1 text-[16px] font-light text-[#666]">
              הצטרפות כמטפל, ניהול תורים ופרופיל מקצועי
            </p>
          </div>
        </button>
      </div>

      {/* Navigation buttons */}
      <div className="mt-8 flex gap-3">
        <Button
          disabled={!selectedRole}
          onClick={() => {
            if (selectedRole) {
              router.push(`/register/${selectedRole}`);
            }
          }}
          className="flex-1"
        >
          המשך
        </Button>
        <Button
          variant="secondary"
          className="bg-[#F4F7F7]"
          onClick={() => router.back()}
        >
          חזור
        </Button>
      </div>
    </AuthLayout>
  );
}
