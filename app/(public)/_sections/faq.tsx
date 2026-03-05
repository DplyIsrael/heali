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
      <div className="mb-8 text-right">
        <h2 className="text-[32px] font-medium text-foreground">שאלות נפוצות</h2>
        <p className="mt-2 max-w-[700px] ms-auto text-[15px] font-light text-muted-foreground leading-relaxed">
          אספנו את כל מה שרציתם לדעת על טיפולים, מטפלים והתהליך כדי שיהיה קל,
          ברור ופשוט להתחיל.
        </p>
      </div>

      <Accordion type="single" collapsible className="space-y-3">
        {FAQ_ITEMS.map((item, i) => (
          <AccordionItem
            key={i}
            value={`item-${i}`}
            className="rounded-[12px] border border-border bg-white px-6 shadow-sm"
          >
            <AccordionTrigger className="text-right text-[16px] font-medium text-foreground hover:no-underline">
              {item.q}
            </AccordionTrigger>
            <AccordionContent className="text-right text-[14px] font-light text-muted-foreground leading-relaxed">
              {item.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  );
}
