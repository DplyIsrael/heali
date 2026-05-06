"use client";

import { useState, useEffect, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { saveSpecialties, fetchSpecialties, addCustomSpecialty } from "../actions";

interface StepSpecialtiesProps {
  domainIds: string[];
  initialSelected: string[];
  onNext: (specialtyIds: string[]) => void;
  onBack: (specialtyIds: string[]) => void;
}

interface Specialty {
  id: string;
  name: string;
  domain_id: string;
}

export function StepSpecialties({
  domainIds,
  initialSelected,
  onNext,
  onBack,
}: StepSpecialtiesProps) {
  const [specialties, setSpecialties] = useState<Specialty[]>([]);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState("");
  const [customName, setCustomName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Pass initialSelected so practitioner can still see pending specialties they
    // submitted previously but haven't been admin-approved yet.
    fetchSpecialties(domainIds, initialSelected).then((data) => {
      setSpecialties(data);
      setIsFetching(false);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domainIds]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAddCustom = async () => {
    const name = customName.trim();
    if (!name || domainIds.length === 0) return;

    // Local duplicate check — case-insensitive
    const dup = specialties.find((s) => s.name.trim().toLowerCase() === name.toLowerCase());
    if (dup) {
      setError(`${dup.name} כבר קיים`);
      customInputRef.current?.focus();
      return;
    }

    setIsAdding(true);
    setError("");
    const result = await addCustomSpecialty(name, domainIds[0]);
    if (result.success && result.id) {
      const existing = specialties.find((s) => s.id === result.id);
      if (existing) {
        setError(`${existing.name} כבר קיים`);
        customInputRef.current?.focus();
        setIsAdding(false);
        return;
      }
      setSpecialties((prev) => [...prev, { id: result.id!, name, domain_id: domainIds[0] }]);
      setSelected((prev) => prev.includes(result.id!) ? prev : [...prev, result.id!]);
      setCustomName("");
      setShowCustomInput(false);
    } else {
      setError(result.error ?? "שגיאה");
      customInputRef.current?.focus();
    }
    setIsAdding(false);
  };

  // Preserve in-progress selection on back: best-effort save so the
  // selection survives a session abandonment, plus hand it up so the
  // parent re-renders this step with the same state on re-entry.
  const handleBack = async () => {
    if (selected.length > 0) {
      await saveSpecialties(selected).catch(() => {});
    }
    onBack(selected);
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      setError("יש לבחור לפחות התמחות אחת");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await saveSpecialties(selected);
    if (result.success) {
      onNext(selected);
    } else {
      setError(result.error ?? "שגיאה");
    }
    setIsLoading(false);
  };

  if (isFetching) {
    return (
      <div className="flex items-center justify-center py-20">
        <Spinner />
      </div>
    );
  }

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        מה ההתמחויות שלך
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        כאן ניתן לבחור את ההתמחות הספציפית שלך
      </p>

      {specialties.length === 0 && !showCustomInput ? (
        <p className="mt-8 text-[16px] text-[#666]">
          לא נמצאו התמחויות עבור התחומים שנבחרו
        </p>
      ) : (
        <div className="mt-8 flex flex-wrap gap-3">
          {specialties.map((specialty) => (
            <button
              key={specialty.id}
              type="button"
              onClick={() => toggle(specialty.id)}
              className={`rounded-full border px-5 py-2.5 text-[14px] transition-colors ${
                selected.includes(specialty.id)
                  ? "border-primary bg-primary/5 font-medium text-primary"
                  : "border-border-input bg-white text-foreground hover:border-primary/40"
              }`}
            >
              {specialty.name}
            </button>
          ))}
        </div>
      )}

      {/* Add custom specialty */}
      {showCustomInput ? (
        <div className="mt-4 flex gap-2">
          <Input
            ref={customInputRef}
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); if (error) setError(""); }}
            placeholder="שם ההתמחות..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
            autoFocus
          />
          <Button
            type="button"
            onClick={handleAddCustom}
            disabled={isAdding || !customName.trim()}
            className="bg-accent text-black shrink-0"
          >
            {isAdding ? <Spinner size="sm" /> : "הוסף"}
          </Button>
          <Button
            type="button"
            variant="ghost"
            onClick={() => { setShowCustomInput(false); setCustomName(""); setError(""); }}
            className="shrink-0"
          >
            ביטול
          </Button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => setShowCustomInput(true)}
          className="mt-4 flex items-center gap-1.5 text-[15px] text-primary hover:underline self-start"
        >
          <Plus className="size-4" />
          לא מצאת? כאן ניתן להוסיף את תחום ההתמחות שלך.
        </button>
      )}

      {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}

      <div className="mt-8 flex gap-3">
        <Button className="flex-1" disabled={isLoading} onClick={handleNext}>
          {isLoading ? (
            <Spinner size="sm" className="border-white/30 border-t-white" />
          ) : (
            "המשך"
          )}
        </Button>
        <Button variant="secondary" className="bg-[#F4F7F7]" onClick={handleBack}>
          חזור
        </Button>
      </div>
    </div>
  );
}
