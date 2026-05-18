"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter, useParams } from "next/navigation";
import { ChevronLeft, ChevronRight, Sun, Cloud, Moon, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import { getTimeSlotsForDate, createBooking, type AvailableSlot } from "./actions";
import { fetchPractitionerById } from "../actions";

const DAY_NAMES_SHORT = ["א׳", "ב׳", "ג׳", "ד׳", "ה׳", "ו׳", "ש׳"];
const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];

function getWeekDates(baseDate: Date): Date[] {
  const dates: Date[] = [];
  const day = baseDate.getDay();
  const start = new Date(baseDate);
  start.setDate(start.getDate() - day);
  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    dates.push(d);
  }
  return dates;
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

function formatDateDisplay(d: Date) {
  return d.toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" });
}

export default function BookingPage() {
  const router = useRouter();
  const params = useParams();
  const practitionerId = params.id as string;

  const [practitioner, setPractitioner] = useState<{ name: string; price: number; domainNames: string[]; domainIds: string[] } | null>(null);
  const [weekOffset, setWeekOffset] = useState(0);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [timeSlots, setTimeSlots] = useState<AvailableSlot[]>([]);
  const [selectedTime, setSelectedTime] = useState<string>("");
  const [selectedDomain, setSelectedDomain] = useState<string>("");
  const [isLoadingSlots, setIsLoadingSlots] = useState(false);
  const [step, setStep] = useState<"schedule" | "summary" | "confirmed">("schedule");
  const [isBooking, setIsBooking] = useState(false);
  const [_bookingId, setBookingId] = useState("");

  const baseDate = new Date();
  baseDate.setDate(baseDate.getDate() + weekOffset * 7);
  const weekDates = getWeekDates(baseDate);

  // Load practitioner info
  useEffect(() => {
    async function load() {
      const p = await fetchPractitionerById(practitionerId);
      if (p) {
        setPractitioner({ name: p.name, price: p.price, domainNames: p.domainNames, domainIds: p.domainIds });
        if (p.domainNames.length > 0) setSelectedDomain(p.domainNames[0]);
      }
    }
    load();
  }, [practitionerId]);

  // Load time slots when date is selected
  const loadSlots = useCallback(async (date: Date) => {
    setIsLoadingSlots(true);
    setSelectedTime("");
    const dateStr = formatDate(date);
    const weekday = date.getDay();
    const slots = await getTimeSlotsForDate(practitionerId, dateStr, weekday);
    setTimeSlots(slots);
    setIsLoadingSlots(false);
  }, [practitionerId]);

  const handleDateSelect = (date: Date) => {
    setSelectedDate(date);
    loadSlots(date);
  };

  const handleBook = () => {
    if (!selectedDate || !selectedTime) return;
    setStep("summary");
  };

  const handleConfirm = async () => {
    if (!selectedDate || !selectedTime || !practitioner) return;
    setIsBooking(true);

    const domainId = practitioner.domainIds[0] ?? "";
    const result = await createBooking(
      practitionerId,
      domainId,
      formatDate(selectedDate),
      selectedTime,
      practitioner.price
    );

    if (result.success) {
      // If CardCom is on, the server hands us a hosted payment URL.
      // Send the patient there so they can enter their card; CardCom
      // bounces them back to /api/cardcom/success once tokenized.
      if (result.redirectUrl) {
        window.location.href = result.redirectUrl;
        return;
      }
      setBookingId(result.bookingId ?? "");
      setStep("confirmed");
    } else {
      toast.error(result.error);
    }
    setIsBooking(false);
  };

  const morningSlots = timeSlots.filter((s) => s.period === "morning");
  const afternoonSlots = timeSlots.filter((s) => s.period === "afternoon");
  const eveningSlots = timeSlots.filter((s) => s.period === "evening");

  const vat = practitioner ? Math.round(practitioner.price * 0.17) : 0;
  const total = practitioner ? practitioner.price + vat : 0;

  if (!practitioner) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <Spinner />
      </div>
    );
  }

  // Confirmation screen
  if (step === "confirmed") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="flex flex-col items-center text-center max-w-[500px]">
          <div className="size-[140px] rounded-full bg-[#e0ffed] flex items-center justify-center mb-8">
            <div className="size-[80px] rounded-full bg-accent flex items-center justify-center">
              <Check className="size-10 text-white" strokeWidth={3} />
            </div>
          </div>
          <h1 className="text-[26px] md:text-[30px] font-bold text-black mb-4">
            ההזמנה שלך בוצעה בהצלחה
          </h1>
          <p className="text-[16px] font-light text-[#9f9f9f] mb-2">
            הטיפול שלך עם {practitioner.name} נקבע בהצלחה!
          </p>
          <p className="text-[16px] font-light text-[#9f9f9f] mb-10">
            תקבל/י מייל אישור עם כל הפרטים.
          </p>
          <Button
            onClick={() => router.push("/my-treatments")}
            className="bg-accent text-black px-10 h-[48px] text-[16px]"
          >
            צפייה בהזמנה
          </Button>
        </div>
      </div>
    );
  }

  // Order summary screen
  if (step === "summary") {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background px-4">
        <div className="w-full max-w-[480px] rounded-[16px] bg-white p-6 shadow-lg">
          <h2 className="text-[26px] font-semibold text-black mb-1">
            טיפול {selectedDomain}
          </h2>
          <p className="text-[16px] font-light text-[#9f9f9f] mb-4">
            {selectedDate && `יום ${DAY_NAMES[selectedDate.getDay()]}, ${selectedDate.toLocaleDateString("he-IL")}, ${selectedTime}`}
          </p>

          <div className="h-px bg-border mb-4" />

          <h3 className="text-[24px] text-black mb-4">סיכום הזמנה</h3>

          <div className="flex flex-col gap-2 mb-4">
            <div className="flex justify-between text-[16px] font-light text-[#9f9f9f]">
              <span>₪{practitioner.price}</span>
              <span>סה״כ מחיר לטיפול</span>
            </div>
            <div className="flex justify-between text-[16px] font-light text-[#9f9f9f]">
              <span>₪{vat}</span>
              <span>מע״מ (17%)</span>
            </div>
            <div className="h-px bg-border my-1" />
            <div className="flex justify-between text-[18px] font-medium text-[#575757]">
              <span>₪{total}</span>
              <span>סה״כ</span>
            </div>
          </div>

          <div className="h-px bg-border mb-4" />

          <div className="flex gap-3">
            <Button
              onClick={handleConfirm}
              disabled={isBooking}
              className="flex-1 bg-accent text-black h-[48px] text-[16px]"
            >
              {isBooking ? <Spinner size="sm" /> : "אישור והזמנה"}
            </Button>
            <Button
              variant="secondary"
              onClick={() => setStep("schedule")}
              className="bg-[#f4f7f7] h-[48px]"
            >
              חזור
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Scheduling screen
  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-[520px] px-4 py-6 md:py-10">
        <div className="rounded-[16px] bg-white p-5 md:p-6 shadow-lg">
          <h1 className="text-[20px] font-medium text-black mb-1">הזמנת טיפול</h1>
          <p className="text-[16px] font-light text-[#9f9f9f] mb-6">
            מלא/י את הפרטים הבאים כדי להשלים את ההזמנה.
          </p>

          {/* Treatment domain selector */}
          {practitioner.domainNames.length > 1 && (
            <div className="mb-5">
              <select
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
                className="w-full h-[50px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]"
              >
                {practitioner.domainNames.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}

          {/* Week navigation */}
          <div className="flex items-center justify-between mb-4">
            <button onClick={() => setWeekOffset((w) => w + 1)}>
              <ChevronLeft className="size-6 text-black" />
            </button>
            <span className="text-[14px] text-black">
              {formatDateDisplay(weekDates[0])} — {formatDateDisplay(weekDates[6])}
            </span>
            <button onClick={() => setWeekOffset((w) => Math.max(w - 1, 0))}>
              <ChevronRight className="size-6 text-black" />
            </button>
          </div>

          {/* Day strip */}
          <div className="grid grid-cols-7 gap-1 mb-6">
            {weekDates.map((date, i) => {
              const isSelected = selectedDate && formatDate(date) === formatDate(selectedDate);
              const isPast = date < new Date(new Date().setHours(0, 0, 0, 0));
              return (
                <button
                  key={i}
                  onClick={() => !isPast && handleDateSelect(date)}
                  disabled={isPast}
                  className={`flex flex-col items-center gap-1 py-2 rounded-[10px] transition-colors ${
                    isSelected
                      ? "bg-[#e0ffed] border border-[#13d464]"
                      : isPast
                        ? "opacity-40"
                        : "hover:bg-muted/10"
                  }`}
                >
                  <span className="text-[12px] text-black/80">{DAY_NAMES_SHORT[i]}</span>
                  <span className={`text-[14px] font-medium ${isSelected ? "text-[#13d464]" : "text-black"}`}>
                    {date.getDate()}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Time slots */}
          {selectedDate && (
            <>
              {isLoadingSlots ? (
                <div className="flex justify-center py-6">
                  <Spinner />
                </div>
              ) : timeSlots.length === 0 ? (
                <p className="text-center text-[16px] text-muted py-6">אין תורים פנויים ביום זה</p>
              ) : (
                <div className="flex flex-col gap-4 mb-6">
                  {morningSlots.length > 0 && (
                    <TimeSlotGroup
                      label="שעות בוקר"
                      icon={<Sun className="size-5 text-[#f5a623]" />}
                      slots={morningSlots}
                      selected={selectedTime}
                      onSelect={setSelectedTime}
                    />
                  )}
                  {afternoonSlots.length > 0 && (
                    <TimeSlotGroup
                      label="שעות צהריים"
                      icon={<Cloud className="size-5 text-[#f5a623]" />}
                      slots={afternoonSlots}
                      selected={selectedTime}
                      onSelect={setSelectedTime}
                    />
                  )}
                  {eveningSlots.length > 0 && (
                    <TimeSlotGroup
                      label="שעות ערב"
                      icon={<Moon className="size-5 text-[#9f9f9f]" />}
                      slots={eveningSlots}
                      selected={selectedTime}
                      onSelect={setSelectedTime}
                    />
                  )}
                </div>
              )}
            </>
          )}

          {/* Book button */}
          <Button
            onClick={handleBook}
            disabled={!selectedDate || !selectedTime}
            className="w-full h-[48px] bg-accent text-black text-[16px] disabled:opacity-50"
          >
            הזמנת טיפול
          </Button>
        </div>
      </div>
    </div>
  );
}

function TimeSlotGroup({
  label,
  icon,
  slots,
  selected,
  onSelect,
}: {
  label: string;
  icon: React.ReactNode;
  slots: AvailableSlot[];
  selected: string;
  onSelect: (time: string) => void;
}) {
  return (
    <div>
      <div className="flex items-center gap-2 mb-2">
        {icon}
        <span className="text-[14px] text-black">{label}</span>
      </div>
      <div className="flex flex-wrap gap-2">
        {slots.map((slot) => (
          <button
            key={slot.time}
            onClick={() => onSelect(slot.time)}
            className={`px-4 py-2 rounded-[8px] border text-[14px] transition-colors ${
              selected === slot.time
                ? "bg-[#e0ffed] border-[#13d464] text-[#13d464]"
                : "border-[#dcdcdc] text-black hover:bg-muted/10"
            }`}
          >
            {slot.time}
          </button>
        ))}
      </div>
    </div>
  );
}
