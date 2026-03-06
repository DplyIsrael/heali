import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { Youtube, Instagram, Facebook } from "lucide-react";

const CATEGORIES = [
  "עיסוי טיפולי",
  "רפלקסולוגיה",
  "היפנוזה טיפולית",
  "טיפול בצמחי מרפא",
];

const LINKS = [
  { label: "דף הבית", href: "/" },
  { label: "בלוג", href: "/articles" },
  { label: "שאלות תשובות", href: "/faq" },
];

function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 0011.14 4.13V12.9a8.28 8.28 0 005.3 1.91V11.4a4.85 4.85 0 01-3-.71V6.69h3z" />
    </svg>
  );
}

export function PublicFooter() {
  return (
    <footer className="bg-[#08190C] text-white">
      <div className="mx-auto max-w-[1440px] px-[50px] py-16">
        <div className="grid grid-cols-3 gap-12">
          {/* Categories — first = right in RTL */}
          <div>
            <h3 className="mb-5 text-[16px] font-semibold text-white/80">
              קטגוריות
            </h3>
            <ul className="space-y-3">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href="/discovery"
                    className="text-[14px] font-light text-white/50 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links — center */}
          <div>
            <h3 className="mb-5 text-[16px] font-semibold text-white/80">
              קישורים
            </h3>
            <ul className="space-y-3">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] font-light text-white/50 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo + description — last = left in RTL */}
          <div className="flex flex-col gap-4">
            <Logo light />
            <p className="text-[13px] font-light text-white/40 leading-relaxed max-w-[280px]">
              פלטפורמת הבריאות הטבעית המחברת בין מטופלים למטפלים המתאימים
              ביותר עבורם.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-14 flex items-center justify-between border-t border-white/10 pt-6">
          {/* Social icons — first = right in RTL */}
          <div className="flex items-center gap-4">
            <Link href="#" aria-label="Facebook" className="text-white/40 hover:text-white transition-colors">
              <Facebook className="size-[18px]" />
            </Link>
            <Link href="#" aria-label="Instagram" className="text-white/40 hover:text-white transition-colors">
              <Instagram className="size-[18px]" />
            </Link>
            <Link href="#" aria-label="TikTok" className="text-white/40 hover:text-white transition-colors">
              <TikTokIcon className="size-[18px]" />
            </Link>
            <Link href="#" aria-label="YouTube" className="text-white/40 hover:text-white transition-colors">
              <Youtube className="size-[18px]" />
            </Link>
          </div>

          {/* Legal links — second = left in RTL */}
          <div className="flex items-center gap-6 text-[13px] text-white/40">
            <Link href="/accessibility" className="hover:text-white transition-colors">נגישות</Link>
            <Link href="/privacy" className="hover:text-white transition-colors">פרטיות</Link>
            <Link href="/terms" className="hover:text-white transition-colors">תנאי שימוש</Link>
            <span>© 2025 Heali</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
