import Link from "next/link";
import { Star, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

// Placeholder practitioners — replaced with DB query in Phase 5
const PRACTITIONERS = [
  { id: "1", name: "ליאת גולדנברג", domain: "עיסוי טיפולי", city: "יפו - תל אביב", rating: 4.9, reviews: 500, price: 250, available: true },
  { id: "2", name: "יוסי כהן", domain: "דיקור סיני", city: "ירושלים", rating: 4.7, reviews: 312, price: 300, available: true },
  { id: "3", name: "מיכל לוי", domain: "רפלקסולוגיה", city: "חיפה", rating: 4.8, reviews: 198, price: 200, available: false },
  { id: "4", name: "אבי ישראל", domain: "יוגה", city: "רמת גן", rating: 4.6, reviews: 420, price: 180, available: true },
];

export function PractitionersGrid() {
  return (
    <section className="mx-auto max-w-[1440px] px-[50px] py-16">
      {/* Header + toolbar */}
      <div className="mb-6 flex items-end justify-between">
        {/* Title first → right in RTL */}
        <div className="text-right">
          <h2 className="text-[32px] font-medium text-foreground">
            גלו את המטפלים שלנו{" "}
            <span className="text-[20px] text-muted-foreground">(2858)</span>
          </h2>
          <p className="mt-1 text-[14px] font-light text-muted-foreground">
            חפש מטפלים או תחומים...
          </p>
        </div>
        {/* Button second → left in RTL */}
        <div className="flex items-center gap-3">
          <Button asChild variant="outline" className="rounded-[10px] border-border font-[family-name:var(--font-poppins)]">
            <Link href="/discovery">חיפוש</Link>
          </Button>
        </div>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-4 gap-5">
        {PRACTITIONERS.map((p) => (
          <div
            key={p.id}
            className="flex flex-col rounded-[16px] border border-border bg-white p-5 shadow-sm"
          >
            {/* Avatar + available badge */}
            <div className="relative mb-4">
              <Avatar className="size-20 mx-auto">
                <AvatarFallback className="bg-primary/10 text-primary text-2xl">
                  {p.name.slice(0, 1)}
                </AvatarFallback>
              </Avatar>
              {p.available && (
                <span className="absolute top-0 right-0 rounded-full bg-accent px-2 py-0.5 text-[11px] font-medium text-foreground">
                  זמין לקבל היום
                </span>
              )}
            </div>

            {/* Info */}
            <h3 className="text-center text-[17px] font-medium text-foreground">
              {p.name}
            </h3>
            <p className="mt-1 text-center text-[13px] font-light text-muted-foreground">
              {p.domain}
            </p>

            {/* Rating */}
            <div className="mt-2 flex items-center justify-center gap-1">
              <Star className="size-4 fill-yellow-400 text-yellow-400" />
              <span className="text-[13px] font-medium">{p.rating}</span>
              <span className="text-[12px] text-muted-foreground">({p.reviews})</span>
            </div>

            {/* Location + price */}
            <div className="mt-2 flex items-center justify-between text-[13px] text-muted-foreground">
              <span className="font-medium text-foreground">₪{p.price}</span>
              <div className="flex items-center gap-1">
                <MapPin className="size-3" />
                <span className="font-light">{p.city}</span>
              </div>
            </div>

            {/* Actions */}
            <div className="mt-4 flex gap-2">
              <Button
                asChild
                variant="outline"
                className="flex-1 rounded-[8px] border-primary text-primary hover:bg-primary/5 text-[13px]"
              >
                <Link href={`/practitioners/${p.id}`}>צפייה בפרופיל</Link>
              </Button>
              <Button
                asChild
                className="flex-1 rounded-[8px] bg-accent text-foreground hover:bg-accent/90 text-[13px]"
              >
                <Link href={`/practitioners/${p.id}/book`}>קביעת טיפול</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 text-center">
        <Button asChild variant="outline" className="rounded-full px-8 border-primary text-primary">
          <Link href="/discovery">לכל המטפלים</Link>
        </Button>
      </div>
    </section>
  );
}
