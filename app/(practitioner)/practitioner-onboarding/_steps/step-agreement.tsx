"use client";

import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { saveAgreement } from "../actions";

interface StepAgreementProps {
  onNext: () => void;
  onBack: () => void;
}

// Hardcoded for now — flip once the client supplies the real legal text and
// the server-side AGREEMENT_TEXT_FINAL env is set to "true". Keeping the
// banner client-side too means the visible warning + the server-side
// signed_at write get removed together (one PR touches both).
const AGREEMENT_IS_DRAFT = true;

export function StepAgreement({ onNext, onBack }: StepAgreementProps) {
  const [agreed, setAgreed] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleNext = async () => {
    if (!agreed) {
      setError(
        AGREEMENT_IS_DRAFT
          ? "יש לאשר את הטיוטה כדי להמשיך בהרשמה"
          : "יש לאשר את ההסכם כדי להמשיך"
      );
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
        {AGREEMENT_IS_DRAFT
          ? "טיוטה ראשונית — ההסכם הסופי יישלח לחתימה לפני תחילת העבודה בפועל"
          : "אנא קרא את ההסכם הבא ואשר כדי להמשיך"}
      </p>

      {/* Non-binding draft banner — only when AGREEMENT_IS_DRAFT.
          Surfaces clearly that this text isn't legally binding. */}
      {AGREEMENT_IS_DRAFT && (
        <div className="mt-6 flex items-start gap-3 rounded-[10px] border border-[#F5C518] bg-[#FFF8DC] p-4">
          <AlertTriangle className="mt-0.5 size-5 shrink-0 text-[#9A6700]" />
          <div className="text-[14px] leading-snug text-[#5C4A00]">
            <p className="font-semibold mb-1">טקסט זה הוא טיוטה — לא לחתימה משפטית</p>
            <p>
              ההסכם המלא והמחייב יישלח אליך בנפרד לחתימה לפני תחילת מתן השירותים בפלטפורמה. אישור בשלב זה הוא לצורך התקדמות בתהליך ההרשמה בלבד ואינו מהווה התקשרות משפטית.
            </p>
          </div>
        </div>
      )}

      {/* Agreement text */}
      <div className="mt-6 max-h-[400px] overflow-y-auto rounded-[10px] border border-border-input bg-white p-6">
        <h3 className="text-[18px] font-medium text-foreground">
          {AGREEMENT_IS_DRAFT
            ? "טיוטת תנאי שימוש למטפלים בפלטפורמת Heali"
            : "הסכם שימוש למטפלים בפלטפורמת Heali"}
        </h3>
        <div className="mt-4 space-y-4 text-[15px] leading-relaxed text-[#666]">
          <p>
            {AGREEMENT_IS_DRAFT
              ? "מסמך זה מציג את הציפיות המרכזיות שלנו ממטפלים בפלטפורמה. הסעיפים הסופיים, כולל תנאי תשלום ותנאי ביטול, יישלחו לחתימה בהמשך."
              : "הסכם זה מסדיר את תנאי השימוש שלך כמטפל/ת בפלטפורמת Heali. באישורך, אתה מסכים לתנאים הבאים:"}
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
          {AGREEMENT_IS_DRAFT
            ? "קראתי את הטיוטה ואני מאשר/ת את ההתקדמות בתהליך ההרשמה (אינו מהווה חתימה משפטית)"
            : "קראתי את ההסכם ואני מסכים/ה לתנאים"}
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
