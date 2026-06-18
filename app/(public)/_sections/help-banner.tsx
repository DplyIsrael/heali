import Link from "next/link";

/* Authentic WhatsApp glyph — same path reused from app/(public)/contact/page.tsx
   so the brand mark stays consistent across the site. */
function WhatsAppIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden="true"
    >
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z" />
    </svg>
  );
}

export function HelpBanner() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-12 md:py-20">
      <div className="relative w-full overflow-hidden rounded-[20px] border border-[#E6EDEC] bg-white px-6 py-14 md:px-16 md:py-20 lg:py-24">
        {/* Soft teal corner wash — anchors the white card to the Heali palette.
            Logical -end-32 keeps it pinned to the visual top-right in RTL today
            and to the trailing edge under any future LTR locale. */}
        <div
          aria-hidden="true"
          className="pointer-events-none absolute -top-32 -end-32 h-[420px] w-[420px] rounded-full opacity-[0.06] blur-3xl"
          style={{
            background:
              "radial-gradient(circle, #21544E 0%, transparent 70%)",
          }}
        />

        {/* items-start in flex-col under dir=rtl aligns children to the visual RIGHT */}
        <div className="relative mx-auto flex max-w-[820px] flex-col items-start gap-6 md:gap-8">
          {/* Eyebrow with live-channel pulse — grafted from whatsapp-native.
              flex-wrap keeps the dot adjacent to the label if it ever breaks. */}
          <div className="flex max-w-full flex-wrap items-center gap-x-2.5 gap-y-1">
            <span aria-hidden="true" className="relative flex h-2 w-2 shrink-0">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-[#7DE4A8] opacity-70 motion-reduce:animate-none" />
              <span className="relative inline-flex h-2 w-2 rounded-full bg-[#7DE4A8]" />
            </span>
            <span className="text-[12px] font-medium text-[#21544E] md:text-[13px]">
              <span className="tracking-[0.18em]">HEALI</span>
              <span aria-hidden="true">{" · "}</span>
              <span>זמינים עכשיו בוואטסאפ</span>
            </span>
          </div>

          {/* Headline — typography does the work */}
          <h2 className="text-right text-[30px] leading-[1.15] text-[#0C2826] sm:text-[40px] sm:leading-[1.1] md:text-[58px] md:leading-[1.08] lg:text-[68px] lg:leading-[1.05]">
            <span className="block font-light">
              עדיין מחפשים את הטיפול הנכון?
            </span>
            <span className="block font-bold">
              דברו{" "}
              <span className="relative inline-block">
                איתנו
                <span
                  aria-hidden="true"
                  className="absolute inset-x-0 -bottom-[2px] h-[3px] rounded-full bg-[#7DE4A8] md:-bottom-[6px] md:h-[5px]"
                />
              </span>
              .
            </span>
          </h2>

          {/* Subtitle — one breath */}
          <p className="max-w-[560px] text-right text-[16px] font-light text-[#0C2826]/60 md:text-[19px]">
            רגע אחד בוואטסאפ — ונמצא לכם בדיוק את מה שצריך.
          </p>

          {/* CTA — wide pill, WhatsApp glyph inset on the trailing edge.
              In RTL: badge is LAST in DOM = visual LEFT, text leads from the RIGHT.
              Reading flow: eye reads label right-to-left and lands on the icon.
              Mobile: full-width up to 420px so the badge can't overflow on 320px
              viewports. md+: collapses to inline-flex at intrinsic width. */}
          <Link
            href="https://wa.me/972512727631"
            target="_blank"
            rel="noopener noreferrer"
            aria-label="פתחו שיחת וואטסאפ עם הצוות של Heali"
            className="group mt-2 flex w-full max-w-[420px] items-center justify-between gap-3 rounded-full bg-[#7DE4A8] py-2 pe-2 ps-5 text-[#0C2826] shadow-[0_10px_30px_-12px_rgba(125,228,168,0.55)] transition-all duration-200 hover:-translate-y-[1px] hover:bg-[#6CD89A] hover:shadow-[0_14px_36px_-12px_rgba(125,228,168,0.7)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#21544E] focus-visible:ring-offset-2 focus-visible:ring-offset-white motion-reduce:transition-none motion-reduce:hover:translate-y-0 md:inline-flex md:w-auto md:gap-4 md:py-2.5 md:pe-2 md:ps-10"
          >
            <span className="whitespace-nowrap text-[16px] font-medium leading-[1.15] md:text-[18px]">
              שלחו לנו הודעה בוואטסאפ
            </span>
            {/* h-11 w-11 = 44px = WCAG 2.5.5 floor — do not shrink below this */}
            <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[#0C2826] text-[#7DE4A8] transition-transform duration-200 group-hover:rotate-[-8deg] motion-reduce:transition-none motion-reduce:group-hover:rotate-0 md:h-12 md:w-12">
              <WhatsAppIcon className="h-5 w-5 md:h-[22px] md:w-[22px]" />
            </span>
          </Link>

          {/* Trust micro-line — softens the ask. Solid teal at 85% passes
              WCAG AA at 12-13px (~6.4:1) instead of the prior 3.3:1. */}
          <p className="text-right text-[12px] font-light text-[#21544E]/85 md:text-[13px]">
            בני אדם אמיתיים · תשובה תוך דקות
          </p>
        </div>
      </div>
    </section>
  );
}
