"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { MobileNav } from "@/components/shared/mobile-nav";

const NAV_ITEMS = [
  { label: "חיפוש מטפלים", href: "/discovery" },
  { label: "אודות", href: "/about" },
  { label: "חבילות טיפול", href: "/packages" },
  { label: "מאמרים", href: "/articles" },
  { label: "יצירת קשר", href: "/contact" },
] as const;

export function PublicHeader() {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full bg-white">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-[60px] py-[10px]">

        {/* RIGHT side in RTL (first in DOM): logo + nav grouped */}
        <div className="flex items-center gap-[83px]">
          {/* Logo first → rightmost in RTL */}
          <Logo />
          {/* Nav second → left of logo in RTL (hidden on mobile) */}
          <nav className="hidden items-center gap-[50px] lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[18px] text-foreground transition-colors hover:text-primary whitespace-nowrap leading-[1.2]",
                  pathname.startsWith(item.href) ? "font-medium" : "font-normal"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* LEFT side in RTL (second in DOM): auth buttons (hidden on mobile) */}
        <div className="hidden items-center gap-[11px] lg:flex">
          <Link
            href="/login"
            className="flex h-[42px] w-[125px] items-center justify-center rounded-full bg-[#7de4a8] text-[16px] text-[#102424] whitespace-nowrap"
          >
            התחברות
          </Link>
          <Link
            href="/register"
            className="flex h-[42px] w-[125px] items-center justify-center rounded-full bg-[#f4f7f7] text-[16px] text-[#102424] whitespace-nowrap"
          >
            הרשמה
          </Link>
        </div>

        {/* Mobile hamburger menu */}
        <MobileNav />

      </div>
    </header>
  );
}
