import Image from "next/image";
import Link from "next/link";

/* Floating avatar bubble with frosted glass ring */
function AvatarBubble({
  size,
  padding,
  top,
  left,
  image,
}: {
  size: number;
  padding: number;
  top: string;
  left: string;
  image: string;
}) {
  const outerSize = size + padding * 2;
  return (
    <div
      className="absolute rounded-full bg-[rgba(247,247,247,0.09)] flex items-center justify-center overflow-hidden"
      style={{
        width: outerSize,
        height: outerSize,
        top,
        left,
      }}
    >
      <div
        className="rounded-full overflow-hidden relative"
        style={{
          width: size,
          height: size,
        }}
      >
        <Image src={image} alt="" fill className="object-cover" />
      </div>
    </div>
  );
}

/* Support headset icon in green circle */
function SupportIcon() {
  return (
    <div className="absolute right-4 md:right-[40px] top-4 md:top-[30px] size-[46px] md:size-[58px] rounded-full bg-accent border-[1.3px] border-white flex items-center justify-center">
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
        <path d="M18 16.5V14a6 6 0 0 0-12 0v2.5" />
        <path d="M4 16.5C4 15.12 5.12 14 6.5 14H8v4H6.5C5.12 18 4 16.88 4 15.5v-1z" fill="white" stroke="none" />
        <path d="M16 14h1.5c1.38 0 2.5 1.12 2.5 2.5v0c0 1.38-1.12 2.5-2.5 2.5H16v-5z" fill="white" stroke="none" />
        <path d="M18 19c0 1.66-1.34 3-3 3h-2" />
      </svg>
    </div>
  );
}

export function HelpBanner() {
  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-4">
      <div className="rounded-[16px] bg-[#1d4847] overflow-hidden relative min-h-[250px] md:h-[300px]">

        {/* ── Left side: decorative constellation — hidden on mobile ── */}
        <div className="absolute left-[50px] top-1/2 -translate-y-1/2 w-[500px] h-[400px] hidden lg:block">
          <div className="absolute left-[120px] top-[80px] size-[240px] rounded-full border border-white/[0.08] bg-white/[0.04]" />
          <div className="absolute left-[145px] top-[105px] size-[190px] rounded-full border border-white/[0.06]" />
          <div className="absolute left-[170px] top-[130px] size-[140px] rounded-full bg-white/[0.06]" />

          <div className="absolute left-[60px] top-[20px] size-[360px] rounded-full border border-white/[0.06]" />
          <div className="absolute left-[20px] top-[-20px] size-[440px] rounded-full border border-white/[0.04]" />

          <div className="absolute left-[135px] top-[0px] w-px h-[400px] bg-white/[0.05]" />
          <div className="absolute left-[270px] top-[0px] w-px h-[400px] bg-white/[0.05]" />
          <div className="absolute left-[0px] top-[135px] w-[500px] h-px bg-white/[0.05]" />
          <div className="absolute left-[0px] top-[268px] w-[500px] h-px bg-white/[0.05]" />
          <div className="absolute left-[0px] top-[200px] w-[500px] h-px bg-white/[0.05]" />

          <AvatarBubble size={66} padding={28} top="-30px" left="230px" image="/images/avatars/avatar-1.jpg" />
          <AvatarBubble size={66} padding={28} top="-5px" left="10px" image="/images/avatars/avatar-2.jpg" />
          <AvatarBubble size={66} padding={28} top="190px" left="-30px" image="/images/avatars/avatar-3.jpg" />
          <AvatarBubble size={66} padding={16} top="105px" left="390px" image="/images/avatars/avatar-4.jpg" />
          <AvatarBubble size={63} padding={26} top="245px" left="210px" image="/images/avatars/avatar-5.jpg" />
        </div>

        {/* Support icon — top-right */}
        <SupportIcon />

        {/* ── Right side: text + CTA ── */}
        <div className="relative md:absolute right-0 md:right-[80px] top-0 md:top-1/2 md:-translate-y-1/2 flex flex-col gap-6 md:gap-[40px] items-center md:items-end p-8 pt-16 md:p-0 md:w-[574px]">
          <div className="flex flex-col gap-3 text-center md:text-right w-full">
            <p className="text-[28px] sm:text-[40px] md:text-[52px] font-semibold text-white leading-[1.1] md:leading-[56px]">
              עדיין לא מצאת את הטיפול שהכי מתאים לך?
            </p>
            <p className="text-[16px] md:text-[20px] font-light text-white/70">
              נשמח לעזור ולהכווין אותך
            </p>
          </div>

          <Link
            href="https://wa.me/972000000000"
            target="_blank"
            className="flex h-[42px] w-[226px] items-center justify-center rounded-[10px] text-[16px] font-medium text-black"
            style={{
              background:
                "radial-gradient(ellipse 120% 300% at 50% -80%, #abffbf 0%, #7deaa1 7%, #4ed584 14%, #54fdae 35%, #51ff97 50%, #7de4a8 70%, #b8ffbb 86%, #deffeb 100%)",
            }}
          >
            קחו אותי לווטסאפ
          </Link>
        </div>
      </div>
    </section>
  );
}
