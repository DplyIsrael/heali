"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import Image from "next/image";
import Link from "next/link";

const HERO_VIDEOS = ["/videos/hero-1.mp4", "/videos/hero-2.mp4", "/videos/hero-3.mp4"];

const SEARCH_TERMS = [
  "דיקור סיני",
  "שיאצו",
  "רפלקסולוגיה",
  "טיפול להפחתת סטרס",
  "טיפולים להריון",
  "מדקר בתל אביב",
];

const POPULAR_SEARCHES = ["פסיכולוגיה", "יוגה", "מדיטציה", "דיקור סיני"];

export function Hero() {
  const [termIndex, setTermIndex] = useState(0);
  const [fade, setFade] = useState(true);
  const [videoIndex, setVideoIndex] = useState(0);
  const [videoFade, setVideoFade] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Search term rotation
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

  // Video rotation — switch when current video ends
  const handleVideoEnd = useCallback(() => {
    setVideoFade(false);
    setTimeout(() => {
      setVideoIndex((prev) => (prev + 1) % HERO_VIDEOS.length);
      setVideoFade(true);
    }, 500);
  }, []);

  // Load new video source when index changes
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      videoRef.current.play().catch(() => {});
    }
  }, [videoIndex]);

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-[50px]">
      <section className="relative h-[500px] md:h-[700px] lg:h-[880px] w-full overflow-hidden rounded-[20px]">
        {/* Background video — rotates between clips */}
        <video
          ref={videoRef}
          autoPlay
          muted
          playsInline
          onEnded={handleVideoEnd}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-500 ${videoFade ? "opacity-100" : "opacity-0"}`}
          poster="/images/hero-bg.jpg"
        >
          <source src={HERO_VIDEOS[videoIndex]} type="video/mp4" />
        </video>

        {/* Fallback static image */}
        <Image
          src="/images/hero-bg.jpg"
          alt=""
          fill
          priority
          className="object-cover object-center"
          style={{ zIndex: -1 }}
        />

        {/* Frosted overlay — full width on mobile */}
        <div
          className="absolute right-0 top-0 h-full w-full md:w-[702px] pointer-events-none"
          style={{
            background:
              "linear-gradient(to left, rgba(4,7,4,0.25) 0%, rgba(3,6,4,0.18) 24%, rgba(0,0,0,0) 100%)",
            backdropFilter: "blur(20px)",
            WebkitBackdropFilter: "blur(2px)",
            maskImage: "linear-gradient(to left, black 70%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(to left, black 70%, transparent 100%)",
          }}
        />

        {/* Content block — right side, vertically centered */}
        <div className="absolute inset-0 flex items-center">
          <div className="relative mx-auto w-full max-w-[1440px] h-full">
            <div className="absolute right-4 left-4 md:right-[60px] md:left-auto top-1/2 -translate-y-1/2 flex flex-col gap-6 md:gap-10 items-end md:w-[631px]">

              {/* Main headline */}
              <div className="flex flex-col gap-3 md:gap-[18px] items-end w-full md:w-[599px]">
                <h1 className="text-[32px] md:text-[48px] lg:text-[64px] leading-none text-white text-right">
                  <span className="font-light block">כל המטפלים. כל הטיפולים.</span>
                  <span className="font-bold block">במקום אחד.</span>
                </h1>
                <p className="text-[16px] md:text-[20px] font-light text-[#f3f3f3] text-right w-full">
                  הדרך להרגיש טוב יותר מתחילה בשני קליקים
                </p>
              </div>

              {/* Search — glassmorphism container */}
              <div className="w-full flex flex-col gap-3 items-end">
                <p className="text-[16px] md:text-[18px] text-[#f3f3f3] text-right">
                  איזה טיפול בא לך היום?
                </p>
                <div className="w-full bg-[rgba(255,255,255,0.31)] border border-[rgba(255,255,255,0.33)] rounded-[16px] shadow-[0px_21px_44.6px_-10px_rgba(0,0,0,0.08)] p-3 md:p-4 flex items-center">
                  <div className="w-full h-[50px] md:h-[62px] bg-white border border-[#a7d6b4] rounded-[16px] flex items-center justify-between overflow-hidden px-[10px]">
                    {/* Animated placeholder */}
                    <div className="flex-1 h-full flex items-center px-2 md:px-4">
                      <span
                        className={`text-[14px] md:text-[16px] font-[family-name:var(--font-poppins)] text-[#b0b0b0] transition-opacity duration-300 ${
                          fade ? "opacity-100" : "opacity-0"
                        }`}
                      >
                        {SEARCH_TERMS[termIndex]}
                      </span>
                    </div>

                    <button
                      className="h-[36px] md:h-[42px] w-auto md:w-[191px] flex items-center justify-center gap-[6px] md:gap-[10px] rounded-[8px] shrink-0 border border-[#d2ffe5] px-3 md:px-0"
                      style={{
                        background:
                          "radial-gradient(ellipse 120% 300% at 50% -80%, #abffbf 0%, #7deaa1 7%, #4ed584 14%, #54fdae 35%, #51ff97 50%, #7de4a8 70%, #b8ffbb 86%, #deffeb 100%)",
                      }}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/images/hero-magicpen.svg"
                        alt=""
                        width={20}
                        height={20}
                        className="shrink-0"
                      />
                      <span className="text-[14px] md:text-[16px] font-normal text-black whitespace-nowrap hidden sm:inline">
                        תמצאו לי טיפול
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Popular searches — hidden on small mobile */}
              <div className="hidden sm:flex flex-col gap-[18px] items-end w-full">
                <p className="text-[14px] md:text-[16px] text-[#f3f3f3] text-right w-full">
                  מה אחרים חיפשו?
                </p>
                <div className="flex flex-wrap gap-2 md:gap-[14px] items-center w-full">
                  {POPULAR_SEARCHES.map((cat) => (
                    <Link
                      key={cat}
                      href={`/discovery?category=${encodeURIComponent(cat)}`}
                      className="h-[36px] md:h-[40px] px-3 md:px-4 flex items-center gap-[10px] backdrop-blur-[3px] bg-[rgba(0,0,0,0.35)] border border-[#f3f3f3] rounded-bl-[16px] rounded-tl-[16px] rounded-tr-[16px] whitespace-nowrap transition-colors hover:bg-[rgba(0,0,0,0.5)]"
                    >
                      <span className="text-[14px] md:text-[18px] text-[#f3f3f3]">{cat}</span>
                      <svg width="11" height="11" viewBox="0 0 11 11" fill="none" className="shrink-0">
                        <path d="M6.5 1L1 5.5L6.5 10" stroke="#f3f3f3" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
                      </svg>
                    </Link>
                  ))}
                </div>
              </div>

            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
