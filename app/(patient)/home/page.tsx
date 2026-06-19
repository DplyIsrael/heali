import Link from "next/link";
import Image from "next/image";
import { WandSparkles, Sparkles, Coins, Headset, ChevronLeft } from "lucide-react";
import { PractitionerCard, type PractitionerCardData } from "@/components/shared/practitioner-card";
import { searchPractitioners } from "@/app/(public)/discovery/actions";
import { fetchActiveCreditBalance } from "@/app/(public)/practitioners/[id]/book/actions";
import { fetchConversations, type ConversationListItem } from "@/lib/messaging/actions";

function HeroSearch() {
  return (
    <Link
      href="/discovery"
      className="flex h-[56px] md:h-[62px] w-full max-w-[840px] items-center justify-between gap-2 overflow-hidden rounded-[10px] border border-border-input bg-white p-[10px] shadow-sm"
    >
      {/* Placeholder (right in RTL) */}
      <span className="flex items-center gap-2 ps-2 text-[14px] md:text-[16px] text-[#b0b0b0] truncate">
        חיפוש מטפלים, תחום או תחושה…
        <Sparkles className="size-[14px] text-accent shrink-0" />
      </span>
      {/* Action button (left in RTL) */}
      <span className="flex h-full shrink-0 items-center justify-center gap-2 rounded-[8px] bg-primary px-4 md:px-5 text-[14px] md:text-[16px] text-white whitespace-nowrap">
        מצא את הטיפול שלך
        <WandSparkles className="size-[18px]" />
      </span>
    </Link>
  );
}

function WalletCard({ balance }: { balance: number }) {
  return (
    <Link
      href="/wallet"
      className="flex flex-col items-end gap-2 rounded-[10px] bg-white px-[13px] py-[18px] shadow-[0px_2px_8px_rgba(0,0,0,0.12)]"
    >
      <p className="text-[18px] font-medium text-black">הארנק שלי</p>
      <div className="flex items-center gap-[6px]">
        <span className="text-[16px] text-black">{balance.toLocaleString("he-IL")} ₪ זמינים לשימוש</span>
        <Coins className="size-[20px] text-accent" />
      </div>
      <p className="text-[14px] font-light text-muted-foreground">
        {balance > 0 ? "ניתן להשתמש ביתרה בעת הזמנת טיפול" : "זיכויים יופיעו כאן לאחר ביטול טיפול שחויב"}
      </p>
    </Link>
  );
}

function fmtTime(iso: string | null): string {
  if (!iso) return "";
  return new Date(iso).toLocaleString("he-IL", {
    day: "numeric",
    month: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function RecentMessages({ conversations }: { conversations: ConversationListItem[] }) {
  return (
    <div className="flex flex-col gap-3">
      <p className="text-[16px] font-medium text-black">הודעות אחרונות</p>
      {conversations.length === 0 ? (
        <p className="rounded-[10px] border border-border-input bg-white px-[10px] py-4 text-right text-[14px] font-light text-muted-foreground">
          אין הודעות עדיין
        </p>
      ) : (
        conversations.slice(0, 4).map((m) => (
          <div
            key={m.id}
            className="flex items-center gap-[10px] rounded-[10px] border border-border-input bg-white px-[10px] py-3"
          >
            {/* Text (right) */}
            <div className="flex flex-1 flex-col items-end gap-[7px] min-w-0">
              <p className="w-full text-right text-[16px] font-medium text-black truncate">{m.otherUserName}</p>
              {m.lastMessageAt && (
                <span className="rounded-[8px] bg-gradient-to-b from-[#ebecec] to-white px-3 py-1 text-[12px] font-light text-black">
                  {fmtTime(m.lastMessageAt)}
                </span>
              )}
              <p className="w-full text-right text-[14px] font-light leading-[18px] text-muted-foreground line-clamp-2">
                {m.lastMessage || "—"}
              </p>
            </div>
            {/* Avatar (left) */}
            <div className="relative size-[72px] shrink-0 overflow-hidden rounded-full bg-gradient-to-b from-[#ebecec] to-white">
              <Image
                src={m.otherUserAvatarUrl || "/images/practitioners/practitioner-1.jpg"}
                alt={m.otherUserName}
                fill
                className="object-cover"
              />
            </div>
          </div>
        ))
      )}
      <Link
        href="/patient-messages"
        className="flex items-center justify-center gap-1 pt-1 text-[14px] font-medium text-primary"
      >
        צפייה בכל ההודעות
        <ChevronLeft className="size-4" />
      </Link>
    </div>
  );
}

function HelpCta() {
  return (
    <section className="mx-auto max-w-[1340px] px-4 md:px-[50px] pb-12 md:pb-16">
      <div className="relative overflow-hidden rounded-[16px] bg-[#1d4847] px-6 py-10 md:px-12 md:py-0 md:min-h-[353px] flex items-center">
        {/* Decorative grid (right side) */}
        <div
          aria-hidden
          className="pointer-events-none absolute right-[-54px] top-1/2 hidden h-[506px] w-[546px] -translate-y-1/2 rotate-180 opacity-50 md:block"
          style={{ backgroundImage: "url('/images/patient-cta-grid.svg')", backgroundSize: "100% 100%" }}
        />
        <div className="relative z-10 flex w-full flex-col items-center justify-between gap-8 md:flex-row">
          {/* Heading + button (right in RTL) */}
          <div className="flex flex-col items-center gap-8 text-center md:items-end md:text-right">
            <h2 className="text-[32px] font-semibold leading-[1.15] text-white md:text-[48px] lg:text-[60px]">
              צריכים עזרה?
              <br />
              אנחנו כאן בשבילך תמיד.
            </h2>
            <Link
              href="/contact"
              className="flex h-[42px] w-[226px] items-center justify-center rounded-[10px] text-[16px] font-medium text-black"
              style={{
                background:
                  "radial-gradient(ellipse 120% 300% at 50% -80%, #abffbf 0%, #7deaa1 7%, #4ed584 14%, #54fdae 35%, #51ff97 50%, #7de4a8 70%, #b8ffbb 86%, #deffeb 100%)",
              }}
            >
              צור איתנו קשר
            </Link>
          </div>
          {/* Glass image card (left in RTL) */}
          <div className="relative flex w-[320px] max-w-full shrink-0 items-center justify-center rounded-[37px] border border-[#6ceea1] bg-white/[0.14] p-4 md:w-[420px]">
            <div className="relative aspect-[375/251] w-full overflow-hidden rounded-[18px]">
              <Image src="/images/patient-cta-person.png" alt="" fill className="object-cover" />
            </div>
            {/* Mic accent badge */}
            <div className="absolute -top-5 right-8 flex size-[52px] items-center justify-center rounded-full border-2 border-white bg-accent">
              <Headset className="size-6 text-[#1d4847]" />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

export default async function PatientHomePage() {
  // Real data — top-rated approved practitioners, the patient's wallet balance,
  // and their recent conversations. Empty states render when there's nothing yet.
  const [{ practitioners }, balance, conversations] = await Promise.all([
    searchPractitioners({ limit: 9, sortBy: "rating" }),
    fetchActiveCreditBalance(),
    fetchConversations(),
  ]);

  const cards: PractitionerCardData[] = practitioners.map((p) => ({
    id: p.id,
    name: p.name,
    domain: p.domainNames[0] ?? "",
    price: p.price,
    city: p.city,
    rating: p.rating,
    reviews: p.reviews,
    available: p.available,
    bio: p.bio,
    image: p.image,
  }));

  const availableToday = cards.filter((c) => c.available).slice(0, 3);
  const sections = [
    { title: "מטפלים מובילים", items: cards.slice(0, 3) },
    { title: "מומלצים עבורך", items: cards.slice(3, 6) },
    ...(availableToday.length ? [{ title: "זמינים היום", items: availableToday }] : []),
  ].filter((s) => s.items.length > 0);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <section
        className="relative bg-primary"
        style={{ backgroundImage: "url('/images/patient-hero-bg.svg')", backgroundSize: "100% 100%" }}
      >
        <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-16 md:py-[110px]">
          <div className="mx-auto flex max-w-[900px] flex-col items-center gap-[45px]">
            <div className="flex flex-col items-center gap-4 text-center">
              <h1 className="text-[32px] font-bold leading-none text-white md:text-[48px] lg:text-[64px]">
                כאן מתחיל החיבור <span className="text-accent">האמיתי שלכם</span>
              </h1>
              <p className="max-w-[709px] text-[16px] font-light leading-[1.3] text-white md:text-[20px]">
                כתבו מה אתם מחפשים, ואנו נציג בפניכם מטפלים ותחומים מקצועיים שיכולים להתאים לצרכים האישיים שלכם, מתוך אמינות ושקט נפשי מלא.
              </p>
            </div>
            <HeroSearch />
          </div>
        </div>
      </section>

      {/* Body — main column + sidebar */}
      <div className="mx-auto max-w-[1340px] px-4 md:px-[50px] py-8 md:py-12">
        <div className="flex flex-col gap-8 lg:flex-row lg:gap-10">
          {/* Main column (right in RTL) */}
          <div className="flex flex-1 flex-col gap-10 min-w-0">
            {sections.length === 0 ? (
              <p className="text-[16px] text-muted-foreground">לא נמצאו מטפלים זמינים כרגע.</p>
            ) : (
              sections.map((section) => (
                <section key={section.title}>
                  <h2 className="mb-5 text-[20px] font-medium text-black md:text-[22px]">{section.title}</h2>
                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
                    {section.items.map((p) => (
                      <PractitionerCard key={`${section.title}-${p.id}`} practitioner={p} />
                    ))}
                  </div>
                </section>
              ))
            )}
          </div>

          {/* Sidebar (left in RTL) */}
          <aside className="flex w-full shrink-0 flex-col gap-6 lg:w-[346px]">
            <WalletCard balance={balance} />
            <RecentMessages conversations={conversations} />
          </aside>
        </div>
      </div>

      {/* Help CTA */}
      <HelpCta />
    </div>
  );
}
