import { Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "איך אני מוצא מטפל מתאים?",
    a: "דרך עמוד החיפוש שלנו תוכלו לסנן מטפלים לפי תחום טיפול, מיקום, מחיר ודירוג. לאחר ההרשמה, המערכת גם ממליצה על מטפלים בהתאמה אישית.",
  },
  {
    q: "האם המטפלים מוסמכים ומאומתים?",
    a: "כן. כל מטפל עובר תהליך אימות מקיף הכולל בדיקת תעודות הסמכה ואישור על ידי צוות Heali לפני שהפרופיל שלו מופיע בפלטפורמה.",
  },
  {
    q: "כיצד מתבצעת ההזמנה?",
    a: "בוחרים מטפל, בוחרים תאריך ושעה פנויה, ומאשרים. המטפל מקבל את הבקשה ומאשר תוך 24 שעות. לאחר האישור תקבלו אישור עם כל הפרטים.",
  },
  {
    q: "מה מדיניות הביטולים?",
    a: "ניתן לבטל טיפול עד 24 שעות לפני המועד המתוכנן. ביטול בזמן מסב את הסכום כקרדיט לארנק הדיגיטלי שלכם לשימוש בטיפולים עתידיים.",
  },
  {
    q: "האם יש אפשרות לטיפולים מרחוק?",
    a: "חלק מהמטפלים מציעים טיפולים מרחוק. ניתן לסנן לפי אפשרות זו בעמוד החיפוש.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      {/* Section header */}
      <div className="mb-10 text-center">
        <h2 className="text-[30px] font-semibold text-foreground">שאלות נפוצות</h2>
        <p className="mt-3 mx-auto max-w-[700px] text-[15px] font-light text-muted-foreground leading-relaxed">
          אספנו את כל מה שרציתם לדעת על טיפולים, מטפלים והתהליך כדי שיהיה קל,
          ברור ופשוט להתחיל.
        </p>
      </div>

      <div className="flex gap-10">
        {/* FAQ accordion — right side (first in DOM = right in RTL) */}
        <div className="flex-1">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-[12px] border border-border bg-white px-6 shadow-sm"
              >
                <AccordionTrigger className="text-right text-[16px] font-medium text-foreground hover:no-underline py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-right text-[14px] font-light text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Testimonial quote card — left side (second in DOM = left in RTL) */}
        <div className="w-[320px] shrink-0">
          <div className="rounded-[20px] bg-[#f4f7f7] p-7 flex flex-col">
            {/* Avatar placeholder */}
            <div className="size-[56px] rounded-full bg-primary/10 flex items-center justify-center text-primary text-lg font-semibold mb-4">
              ר
            </div>

            {/* Stars */}
            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="size-4 fill-[#f5c518] text-[#f5c518]" />
              ))}
            </div>

            {/* Quote text */}
            <p className="text-[15px] font-light text-foreground leading-relaxed mb-4">
              &quot;אחרי שנים של חיפוש, מצאתי ב-Heali את המטפל שבאמת מבין אותי.
              התהליך היה פשוט ומהיר, וההמלצות היו מדויקות.&quot;
            </p>

            {/* Reviewer info */}
            <div className="mt-auto">
              <p className="text-[14px] font-medium text-foreground">רחל כהן</p>
              <p className="text-[12px] font-light text-muted-foreground">מטופלת בתחום הרפלקסולוגיה</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
