import Link from "next/link";
import { Search, ChevronDown } from "lucide-react";
import { PractitionerCard, type PractitionerCardData } from "@/components/shared/practitioner-card";

const PRACTITIONERS: PractitionerCardData[] = [
  { id: "1", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", image: "/images/practitioners/practitioner-1.jpg" },
  { id: "2", name: "דני כהן", domain: "עיסוי טיפולי", price: 180, city: "חיפה", rating: "4.9/5", reviews: 320, available: true, bio: "מטפל מוסמך עם ניסיון של מעל 10 שנים בתחום העיסוי הטיפולי והרפואה המשלימה.", image: "/images/practitioners/practitioner-2.jpg" },
  { id: "3", name: "שרה לוי", domain: "מדיטציה", price: 120, city: "ירושלים", rating: "4.7/5", reviews: 215, available: true, bio: "מורה למדיטציה ומיינדפולנס, מלווה מטופלים בתהליכי הרפיה והפחתת מתח.", image: "/images/practitioners/practitioner-3.jpg" },
  { id: "4", name: "יוסי מזרחי", domain: "רפלקסולוגיה", price: 160, city: "רמת גן", rating: "4.6/5", reviews: 180, available: false, bio: "רפלקסולוג מוסמך המתמחה בטיפול בכאבים כרוניים ושיפור מחזור הדם.", image: "/images/practitioners/practitioner-4.jpg" },
  { id: "5", name: "מיכל אברהם", domain: "יוגה", price: 90, city: "תל אביב", rating: "4.9/5", reviews: 450, available: true, bio: "מורה ליוגה טיפולית עם התמחות ביוגה לנשים בהריון ולאחר לידה.", image: "/images/practitioners/practitioner-5.jpg" },
  { id: "6", name: "אורי שמש", domain: "היפנוזה טיפולית", price: 200, city: "הרצליה", rating: "4.8/5", reviews: 290, available: true, bio: "מטפל בהיפנוזה קלינית, מסייע בהתמודדות עם חרדות, פחדים והרגלים.", image: "/images/practitioners/practitioner-6.jpg" },
  { id: "7", name: "נעמי רוזן", domain: "צמחי מרפא", price: 170, city: "כפר סבא", rating: "4.5/5", reviews: 140, available: true, bio: "מומחית לרפואה טבעית וצמחי מרפא, מתמחה בטיפול הוליסטי ומותאם אישית.", image: "/images/practitioners/practitioner-7.jpg" },
  { id: "8", name: "רון דוד", domain: "פסיכולוגיה", price: 250, city: "באר שבע", rating: "4.7/5", reviews: 380, available: true, bio: "פסיכולוג קליני מומחה בטיפול CBT, מלווה מטופלים בתהליכי שינוי והתפתחות.", image: "/images/practitioners/practitioner-8.jpg" },
];

export function PractitionersGrid() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
      {/* Title + Subtitle */}
      <div className="mb-6 md:mb-[30px]">
        <h2 className="text-[24px] md:text-[30px] text-right text-black">
          <span className="font-bold">המטפלים המוסמכים שלנו</span>
          <span className="font-light"> (2858)</span>
        </h2>
        <p className="text-[16px] md:text-[18px] font-light text-[#9f9f9f] text-right mt-2">
          אנחנו אישרנו, אתם דירגתם
        </p>
      </div>

      {/* Toolbar — stacks on mobile */}
      <div className="mb-6 md:mb-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Right group: search input + dropdowns */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-[10px]">
          {/* Search input */}
          <div className="flex h-[50px] w-full sm:flex-1 lg:w-[400px] lg:flex-none items-center gap-[7px] rounded-[16px] border border-border bg-white px-[10px]">
            <Search className="size-[22px] text-foreground shrink-0" />
            <span className="text-[14px] font-[family-name:var(--font-poppins)] text-[#b0b0b0] tracking-[-0.28px]">כאן מחפשים טיפולים</span>
          </div>

          <div className="flex gap-3 lg:gap-[10px]">
            {/* Area filter */}
            <button className="flex h-[50px] flex-1 lg:w-[200px] lg:flex-none items-center justify-between rounded-[16px] border border-border bg-white px-3">
              <ChevronDown className="size-[24px] text-foreground" />
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">אזור בארץ</span>
            </button>

            {/* Treatment type filter */}
            <button className="flex h-[50px] flex-1 lg:w-[200px] lg:flex-none items-center justify-between rounded-[16px] border border-border bg-white px-3">
              <ChevronDown className="size-[24px] text-foreground" />
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">סוג טיפול</span>
            </button>

            {/* What is treatment for filter */}
            <button className="flex h-[50px] flex-1 lg:w-[230px] lg:flex-none items-center justify-between rounded-[16px] border border-border bg-white px-3">
              <ChevronDown className="size-[24px] text-foreground" />
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px] hidden sm:inline">למה הטיפול מיועד</span>
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px] sm:hidden">מיועד ל</span>
            </button>
          </div>
        </div>

        {/* Search CTA button */}
        <Link href="/discovery" className="flex h-[50px] w-full lg:w-[190px] items-center justify-center rounded-[10px] bg-primary cursor-pointer">
          <span className="text-[16px] text-white">תמצאו לי טיפול</span>
        </Link>
      </div>

      {/* Grid — responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
        {PRACTITIONERS.map((p) => (
          <PractitionerCard key={p.id} practitioner={p} />
        ))}
      </div>
    </section>
  );
}
