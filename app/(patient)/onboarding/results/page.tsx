"use client";

import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { Star, MapPin } from "lucide-react";
import { fetchMatchedPractitioners } from "./actions";

export default function OnboardingResultsPage() {
  const router = useRouter();

  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["matched-practitioners"],
    queryFn: () => fetchMatchedPractitioners(6),
  });

  if (isError) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-background">
        <p className="text-[15px] text-muted-foreground">שגיאה בטעינת המטפלים</p>
        <Button onClick={() => void refetch()} variant="secondary" className="bg-[#f4f7f7]">נסה שוב</Button>
      </div>
    );
  }

  const practitioners = data ?? [];

  return (
    <div className="flex min-h-screen flex-col bg-background">
      {/* Header */}
      <div className="mx-auto w-full max-w-[800px] px-6 pt-12">
        <div className="flex flex-col items-center text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-accent/20">
            <Star className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-[36px] font-semibold leading-tight text-foreground">
            {practitioners.length > 0
              ? "מצאנו לך מטפלים מתאימים!"
              : "ברוכים הבאים ל-Heali"}
          </h1>
          <p className="mt-3 text-[18px] font-light text-[#666]">
            {practitioners.length > 0
              ? "בהתאם לפרטים ולהעדפות שלך, הנה המטפלים שמתאימים לך ביותר"
              : "עוד אין מטפלים זמינים באזורך — חזרו אלינו בקרוב או חפשו ידנית"}
          </p>
        </div>

        {/* Practitioner cards */}
        {isLoading ? (
          <div className="mt-12 flex justify-center">
            <Spinner />
          </div>
        ) : practitioners.length === 0 ? null : (
          <div className="mt-10 flex flex-col gap-4">
            {practitioners.map((practitioner) => (
              <div
                key={practitioner.id}
                className="flex items-center gap-5 rounded-[10px] border border-border-input bg-white p-5 transition-shadow hover:shadow-md"
              >
                {/* Avatar */}
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[10px] bg-gradient-to-b from-[#ebecec] to-white overflow-hidden">
                  {practitioner.profilePhotoUrl ? (
                    <Image
                      src={practitioner.profilePhotoUrl}
                      alt={practitioner.name}
                      width={80}
                      height={80}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <span className="text-[24px] font-semibold text-primary">
                      {practitioner.name.charAt(0)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <h3 className="text-[20px] font-medium text-foreground truncate">
                    {practitioner.name}
                  </h3>
                  {practitioner.domain && (
                    <p className="mt-0.5 text-[15px] text-[#666] truncate">
                      {practitioner.domain}
                    </p>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-[14px] text-[#666]">
                    {practitioner.reviewCount > 0 && (
                      <span className="flex items-center gap-1">
                        <Star className="h-4 w-4 fill-amber-400 text-amber-400" />
                        {practitioner.rating.toFixed(1)} ({practitioner.reviewCount})
                      </span>
                    )}
                    {practitioner.city && (
                      <span className="flex items-center gap-1">
                        <MapPin className="h-4 w-4" />
                        {practitioner.city}
                      </span>
                    )}
                  </div>
                </div>

                {/* Price + action */}
                <div className="flex flex-col items-center gap-2 shrink-0">
                  {practitioner.price > 0 && (
                    <span className="text-[18px] font-semibold text-primary">
                      ₪{practitioner.price}
                    </span>
                  )}
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
        )}

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
