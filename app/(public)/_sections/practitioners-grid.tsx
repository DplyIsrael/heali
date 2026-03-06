import Link from "next/link";
import { Search, ChevronDown, SlidersHorizontal, Star, MapPin } from "lucide-react";

const PRACTITIONERS = [
  { id: "1", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-rose-200" },
  { id: "2", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-amber-200" },
  { id: "3", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-pink-200" },
  { id: "4", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-sky-200" },
  { id: "5", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-rose-200" },
  { id: "6", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-amber-200" },
  { id: "7", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-pink-200" },
  { id: "8", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "זהו טקסט דמה שנועד להמחיש את מבנה התוכן באתר ניתן להחליפו בטקסט אמיתי בהמשך....", color: "bg-sky-200" },
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
    <div className="flex flex-col w-[300px] h-[408px] shadow-[0px_4px_21px_0px_rgba(0,0,0,0.07)] shrink-0 rounded-[20px] overflow-hidden">
      {/* Top — avatar area with gradient bg */}
      <div className="relative h-[177px] w-full rounded-t-[20px] overflow-hidden border border-white"
        style={{ background: "linear-gradient(to bottom, #ebecec 4%, white 120%)" }}
      >
        {/* Person image placeholder */}
        <div className={`absolute left-1/2 -translate-x-1/2 top-[6px] w-[199px] h-[170px] rounded-[12px] overflow-hidden ${p.color} flex items-end justify-center`}>
          <div className="w-[120px] h-[140px] bg-foreground/10 rounded-t-full" />
        </div>

        {/* Verified badge — top left (physical left since positioned absolutely) */}
        <div className="absolute left-[10px] top-[9px]">
          <VerifiedBadge />
        </div>

        {/* Bottom row inside top area — available badge + heart */}
        <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
          {/* Available badge — first = right in RTL */}
          {p.available && (
            <div className="flex items-center gap-1 bg-[#eefff3] rounded-full h-[28px] px-[10px]">
              <span className="text-[14px] text-[#0d8a27]">זמין לקבל היום</span>
              <div className="size-[8px] rounded-full bg-[#00d22c]" />
            </div>
          )}
          {/* Heart icon — last = left in RTL */}
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
            {/* Domain + price pills — RTL: first = right */}
            <div className="flex items-center gap-2">
              {/* Domain pill — first = right in RTL */}
              <div
                className="flex items-center justify-end h-[24px] px-[10px] rounded-full border border-[#d7d7d7]"
                style={{ backgroundImage: "linear-gradient(104deg, #ebecec 161%, white 99%)" }}
              >
                <span className="text-[12px] font-light text-black whitespace-nowrap">{p.domain}</span>
              </div>
              {/* Price pill — second = left in RTL */}
              <div
                className="flex items-center justify-end h-[24px] px-[10px] rounded-full border border-[#d7d7d7]"
                style={{ backgroundImage: "linear-gradient(112deg, #ebecec 161%, white 99%)" }}
              >
                <span className="text-[12px] font-light text-black whitespace-nowrap">מחיר לטיפול {p.price}₪</span>
              </div>
            </div>

            {/* Name + bio + rating/location */}
            <div className="flex flex-col gap-[10px] items-end w-full">
              <div className="flex flex-col gap-[6px] items-end w-full">
                <p className="text-[20px] font-medium text-black whitespace-nowrap">{p.name}</p>
                <p className="text-[14px] font-light text-[#9f9f9f] leading-[18px] text-right w-full">
                  {p.bio}
                </p>
              </div>

              {/* Location + rating row — RTL: first = right */}
              <div className="flex items-center justify-between w-full">
                {/* Location — first = right in RTL */}
                <div className="flex items-center gap-1">
                  <MapPin className="size-[20px] text-accent" />
                  <span className="text-[14px] text-black">{p.city}</span>
                </div>
                {/* Rating — second = left in RTL */}
                <div className="flex items-center gap-[6px]">
                  <Star className="size-[20px] fill-[#f5a623] text-[#f5a623]" />
                  <span className="text-[16px] text-black">
                    <span className="font-normal">{p.rating} </span>
                    <span className="font-light">(דרוג {p.reviews})</span>
                  </span>
                </div>
              </div>
            </div>

            {/* Separator */}
            <div className="w-full h-px bg-border" />
          </div>

          {/* Action buttons — RTL: first = right */}
          <div className="flex items-center gap-2 w-full">
            {/* "קביעת טיפול" first = right in RTL */}
            <Link
              href={`/practitioners/${p.id}/book`}
              className="flex items-center justify-center w-[136px] rounded-[8px] bg-accent p-[10px] text-[16px] text-black"
            >
              קביעת טיפול
            </Link>
            {/* "צפייה בפרופיל" second = left in RTL */}
            <Link
              href={`/practitioners/${p.id}`}
              className="flex items-center justify-center w-[136px] rounded-[8px] bg-[#f4f7f7] p-[10px] text-[16px] text-black"
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
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      {/* Title */}
      <div className="mb-[30px]">
        <h2 className="text-[30px] text-right text-black">
          <span className="font-bold">גלו את המטפלים שלנו</span>
          <span className="font-light"> (2858)</span>
        </h2>
      </div>

      {/* Toolbar — RTL: first in DOM = right side */}
      <div className="mb-10 flex items-center justify-between">
        {/* Right group: search input + dropdowns + settings icon (first in DOM = right in RTL) */}
        <div className="flex items-center gap-[10px]">
          {/* Search input — rightmost */}
          <div className="flex h-[50px] w-[578px] items-center gap-[7px] rounded-[16px] border border-border bg-white px-[10px]">
            <Search className="size-[22px] text-foreground shrink-0" />
            <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">חפש מטפלים או תחומים...</span>
          </div>

          {/* Sort by category */}
          <button className="flex h-[50px] w-[229px] items-center justify-between rounded-[16px] border border-border bg-white px-3">
            <ChevronDown className="size-[24px] text-foreground" />
            <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">מיון לפי קטגוריה</span>
          </button>

          {/* Sort by specialty */}
          <button className="flex h-[50px] w-[229px] items-center justify-between rounded-[16px] border border-border bg-white px-3">
            <ChevronDown className="size-[24px] text-foreground" />
            <span className="text-[14px] font-[family-name:var(--font-poppins)] text-black tracking-[-0.28px]">מיון לפי התמחות</span>
          </button>

          {/* Settings icon button — leftmost of this group */}
          <button className="flex h-[50px] w-[54px] items-center justify-center rounded-[16px] border border-border bg-white">
            <SlidersHorizontal className="size-[24px] text-foreground rotate-90" />
          </button>
        </div>

        {/* Search CTA button — last in DOM = left in RTL */}
        <div className="flex h-[50px] w-[164px] items-center justify-center rounded-[10px] bg-primary cursor-pointer">
          <span className="text-[16px] text-white">חיפוש</span>
        </div>
      </div>

      {/* Grid — 4 columns, 2 rows, 40px gap */}
      <div className="flex flex-col gap-10">
        <div className="flex gap-10 justify-center">
          {PRACTITIONERS.slice(0, 4).map((p) => (
            <PractitionerCard key={p.id} p={p} />
          ))}
        </div>
        <div className="flex gap-10 justify-center">
          {PRACTITIONERS.slice(4, 8).map((p) => (
            <PractitionerCard key={p.id} p={p} />
          ))}
        </div>
      </div>
    </section>
  );
}
