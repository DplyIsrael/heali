import Image from "next/image";
import { Star } from "lucide-react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";

const FAQ_ITEMS = [
  {
    q: "למה דווקא Heali?",
    a: "Heali הוא האתר היחיד שמרכז עבורך את כל הטיפולים והמטפלים במקום אחד. כאן קל לסנן ולבחור את הטיפול המדויק בשבילך, כשכל המטפלים עברו בקרת איכות והם הטובים ביותר בתחומם. מעבר לזה, אנחנו תמיד זמינים לתת ייעוץ אישי, ולעזור לך למצוא את הטיפול שהכי נכון עבורך. ולא רק זה, המטפלים בHeali מציעים מחירים נוחים יותר מאלה שבקליניקות הפרטיות, לצד חבילות טיפול מוזלות, היסטוריית טיפולים מסודרת וצוות נגיש לכל התייעצות או שאלה.",
  },
  {
    q: "איך אוכל לדעת שהמטפלים בHeali באמת מקצועיים?",
    a: "אם יש משהו שלא התפשרנו עליו זה מקצועיות המטפלים. כל מטפל ומטפלת בHeali עברו סינון קפדני, כדי שנוכל להיות בטוחים שהטיפול שמגיע לך הוא הטוב ביותר.",
  },
  {
    q: "מה ההבדל בין Heali לבין חיפוש מטפל בגוגל או בפייסבוק?",
    a: "בHeali אנחנו מתאימים עבורך מטפל או מטפלת בדיוק לפי הצורך שלך, ומאפשרים לך למצוא מטפלים נוספים לפי מסננים כמו אזור, סוג טיפול ועוד. בנוסף לזה, יש לנו צוות מקצועי שזמין בשבילך בווטסאפ, כדי לעזור לך למצוא את ההתאמה המושלמת. במנועי חיפוש או רשתות חברתיות קשה לדעת מי המטפל ומה ההכשרה שלו. אצלנו כל המטפלים עברו סינון ובדיקת איכות, כך שאפשר להיות רגועים ולדעת שמקבלים את הטוב ביותר.",
  },
  {
    q: "איך מתבצעת ההתאמה בין מטפל למטופל?",
    a: "ההתאמה מתבצעת בעזרת שאלון איפיון שנבקש ממך למלא בתחילת ההרשמה. ובנוסף לזה, הצוות המקצועי שלנו זמין בשבילך כדי לעזור לך למצוא את ההתאמה המושלמת.",
  },
  {
    q: "האם יש התחייבות או מנוי?",
    a: "אין שום התחייבות. אפשר להתחיל עם טיפולים בודדים, אפשר לרכוש חבילות טיפולים במחיר מוזל, ואפשר אפילו לקנות מתנה למי שאוהבים.",
  },
  {
    q: "מה קורה אם לא התחברתי למטפל?",
    a: "זה ממש בסדר! בHeali יש לנו מבחר עצום של אפשרויות. לא התחברת למטפל או מטפלת? אפשר לכתוב לנו, ואנחנו נעשה התאמה מחודשת - עד שיהיה לך נוח ונעים.",
  },
  {
    q: "למה לי חבילת טיפולים ומה היא כוללת?",
    a: "חבילות הטיפול הן הדרך שלנו לפנק אותך, לגרום לך להתמיד ולהביא שינוי אמיתי בחיים שלך. חבילות הטיפול מחולקות לפי נושאים, והן במחירים אטרקטיביים לעומת טיפולים בודדים. וכבר אמרנו שאפשר לשלוח חבילת טיפולים במתנה למי שאוהבים?",
  },
  {
    q: "האם הטיפולים מתאימים גם למצבים רפואיים ספציפיים?",
    a: "בהחלט כן. טיפולים ברפואה משלימה מתאימים למגוון מצבים רפואיים ספציפיים. אם יש לך התלבטות על איזה סוג טיפול או מטפל הכי מתאים לך - אפשר לכתוב לנו, ונשמח לעזור, לייעץ ולהתאים את הטיפול הנכון.",
  },
  {
    q: "איפה מתקיימים הטיפולים?",
    a: "הטיפולים מתקיימים בקליניקות פרטיות של המטפלים השונים. יש גם מטפלים שמקבלים אונליין או בבית הלקוח/ה.",
  },
  {
    q: "האם ניתן לקבל החזר מקופות חולים / ביטוחים / קרנות?",
    a: "בטח! היתרון שלנו בHeali זה שאנחנו מרכזים לך את כל הטיפולים בחשבונית אחת נוחה כדי שאפשר יהיה להעביר לחברות ביטוח/הקרן לסיוע/ביטוח לאומי ועוד. גם בנושא הזה אנחנו זמינים כדי לעזור במה שצריך.",
  },
];

export function Faq() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
      {/* Section header */}
      <div className="mb-8 md:mb-10 text-center">
        <h2 className="text-[24px] md:text-[30px] font-semibold text-foreground">שאלות ותשובות</h2>
        <p className="mt-3 mx-auto max-w-[700px] text-[14px] md:text-[15px] font-light text-muted-foreground leading-relaxed">
          עושים סדר בכל מה שרצית לדעת
        </p>
      </div>

      <div className="flex flex-col lg:flex-row gap-6 lg:gap-10">
        {/* FAQ accordion — right side (first in DOM = right in RTL) */}
        <div className="flex-1">
          <Accordion type="single" collapsible className="space-y-3">
            {FAQ_ITEMS.map((item, i) => (
              <AccordionItem
                key={i}
                value={`item-${i}`}
                className="rounded-[12px] border border-border bg-white px-4 md:px-6 shadow-sm"
              >
                <AccordionTrigger className="text-right text-[15px] md:text-[16px] font-medium text-foreground hover:no-underline py-4 md:py-5">
                  {item.q}
                </AccordionTrigger>
                <AccordionContent className="text-right text-[14px] font-light text-muted-foreground leading-relaxed">
                  {item.a}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Testimonial quote card — stacks below on mobile */}
        <div className="w-full lg:w-[320px] lg:shrink-0">
          <div className="rounded-[20px] bg-[#f4f7f7] p-6 md:p-7 flex flex-col">
            <div className="size-[56px] rounded-full overflow-hidden mb-4 relative">
              <Image src="/images/practitioners/practitioner-1.jpg" alt="רחל כהן" fill className="object-cover" />
            </div>

            <div className="flex gap-0.5 mb-3">
              {[1, 2, 3, 4, 5].map((s) => (
                <Star key={s} className="size-4 fill-[#f5c518] text-[#f5c518]" />
              ))}
            </div>

            <p className="text-[15px] font-light text-foreground leading-relaxed mb-4">
              &quot;אחרי שנים של חיפוש, מצאתי ב-Heali את המטפל שבאמת מבין אותי.
              התהליך היה פשוט ומהיר, וההמלצות היו מדויקות.&quot;
            </p>

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
