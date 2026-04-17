"use client";

import { useState, useEffect } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { saveSpecialties, fetchSpecialties, addCustomSpecialty } from "../actions";

interface StepSpecialtiesProps {
  domainIds: string[];
  initialSelected: string[];
  onNext: (specialtyIds: string[]) => void;
  onBack: () => void;
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

  useEffect(() => {
    fetchSpecialties(domainIds).then((data) => {
      setSpecialties(data);
      setIsFetching(false);
    });
  }, [domainIds]);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((s) => s !== id) : [...prev, id]
    );
  };

  const handleAddCustom = async () => {
    if (!customName.trim() || domainIds.length === 0) return;
    setIsAdding(true);
    // Add to the first selected domain
    const result = await addCustomSpecialty(customName.trim(), domainIds[0]);
    if (result.success && result.id) {
      if (!specialties.find((s) => s.id === result.id)) {
        setSpecialties((prev) => [...prev, { id: result.id!, name: customName.trim(), domain_id: domainIds[0] }]);
      }
      setSelected((prev) => prev.includes(result.id!) ? prev : [...prev, result.id!]);
      setCustomName("");
      setShowCustomInput(false);
    } else {
      setError(result.error ?? "שגיאה");
    }
    setIsAdding(false);
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
        באיזה תחומים אתה מתמחה?
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        בחר את ההתמחויות הספציפיות שלך
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
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            placeholder="שם ההתמחות..."
            className="flex-1"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), handleAddCustom())}
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
            onClick={() => { setShowCustomInput(false); setCustomName(""); }}
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
          לא מצאת? הוסף התמחות חדשה
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
        <Button variant="secondary" className="bg-[#F4F7F7]" onClick={onBack}>
          חזור
        </Button>
      </div>
    </div>
  );
}
