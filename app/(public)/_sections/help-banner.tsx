import Link from "next/link";
import { Button } from "@/components/ui/button";

export function HelpBanner() {
  return (
    <section className="w-full bg-primary py-16">
      <div className="mx-auto flex max-w-[1440px] items-center justify-between px-[50px]">
        {/* Text first → right in RTL */}
        <h2 className="text-[36px] font-light text-white text-right">
          צריכים עזרה?{" "}
          <span className="font-semibold">אנחנו כאן בשבילך תמיד.</span>
        </h2>
        {/* Button second → left in RTL */}
        <Button
          asChild
          className="rounded-full bg-accent px-8 text-[16px] font-semibold text-foreground hover:bg-accent/90"
        >
          <Link href="/contact">צור איתנו קשר</Link>
        </Button>
      </div>
    </section>
  );
}
