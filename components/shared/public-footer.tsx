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

export function PublicFooter() {
  return (
    <footer className="bg-[#08190C] text-white">
      <div className="mx-auto max-w-[1440px] px-[50px] py-16">
        <div className="grid grid-cols-3 gap-12">
          {/* Categories */}
          <div>
            <h3 className="mb-4 text-[16px] font-semibold text-white/80">
              קטגוריות
            </h3>
            <ul className="space-y-2">
              {CATEGORIES.map((cat) => (
                <li key={cat}>
                  <Link
                    href="/discovery"
                    className="text-[14px] font-light text-white/60 hover:text-white transition-colors"
                  >
                    {cat}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Links */}
          <div>
            <h3 className="mb-4 text-[16px] font-semibold text-white/80">
              קישורים
            </h3>
            <ul className="space-y-2">
              {LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-[14px] font-light text-white/60 hover:text-white transition-colors"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Logo + description */}
          <div className="flex flex-col gap-4">
            <Logo light />
            <p className="text-[13px] font-light text-white/50 leading-relaxed">
              פלטפורמת הבריאות הטבעית המחברת בין מטופלים למטפלים המתאימים
              ביותר עבורם.
            </p>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-12 flex items-center justify-between border-t border-white/10 pt-6">
          {/* Social icons */}
          <div className="flex items-center gap-4">
            <Link
              href="#"
              aria-label="Facebook"
              className="text-white/50 hover:text-white transition-colors"
            >
              <Facebook className="size-5" />
            </Link>
            <Link
              href="#"
              aria-label="Instagram"
              className="text-white/50 hover:text-white transition-colors"
            >
              <Instagram className="size-5" />
            </Link>
            <Link
              href="#"
              aria-label="YouTube"
              className="text-white/50 hover:text-white transition-colors"
            >
              <Youtube className="size-5" />
            </Link>
          </div>

          {/* Legal links */}
          <div className="flex items-center gap-6 text-[13px] text-white/50">
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
