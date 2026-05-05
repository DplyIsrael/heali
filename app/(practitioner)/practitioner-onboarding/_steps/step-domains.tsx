"use client";

import { useState, useRef } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Spinner } from "@/components/ui/spinner";
import { saveDomains, addCustomDomain } from "../actions";

interface Domain {
  id: string;
  name: string;
}

interface StepDomainsProps {
  domains: Domain[];
  initialSelected: string[];
  onNext: (domainIds: string[]) => void;
}

export function StepDomains({ domains: initialDomains, initialSelected, onNext }: StepDomainsProps) {
  const [domains, setDomains] = useState<Domain[]>(initialDomains);
  const [selected, setSelected] = useState<string[]>(initialSelected);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [customName, setCustomName] = useState("");
  const [isAdding, setIsAdding] = useState(false);
  const [showCustomInput, setShowCustomInput] = useState(false);
  const customInputRef = useRef<HTMLInputElement>(null);

  const toggle = (id: string) => {
    setSelected((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  };

  const handleAddCustom = async () => {
    const name = customName.trim();
    if (!name) return;

    // Local duplicate check — case-insensitive
    const dup = domains.find((d) => d.name.trim().toLowerCase() === name.toLowerCase());
    if (dup) {
      setError(`${dup.name} כבר קיים`);
      customInputRef.current?.focus();
      return;
    }

    setIsAdding(true);
    setError("");
    const result = await addCustomDomain(name);
    if (result.success && result.id) {
      // If server returned an existing match (race / casing), surface as duplicate
      const existing = domains.find((d) => d.id === result.id);
      if (existing) {
        setError(`${existing.name} כבר קיים`);
        customInputRef.current?.focus();
        setIsAdding(false);
        return;
      }
      setDomains((prev) => [...prev, { id: result.id!, name }]);
      setSelected((prev) => prev.includes(result.id!) ? prev : [...prev, result.id!]);
      setCustomName("");
      setShowCustomInput(false);
    } else {
      setError(result.error ?? "שגיאה");
      customInputRef.current?.focus();
    }
    setIsAdding(false);
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
        תחומי הטיפול שלך
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        כאן ניתן לבחור את תחומי הטיפול שלך
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

      {/* Add custom domain */}
      {showCustomInput ? (
        <div className="mt-4 flex gap-2">
          <Input
            ref={customInputRef}
            value={customName}
            onChange={(e) => { setCustomName(e.target.value); if (error) setError(""); }}
            placeholder="שם תחום הטיפול..."
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
          לא מצאת? כאן ניתן להוסיף את תחום הטיפול שלך.
        </button>
      )}

      {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}

      <Button className="mt-8 w-full" disabled={isLoading} onClick={handleNext}>
        {isLoading ? (
          <Spinner size="sm" className="border-white/30 border-t-white" />
        ) : (
          "כבר מסיימים"
        )}
      </Button>
    </div>
  );
}
