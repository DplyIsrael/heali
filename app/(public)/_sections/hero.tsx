import Image from "next/image";
import Link from "next/link";

const CATEGORIES = ["פסיכולוגיה", "יוגה", "מדיטציה", "דיקור סיני"];

export function Hero() {
  return (
    <div className="mx-auto max-w-[1440px] px-[50px]">
    <section className="relative h-[880px] w-full overflow-hidden rounded-[20px]">
      {/* Background photo */}
      <Image
        src="/images/hero-bg.jpg"
        alt=""
        fill
        priority
        className="object-cover object-center"
      />

      {/* Girl cutout — positioned per Figma: left-[-41px] top-[131px] size-[811px] */}
      <div className="absolute top-[131px] left-[-41px] size-[811px]">
        <Image
          src="/images/hero-girl-hq.png"
          alt=""
          fill
          priority
          className="object-contain"
        />
      </div>

      {/* Dark gradient overlay on right 702px for text readability */}
      <div
        className="absolute right-0 top-0 h-full w-[702px]"
        style={{
          background:
            "linear-gradient(to right, rgba(0,0,0,0), rgba(3,6,4,0.33) 24%, rgba(4,7,4,0.4) 100%)",
        }}
      />

      {/* Content block — right side, vertically centered */}
      <div className="absolute inset-0 flex items-center">
        <div className="relative mx-auto w-full max-w-[1440px] h-full">
          <div className="absolute right-[92px] top-1/2 -translate-y-1/2 flex flex-col gap-10 items-end">

            {/* Headline + subtext */}
            <div className="flex flex-col gap-[18px] items-end">
              <h1 className="text-[64px] leading-none text-white text-right">
                <span className="font-light block">כל הכלים במקום אחד</span>
                <span className="font-light block">בכדי למצוא את המטפל</span>
                <span className="font-bold block">שמרגיש לך טבעי ונכון.</span>
              </h1>
              <p className="text-[20px] font-light text-[#f3f3f3] text-right max-w-[599px]">
                בHeali תמצאו את המטפלים שמרגישים לכם נכון – כי ריפוי מתחיל בחיבור אישי.
              </p>
            </div>

            {/* Search — glassmorphism container */}
            <div className="w-[599px] bg-[rgba(255,255,255,0.31)] border border-[rgba(255,255,255,0.33)] rounded-[16px] shadow-[0px_21px_44.6px_-10px_rgba(0,0,0,0.08)] p-4 flex items-center">
              <div className="w-full h-[62px] bg-white border border-[#a7d6b4] rounded-[16px] flex items-center justify-between overflow-hidden px-[10px]">
                {/* Input first → right side in RTL (natural Hebrew typing position) */}
                <input
                  type="text"
                  placeholder="חיפוש מטפלים, תחום או תחושה…"
                  className="flex-1 h-full bg-transparent px-4 font-[family-name:var(--font-poppins)] text-[16px] text-right text-foreground placeholder:text-[#b0b0b0] outline-none"
                />

                {/* CTA button second → left side in RTL */}
                <button
                  className="h-[42px] w-[191px] flex items-center justify-center gap-[10px] rounded-[8px] shrink-0 border border-[#d2ffe5]"
                  style={{
                    background:
                      "radial-gradient(ellipse 120% 300% at 50% -80%, #abffbf 0%, #7deaa1 7%, #4ed584 14%, #54fdae 35%, #51ff97 50%, #7de4a8 70%, #b8ffbb 86%, #deffeb 100%)",
                  }}
                >
                  <span className="text-[16px] font-normal text-black whitespace-nowrap">
                    מצא את הטיפול שלך
                  </span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/hero-magicpen.svg"
                    alt=""
                    width={20}
                    height={20}
                    className="shrink-0"
                  />
                </button>
              </div>
            </div>

            {/* Popular categories */}
            <div className="flex flex-col gap-[18px] items-end">
              <p className="text-[16px] text-[#f3f3f3] text-right">
                קטגוריות פופולריות
              </p>
              <div className="flex gap-[14px] items-center">
                {CATEGORIES.map((cat) => (
                  <Link
                    key={cat}
                    href={`/discovery?category=${encodeURIComponent(cat)}`}
                    className="h-[40px] px-4 flex items-center gap-[10px] backdrop-blur-[3px] bg-[rgba(0,0,0,0.35)] border border-[#f3f3f3] rounded-bl-[16px] rounded-tl-[16px] rounded-tr-[16px] whitespace-nowrap"
                  >
                    <span className="text-[18px] text-[#f3f3f3]">{cat}</span>
                  </Link>
                ))}
              </div>
            </div>

          </div>
        </div>
      </div>
    </section>
    </div>
  );
}
