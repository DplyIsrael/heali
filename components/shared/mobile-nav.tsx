"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Button } from "@/components/ui/button";

const NAV_ITEMS = [
  { label: "חיפוש מטפלים", href: "/discovery" },
  { label: "אודות", href: "/about" },
  { label: "חבילות טיפול", href: "/packages" },
  { label: "מאמרים", href: "/articles" },
  { label: "יצירת קשר", href: "/contact" },
] as const;

export function MobileNav() {
  const [isOpen, setIsOpen] = useState(false);
  const pathname = usePathname();

  return (
    <>
      {/* Hamburger button — visible only on mobile */}
      <Button
        variant="ghost"
        size="icon-sm"
        className="lg:hidden"
        onClick={() => setIsOpen(true)}
        aria-label="פתח תפריט"
      >
        <Menu className="size-6" />
      </Button>

      {/* Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/50 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Drawer — slides from right (start) in RTL */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 flex h-full w-[280px] flex-col bg-white shadow-2xl transition-transform duration-300 lg:hidden",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-border-input px-6 py-4">
          <Logo />
          <Button
            variant="ghost"
            size="icon-sm"
            onClick={() => setIsOpen(false)}
            aria-label="סגור תפריט"
          >
            <X className="size-5" />
          </Button>
        </div>

        {/* Nav items */}
        <nav className="flex flex-col gap-1 px-4 py-4">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              onClick={() => setIsOpen(false)}
              className={cn(
                "rounded-[8px] px-4 py-3 text-[16px] transition-colors",
                pathname.startsWith(item.href)
                  ? "bg-primary/10 font-medium text-primary"
                  : "text-foreground hover:bg-muted/20"
              )}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* Auth buttons */}
        <div className="mt-auto flex flex-col gap-3 border-t border-border-input px-6 py-6">
          <Link
            href="/login"
            onClick={() => setIsOpen(false)}
            className="flex h-12 items-center justify-center rounded-full bg-accent text-[16px] font-semibold text-foreground"
          >
            התחברות
          </Link>
          <Link
            href="/register"
            onClick={() => setIsOpen(false)}
            className="flex h-12 items-center justify-center rounded-full bg-muted/20 text-[16px] font-semibold text-foreground"
          >
            הרשמה
          </Link>
        </div>
      </div>
    </>
  );
}
