import { createClient } from "@/lib/supabase/server";

const GRADIENT_MAP: Record<string, string> = {
  teal: "from-[#21544E] to-[#2d7a6f]",
  green: "from-[#166534] to-[#22c55e]",
  purple: "from-[#581c87] to-[#a855f7]",
  orange: "from-[#9a3412] to-[#f97316]",
};

async function fetchPackages() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("treatment_packages")
    .select("*")
    .order("created_at", { ascending: false });
  return data ?? [];
}

export default async function PackagesPage() {
  const packages = await fetchPackages();

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">חבילות טיפול</h1>
        <p className="text-[16px] text-muted mb-8">
          חסכו עם חבילות הטיפול שלנו — מחירים מוזלים לטיפולים מרובים
        </p>

        {packages.length === 0 ? (
          <p className="text-center text-muted py-20">חבילות טיפול יפורסמו בקרוב</p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {packages.map((pkg) => {
              const gradient = GRADIENT_MAP[pkg.gradient_theme] ?? GRADIENT_MAP.teal;
              const totalPrice = pkg.num_treatments * Number(pkg.price_per_treatment);

              return (
                <div
                  key={pkg.id}
                  className={`rounded-[20px] bg-gradient-to-br ${gradient} p-6 text-white shadow-lg hover:scale-[1.02] transition-transform`}
                >
                  <div className="size-[48px] rounded-[12px] bg-white/20 backdrop-blur flex items-center justify-center mb-4">
                    <span className="text-[20px]">✦</span>
                  </div>
                  <h3 className="text-[20px] font-bold mb-2">{pkg.name}</h3>
                  {pkg.description && (
                    <p className="text-[14px] text-white/80 mb-4 line-clamp-3">{pkg.description}</p>
                  )}
                  <div className="flex items-baseline gap-1 mb-1">
                    <span className="text-[28px] font-bold">₪{Number(pkg.price_per_treatment)}</span>
                    <span className="text-[14px] text-white/70">לטיפול</span>
                  </div>
                  <p className="text-[14px] text-white/70 mb-4">
                    {pkg.num_treatments} טיפולים · סה״כ ₪{totalPrice}
                  </p>
                  <button className="w-full h-[44px] rounded-[8px] bg-white/20 backdrop-blur text-[16px] font-medium text-white hover:bg-white/30 transition-colors">
                    לפרטים נוספים
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
