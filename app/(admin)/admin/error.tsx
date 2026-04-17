"use client";

import { Button } from "@/components/ui/button";

export default function AdminError({
  reset,
}: {
  error: Error;
  reset: () => void;
}) {
  return (
    <div className="flex min-h-[60vh] items-center justify-center">
      <div className="text-center">
        <h2 className="text-[20px] font-bold text-black mb-2">שגיאה</h2>
        <p className="text-muted mb-4">אירעה שגיאה בטעינת הדף</p>
        <Button onClick={reset} className="bg-accent text-black">נסה שוב</Button>
      </div>
    </div>
  );
}
