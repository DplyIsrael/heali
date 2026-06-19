import Link from "next/link";
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

export default async function PackagesPage({
  searchParams,
}: {
  searchParams: Promise<{ tab?: string }>;
}) {
  const { tab } = await searchParams;
  const activeTab: "all" | "mine" = tab === "mine" ? "mine" : "all";

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  const isLoggedIn = !!user;

  const packages = activeTab === "all" ? await fetchPackages() : [];

  // "My Packages" data source is intentionally an empty list for now —
  // package purchase tracking (`package_purchases` table + booking FK)
  // is gated on the domain/payout business rules. Empty-state UI ships
  // first so IA/copy can be validated in parallel.
  const myPackages: Array<unknown> = [];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
        <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">חבילות טיפול</h1>
        <p className="text-[16px] text-muted-foreground mb-8">
          חסכו עם חבילות הטיפול שלנו — מחירים מוזלים לטיפולים מרובים
        </p>

        {/* Tab switcher — matches practitioner profile page pattern */}
        <div className="flex rounded-[10px] bg-white p-[6px] mb-8 w-full max-w-[420px]">
          <Link
            href="/packages"
            className={`flex-1 py-2.5 rounded-[8px] text-[16px] text-center transition-colors ${
              activeTab === "all" ? "bg-accent font-normal text-black" : "font-light text-black"
            }`}
          >
            כל החבילות
          </Link>
          <Link
            href="/packages?tab=mine"
            className={`flex-1 py-2.5 rounded-[8px] text-[16px] text-center transition-colors ${
              activeTab === "mine" ? "bg-accent font-normal text-black" : "font-light text-black"
            }`}
          >
            החבילות שלי
          </Link>
        </div>

        {activeTab === "all" ? (
          packages.length === 0 ? (
            <p className="text-center text-muted-foreground py-20">חבילות טיפול יפורסמו בקרוב</p>
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
          )
        ) : !isLoggedIn ? (
          <div className="rounded-[20px] border border-border bg-white py-16 px-6 text-center">
            <h2 className="text-[22px] md:text-[24px] font-semibold text-black mb-2">
              התחברו כדי לראות את החבילות שלכם
            </h2>
            <p className="text-[15px] font-light text-muted-foreground mb-6 max-w-[420px] mx-auto">
              החבילות שתרכשו יופיעו כאן לאחר ההתחברות.
            </p>
            <Link
              href="/login"
              className="inline-flex h-[44px] items-center justify-center rounded-[10px] bg-primary px-8 text-[16px] font-medium text-white hover:bg-primary/90 transition-colors"
            >
              התחברות
            </Link>
          </div>
        ) : myPackages.length === 0 ? (
          <div className="rounded-[20px] border border-border bg-white py-16 px-6 text-center">
            <h2 className="text-[22px] md:text-[24px] font-semibold text-black mb-2">
              עדיין לא רכשתם חבילות
            </h2>
            <p className="text-[15px] font-light text-muted-foreground mb-6 max-w-[420px] mx-auto">
              כאן יופיעו החבילות שתרכשו, עם מספר הטיפולים שנותרו ותוקף השימוש.
            </p>
            <Link
              href="/packages"
              className="inline-flex h-[44px] items-center justify-center rounded-[10px] bg-accent px-8 text-[16px] font-medium text-black hover:bg-accent/90 transition-colors"
            >
              עיינו בחבילות שלנו
            </Link>
          </div>
        ) : null}
      </div>
    </div>
  );
}
