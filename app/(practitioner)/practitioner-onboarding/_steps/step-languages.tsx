"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { X } from "lucide-react";
import { saveLanguages } from "../actions";

const AVAILABLE_LANGUAGES = [
  "עברית",
  "אנגלית",
  "ערבית",
  "רוסית",
  "צרפתית",
  "אמהרית",
  "ספרדית",
  "גרמנית",
  "יידיש",
];

interface StepLanguagesProps {
  initialSelected: string[];
  onNext: (languages: string[]) => void;
  onBack: () => void;
}

export function StepLanguages({ initialSelected, onNext, onBack }: StepLanguagesProps) {
  const [selected, setSelected] = useState<string[]>(
    initialSelected.length > 0 ? initialSelected : ["עברית"]
  );
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (lang: string) => {
    setSelected((prev) =>
      prev.includes(lang) ? prev.filter((l) => l !== lang) : [...prev, lang]
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      setError("יש לבחור לפחות שפה אחת");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await saveLanguages(selected);
    if (result.success) {
      onNext(selected);
    } else {
      setError(result.error ?? "שגיאה");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        מה השפות שלך?
      </h1>

      {/* Selected chips */}
      {selected.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-2">
          {selected.map((lang) => (
            <span
              key={lang}
              className="flex items-center gap-1.5 rounded-[5px] bg-gradient-to-b from-[#EBECEC] to-white px-3 py-1.5 text-[14px]"
            >
              {lang}
              <button type="button" onClick={() => toggle(lang)} className="text-[#666] hover:text-foreground">
                <X className="h-3 w-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      {/* Available languages */}
      <div className="mt-6 flex flex-wrap gap-3">
        {AVAILABLE_LANGUAGES.filter((l) => !selected.includes(l)).map((lang) => (
          <button
            key={lang}
            type="button"
            onClick={() => toggle(lang)}
            className="rounded-full border border-border-input bg-white px-5 py-2.5 text-[14px] text-foreground transition-colors hover:border-primary/40"
          >
            + {lang}
          </button>
        ))}
      </div>

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
