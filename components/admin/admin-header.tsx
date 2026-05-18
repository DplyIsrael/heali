"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { MessageSquare, ChevronDown } from "lucide-react";
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
  { label: "דשבורד", href: "/admin" },
  { label: "טיפולים", href: "/admin/treatments" },
  { label: "מטפלים", href: "/admin/practitioners" },
  { label: "מטופלים", href: "/admin/patients" },
  { label: "קטגוריות", href: "/admin/categories" },
  { label: "התמחויות", href: "/admin/specialties" },
  { label: "חבילות טיפול", href: "/admin/packages" },
  { label: "תשלומים", href: "/admin/payouts" },
  { label: "מאמרים", href: "/admin/articles" },
] as const;

interface AdminHeaderProps {
  userName?: string;
  userAvatarUrl?: string;
  userId?: string;
}

export function AdminHeader({
  userName = "",
  userAvatarUrl,
  userId = "",
}: AdminHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  const isActive = (href: string) => {
    if (href === "/admin") return pathname === "/admin";
    return pathname.startsWith(href);
  };

  return (
    <header className="sticky top-0 z-50 h-[80px] w-full bg-white border-b border-border">
      <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-[50px]">
        {/* Left: user controls */}
        <div className="flex items-center gap-5">
          {/* User dropdown */}
          <DropdownMenu>
            <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
              <Avatar className="size-11">
                <AvatarImage src={userAvatarUrl} />
                <AvatarFallback className="bg-primary/10 text-primary text-sm">
                  {userName.slice(0, 2)}
                </AvatarFallback>
              </Avatar>
              <span className="text-[16px] font-sans">{userName}</span>
              <ChevronDown className="size-4 text-muted-foreground" />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-44">
              <DropdownMenuItem onClick={() => router.push("/admin/settings")}>
                אזור אישי
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

          {/* Icons */}
          <div className="flex items-center gap-3">
            <NotificationsBell userId={userId} variant="dark" />
            <button aria-label="הודעות" className="text-foreground hover:text-primary transition-colors">
              <MessageSquare className="size-5" />
            </button>
          </div>
        </div>

        {/* Center: nav + Right: logo */}
        <div className="flex items-center gap-[83px]">
          {/* Nav items (RTL order) */}
          <nav className="flex items-center gap-10">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-[18px] text-foreground transition-colors hover:text-primary whitespace-nowrap",
                  isActive(item.href)
                    ? "font-semibold" // Demi-bold
                    : "font-light"
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>

          {/* Logo */}
          <Logo />
        </div>
      </div>
    </header>
  );
}
