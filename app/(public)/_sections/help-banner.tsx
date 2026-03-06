import Link from "next/link";

export function HelpBanner() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-4">
      <div className="rounded-[20px] bg-primary overflow-hidden relative">
        {/* Subtle dot pattern */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage: `radial-gradient(circle at 1px 1px, white 1px, transparent 0)`,
            backgroundSize: "20px 20px",
          }}
        />

        <div className="relative flex items-center justify-between px-[60px] py-14">
          {/* Text first → right in RTL */}
          <div>
            <h2 className="text-[34px] font-semibold text-white leading-tight">
              צריכים עזרה?
            </h2>
            <p className="mt-1 text-[22px] font-light text-white/80">
              אנחנו כאן בשבילך תמיד.
            </p>
          </div>
          {/* Button second → left in RTL */}
          <Link
            href="/contact"
            className="flex h-[48px] items-center justify-center rounded-full bg-accent px-10 text-[16px] font-semibold text-foreground hover:bg-accent/90 transition-colors"
          >
            צור איתנו קשר
          </Link>
        </div>
      </div>
    </section>
  );
}
