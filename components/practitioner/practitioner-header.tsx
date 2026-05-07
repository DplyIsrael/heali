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
  { label: "הקליניקה שלי", href: "/dashboard" },
  { label: "המטופלים שלי", href: "/my-patients" },
  { label: "היומן שלי", href: "/availability" },
  { label: "התוכן שלי", href: "/practitioner-articles" },
] as const;

interface PractitionerHeaderProps {
  userName?: string;
  userAvatarUrl?: string;
  userId?: string;
}

export function PractitionerHeader({
  userName = "",
  userAvatarUrl,
  userId = "",
}: PractitionerHeaderProps) {
  const pathname = usePathname();
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full">
      {/* Top bar — dark teal */}
      <div className="h-[60px] w-full bg-primary">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-between px-4 md:px-[50px]">
          {/* Left: notifications + avatar dropdown */}
          <div className="flex items-center gap-4">
            <NotificationsBell userId={userId} variant="light" />

            {/* Profile dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger className="flex items-center gap-2 outline-none">
                <Avatar className="size-9 cursor-pointer">
                  <AvatarImage src={userAvatarUrl} />
                  <AvatarFallback className="bg-white/20 text-white text-sm">
                    {userName.slice(0, 2)}
                  </AvatarFallback>
                </Avatar>
                <ChevronDown className="size-4 text-white/70" />
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-44">
                <DropdownMenuItem onClick={() => router.push("/profile")}>
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
          </div>

          {/* Right: logo */}
          <Logo light />
        </div>
      </div>

      {/* Nav bar — white */}
      <div className="h-[50px] w-full bg-white border-b border-border">
        <div className="mx-auto flex h-full max-w-[1440px] items-center justify-end px-4 md:px-[50px]">
          <nav className="flex items-center gap-6 md:gap-10">
            {NAV_ITEMS.map((item) => {
              const active =
                item.href === "/dashboard"
                  ? pathname === item.href
                  : pathname.startsWith(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "relative text-[14px] md:text-[16px] text-foreground transition-colors hover:text-primary whitespace-nowrap pb-[2px]",
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
