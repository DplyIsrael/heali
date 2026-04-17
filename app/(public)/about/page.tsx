import { PublicHeader } from "@/components/shared/public-header";
import { PublicFooter } from "@/components/shared/public-footer";

export default function AboutPage() {
  return (
    <>
      <div className="w-full bg-primary relative overflow-hidden">
        <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-16 md:py-24 relative">
          {/* Decorative circles */}
          <div className="absolute left-[10%] top-1/2 -translate-y-1/2 hidden lg:block">
            <div className="relative w-[300px] h-[300px]">
              <div className="absolute left-0 top-0 size-[200px] rounded-full bg-[#2d6b5f] opacity-40" />
              <div className="absolute left-[80px] top-[40px] size-[180px] rounded-full bg-accent opacity-30" />
            </div>
          </div>

          <div className="relative z-10 flex flex-col items-end gap-6 md:gap-8 max-w-[700px] me-0 ms-auto">
            <p className="text-[20px] md:text-[24px] text-white/70">אודות</p>
            <h1 className="text-[40px] md:text-[60px] lg:text-[70px] font-bold text-white text-right leading-[1.1]">
              !נעים להכיר
            </h1>
            <div className="flex flex-col gap-4 text-[16px] md:text-[20px] text-white/80 text-right leading-relaxed">
              <p>
                אנחנו ב-Heali מאמינים שכל אדם ראוי לגישה פשוטה, נוחה ומהירה לטיפולים
                שיכולים לשפר את איכות החיים שלו. הפלטפורמה שלנו נולדה מתוך הבנה עמוקה
                שעולם הרפואה המשלימה מלא באפשרויות מדהימות — אבל קשה לנווט בו לבד.
              </p>
              <p>
                לכן יצרנו מקום אחד שמרכז את כל המטפלים המוסמכים, כל סוגי הטיפולים,
                וכל המידע שתצטרכו כדי לבחור נכון. כל מטפל בפלטפורמה עבר תהליך אימות
                מקצועי, כך שתוכלו להיות רגועים ולדעת שאתם בידיים הטובות ביותר.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
