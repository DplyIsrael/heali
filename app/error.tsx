"use client";

import { Button } from "@/components/ui/button";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div className="flex min-h-screen items-center justify-center px-4" dir="rtl">
      <div className="text-center max-w-[400px]">
        <h1 className="text-[24px] font-bold text-black mb-2">אירעה שגיאה</h1>
        <p className="text-[16px] text-muted mb-6">
          משהו השתבש. אנא נסה שוב.
        </p>
        <Button onClick={reset} className="bg-accent text-black">
          נסה שוב
        </Button>
      </div>
    </div>
  );
}
