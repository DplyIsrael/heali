"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";

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
          {/* Nav second → left of logo in RTL */}
          <nav className="flex items-center gap-[50px]">
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

        {/* LEFT side in RTL (second in DOM): auth buttons */}
        <div className="flex items-center gap-[11px]">
          {/* התחברות first → right of the auth group */}
          <Link
            href="/login"
            className="flex h-[42px] w-[125px] items-center justify-center rounded-full bg-[#7de4a8] text-[16px] text-[#102424] whitespace-nowrap"
          >
            התחברות
          </Link>
          {/* הרשמה second → left of the auth group */}
          <Link
            href="/register"
            className="flex h-[42px] w-[125px] items-center justify-center rounded-full bg-[#f4f7f7] text-[16px] text-[#102424] whitespace-nowrap"
          >
            הרשמה
          </Link>
        </div>

      </div>
    </header>
  );
}
