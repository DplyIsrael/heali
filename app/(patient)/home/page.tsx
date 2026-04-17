"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { PractitionerCard, type PractitionerCardData } from "@/components/shared/practitioner-card";
import { Spinner } from "@/components/ui/spinner";

const SEARCH_TERMS = [
  "דיקור סיני",
  "שיאצו",
  "רפלקסולוגיה",
  "טיפול להפחתת סטרס",
  "טיפולים להריון",
  "מדקר בתל אביב",
];

// Mock data for now — will be replaced with real queries
const MOCK_RECOMMENDED: PractitionerCardData[] = [
  { id: "1", name: "ליאת גולדנברג", domain: "דיקור סיני", price: 146, city: "יפו - תל אביב", rating: "4.8/5", reviews: 500, available: true, bio: "מטפלת מוסמכת בדיקור סיני עם ניסיון של מעל 15 שנה.", image: "/images/practitioners/practitioner-1.jpg" },
  { id: "2", name: "דני כהן", domain: "עיסוי טיפולי", price: 180, city: "חיפה", rating: "4.9/5", reviews: 320, available: true, bio: "מטפל מוסמך עם ניסיון של מעל 10 שנים.", image: "/images/practitioners/practitioner-2.jpg" },
  { id: "3", name: "שרה לוי", domain: "מדיטציה", price: 120, city: "ירושלים", rating: "4.7/5", reviews: 215, available: true, bio: "מורה למדיטציה ומיינדפולנס.", image: "/images/practitioners/practitioner-3.jpg" },
  { id: "4", name: "מיכל אברהם", domain: "יוגה", price: 90, city: "תל אביב", rating: "4.9/5", reviews: 450, available: true, bio: "מורה ליוגה טיפולית.", image: "/images/practitioners/practitioner-5.jpg" },
];

export default function PatientHomePage() {
  const [termIndex, setTermIndex] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setTermIndex((prev) => (prev + 1) % SEARCH_TERMS.length);
        setFade(true);
      }, 300);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero */}
      <div className="bg-gradient-to-b from-primary/5 to-background">
        <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">
          <div className="max-w-[840px] mx-auto text-center">
            <h1 className="text-[28px] md:text-[40px] lg:text-[48px] font-bold text-black leading-tight mb-3">
              הריפוי שלך מתחיל עכשיו
            </h1>
            <p className="text-[16px] md:text-[18px] text-muted mb-2">
              איזה טיפול בא לך היום? מה הסיבה שבגללה חיפשת טיפול?
            </p>
            <p className="text-[14px] md:text-[16px] text-muted/70 mb-8">
              זה המקום לכתוב, ואנחנו נמצא לך את המטפלים המקצועיים ביותר והטיפולים הטובים ביותר בשבילך
            </p>

            {/* Search bar */}
            <div className="w-full max-w-[840px] mx-auto bg-white border border-[#a7d6b4] rounded-[16px] flex items-center justify-between overflow-hidden px-[10px] h-[56px] md:h-[62px] shadow-sm">
              <div className="flex-1 h-full flex items-center px-2 md:px-4">
                <span
                  className={`text-[14px] md:text-[16px] text-[#b0b0b0] transition-opacity duration-300 ${
                    fade ? "opacity-100" : "opacity-0"
                  }`}
                >
                  {SEARCH_TERMS[termIndex]}
                </span>
              </div>
              <Link
                href="/discovery"
                className="h-[36px] md:h-[42px] flex items-center justify-center gap-2 rounded-[8px] shrink-0 border border-[#d2ffe5] px-4 md:px-6"
                style={{
                  background:
                    "radial-gradient(ellipse 120% 300% at 50% -80%, #abffbf 0%, #7deaa1 7%, #4ed584 14%, #54fdae 35%, #51ff97 50%, #7de4a8 70%, #b8ffbb 86%, #deffeb 100%)",
                }}
              >
                <span className="text-[14px] md:text-[16px] font-normal text-black whitespace-nowrap">
                  תמצאו לי טיפול
                </span>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* Recommended practitioners */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-8 md:py-12">
        <div className="mb-6">
          <h2 className="text-[22px] md:text-[28px] font-bold text-black">
            מטפלים שעשויים להתאים לך
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_RECOMMENDED.map((p) => (
            <PractitionerCard key={p.id} practitioner={p} />
          ))}
        </div>
      </div>

      {/* Based on searches */}
      <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-8 md:py-12">
        <div className="mb-6">
          <h2 className="text-[22px] md:text-[28px] font-bold text-black">
            מטפלים מומלצים על בסיס החיפושים שלך
          </h2>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {MOCK_RECOMMENDED.slice().reverse().map((p) => (
            <PractitionerCard key={`search-${p.id}`} practitioner={p} />
          ))}
        </div>
      </div>
    </div>
  );
}
