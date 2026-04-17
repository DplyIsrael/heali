import { ChevronLeft, ChevronRight, ArrowLeft } from "lucide-react";

const PACKAGES = [
  {
    id: "1",
    name: "להריון ולידה",
    description: "ריפוי מהבטן",
    badgeText: "חבילת טיפולים",
    gradient: "linear-gradient(to bottom, #ffd28b, #ffc15e)",
    badgeBg: "#fff6e6",
    badgeBorder: "#fed085",
    badgeText2: "#fed085",
    iconGradient: "radial-gradient(circle at center, #fce2b4 0%, #fecf81 100%)",
    iconShadow: "0px 4.5px 22.7px 0px #f2bd68",
  },
  {
    id: "2",
    name: "לספורטאים",
    description: "בוסט לשרירים",
    badgeText: "חבילת טיפולים",
    gradient: "linear-gradient(to bottom, #7de4a8, #4bb377)",
    badgeBg: "#deffec",
    badgeBorder: "#4cb578",
    badgeText2: "#4cb578",
    iconGradient: "radial-gradient(circle at center, #8de5b2 0%, #6ccd95 50%, #4bb477 100%)",
    iconShadow: "0px 4.5px 22.7px 0px rgba(100,111,198,0.25)",
  },
  {
    id: "3",
    name: "לחילופי עונות",
    description: "ריסטרט אביבי",
    badgeText: "חבילת טיפולים",
    gradient: "linear-gradient(to bottom, #ffd2c1, #ffa480)",
    badgeBg: "#ffdfd2",
    badgeBorder: "#ffa987",
    badgeText2: "#ffa987",
    iconGradient: "radial-gradient(circle at center, #fdd6c6 0%, #febea4 50%, #ffa581 100%)",
    iconShadow: "0px 4.5px 22.7px 0px #ffb091",
  },
  {
    id: "4",
    name: "חבילת הדגל",
    description: "כל המטפלים, כל הטיפולים",
    badgeText: "חבילת טיפולים",
    gradient: "linear-gradient(to bottom, #7ac1b9, #3d9b90)",
    badgeBg: "#b6f0ea",
    badgeBorder: "#449f94",
    badgeText2: "#449f94",
    iconGradient: "radial-gradient(circle at center, #89c8c0 0%, #63b2a8 50%, #3d9b90 100%)",
    iconShadow: "0px 3.5px 17.5px 0px #43938a",
  },
];

/* Checkerboard grid pattern */
function GridPattern() {
  return (
    <>
      <div className="absolute left-[146px] top-[-1px] rotate-180 flex items-center opacity-[0.16]">
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
      </div>
      <div className="absolute left-[146px] top-[36px] flex items-center opacity-[0.16]">
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
      </div>
      <div className="absolute left-[-12px] top-[258px] rotate-180 flex items-center opacity-[0.10]">
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
      </div>
      <div className="absolute left-[-12px] top-[295px] flex items-center opacity-[0.16]">
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] bg-[rgba(243,246,246,0.9)]" />
        <div className="size-[37.274px] border-[0.852px] border-[rgba(243,246,246,0.9)]" />
      </div>
    </>
  );
}

function PackageIcon() {
  return (
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none">
      <path
        d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22l1-2.3A4.49 4.49 0 0 0 8 20c4 0 8.71-3.13 9-9.34.81 1.92 1.46 3.79 1.72 5.84 2.47-1.55 4.39-4.32 3.28-8.5z"
        fill="white"
        opacity="0.9"
      />
    </svg>
  );
}

function PackageCard({ pkg }: { pkg: (typeof PACKAGES)[0] }) {
  return (
    <div
      className="relative w-full sm:w-[280px] lg:w-[300px] h-[329px] rounded-[16px] border border-white overflow-hidden shrink-0 shadow-[0px_3.525px_17.625px_0px_rgba(100,111,198,0.25)]"
      style={{ background: pkg.gradient }}
    >
      <GridPattern />

      <div
        className="absolute left-1/2 top-[calc(50%-35.5px)] -translate-x-1/2 -translate-y-1/2 size-[110px] rounded-full border-[3.4px] border-white flex items-center justify-center backdrop-blur-[11px]"
        style={{
          background: pkg.iconGradient,
          boxShadow: pkg.iconShadow,
        }}
      >
        <PackageIcon />
      </div>

      <div
        className="absolute right-[17px] top-[17px] flex items-center h-[28px] px-[10px] py-[2px] rounded-full"
        style={{
          backgroundColor: pkg.badgeBg,
          borderWidth: "0.7px",
          borderStyle: "solid",
          borderColor: pkg.badgeBorder,
        }}
      >
        <span className="text-[14px] whitespace-nowrap" style={{ color: pkg.badgeText2 }}>
          {pkg.badgeText}
        </span>
      </div>

      <div className="absolute right-[24px] top-[211px] flex flex-col gap-[8px] w-[252px] text-right text-white">
        <p className="text-[20px] font-bold leading-normal">{pkg.name}</p>
        <p className="text-[14px] font-light leading-[19.17px]">{pkg.description}</p>
      </div>

      <div className="absolute left-[17px] top-[272px] size-[38px] rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center">
        <ArrowLeft className="size-[18px] text-white" />
      </div>
    </div>
  );
}

export function PackagesTeaser() {
  return (
    <section className="bg-[#FAFAFA] w-full">
    <div className="relative mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
      {/* Section header */}
      <div className="flex flex-col items-center gap-3 md:gap-[18px] mb-8 md:mb-[55px]">
        <h2 className="text-[24px] md:text-[30px] font-semibold text-black text-center">
          חבילות הטיפולים שלנו
        </h2>
        <p className="text-[16px] md:text-[20px] font-light text-[#9f9f9f] text-center leading-[26px] max-w-[641px]">
          הדרך להוסיף איזון, בריאות ורוגע לחיים של מי שאוהבים
        </p>
      </div>

      {/* Cards row — horizontal scroll on mobile, centered grid on desktop */}
      <div className="flex gap-4 md:gap-10 justify-start md:justify-center overflow-x-auto pb-4 md:pb-0 md:overflow-visible snap-x snap-mandatory md:snap-none">
        {PACKAGES.map((pkg) => (
          <div key={pkg.id} className="snap-center shrink-0 sm:shrink">
            <PackageCard pkg={pkg} />
          </div>
        ))}
      </div>

      {/* Carousel navigation arrows — hidden on mobile */}
      <button className="hidden md:flex absolute right-[40px] top-[calc(50%+40px)] size-[46px] rounded-full border border-border bg-white items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
        <ChevronRight className="size-[22px] text-foreground" />
      </button>
      <button className="hidden md:flex absolute left-[40px] top-[calc(50%+40px)] size-[46px] rounded-full border border-border bg-white items-center justify-center shadow-sm hover:bg-gray-50 transition-colors">
        <ChevronLeft className="size-[22px] text-foreground" />
      </button>
    </div>
    </section>
  );
}
