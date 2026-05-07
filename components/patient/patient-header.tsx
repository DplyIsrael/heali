"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/shared/logo";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { signOut } from "@/app/(public)/auth/actions";
import { NotificationsBell } from "@/components/shared/notifications-bell";

const NAV_ITEMS = [
  { label: "דף בית", href: "/" },
  { label: "חיפוש מטפלים", href: "/discovery" },
  { label: "הטיפולים שלי", href: "/my-treatments" },
  { label: "חבילות טיפול", href: "/packages" },
  { label: "מאמרים", href: "/articles" },
] as const;

interface PatientHeaderProps {
  userName?: string;
  userAvatarUrl?: string;
  userId?: string;
  points?: number;
}

export function PatientHeader({
  userName = "",
  userAvatarUrl,
  userId = "",
  points = 0,
}: PatientHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full bg-white border-b border-border">
      <div className="mx-auto flex h-[80px] max-w-[1440px] items-center justify-between px-4 md:px-[60px]">
        {/* RIGHT side in RTL: logo + nav */}
        <div className="flex items-center gap-6 lg:gap-[60px]">
          <Logo />
          <nav className="hidden items-center gap-5 xl:gap-[40px] lg:flex">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[16px] text-foreground transition-colors hover:text-primary whitespace-nowrap",
                  (item.href === "/" ? pathname === "/" : pathname.startsWith(item.href))
                    ? "font-medium"
                    : "font-normal"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* LEFT side in RTL: user controls */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <NotificationsBell userId={userId} variant="dark" />

          {/* Points badge */}
          {points > 0 && (
            <div className="hidden md:flex items-center gap-1.5 h-[36px] px-4 rounded-[8px] bg-primary text-white text-[14px]">
              <span>{points} נקודות</span>
            </div>
          )}

          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="size-[44px]">
                <AvatarImage src={userAvatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {userName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="hidden md:inline text-[16px] text-foreground">{userName}</span>
              <ChevronDown className="size-4 text-muted" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push("/patient-profile")}>
                אזור אישי
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => router.push("/favorites")}>
                המועדפים שלי
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => signOut()}
                className="text-destructive focus:text-destructive"
              >
                התנתקות
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
