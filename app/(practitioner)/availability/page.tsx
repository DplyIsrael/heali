"use client";

import { useState, useMemo } from "react";
import { useQuery } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarOff, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  fetchAvailability,
  fetchBookingsForRange,
  fetchUpcomingBookingsForPractitioner,
  saveAvailabilitySlot,
  deleteAvailabilitySlot,
  addBlockedDate,
  removeBlockedDate,
  type BookingForCalendar,
} from "./actions";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const MINI_DAY_LETTERS = ["א", "ב", "ג", "ד", "ה", "ו", "ש"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
const HOUR_HEIGHT = 80; // px per hour row in daily view
const TIME_OPTIONS: string[] = [];
for (let h = 8; h <= 21; h++) {
  TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:00`);
  TIME_OPTIONS.push(`${h.toString().padStart(2, "0")}:30`);
}

function getWeekDates(offset: number): Date[] {
  const today = new Date();
  const day = today.getDay();
  const start = new Date(today);
  start.setDate(start.getDate() - day + offset * 7);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(start.getDate() + i);
    return d;
  });
}

function formatDate(d: Date) {
  return d.toISOString().split("T")[0];
}

// Mini month grid: array of 7n cells, nulls for leading/trailing pad.
function buildMonthGrid(cursor: Date): (Date | null)[] {
  const year = cursor.getFullYear();
  const month = cursor.getMonth();
  const startOffset = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();
  const cells: (Date | null)[] = [];
  for (let i = 0; i < startOffset; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(new Date(year, month, d));
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

function formatHebrewLongDate(d: Date): string {
  return d.toLocaleDateString("he-IL", { weekday: "long", day: "numeric", month: "long" });
}

function formatHebrewShortDate(iso: string): string {
  const d = new Date(iso);
  const weekday = d.toLocaleDateString("he-IL", { weekday: "long" });
  const dd = String(d.getDate()).padStart(2, "0");
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const yy = String(d.getFullYear()).slice(-2);
  return `${weekday}, ${dd}/${mm}/${yy}`;
}

function UpcomingCard({ booking }: { booking: BookingForCalendar }) {
  const initial = booking.patientName.slice(0, 1);
  return (
    <div className="w-full rounded-[12px] border border-border-input bg-white p-4">
      <div className="flex items-start justify-between gap-2">
        <div className="flex flex-col gap-1 min-w-0">
          <p className="text-[18px] font-bold text-black truncate">{booking.domainName}</p>
          <p className="text-[14px] text-[#9F9F9F]">
            {formatHebrewShortDate(booking.scheduledDate)}
          </p>
        </div>
      </div>
      <div className="mt-3 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 min-w-0">
          <div className="size-[18px] rounded-full bg-primary/10 text-primary flex items-center justify-center text-[10px] font-medium shrink-0">
            {initial}
          </div>
          <span className="text-[13px] text-[#666] shrink-0">שם המטופל:</span>
          <span className="text-[13px] text-black truncate">{booking.patientName}</span>
        </div>
        <div className="flex items-center gap-1.5 shrink-0">
          <div className="size-[20px] rounded-full bg-[#F6F6F6] flex items-center justify-center">
            <Clock className="size-3 text-muted-foreground" />
          </div>
          <span className="text-[13px] text-[#13D464]">{booking.scheduledTime}</span>
        </div>
      </div>
    </div>
  );
}

export default function AvailabilityPage() {
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<"daily" | "calendar" | "manage">("daily");

  // Add slot form
  const [newWeekday, setNewWeekday] = useState(0);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [isSaving, setIsSaving] = useState(false);
  const [blockDate, setBlockDate] = useState("");

  // Daily view state
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());
  const [miniMonthCursor, setMiniMonthCursor] = useState<Date>(() => new Date());

  const todayIso = formatDate(new Date());
  const selectedIso = formatDate(selectedDate);

  const { data: availability, isLoading, isError, refetch } = useQuery({
    queryKey: ["practitioner-availability"],
    queryFn: fetchAvailability,
  });

  const slots = useMemo(() => availability?.slots ?? [], [availability]);
  const blocks = useMemo(() => availability?.blocks ?? [], [availability]);

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const blockedSet = useMemo(() => new Set(blocks.map((b) => b.blockedDate)), [blocks]);
  const monthGrid = useMemo(() => buildMonthGrid(miniMonthCursor), [miniMonthCursor]);

  // Daily view: fetch bookings for the selected date when this tab is active.
  const { data: dayBookings = [], isLoading: isLoadingDayBookings } = useQuery({
    queryKey: ["availability-day-bookings", selectedIso],
    queryFn: () => fetchBookingsForRange(selectedIso, selectedIso),
    enabled: activeTab === "daily",
  });

  // Daily view: fetch the 3 next upcoming bookings when the tab opens.
  const { data: upcomingBookings = [] } = useQuery<BookingForCalendar[]>({
    queryKey: ["availability-upcoming-bookings"],
    queryFn: () => fetchUpcomingBookingsForPractitioner(3),
    enabled: activeTab === "daily",
  });

  const handleAddSlot = async () => {
    if (newStart >= newEnd) { toast.error("שעת סיום חייבת להיות אחרי שעת התחלה"); return; }
    setIsSaving(true);
    const result = await saveAvailabilitySlot(newWeekday, newStart, newEnd);
    if (result.success) {
      toast.success("זמינות נוספה");
      void refetch();
    } else { toast.error(result.error); }
    setIsSaving(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    const result = await deleteAvailabilitySlot(slotId);
    if (result.success) { toast.success("זמינות הוסרה"); void refetch(); }
    else toast.error(result.error);
  };

  const handleAddBlock = async () => {
    if (!blockDate) return;
    const result = await addBlockedDate(blockDate);
    if (result.success) { toast.success("תאריך נחסם"); setBlockDate(""); void refetch(); }
    else toast.error(result.error);
  };

  const handleRemoveBlock = async (blockId: string) => {
    const result = await removeBlockedDate(blockId);
    if (result.success) { toast.success("חסימה הוסרה"); void refetch(); }
    else toast.error(result.error);
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;
  if (isError || !availability) {
    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center gap-3">
        <p className="text-[15px] text-muted-foreground">שגיאה בטעינת היומן</p>
        <Button onClick={() => void refetch()} variant="secondary" className="bg-[#f4f7f7]">נסה שוב</Button>
      </div>
    );
  }

  const slotsByDay = DAY_NAMES.map((_, i) => slots.filter((s) => s.weekday === i));

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">היומן שלי</h1>
      <p className="text-[16px] text-muted-foreground mb-6">ניהול שעות קבלה ותצוגת יומן שבועי</p>

      {/* Tabs */}
      <div className="flex rounded-[10px] bg-white p-[6px] mb-6 w-full max-w-[600px]">
        <button onClick={() => setActiveTab("daily")} className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "daily" ? "bg-accent font-normal text-black" : "font-light text-black"}`}>
          תצוגה יומית
        </button>
        <button onClick={() => setActiveTab("calendar")} className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "calendar" ? "bg-accent font-normal text-black" : "font-light text-black"}`}>
          תצוגת יומן
        </button>
        <button onClick={() => setActiveTab("manage")} className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "manage" ? "bg-accent font-normal text-black" : "font-light text-black"}`}>
          ניהול זמינות
        </button>
      </div>

      {/* ═══ DAILY VIEW (Screen 29 minimal) ═══ */}
      {activeTab === "daily" && (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Sidebar — first in DOM = visual RIGHT in RTL */}
          <div className="w-full lg:w-[375px] shrink-0 flex flex-col gap-6">
            {/* Mini month calendar */}
            <div className="rounded-[10px] border border-border-input bg-white p-4">
              <div className="flex items-center justify-between mb-3">
                <button
                  type="button"
                  onClick={() =>
                    setMiniMonthCursor((d) => {
                      const n = new Date(d);
                      n.setMonth(d.getMonth() - 1);
                      return n;
                    })
                  }
                  className="p-1 rounded hover:bg-muted/20"
                  aria-label="חודש קודם"
                >
                  <ChevronRight className="size-5" />
                </button>
                <span className="text-[16px] font-medium text-black">
                  {miniMonthCursor.toLocaleDateString("he-IL", { month: "long", year: "numeric" })}
                </span>
                <button
                  type="button"
                  onClick={() =>
                    setMiniMonthCursor((d) => {
                      const n = new Date(d);
                      n.setMonth(d.getMonth() + 1);
                      return n;
                    })
                  }
                  className="p-1 rounded hover:bg-muted/20"
                  aria-label="חודש הבא"
                >
                  <ChevronLeft className="size-5" />
                </button>
              </div>

              <div className="grid grid-cols-7 gap-1 mb-2">
                {MINI_DAY_LETTERS.map((letter) => (
                  <div key={letter} className="text-center text-[12px] text-muted-foreground py-1">
                    {letter}
                  </div>
                ))}
              </div>

              <div className="grid grid-cols-7 gap-1">
                {monthGrid.map((day, i) => {
                  if (!day) return <div key={i} className="h-9" />;
                  const iso = formatDate(day);
                  const isSelected = iso === selectedIso;
                  const isToday = iso === todayIso;
                  return (
                    <button
                      key={i}
                      type="button"
                      onClick={() => setSelectedDate(day)}
                      className={`h-9 rounded-full text-[14px] flex items-center justify-center transition-colors ${
                        isSelected
                          ? "bg-[#CCFFE1] border border-[#13D464] text-[#13D464] font-medium"
                          : isToday
                            ? "border border-border-input text-black"
                            : "text-black hover:bg-muted/20"
                      }`}
                    >
                      {day.getDate()}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Upcoming treatments */}
            <div>
              <h3 className="text-[20px] md:text-[24px] font-medium text-black mb-4">
                טיפולים קרובים
              </h3>
              {upcomingBookings.length === 0 ? (
                <p className="text-[14px] text-muted-foreground">אין טיפולים קרובים</p>
              ) : (
                <div className="flex flex-col gap-4">
                  {upcomingBookings.map((b) => (
                    <UpcomingCard key={b.id} booking={b} />
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Main — day schedule (visual LEFT in RTL = last in DOM) */}
          <div className="flex-1 rounded-[10px] border border-border-input bg-white overflow-hidden">
            <div className="px-5 py-4 border-b border-border">
              <h2 className="text-[20px] md:text-[24px] font-medium text-black">
                {formatHebrewLongDate(selectedDate)}
              </h2>
            </div>

            {isLoadingDayBookings ? (
              <div className="flex justify-center py-20"><Spinner /></div>
            ) : (
              <div className="relative" style={{ height: HOURS.length * HOUR_HEIGHT }}>
                {/* Hour rows (alternating row backgrounds, time labels) */}
                {HOURS.map((hour, i) => (
                  <div
                    key={hour}
                    className={`absolute left-0 right-0 grid grid-cols-[100px_1fr] border-b border-border/40 ${
                      i % 2 === 0 ? "bg-white" : "bg-[#FAFAFA]"
                    }`}
                    style={{ top: i * HOUR_HEIGHT, height: HOUR_HEIGHT }}
                  >
                    <div className="px-3 py-2 text-[13px] text-[#9F9F9F] border-l border-border/40">
                      {hour}:00 {hour < 12 ? "בבוקר" : "בצהריים"}
                    </div>
                    <div />
                  </div>
                ))}

                {/* Booking blocks overlaid by start time. Default 60-min height
                    since the bookings schema has no duration column. */}
                {dayBookings.map((b) => {
                  const [hh, mm] = b.scheduledTime.split(":").map(Number);
                  const startMin = (hh - 8) * 60 + (mm || 0);
                  if (startMin < 0 || startMin >= HOURS.length * 60) return null;
                  const top = (startMin / 60) * HOUR_HEIGHT;
                  const isPending = b.status === "pending_practitioner_approval";
                  return (
                    <div
                      key={b.id}
                      className={`absolute rounded-[8px] p-3 shadow-sm ${
                        isPending
                          ? "bg-[#F0E9FD] border border-[#AD80FF]"
                          : "bg-[#DCFCE7] border border-[#13D464]"
                      }`}
                      style={{
                        top,
                        height: HOUR_HEIGHT - 6,
                        right: 108,
                        left: 8,
                      }}
                    >
                      <p className={`text-[14px] font-medium ${isPending ? "text-[#AD80FF]" : "text-black"}`}>
                        {b.domainName}
                      </p>
                      <p className={`text-[12px] ${isPending ? "text-[#AD80FF]" : "text-[#13D464]"}`}>
                        {b.scheduledTime} • {b.patientName}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ═══ CALENDAR VIEW (week grid — existing) ═══ */}
      {activeTab === "calendar" && (
        <div className="rounded-[16px] border border-border bg-white overflow-hidden">
          {/* Week navigation */}
          <div className="flex items-center justify-between px-4 py-3 border-b border-border">
            <button onClick={() => setWeekOffset((w) => w + 1)}><ChevronLeft className="size-5" /></button>
            <span className="text-[16px] font-medium text-black">
              {weekDates[0].toLocaleDateString("he-IL", { day: "numeric", month: "long" })} — {weekDates[6].toLocaleDateString("he-IL", { day: "numeric", month: "long", year: "numeric" })}
            </span>
            <button onClick={() => setWeekOffset((w) => w - 1)}><ChevronRight className="size-5" /></button>
          </div>

          {/* Day headers */}
          <div className="grid grid-cols-[60px_repeat(7,1fr)] border-b border-border">
            <div className="border-l border-border" />
            {weekDates.map((date, i) => {
              const isToday = formatDate(date) === formatDate(new Date());
              const isBlocked = blockedSet.has(formatDate(date));
              return (
                <div key={i} className={`text-center py-2 border-l border-border ${isToday ? "bg-accent/10" : ""} ${isBlocked ? "bg-red-50" : ""}`}>
                  <p className="text-[12px] text-muted-foreground">{DAY_NAMES[date.getDay()]}</p>
                  <p className={`text-[16px] font-medium ${isToday ? "text-primary" : "text-black"}`}>{date.getDate()}</p>
                  {isBlocked && <p className="text-[10px] text-destructive">חסום</p>}
                </div>
              );
            })}
          </div>

          {/* Hourly grid */}
          <div className="max-h-[600px] overflow-y-auto">
            {HOURS.map((hour) => (
              <div key={hour} className="grid grid-cols-[60px_repeat(7,1fr)] min-h-[48px] border-b border-border/50">
                <div className="flex items-start justify-center pt-1 text-[12px] text-muted-foreground border-l border-border">
                  {hour.toString().padStart(2, "0")}:00
                </div>
                {weekDates.map((date, dayIdx) => {
                  const weekday = date.getDay();
                  const daySlots = slotsByDay[weekday] ?? [];
                  const hasSlot = daySlots.some((s) => {
                    const startH = parseInt(s.startTime.split(":")[0]);
                    const endH = parseInt(s.endTime.split(":")[0]);
                    return hour >= startH && hour < endH;
                  });
                  const isBlocked = blockedSet.has(formatDate(date));
                  return (
                    <div
                      key={dayIdx}
                      className={`border-l border-border/50 ${
                        isBlocked ? "bg-red-50/50" : hasSlot ? "bg-accent/15" : ""
                      }`}
                    >
                      {hasSlot && !isBlocked && (
                        <div className="h-full flex items-center justify-center">
                          <div className="w-[90%] h-[80%] rounded-[4px] bg-accent/30 flex items-center justify-center text-[11px] text-primary">
                            פנוי
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ═══ MANAGE VIEW (existing) ═══ */}
      {activeTab === "manage" && (
        <>
          {/* Add slot form */}
          <div className="rounded-[16px] border border-border bg-white p-5 mb-6">
            <h2 className="text-[18px] font-semibold text-black mb-4">הוספת שעות קבלה</h2>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[14px] text-muted-foreground">יום</label>
                <select value={newWeekday} onChange={(e) => setNewWeekday(Number(e.target.value))} className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-muted-foreground">משעה</label>
                <select value={newStart} onChange={(e) => setNewStart(e.target.value)} className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-muted-foreground">עד שעה</label>
                <select value={newEnd} onChange={(e) => setNewEnd(e.target.value)} className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <Button onClick={handleAddSlot} disabled={isSaving} className="h-[44px] bg-accent text-black">
                {isSaving ? <Spinner size="sm" /> : <><Plus className="size-4 me-1" /> הוסף</>}
              </Button>
            </div>
          </div>

          {/* Weekly schedule */}
          <div className="rounded-[16px] border border-border bg-white p-5 mb-6">
            <h2 className="text-[18px] font-semibold text-black mb-4">לוח זמנים שבועי</h2>
            <div className="flex flex-col gap-4">
              {DAY_NAMES.map((dayName, dayIndex) => (
                <div key={dayIndex} className="flex flex-col sm:flex-row gap-2 sm:items-center">
                  <span className="text-[16px] font-medium text-black w-[80px] shrink-0">{dayName}</span>
                  <div className="flex flex-wrap gap-2 flex-1">
                    {slotsByDay[dayIndex].length === 0 ? (
                      <span className="text-[14px] text-muted-foreground">לא הוגדרה זמינות</span>
                    ) : (
                      slotsByDay[dayIndex].map((slot) => (
                        <div key={slot.id} className="flex items-center gap-2 rounded-[8px] bg-[#e0ffed] border border-[#13d464] px-3 py-1.5">
                          <span className="text-[14px] text-black">{slot.startTime} — {slot.endTime}</span>
                          <button type="button" onClick={() => handleDeleteSlot(slot.id)} className="text-destructive hover:text-destructive/80">
                            <Trash2 className="size-3.5" />
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Block dates */}
          <div className="rounded-[16px] border border-border bg-white p-5">
            <h2 className="text-[18px] font-semibold text-black mb-4">חסימת תאריכים</h2>
            <div className="flex gap-3 items-end mb-4">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[14px] text-muted-foreground">תאריך לחסימה</label>
                <input type="date" value={blockDate} onChange={(e) => setBlockDate(e.target.value)} className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]" />
              </div>
              <Button onClick={handleAddBlock} className="h-[44px] bg-[#ffe0e2] text-destructive hover:bg-[#ffd0d3]">
                <CalendarOff className="size-4 me-1" /> חסום
              </Button>
            </div>
            {blocks.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {blocks.map((block) => (
                  <div key={block.id} className="flex items-center gap-2 rounded-[8px] bg-[#ffe0e2] border border-destructive/30 px-3 py-1.5">
                    <span className="text-[14px] text-destructive">{block.blockedDate}</span>
                    <button type="button" onClick={() => handleRemoveBlock(block.id)} className="text-destructive hover:text-destructive/80">
                      <Trash2 className="size-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );
}
