"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Clock } from "lucide-react";

export default function PendingApprovalPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-background px-6">
      {/* Progress bar at 100% */}
      <div className="absolute top-0 left-0 right-0 h-1 bg-muted/30">
        <div className="h-full w-full bg-accent" />
      </div>

      <div className="flex max-w-[460px] flex-col items-center text-center">
        {/* Illustration */}
        <div className="mb-8 flex h-44 w-44 items-center justify-center rounded-full bg-accent/20">
          <Clock className="h-20 w-20 text-primary" />
        </div>

        <h1 className="text-[40px] font-semibold leading-tight text-foreground">
          הפרטים התקבלו בהצלחה
        </h1>
        <p className="mt-4 text-[18px] font-light leading-relaxed text-[#666]">
          הפרטים שלך נמצאים כעת בבדיקה על-ידי צוות המערכת.
          <br />
          התהליך עשוי להימשך מספר ימים, ונעדכן אותך ברגע שהפרופיל יאושר.
        </p>

        <Button
          variant="accent"
          className="mt-10 w-[331px]"
          onClick={() => router.push("/")}
        >
          לעמוד הבית
        </Button>
      </div>
    </div>
  );
}
