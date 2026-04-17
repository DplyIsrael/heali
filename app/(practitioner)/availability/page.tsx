"use client";

/* eslint-disable react-hooks/set-state-in-effect */

import { useState, useEffect, useMemo } from "react";
import { ChevronLeft, ChevronRight, Plus, Trash2, CalendarOff } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { toast } from "sonner";
import {
  fetchAvailability,
  saveAvailabilitySlot,
  deleteAvailabilitySlot,
  addBlockedDate,
  removeBlockedDate,
  type AvailabilitySlot,
  type BlockedDate,
} from "./actions";

const DAY_NAMES = ["ראשון", "שני", "שלישי", "רביעי", "חמישי", "שישי", "שבת"];
const HOURS = Array.from({ length: 13 }, (_, i) => i + 8); // 8:00 - 20:00
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

export default function AvailabilityPage() {
  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [blocks, setBlocks] = useState<BlockedDate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [weekOffset, setWeekOffset] = useState(0);
  const [activeTab, setActiveTab] = useState<"calendar" | "manage">("calendar");

  // Add slot form
  const [newWeekday, setNewWeekday] = useState(0);
  const [newStart, setNewStart] = useState("09:00");
  const [newEnd, setNewEnd] = useState("10:00");
  const [isSaving, setIsSaving] = useState(false);
  const [blockDate, setBlockDate] = useState("");

  const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
  const blockedSet = useMemo(() => new Set(blocks.map((b) => b.blockedDate)), [blocks]);

  useEffect(() => {
    async function load() {
      const data = await fetchAvailability();
      setSlots(data.slots);
      setBlocks(data.blocks);
      setIsLoading(false);
    }
    load();
  }, []);

  const handleAddSlot = async () => {
    if (newStart >= newEnd) { toast.error("שעת סיום חייבת להיות אחרי שעת התחלה"); return; }
    setIsSaving(true);
    const result = await saveAvailabilitySlot(newWeekday, newStart, newEnd);
    if (result.success) {
      toast.success("זמינות נוספה");
      const data = await fetchAvailability();
      setSlots(data.slots);
    } else { toast.error(result.error); }
    setIsSaving(false);
  };

  const handleDeleteSlot = async (slotId: string) => {
    const result = await deleteAvailabilitySlot(slotId);
    if (result.success) { setSlots((p) => p.filter((s) => s.id !== slotId)); toast.success("זמינות הוסרה"); }
    else toast.error(result.error);
  };

  const handleAddBlock = async () => {
    if (!blockDate) return;
    const result = await addBlockedDate(blockDate);
    if (result.success) { toast.success("תאריך נחסם"); const data = await fetchAvailability(); setBlocks(data.blocks); setBlockDate(""); }
    else toast.error(result.error);
  };

  const handleRemoveBlock = async (blockId: string) => {
    const result = await removeBlockedDate(blockId);
    if (result.success) { setBlocks((p) => p.filter((b) => b.id !== blockId)); toast.success("חסימה הוסרה"); }
    else toast.error(result.error);
  };

  if (isLoading) return <div className="flex min-h-[60vh] items-center justify-center"><Spinner /></div>;

  const slotsByDay = DAY_NAMES.map((_, i) => slots.filter((s) => s.weekday === i));

  return (
    <div className="mx-auto max-w-[1440px] px-4 md:px-[50px] py-6 md:py-10">
      <h1 className="text-[28px] md:text-[36px] font-bold text-black mb-2">היומן שלי</h1>
      <p className="text-[16px] text-muted mb-6">ניהול שעות קבלה ותצוגת יומן שבועי</p>

      {/* Tabs */}
      <div className="flex rounded-[10px] bg-white p-[6px] mb-6 w-full max-w-[400px]">
        <button onClick={() => setActiveTab("calendar")} className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "calendar" ? "bg-accent font-normal text-black" : "font-light text-black"}`}>
          תצוגת יומן
        </button>
        <button onClick={() => setActiveTab("manage")} className={`flex-1 py-2.5 rounded-[8px] text-[16px] transition-colors ${activeTab === "manage" ? "bg-accent font-normal text-black" : "font-light text-black"}`}>
          ניהול זמינות
        </button>
      </div>

      {/* ═══ CALENDAR VIEW ═══ */}
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
                  <p className="text-[12px] text-muted">{DAY_NAMES[date.getDay()]}</p>
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
                <div className="flex items-start justify-center pt-1 text-[12px] text-muted border-l border-border">
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

      {/* ═══ MANAGE VIEW ═══ */}
      {activeTab === "manage" && (
        <>
          {/* Add slot form */}
          <div className="rounded-[16px] border border-border bg-white p-5 mb-6">
            <h2 className="text-[18px] font-semibold text-black mb-4">הוספת שעות קבלה</h2>
            <div className="flex flex-col sm:flex-row gap-3 items-end">
              <div className="flex flex-col gap-1 flex-1">
                <label className="text-[14px] text-muted">יום</label>
                <select value={newWeekday} onChange={(e) => setNewWeekday(Number(e.target.value))} className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  {DAY_NAMES.map((name, i) => <option key={i} value={i}>{name}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-muted">משעה</label>
                <select value={newStart} onChange={(e) => setNewStart(e.target.value)} className="h-[44px] rounded-[10px] border border-border-input bg-white px-3 text-[14px]">
                  {TIME_OPTIONS.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1">
                <label className="text-[14px] text-muted">עד שעה</label>
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
                      <span className="text-[14px] text-muted">לא הוגדרה זמינות</span>
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
                <label className="text-[14px] text-muted">תאריך לחסימה</label>
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
