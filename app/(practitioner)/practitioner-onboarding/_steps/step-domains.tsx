"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { saveDomains } from "../actions";

interface Domain {
  id: string;
  name: string;
}

interface StepDomainsProps {
  domains: Domain[];
  initialSelected: string[];
  onNext: (domainIds: string[]) => void;
}

export function StepDomains({ domains, initialSelected, onNext }: StepDomainsProps) {
  const t = useTranslations("onboarding.practitioner");
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleNext = async () => {
    if (selected.length === 0) {
      setError("יש לבחור לפחות תחום טיפול אחד");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await saveDomains(selected);
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
        ספר לנו קצת על תחומי הטיפול שלך
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        בחר את תחומי הטיפול בהם אתה מתמחה (ניתן לבחור יותר מאחד)
      </p>

      <div className="mt-8 grid grid-cols-2 gap-3">
        {domains.map((domain) => (
          <button
            key={domain.id}
            type="button"
            onClick={() => toggle(domain.id)}
            className={`rounded-[10px] border px-4 py-4 text-[15px] transition-colors ${
              selected.includes(domain.id)
                ? "border-primary bg-primary/5 font-medium text-primary"
                : "border-border-input bg-white text-foreground hover:border-primary/40"
            }`}
          >
            {domain.name}
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}

      <Button className="mt-8 w-full" disabled={isLoading} onClick={handleNext}>
        {isLoading ? (
          <Spinner size="sm" className="border-white/30 border-t-white" />
        ) : (
          "המשך"
        )}
      </Button>
    </div>
  );
}
