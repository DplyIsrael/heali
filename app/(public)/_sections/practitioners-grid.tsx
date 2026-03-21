import Image from "next/image";
import Link from "next/link";
import { Search, ChevronDown, SlidersHorizontal, Star, MapPin } from "lucide-react";

const PRACTITIONERS = [
  { id: "1", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", image: "/images/practitioners/practitioner-1.jpg" },
  { id: "2", name: "דני כהן", domain: "עיסוי טיפולי", price: 180, city: "חיפה", rating: "4.9/5", reviews: 320, available: true, bio: "מטפל מוסמך עם ניסיון של מעל 10 שנים בתחום העיסוי הטיפולי והרפואה המשלימה.", image: "/images/practitioners/practitioner-2.jpg" },
  { id: "3", name: "שרה לוי", domain: "מדיטציה", price: 120, city: "ירושלים", rating: "4.7/5", reviews: 215, available: true, bio: "מורה למדיטציה ומיינדפולנס, מלווה מטופלים בתהליכי הרפיה והפחתת מתח.", image: "/images/practitioners/practitioner-3.jpg" },
  { id: "4", name: "יוסי מזרחי", domain: "רפלקסולוגיה", price: 160, city: "רמת גן", rating: "4.6/5", reviews: 180, available: false, bio: "רפלקסולוג מוסמך המתמחה בטיפול בכאבים כרוניים ושיפור מחזור הדם.", image: "/images/practitioners/practitioner-4.jpg" },
  { id: "5", name: "מיכל אברהם", domain: "יוגה", price: 90, city: "תל אביב", rating: "4.9/5", reviews: 450, available: true, bio: "מורה ליוגה טיפולית עם התמחות ביוגה לנשים בהריון ולאחר לידה.", image: "/images/practitioners/practitioner-5.jpg" },
  { id: "6", name: "אורי שמש", domain: "היפנוזה טיפולית", price: 200, city: "הרצליה", rating: "4.8/5", reviews: 290, available: true, bio: "מטפל בהיפנוזה קלינית, מסייע בהתמודדות עם חרדות, פחדים והרגלים.", image: "/images/practitioners/practitioner-6.jpg" },
  { id: "7", name: "נעמי רוזן", domain: "צמחי מרפא", price: 170, city: "כפר סבא", rating: "4.5/5", reviews: 140, available: true, bio: "מומחית לרפואה טבעית וצמחי מרפא, מתמחה בטיפול הוליסטי ומותאם אישית.", image: "/images/practitioners/practitioner-7.jpg" },
  { id: "8", name: "רון דוד", domain: "פסיכולוגיה", price: 250, city: "באר שבע", rating: "4.7/5", reviews: 380, available: true, bio: "פסיכולוג קליני מומחה בטיפול CBT, מלווה מטופלים בתהליכי שינוי והתפתחות.", image: "/images/practitioners/practitioner-8.jpg" },
];

function VerifiedBadge() {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-[12px] font-light text-black leading-none">+10</span>
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
        <circle cx="10.5" cy="10.5" r="10.5" fill="#dcfce7"/>
        <circle cx="10.5" cy="10.5" r="5.75" fill="#7de4a8" stroke="white" strokeWidth="0.3"/>
        <path d="M8 10.5L9.8 12.3L13 8.7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    </div>
  );
}

function PractitionerCard({ p }: { p: typeof PRACTITIONERS[0] }) {
  return (
    <div className="flex flex-col w-full md:w-[300px] h-[408px] shadow-[0px_4px_21px_0px_rgba(0,0,0,0.07)] shrink-0 rounded-[20px] overflow-hidden">
      {/* Top — avatar area with gradient bg */}
      <div className="relative h-[177px] w-full rounded-t-[20px] overflow-hidden border border-white"
        style={{ background: "linear-gradient(to bottom, #ebecec 4%, white 120%)" }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-[6px] w-[199px] h-[170px] rounded-[12px] overflow-hidden">
          <Image src={p.image} alt={p.name} fill className="object-cover" />
        </div>

        <div className="absolute left-[10px] top-[9px]">
          <VerifiedBadge />
        </div>

        <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
          {p.available && (
            <div className="flex items-center gap-1 bg-[#eefff3] rounded-full h-[28px] px-[10px]">
              <span className="text-[14px] text-[#0d8a27]">זמין לקבל היום</span>
              <div className="size-[8px] rounded-full bg-[#00d22c]" />
            </div>
          )}
          <div className="size-[28px] rounded-full bg-white/80 flex items-center justify-center">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-muted-foreground">
              <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/>
            </svg>
          </div>
        </div>
      </div>

      {/* Bottom — info area */}
      <div className="flex flex-col flex-1 bg-white border border-white rounded-b-[20px] p-[10px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[14px] items-end">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-end h-[24px] px-[10px] rounded-full border border-[#d7d7d7]"
                style={{ backgroundImage: "linear-gradient(104deg, #ebecec 161%, white 99%)" }}
              >
                <span className="text-[12px] font-light text-black whitespace-nowrap">{p.domain}</span>
              </div>
              <div
                className="flex items-center justify-end h-[24px] px-[10px] rounded-full border border-[#d7d7d7]"
                style={{ backgroundImage: "linear-gradient(112deg, #ebecec 161%, white 99%)" }}
              >
                <span className="text-[12px] font-light text-black whitespace-nowrap">מחיר לטיפול {p.price}₪</span>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] items-end w-full">
              <div className="flex flex-col gap-[6px] items-end w-full">
                <p className="text-[20px] font-medium text-black whitespace-nowrap">{p.name}</p>
                <p className="text-[14px] font-light text-[#9f9f9f] leading-[18px] text-right w-full">
                  {p.bio}
                </p>
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <MapPin className="size-[20px] text-accent" />
                  <span className="text-[14px] text-black">{p.city}</span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <Star className="size-[20px] fill-[#f5a623] text-[#f5a623]" />
                  <span className="text-[16px] text-black">
                    <span className="font-normal">{p.rating} </span>
                    <span className="font-light">(דרוג {p.reviews})</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border" />
          </div>

          <div className="flex items-center gap-2 w-full">
            <Link
              href={`/practitioners/${p.id}/book`}
              className="flex items-center justify-center flex-1 md:w-[136px] md:flex-none rounded-[8px] bg-accent p-[10px] text-[16px] text-black"
            >
              קביעת טיפול
            </Link>
            <Link
              href={`/practitioners/${p.id}`}
              className="flex items-center justify-center flex-1 md:w-[136px] md:flex-none rounded-[8px] bg-[#f4f7f7] p-[10px] text-[16px] text-black"
            >
              צפייה בפרופיל
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export function PractitionersGrid() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
      {/* Title */}
      <div className="mb-6 md:mb-[30px]">
        <h2 className="text-[24px] md:text-[30px] text-right text-black">
          <span className="font-bold">גלו את המטפלים שלנו</span>
          <span className="font-light"> (2858)</span>
        </h2>
      </div>

      {/* Toolbar — stacks on mobile */}
      <div className="mb-6 md:mb-10 flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
        {/* Right group: search input + dropdowns + settings icon */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 lg:gap-[10px]">
          {/* Search input */}
          <div className="flex h-[50px] w-full sm:flex-1 lg:w-[578px] lg:flex-none items-center gap-[7px] rounded-[16px] border border-border bg-white px-[10px]">
            <Search className="size-[22px] text-foreground shrink-0" />
            <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">חפש מטפלים או תחומים...</span>
          </div>

          <div className="flex gap-3 lg:gap-[10px]">
            {/* Sort by category */}
            <button className="flex h-[50px] flex-1 lg:w-[229px] lg:flex-none items-center justify-between rounded-[16px] border border-border bg-white px-3">
              <ChevronDown className="size-[24px] text-foreground" />
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">מיון לפי קטגוריה</span>
            </button>

            {/* Sort by specialty */}
            <button className="flex h-[50px] flex-1 lg:w-[229px] lg:flex-none items-center justify-between rounded-[16px] border border-border bg-white px-3">
              <ChevronDown className="size-[24px] text-foreground" />
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px] hidden sm:inline">מיון לפי התמחות</span>
              <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px] sm:hidden">התמחות</span>
            </button>

            {/* Settings icon button */}
            <button className="flex h-[50px] w-[54px] shrink-0 items-center justify-center rounded-[16px] border border-border bg-white">
              <SlidersHorizontal className="size-[24px] text-foreground rotate-90" />
            </button>
          </div>
        </div>

        {/* Search CTA button */}
        <div className="flex h-[50px] w-full lg:w-[164px] items-center justify-center rounded-[10px] bg-primary cursor-pointer">
          <span className="text-[16px] text-white">חיפוש</span>
        </div>
      </div>

      {/* Grid — responsive columns */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 md:gap-10">
        {PRACTITIONERS.map((p) => (
          <PractitionerCard key={p.id} p={p} />
        ))}
      </div>
    </section>
  );
}
