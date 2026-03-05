import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  href?: string;
  className?: string;
  light?: boolean; // white text on dark bg
}

export function Logo({ href = "/", className, light = false }: LogoProps) {
  return (
    <Link href={href} className={cn("flex flex-col items-start leading-none", className)}>
      <span
        className={cn(
          "font-logo text-[42px] tracking-[1.68px] leading-none",
          light ? "text-white" : "text-foreground"
        )}
      >
        Heali
      </span>
      <span
        className={cn(
          "text-[13px] tracking-wide -mt-1",
          light ? "text-white/70" : "text-muted-foreground"
        )}
      >
        Website concept
      </span>
    </Link>
  );
}
