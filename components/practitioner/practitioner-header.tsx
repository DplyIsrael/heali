"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Bell } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

const NAV_ITEMS = [
  { label: "דשבורד", href: "/practitioner/dashboard" },
  { label: "המטופלים שלי", href: "/practitioner/patients" },
  { label: "היומן שלי", href: "/practitioner/calendar" },
  { label: "מאמרים", href: "/practitioner/articles" },
] as const;

interface PractitionerHeaderProps {
  userName?: string;
  userAvatarUrl?: string;
  unreadNotifications?: number;
}

export function PractitionerHeader({
  userName = "",
  userAvatarUrl,
  unreadNotifications = 0,
}: PractitionerHeaderProps) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar — dark teal */}
      <div className="h-[60px] w-full bg-primary">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-[50px]">
          {/* Left: notifications + avatar */}
          <div className="flex items-center gap-4">
            <button
              aria-label="התראות"
              className="relative text-white hover:text-accent transition-colors"
            >
              <Bell className="size-5" />
              {unreadNotifications > 0 && (
                <span className="absolute -top-1 -right-1 flex size-4 items-center justify-center rounded-full bg-destructive text-[10px] text-white">
                  {unreadNotifications}
                </span>
              )}
            </button>
            <Avatar className="size-9">
              <AvatarImage src={userAvatarUrl} />
              <AvatarFallback className="bg-white/20 text-white text-sm">
                {userName.slice(0, 2)}
              </AvatarFallback>
            </Avatar>
          </div>

          {/* Right: logo */}
          <Logo light />
        </div>
      </div>

      {/* Nav bar — white */}
      <div className="h-[50px] w-full bg-white border-b border-border">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-end px-[50px]">
          <nav className="flex items-center gap-10">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/practitioner/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-[16px] text-foreground transition-colors hover:text-primary whitespace-nowrap pb-[2px]",
                    active ? "font-semibold" : "font-light"
                  )}
                >
                  {item.label}
                  {active && (
                    <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-accent rounded-full" />
                  )}
                </Link>
              );
            })}
          </nav>
        </div>
      </div>
    </header>
  );
}
