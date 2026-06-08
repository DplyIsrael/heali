"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { saveQuestionnaireResponses, completeOnboarding } from "../actions";

interface StepQuestionnaireProps {
  onComplete: () => void;
  onBack: () => void;
}

// Placeholder questions — will be replaced with dynamic content from DB/config
const PLACEHOLDER_QUESTIONS = [
  {
    id: "q1",
    question: "מה סוג הטיפול שמעניין אותך?",
    options: ["טיפול גופני", "טיפול רגשי", "טיפול משולב", "עוד לא בטוח/ה"],
  },
  {
    id: "q2",
    question: "האם קיבלת טיפול אלטרנטיבי בעבר?",
    options: ["כן, יש לי ניסיון", "ניסיתי פעם אחת", "לא, זו הפעם הראשונה"],
  },
  {
    id: "q3",
    question: "מה הכי חשוב לך במטפל/ת?",
    options: ["ניסיון מקצועי", "קרבה גיאוגרפית", "מחיר נוח", "חיבור אישי"],
  },
];

export function StepQuestionnaire({
  onComplete,
  onBack,
}: StepQuestionnaireProps) {
  const t = useTranslations("onboarding.patient");
  const [responses, setResponses] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSelect = (questionId: string, option: string) => {
    setResponses((prev) => ({ ...prev, [questionId]: option }));
  };

  const allAnswered = PLACEHOLDER_QUESTIONS.every((q) => responses[q.id]);

  const handleSubmit = async () => {
    setIsLoading(true);
    setError("");

    const saveResult = await saveQuestionnaireResponses(responses);
    if (!saveResult.success) {
      setError(saveResult.error ?? "שגיאה בשמירת תשובות");
      setIsLoading(false);
      return;
    }

    const completeResult = await completeOnboarding();
    if (!completeResult.success) {
      setError(completeResult.error ?? "שגיאה בהשלמת ההרשמה");
      setIsLoading(false);
      return;
    }

    onComplete();
  };

  return (
    <div className="flex flex-col">
      <h1 className="text-[40px] font-semibold leading-tight text-foreground">
        {t("step6Title")}
      </h1>
      <p className="mt-2 text-[18px] font-light text-[#666]">
        ענה על מספר שאלות כדי שנוכל להתאים לך מטפלים באופן אישי
      </p>

      <div className="mt-8 flex flex-col gap-8">
        {PLACEHOLDER_QUESTIONS.map((q) => (
          <div key={q.id}>
            <h3 className="text-[17px] font-medium text-foreground">
              {q.question}
            </h3>
            <div className="mt-3 flex flex-col gap-2">
              {q.options.map((option) => (
                <button
                  key={option}
                  type="button"
                  onClick={() => handleSelect(q.id, option)}
                  className={`rounded-[10px] border px-4 py-3 text-start text-[15px] transition-colors ${
                    responses[q.id] === option
                      ? "border-primary bg-primary/5 font-medium text-primary"
                      : "border-border-input bg-white text-foreground hover:border-primary/40"
                  }`}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {error && (
        <p className="mt-4 text-[14px] text-destructive">{error}</p>
      )}

      <div className="mt-8 flex gap-3">
        <Button
          className="flex-1"
          disabled={!allAnswered || isLoading}
          onClick={handleSubmit}
        >
          {isLoading ? (
            <Spinner size="sm" className="border-white/30 border-t-white" />
          ) : (
            t("completeOnboarding")
          )}
        </Button>
        <Button
          variant="secondary"
          className="bg-[#F4F7F7]"
          onClick={onBack}
        >
          חזור
        </Button>
      </div>
    </div>
  );
}
