import Link from "next/link";
import { ArrowLeft } from "lucide-react";

const PACKAGES = [
  { name: "חבילת עיסוי מלא", description: "5 טיפולי עיסוי מקצועיים לגוף ולנפש", treatments: 5, price: 220, gradient: "from-[#21544E] to-[#3a8a7a]" },
  { name: "חבילת רפלקסולוגיה", description: "4 טיפולי רפלקסולוגיה לאיזון ורוגע", treatments: 4, price: 190, gradient: "from-[#7DE4A8] to-[#4fc88e]" },
  { name: "חבילת ריפוי הוליסטי", description: "6 טיפולים משלימים לבריאות כוללת", treatments: 6, price: 250, gradient: "from-[#6c63ff] to-[#9b8fff]" },
];

export function PackagesTeaser() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      <div className="mb-8 flex items-end justify-between">
        {/* Title first → right in RTL */}
        <div className="text-right">
          <h2 className="text-[32px] font-medium text-foreground">חבילות טיפול</h2>
          <p className="mt-1 text-[14px] font-light text-muted-foreground">כ 16 חבילות</p>
        </div>
        {/* Link second → left in RTL */}
        <Link href="/packages" className="flex items-center gap-1 text-[14px] font-medium text-primary hover:underline">
          <ArrowLeft className="size-4" />
          לכל החבילות
        </Link>
      </div>

      <div className="grid grid-cols-3 gap-6">
        {PACKAGES.map((pkg) => (
          <Link
            key={pkg.name}
            href="/packages"
            className={`group relative overflow-hidden rounded-[20px] bg-gradient-to-br ${pkg.gradient} p-8 text-white transition-transform hover:scale-[1.02]`}
          >
            {/* Glassmorphism icon */}
            <div className="mb-4 flex size-14 items-center justify-center rounded-[16px] bg-white/20 backdrop-blur-sm text-2xl">
              🌿
            </div>
            <h3 className="text-[20px] font-semibold">{pkg.name}</h3>
            <p className="mt-2 text-[14px] font-light text-white/80">{pkg.description}</p>
            <div className="mt-4 flex items-center justify-between">
              <span className="text-[18px] font-bold">₪{pkg.price} / טיפול</span>
              <span className="text-[13px] text-white/70">{pkg.treatments} טיפולים</span>
            </div>
            <ArrowLeft className="absolute bottom-6 left-6 size-5 opacity-60 transition-opacity group-hover:opacity-100" />
          </Link>
        ))}
      </div>
    </section>
  );
}
