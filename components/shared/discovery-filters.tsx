"use client";

import { useState } from "react";
import { Search, ChevronDown, Star, X, MapPin, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface FilterDomain {
  id: string;
  name: string;
}

interface DiscoveryFiltersProps {
  domains: FilterDomain[];
  cities: string[];
  onApply: (filters: FilterValues) => void;
  initialValues?: Partial<FilterValues>;
  isMobile?: boolean;
  onClose?: () => void;
}

export interface FilterValues {
  search: string;
  domainId: string;
  city: string;
  gender: string;
  language: string;
  minPrice: number;
  maxPrice: number;
  minRating: number;
  sortBy: string;
  nearMe: boolean;
}

const LANGUAGES = ["עברית", "אנגלית", "רוסית", "ערבית", "צרפתית", "ספרדית"];
const GENDERS = [
  { value: "", label: "הכל" },
  { value: "male", label: "גבר" },
  { value: "female", label: "אישה" },
];

export function DiscoveryFilters({
  domains,
  cities,
  onApply,
  initialValues,
  isMobile,
  onClose,
}: DiscoveryFiltersProps) {
  const [search, setSearch] = useState(initialValues?.search ?? "");
  const [domainId, setDomainId] = useState(initialValues?.domainId ?? "");
  const [city, setCity] = useState(initialValues?.city ?? "");
  const [gender, setGender] = useState(initialValues?.gender ?? "");
  const [language, setLanguage] = useState(initialValues?.language ?? "");
  const [minPrice, setMinPrice] = useState(initialValues?.minPrice ?? 0);
  const [maxPrice, setMaxPrice] = useState(initialValues?.maxPrice ?? 500);
  const [minRating, setMinRating] = useState(initialValues?.minRating ?? 0);
  const [nearMe, setNearMe] = useState(initialValues?.nearMe ?? false);

  const handleNearMeToggle = () => {
    const next = !nearMe;
    if (next && typeof navigator !== "undefined" && navigator.geolocation) {
      // Request permission so the coordinate is ready once area-to-coords is wired up
      navigator.geolocation.getCurrentPosition(
        () => setNearMe(true),
        () => setNearMe(false),
      );
    } else {
      setNearMe(next);
    }
  };

  const handleOpenMap = () => {
    // TODO: wire to a map picker once the client delivers the area → cities mapping
    // and we pick a map provider (Google Maps / Mapbox).
    window.alert("בחירת מיקום על המפה — בקרוב");
  };

  const handleApply = () => {
    onApply({
      search,
      domainId,
      city,
      gender,
      language,
      minPrice,
      maxPrice,
      minRating,
      sortBy: "",
      nearMe,
    });
    onClose?.();
  };

  const handleReset = () => {
    setSearch("");
    setDomainId("");
    setCity("");
    setGender("");
    setLanguage("");
    setMinPrice(0);
    setMaxPrice(500);
    setMinRating(0);
    setNearMe(false);
    onApply({
      search: "",
      domainId: "",
      city: "",
      gender: "",
      language: "",
      minPrice: 0,
      maxPrice: 500,
      minRating: 0,
      sortBy: "",
      nearMe: false,
    });
  };

  return (
    <div className="flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="text-[20px] font-semibold text-black">פילטרים</h3>
        {isMobile && onClose && (
          <button type="button" onClick={onClose}>
            <X className="size-5 text-muted-foreground" />
          </button>
        )}
      </div>

      {/* Free text search */}
      <div className="relative">
        <Search className="absolute top-1/2 right-3 -translate-y-1/2 size-[18px] text-muted-foreground" />
        <Input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="חיפוש חופשי..."
          className="pe-10 h-[50px]"
        />
      </div>

      {/* Domain */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black">מיון לפי קטגוריה</label>
        <div className="relative">
          <select
            value={domainId}
            onChange={(e) => setDomainId(e.target.value)}
            className="w-full h-[50px] rounded-[10px] border border-border-input bg-white px-3 pe-8 text-[14px] appearance-none"
          >
            <option value="">הכל</option>
            {domains.map((d) => (
              <option key={d.id} value={d.id}>{d.name}</option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* City / Area */}
      {/* Area list + city-per-area mapping will be supplied by the client; cities[] is used as a flat fallback for now. */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black">חפש לפי אזור</label>
        <div className="flex items-stretch gap-2">
          <div className="relative flex-1">
            <select
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="w-full h-[50px] rounded-[10px] border border-border-input bg-white px-3 pe-8 text-[14px] appearance-none"
            >
              <option value="">הכל</option>
              {cities.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <ChevronDown className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
          </div>
          <button
            type="button"
            onClick={handleOpenMap}
            aria-label="בחר מיקום על המפה"
            className="flex items-center justify-center size-[50px] shrink-0 rounded-[10px] border border-border-input bg-white text-primary hover:bg-muted/10"
          >
            <Plus className="size-5" />
          </button>
        </div>
        <button
          type="button"
          onClick={handleNearMeToggle}
          aria-pressed={nearMe}
          className={`flex items-center gap-2 h-[44px] px-3 rounded-[10px] border text-[14px] transition-colors ${
            nearMe
              ? "border-primary bg-primary/10 text-primary"
              : "border-border-input bg-white text-black hover:bg-muted/10"
          }`}
        >
          <MapPin className="size-4" />
          קרוב למיקום שלי
        </button>
      </div>

      {/* Gender */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black">מיון לפי מגדר</label>
        <div className="relative">
          <select
            value={gender}
            onChange={(e) => setGender(e.target.value)}
            className="w-full h-[50px] rounded-[10px] border border-border-input bg-white px-3 pe-8 text-[14px] appearance-none"
          >
            {GENDERS.map((g) => (
              <option key={g.value} value={g.value}>{g.label}</option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Language */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black">שפה</label>
        <div className="relative">
          <select
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            className="w-full h-[50px] rounded-[10px] border border-border-input bg-white px-3 pe-8 text-[14px] appearance-none"
          >
            <option value="">הכל</option>
            {LANGUAGES.map((l) => (
              <option key={l} value={l}>{l}</option>
            ))}
          </select>
          <ChevronDown className="absolute top-1/2 left-3 -translate-y-1/2 size-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {/* Price range */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black">
          טווח מחירים: ₪{minPrice} — ₪{maxPrice}
        </label>
        <div className="flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={500}
            value={minPrice}
            onChange={(e) => setMinPrice(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
          <input
            type="range"
            min={0}
            max={500}
            value={maxPrice}
            onChange={(e) => setMaxPrice(Number(e.target.value))}
            className="flex-1 accent-primary"
          />
        </div>
      </div>

      {/* Rating */}
      <div className="flex flex-col gap-2">
        <label className="text-[14px] font-medium text-black flex items-center gap-1">
          <Star className="size-4 fill-[#f5a623] text-[#f5a623]" />
          דירוג מינימלי: {minRating} כוכבים
        </label>
        <input
          type="range"
          min={0}
          max={5}
          step={0.5}
          value={minRating}
          onChange={(e) => setMinRating(Number(e.target.value))}
          className="w-full accent-primary"
        />
      </div>

      {/* Action buttons */}
      <div className="flex flex-col gap-2 mt-2">
        <Button onClick={handleApply} className="w-full bg-accent text-black hover:bg-accent/90">
          חיפוש
        </Button>
        <Button onClick={handleReset} variant="ghost" className="w-full text-muted-foreground">
          איפוס פילטרים
        </Button>
      </div>
    </div>
  );
}
