"use client";

import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Star, MapPin } from "lucide-react";

// Placeholder matched practitioners — will be replaced with real matching query
const MOCK_PRACTITIONERS = [
  {
    id: "1",
    name: "ליאת גולדנברג",
    domain: "דיקור סיני",
    city: "תל אביב - יפו",
    rating: 4.8,
    reviewCount: 24,
    price: 250,
    imageUrl: null,
  },
  {
    id: "2",
    name: "דר׳ יוסי כהן",
    domain: "נטורופתיה",
    city: "חיפה",
    rating: 4.9,
    reviewCount: 31,
    price: 300,
    imageUrl: null,
  },
  {
    id: "3",
    name: "מיכל אברהם",
    domain: "רפלקסולוגיה",
    city: "ירושלים",
    rating: 4.7,
    reviewCount: 18,
    price: 200,
    imageUrl: null,
  },
];

export default function OnboardingResultsPage() {
  const router = useRouter();

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="mx-auto w-full max-w-[800px] px-6 pt-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-[36px] font-semibold leading-tight text-foreground">
            מצאנו לך מטפלים מתאימים!
          </h1>
          <p className="mt-3 text-[18px] font-light text-[#666]">
            בהתאם לפרטים ולהעדפות שלך, הנה המטפלים שמתאימים לך ביותר
          </p>
        </div>

        {/* Practitioner cards */}
        <div className="mt-10 flex flex-col gap-4">
          {MOCK_PRACTITIONERS.map((practitioner) => (
            <div
              key={practitioner.id}
              className="flex items-center gap-5 rounded-[10px] border border-border-input bg-white p-5 transition-shadow hover:shadow-md"
            >
              {/* Avatar placeholder */}
              <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#ebecec] to-white">
                <span className="text-[24px] font-semibold text-primary">
                  {practitioner.name.charAt(0)}
                </span>
              </div>

              {/* Info */}
              <div className="flex-1">
                <h3 className="text-[20px] font-medium text-foreground">
                  {practitioner.name}
                </h3>
                <p className="mt-0.5 text-[15px] text-[#666]">
                  {practitioner.domain}
                </p>
                <div className="mt-2 flex items-center gap-4 text-[14px] text-[#666]">
                  <span className="flex items-center gap-1">
                    <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                    {practitioner.rating} ({practitioner.reviewCount})
                  </span>
                  <span className="flex items-center gap-1">
                    <MapPin className="h-4 w-4" />
                    {practitioner.city}
                  </span>
                </div>
              </div>

              {/* Price + action */}
              <div className="flex flex-col items-center gap-2">
                <span className="text-[18px] font-semibold text-primary">
                  ₪{practitioner.price}
                </span>
                <Button
                  size="sm"
                  onClick={() => router.push(`/practitioners/${practitioner.id}`)}
                >
                  צפה בפרופיל
                </Button>
              </div>
            </div>
          ))}
        </div>

        {/* Browse all */}
        <div className="mt-8 flex flex-col items-center gap-4 pb-12">
          <Button
            variant="outline"
            className="w-full max-w-[400px] border-border-input"
            onClick={() => router.push("/discovery")}
          >
            חפש מטפלים נוספים
          </Button>
          <Button
            variant="secondary"
            className="w-full max-w-[400px] bg-[#F4F7F7]"
            onClick={() => router.push("/")}
          >
            המשך לדף הבית
          </Button>
        </div>
      </div>
    </div>
  );
}
