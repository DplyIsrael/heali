"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { saveAgreement } from "../actions";

interface StepAgreementProps {
  onNext: () => void;
  onBack: () => void;
}

export function StepAgreement({ onNext, onBack }: StepAgreementProps) {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!agreed) {
      setError("יש לאשר את ההסכם כדי להמשיך");
      return;
    }
    setIsLoading(true);
    setError("");
    const result = await saveAgreement();
    if (result.success) {
      onNext();
    } else {
      setError(result.error ?? "שגיאה");
    }
    setIsLoading(false);
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[36px] font-semibold leading-tight text-foreground">
        הסכם מטפל
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        אנא קרא את ההסכם הבא ואשר כדי להמשיך
      </p>

      {/* Agreement text placeholder */}
      <div className="mt-8 max-h-[400px] overflow-y-auto rounded-[10px] border border-border-input bg-white p-6">
        <h3 className="text-[18px] font-medium text-foreground">
          הסכם שימוש למטפלים בפלטפורמת Heali
        </h3>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#666]">
          <p>
            הסכם זה מסדיר את תנאי השימוש שלך כמטפל/ת בפלטפורמת Heali. באישורך, אתה
            מסכים לתנאים הבאים:
          </p>
          <p>
            <strong className="text-foreground">1. זמינות:</strong> אתה מתחייב לעדכן את
            לוח הזמנים שלך באופן שוטף ולהגיב לבקשות תורים תוך 24 שעות.
          </p>
          <p>
            <strong className="text-foreground">2. מקצועיות:</strong> אתה מתחייב לספק
            שירות מקצועי ואיכותי לכל מטופל/ת.
          </p>
          <p>
            <strong className="text-foreground">3. ביטולים:</strong> ביטול טיפול חייב
            להתבצע לפחות 24 שעות מראש.
          </p>
          <p>
            <strong className="text-foreground">4. תשלומים:</strong> התשלומים יועברו
            אליך בהתאם למדיניות התשלומים של הפלטפורמה.
          </p>
          <p>
            <strong className="text-foreground">5. תוכן:</strong> אתה אחראי לדיוק
            המידע בפרופיל שלך, כולל תעודות, ניסיון, ותיאור השירותים.
          </p>
          <p className="text-[13px] italic">
            * הסכם מלא יפורסם בקרוב. זהו טקסט מקום (placeholder).
          </p>
        </div>
      </div>

      {/* Checkbox */}
      <label className="mt-6 flex cursor-pointer items-start gap-3">
        <input
          type="checkbox"
          checked={agreed}
          onChange={(e) => setAgreed(e.target.checked)}
          className="mt-1 h-5 w-5 rounded border-border-input accent-primary"
        />
        <span className="text-[15px] text-foreground">
          קראתי את ההסכם ואני מסכים/ה לתנאים
        </span>
      </label>

      {error && <p className="mt-4 text-[14px] text-destructive">{error}</p>}

      <div className="mt-8 flex gap-3">
        <Button className="flex-1" disabled={!agreed || isLoading} onClick={handleNext}>
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
