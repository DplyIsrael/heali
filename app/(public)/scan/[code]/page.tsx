"use client";

import { useState } from "react";
import { useParams } from "next/navigation";
import { Check, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { confirmAttendance } from "./actions";

export default function ScanPage() {
  const params = useParams();
  const code = params.code as string;

  const [status, setStatus] = useState<"loading" | "confirming" | "success" | "error">("confirming");
  const [errorMsg, setErrorMsg] = useState("");
  const [practitionerName, setPractitionerName] = useState("");

  const handleConfirm = async () => {
    setStatus("loading");
    const result = await confirmAttendance(code);

    if (result.success) {
      setPractitionerName(result.practitionerName ?? "");
      setStatus("success");
    } else {
      setErrorMsg(result.error ?? "שגיאה באישור הנוכחות");
      setStatus("error");
    }
  };

  if (status === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center text-center max-w-[400px]">
          <div className="size-[120px] rounded-full bg-[#e0ffed] flex items-center justify-center mb-6">
            <div className="size-[70px] rounded-full bg-accent flex items-center justify-center">
              <Check className="size-8 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-[24px] font-bold text-black mb-3">
            הנוכחות אושרה בהצלחה!
          </h1>
          <p className="text-[16px] text-[#9f9f9f] mb-2">
            הטיפול עם {practitionerName} סומן כהושלם.
          </p>
          <p className="text-[16px] text-[#9f9f9f]">
            תקבל/י קישור לסקר שביעות רצון בקרוב.
          </p>
        </div>
      </div>
    );
  }

  if (status === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center text-center max-w-[400px]">
          <div className="size-[120px] rounded-full bg-[#ffe0e2] flex items-center justify-center mb-6">
            <AlertCircle className="size-12 text-destructive" />
          </div>
          <h1 className="text-[24px] font-bold text-black mb-3">שגיאה</h1>
          <p className="text-[16px] text-[#9f9f9f]">{errorMsg}</p>
        </div>
      </div>
    );
  }

  // Confirming state
  return (
    <div className="flex min-h-screen items-center justify-center bg-background px-4">
      <div className="flex flex-col items-center text-center max-w-[400px]">
        <h1 className="text-[24px] font-bold text-black mb-3">אישור נוכחות</h1>
        <p className="text-[16px] text-[#9f9f9f] mb-6">
          לחץ/י לאישור שהגעת לטיפול
        </p>
        <Button
          onClick={handleConfirm}
          className="bg-accent text-black h-[48px] px-10 text-[16px]"
        >
          אישור נוכחות
        </Button>
      </div>
    </div>
  );
}
