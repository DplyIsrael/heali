"use client";

import { useRef, useState } from "react";
import { Upload, Trash2, Link2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { FormField } from "@/components/ui/form-field";
import { saveClientReferences, type ClientReferenceRow } from "../actions";

const SLOT_COUNT = 5;
const PHONE_REGEX = /^[2-9]\d{8}$/;

interface StepClientReferencesProps {
  initialSlots: ClientReferenceRow[];
  onNext: (slots: ClientReferenceRow[]) => void;
  onBack: (slots: ClientReferenceRow[]) => void;
}

function emptySlot(): ClientReferenceRow {
  return { fileUrl: "", fileName: "", clientName: "", clientPhone: "" };
}

export function StepClientReferences({
  initialSlots,
  onNext,
  onBack,
}: StepClientReferencesProps) {
  const [slots, setSlots] = useState<ClientReferenceRow[]>(() => {
    const seeded = [...initialSlots];
    while (seeded.length < SLOT_COUNT) seeded.push(emptySlot());
    return seeded.slice(0, SLOT_COUNT);
  });
  const [slotErrors, setSlotErrors] = useState<
    Array<{ file?: string; clientName?: string; clientPhone?: string }>
  >(() => Array.from({ length: SLOT_COUNT }, () => ({})));
  const [serverError, setServerError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingSlot, setUploadingSlot] = useState<number | null>(null);
  const fileInputs = useRef<(HTMLInputElement | null)[]>([]);

  const updateSlot = (index: number, patch: Partial<ClientReferenceRow>) => {
    setSlots((prev) => prev.map((s, i) => (i === index ? { ...s, ...patch } : s)));
    setSlotErrors((prev) =>
      prev.map((e, i) => (i === index ? {} : e))
    );
  };

  const handleFileChange = async (index: number, e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;
    const file = fileList[0];

    const lower = file.name.toLowerCase();
    const isValid =
      lower.endsWith(".pdf") ||
      lower.endsWith(".jpg") ||
      lower.endsWith(".jpeg") ||
      lower.endsWith(".png");
    if (!isValid) {
      setSlotErrors((prev) =>
        prev.map((er, i) => (i === index ? { ...er, file: "יש לבחור PDF, JPG או PNG" } : er))
      );
      e.target.value = "";
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setSlotErrors((prev) =>
        prev.map((er, i) => (i === index ? { ...er, file: "גודל הקובץ עד 10MB" } : er))
      );
      e.target.value = "";
      return;
    }

    setUploadingSlot(index);
    try {
      const formData = new FormData();
      formData.append("file", file);
      const res = await fetch("/api/upload-client-reference", { method: "POST", body: formData });
      // Route returns { path, name } — storage path under the PRIVATE
      // client-documents bucket. We persist the path; signed URLs are
      // issued at display time via getSignedClientDocumentUrl.
      const data: { path?: string; name?: string; error?: string } = await res
        .json()
        .catch(() => ({ error: "שגיאת שרת" }));
      if (!res.ok || !data.path) {
        setSlotErrors((prev) =>
          prev.map((er, i) =>
            i === index ? { ...er, file: data.error ?? "שגיאה בהעלאה" } : er
          )
        );
      } else {
        updateSlot(index, { fileUrl: data.path, fileName: data.name ?? file.name });
      }
    } catch {
      setSlotErrors((prev) =>
        prev.map((er, i) => (i === index ? { ...er, file: "שגיאה בהעלאה" } : er))
      );
    } finally {
      setUploadingSlot(null);
      e.target.value = "";
    }
  };

  const removeFile = (index: number) => updateSlot(index, { fileUrl: "", fileName: "" });

  const validate = (): boolean => {
    const next = slots.map((slot) => {
      const err: { file?: string; clientName?: string; clientPhone?: string } = {};
      if (!slot.fileUrl) err.file = "יש להעלות קובץ";
      if (!slot.clientName.trim()) err.clientName = "שדה חובה";
      if (!PHONE_REGEX.test(slot.clientPhone)) err.clientPhone = "מספר טלפון לא תקין";
      return err;
    });
    setSlotErrors(next);
    return next.every((e) => !e.file && !e.clientName && !e.clientPhone);
  };

  const handleNext = async () => {
    setServerError("");
    if (!validate()) return;
    setIsLoading(true);
    const result = await saveClientReferences(slots);
    if (result.success) {
      onNext(slots);
    } else {
      setServerError(result.error ?? "שגיאה");
    }
    setIsLoading(false);
  };

  const handleBack = async () => {
    const allValid = slots.every(
      (s) => s.fileUrl && s.clientName.trim() && PHONE_REGEX.test(s.clientPhone)
    );
    if (allValid) {
      await saveClientReferences(slots).catch(() => {});
    }
    onBack(slots);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        המלצות של לקוחות
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        נא להעלות קבצים או צילומי מסך של המלצות של 5 לקוחות שונים
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {slots.map((slot, i) => {
          const err = slotErrors[i];
          return (
            <div
              key={i}
              className="flex flex-col gap-3 rounded-[12px] border border-border-input bg-white p-4"
            >
              <div className="text-[14px] font-medium text-primary">המלצה #{i + 1}</div>

              {/* File row */}
              {slot.fileUrl ? (
                <div className="flex items-center justify-between rounded-[10px] border border-border-input bg-white px-4 py-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <Link2 className="h-4 w-4 text-primary shrink-0" />
                    <span className="text-[14px] font-medium text-primary truncate">
                      {slot.fileName}
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeFile(i)}
                    className="text-destructive hover:text-destructive/80"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => fileInputs.current[i]?.click()}
                  disabled={uploadingSlot === i}
                  className="flex items-center justify-center gap-2 rounded-[8px] border border-foreground px-6 py-3 text-[16px] transition-colors hover:bg-muted/10"
                >
                  {uploadingSlot === i ? <Spinner size="sm" /> : <Upload className="h-4 w-4" />}
                  {uploadingSlot === i ? "מעלה..." : "העלאת קובץ +"}
                </button>
              )}
              <input
                ref={(el) => {
                  fileInputs.current[i] = el;
                }}
                type="file"
                accept=".pdf,.jpg,.jpeg,.png"
                className="hidden"
                onChange={(e) => handleFileChange(i, e)}
              />
              {err?.file && <p className="text-[13px] text-destructive">{err.file}</p>}

              {/* Client details */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <FormField label="שם הלקוח" htmlFor={`refClientName-${i}`} error={err?.clientName} required>
                  <Input
                    id={`refClientName-${i}`}
                    value={slot.clientName}
                    onChange={(e) => updateSlot(i, { clientName: e.target.value })}
                    placeholder="הקלד/י כאן..."
                  />
                </FormField>

                <FormField label="מס. טלפון" htmlFor={`refClientPhone-${i}`} error={err?.clientPhone} required>
                  <div className="flex h-[48px] items-stretch overflow-hidden rounded-[10px] border border-border-input bg-white focus-within:border-primary focus-within:ring-1 focus-within:ring-primary">
                    <input
                      id={`refClientPhone-${i}`}
                      type="tel"
                      inputMode="numeric"
                      value={slot.clientPhone}
                      onChange={(e) =>
                        updateSlot(i, {
                          clientPhone: e.target.value.replace(/\D/g, "").slice(0, 9),
                        })
                      }
                      placeholder="501234567"
                      className="flex-1 bg-transparent px-3 text-[15px] text-foreground placeholder:text-[#666] focus:outline-none"
                      maxLength={9}
                      aria-invalid={!!err?.clientPhone}
                    />
                    <span className="flex items-center border-s border-border-input bg-[#f9f9f9] px-3 text-[14px] text-foreground">
                      +972
                    </span>
                  </div>
                </FormField>
              </div>
            </div>
          );
        })}
      </div>

      {serverError && <p className="mt-4 text-[14px] text-destructive">{serverError}</p>}

      <div className="mt-8 flex gap-3">
        <Button className="flex-1" disabled={isLoading} onClick={handleNext}>
          {isLoading ? <Spinner size="sm" className="border-white/30 border-t-white" /> : "המשך"}
        </Button>
        <Button type="button" variant="secondary" className="bg-[#F4F7F7]" onClick={handleBack}>
          חזור
        </Button>
      </div>
    </div>
  );
}
