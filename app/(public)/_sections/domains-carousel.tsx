"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { ChevronLeft, ChevronRight } from "lucide-react";

const DOMAINS = [
  { id: 1, name: "דיקור סיני",      count: "4,200", image: "/images/domains/domain-1.jpg" },
  { id: 2, name: "עיסוי טיפולי",    count: "3,800", image: "/images/domains/domain-2.jpg" },
  { id: 3, name: "מדיטציה",         count: "2,100", image: "/images/domains/domain-3.jpg" },
  { id: 4, name: "רפלקסולוגיה",     count: "1,500", image: "/images/domains/domain-4.jpg" },
  { id: 5, name: "יוגה",            count: "5,000", image: "/images/domains/domain-5.jpg" },
  { id: 6, name: "היפנוזה טיפולית", count: "900",   image: "/images/domains/domain-6.jpg" },
  { id: 7, name: "פסיכולוגיה",      count: "6,300", image: "/images/domains/domain-7.jpg" },
  { id: 8, name: "צמחי מרפא",       count: "1,200", image: "/images/domains/domain-8.jpg" },
];

const PER_PAGE = 4;
const SQ = 37.274; // checkerboard square size from Figma

export function DomainsCarousel() {
  const [page, setPage]       = useState(0);
  const [hoverId, setHoverId] = useState<number | null>(null);

  const totalPages = Math.ceil(DOMAINS.length / PER_PAGE);
  const visible    = DOMAINS.slice(page * PER_PAGE, (page + 1) * PER_PAGE);

  return (
    <section className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-10 md:py-16">

      {/* Header */}
      <div className="mb-8 md:mb-[46px] flex flex-col items-center gap-5">
        <div className="flex flex-col items-center gap-3 md:gap-[18px]">
          <h2 className="text-[24px] md:text-[30px] font-semibold text-black text-center">
            הטיפולים שלנו
          </h2>
          <p className="text-[16px] md:text-[20px] font-light text-[#9f9f9f] text-center">
            זה הזמן להכיר את עולמות הריפוי שלנו ולהבין מה עושה לך טוב
          </p>
        </div>
        <div className="flex items-center gap-5">
          <button
            onClick={() => setPage((p) => Math.max(0, p - 1))}
            disabled={page === 0}
            aria-label="הקודם"
            className="flex size-[46px] items-center justify-center rounded-full border border-[#cddbdb] bg-white transition-colors hover:bg-[#f3f6f6] disabled:opacity-40"
          >
            <ChevronRight className="size-5" />
          </button>
          <button
            onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
            disabled={page === totalPages - 1}
            aria-label="הבא"
            className="flex size-[46px] items-center justify-center rounded-full border border-[#cddbdb] bg-white transition-colors hover:bg-[#f3f6f6] disabled:opacity-40"
          >
            <ChevronLeft className="size-5" />
          </button>
        </div>
      </div>

      {/* Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-[23px]">
        {visible.map((domain) => {
          const active = hoverId === domain.id;

          const cardBg   = active ? "linear-gradient(195deg,#21544e,#3a8a7a)" : "#ffffff";
          const areaBg   = active ? "rgba(59,104,99,0.35)" : "linear-gradient(to top,#f3f6f6 0%,#ffffff 121.43%)";
          const sqFill   = active ? "rgba(59,104,99,0.4)"  : "rgba(243,246,246,0.9)";
          const sqBorder = active ? "transparent"           : "rgba(243,246,246,0.9)";
          const nameCl   = active ? "#ffffff"               : "#000000";
          const subCl    = active ? "rgba(255,255,255,0.8)" : "#666666";
          const pillBg   = active ? "#ffffff"               : "transparent";

          return (
            <div
              key={domain.id}
              onMouseEnter={() => setHoverId(domain.id)}
              onMouseLeave={() => setHoverId(null)}
              className="relative flex h-[205px] cursor-pointer flex-col justify-end rounded-[16px] px-[8px] py-[10px] transition-all duration-300"
              style={{ background: cardBg, border: active ? "none" : "1px solid #cddbdb" }}
            >
              {/* ── Absolute inner card: gradient area + checkerboard + text ── */}
              <div
                className="absolute inset-0 overflow-hidden rounded-[16px] p-[8.52px]"
                style={{ background: active ? "transparent" : "#ffffff" }}
              >
                <div
                  className="relative w-full overflow-hidden rounded-[10px]"
                  style={{ height: "141.642px", background: areaBg }}
                >
                  {/* Background image */}
                  <Image src={domain.image} alt={domain.name} fill className="object-cover opacity-20" />
                  {/* Checkerboard row A — left=0, top=37.47 */}
                  <div className="absolute flex" style={{ left: 0, top: 37.47 }}>
                    {[0,1,2,3].map((i) => (
                      <div key={i} style={{
                        width: SQ, height: SQ, flexShrink: 0,
                        background: i % 2 === 0 ? sqFill : "transparent",
                        border: i % 2 !== 0 ? `0.852px solid ${sqBorder}` : "none",
                      }} />
                    ))}
                  </div>

                  {/* Checkerboard row B — left=37.27, top=0.19 */}
                  <div className="absolute flex" style={{ left: 37.27, top: 0.19 }}>
                    {[0,1,2,3].map((i) => (
                      <div key={i} style={{
                        width: SQ, height: SQ, flexShrink: 0,
                        background: i % 2 === 0 ? sqFill : "transparent",
                        border: i % 2 !== 0 ? `0.852px solid ${sqBorder}` : "none",
                      }} />
                    ))}
                  </div>

                  {/* Text — physically anchored to right, w-full so text-right fills correctly */}
                  <div
                    className="absolute flex flex-col gap-[6px]"
                    style={{ top: 56.04, right: 13.08, width: 270.504 }}
                  >
                    <p className="w-full text-right text-[20px] font-medium leading-normal whitespace-nowrap"
                       style={{ color: nameCl }}>
                      {domain.name}
                    </p>
                    <p className="w-full text-right text-[14px] font-light leading-[19.17px] whitespace-nowrap"
                       style={{ color: subCl }}>
                      ({domain.count}) מטפלים בתחום
                    </p>
                  </div>
                </div>
              </div>

              {/* ── Pill — bottom LEFT. justify-end in RTL row = visual LEFT ── */}
              <div className="relative z-10 flex w-full justify-end">
                <Link
                  href={`/discovery?domain=${encodeURIComponent(domain.name)}`}
                  onClick={(e) => e.stopPropagation()}
                  className="flex h-[35px] w-fit items-center justify-end gap-[6.39px] rounded-full border border-[#cddbdb] px-[10.65px] text-[16px] font-light text-black transition-colors"
                  style={{ background: pillBg }}
                >
                  <span className="whitespace-nowrap">לצפייה בכל המטפלים</span>
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img src="/images/domain-arrow.svg" alt="" width={19} height={19} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
