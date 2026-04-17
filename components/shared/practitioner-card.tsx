"use client";

import Image from "next/image";
import Link from "next/link";
import { Star, MapPin, Heart } from "lucide-react";

export interface PractitionerCardData {
  id: string;
  name: string;
  domain: string;
  price: number;
  city: string;
  rating: string;
  reviews: number;
  available: boolean;
  bio: string;
  image: string;
  isFavorite?: boolean;
}

function VerifiedBadge() {
  return (
    <div className="flex items-center gap-[4px]">
      <span className="text-[12px] font-light text-black leading-none">+10</span>
      <svg width="21" height="21" viewBox="0 0 21 21" fill="none">
        <circle cx="10.5" cy="10.5" r="10.5" fill="#dcfce7" />
        <circle cx="10.5" cy="10.5" r="5.75" fill="#7de4a8" stroke="white" strokeWidth="0.3" />
        <path d="M8 10.5L9.8 12.3L13 8.7" stroke="white" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    </div>
  );
}

interface PractitionerCardProps {
  practitioner: PractitionerCardData;
  onToggleFavorite?: (id: string) => void;
  showBookButton?: boolean;
}

export function PractitionerCard({ practitioner: p, onToggleFavorite, showBookButton = true }: PractitionerCardProps) {
  return (
    <div className="flex flex-col w-full h-[408px] shadow-[0px_4px_21px_0px_rgba(0,0,0,0.07)] shrink-0 rounded-[20px] overflow-hidden bg-white">
      {/* Top — avatar area with gradient bg */}
      <div
        className="relative h-[177px] w-full rounded-t-[20px] overflow-hidden border border-white"
        style={{ background: "linear-gradient(to bottom, #ebecec 4%, white 120%)" }}
      >
        <div className="absolute left-1/2 -translate-x-1/2 top-[6px] w-[199px] h-[170px] rounded-[12px] overflow-hidden">
          <Image src={p.image} alt={p.name} fill className="object-cover" />
        </div>

        <div className="absolute left-[10px] top-[9px]">
          <VerifiedBadge />
        </div>

        <div className="absolute bottom-[10px] left-[10px] right-[10px] flex items-center justify-between">
          {p.available && (
            <div className="flex items-center gap-1 bg-[#eefff3] rounded-full h-[28px] px-[10px]">
              <span className="text-[14px] text-[#0d8a27]">זמין לקבל היום</span>
              <div className="size-[8px] rounded-full bg-[#00d22c]" />
            </div>
          )}
          <button
            type="button"
            onClick={() => onToggleFavorite?.(p.id)}
            className="size-[28px] rounded-full bg-white/80 flex items-center justify-center hover:bg-white transition-colors"
          >
            <Heart
              className={`size-[16px] ${p.isFavorite ? "fill-red-500 text-red-500" : "text-muted-foreground"}`}
            />
          </button>
        </div>
      </div>

      {/* Bottom — info area */}
      <div className="flex flex-col flex-1 bg-white border border-white rounded-b-[20px] p-[10px]">
        <div className="flex flex-col gap-5">
          <div className="flex flex-col gap-[14px] items-end">
            <div className="flex items-center gap-2">
              <div
                className="flex items-center justify-end h-[24px] px-[10px] rounded-full border border-[#d7d7d7]"
                style={{ backgroundImage: "linear-gradient(104deg, #ebecec 161%, white 99%)" }}
              >
                <span className="text-[12px] font-light text-black whitespace-nowrap">{p.domain}</span>
              </div>
              <div
                className="flex items-center justify-end h-[24px] px-[10px] rounded-full border border-[#d7d7d7]"
                style={{ backgroundImage: "linear-gradient(112deg, #ebecec 161%, white 99%)" }}
              >
                <span className="text-[12px] font-light text-black whitespace-nowrap">מחיר לטיפול {p.price}₪</span>
              </div>
            </div>

            <div className="flex flex-col gap-[10px] items-end w-full">
              <div className="flex flex-col gap-[6px] items-end w-full">
                <p className="text-[20px] font-medium text-black whitespace-nowrap">{p.name}</p>
                <p className="text-[14px] font-light text-[#9f9f9f] leading-[18px] text-right w-full line-clamp-2">
                  {p.bio}
                </p>
              </div>

              <div className="flex items-center justify-between w-full">
                <div className="flex items-center gap-1">
                  <MapPin className="size-[20px] text-accent" />
                  <span className="text-[14px] text-black">{p.city}</span>
                </div>
                <div className="flex items-center gap-[6px]">
                  <Star className="size-[20px] fill-[#f5a623] text-[#f5a623]" />
                  <span className="text-[16px] text-black">
                    <span className="font-normal">{p.rating} </span>
                    <span className="font-light">(דרוג {p.reviews})</span>
                  </span>
                </div>
              </div>
            </div>

            <div className="w-full h-px bg-border" />
          </div>

          <div className="flex items-center gap-2 w-full">
            {showBookButton && (
              <Link
                href={`/practitioners/${p.id}/book`}
                className="flex items-center justify-center flex-1 rounded-[8px] bg-accent p-[10px] text-[16px] text-black"
              >
                קביעת טיפול
              </Link>
            )}
            <Link
              href={`/practitioners/${p.id}`}
              className={`flex items-center justify-center rounded-[8px] bg-[#f4f7f7] p-[10px] text-[16px] text-black ${showBookButton ? "flex-1" : "flex-1"}`}
            >
              צפייה בפרופיל
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
