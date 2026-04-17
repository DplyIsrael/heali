"use server";

import { createClient } from "@/lib/supabase/server";

interface ActionResult {
  success: boolean;
  error?: string;
}

export interface AvailabilitySlot {
  id: string;
  weekday: number;
  startTime: string;
  endTime: string;
}

export interface BlockedDate {
  id: string;
  blockedDate: string;
}

export async function fetchAvailability(): Promise<{
  slots: AvailabilitySlot[];
  blocks: BlockedDate[];
}> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { slots: [], blocks: [] };

  // Get practitioner profile ID
  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { slots: [], blocks: [] };

  const [slotsRes, blocksRes] = await Promise.all([
    supabase
      .from("practitioner_availability")
      .select("id, weekday, start_time, end_time")
      .eq("practitioner_id", profile.id)
      .order("weekday")
      .order("start_time"),
    supabase
      .from("availability_blocks")
      .select("id, blocked_date")
      .eq("practitioner_id", profile.id)
      .order("blocked_date"),
  ]);

  return {
    slots: (slotsRes.data ?? []).map((s) => ({
      id: s.id,
      weekday: s.weekday,
      startTime: s.start_time,
      endTime: s.end_time,
    })),
    blocks: (blocksRes.data ?? []).map((b) => ({
      id: b.id,
      blockedDate: b.blocked_date,
    })),
  };
}

export async function saveAvailabilitySlot(
  weekday: number,
  startTime: string,
  endTime: string
): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  const { error } = await supabase
    .from("practitioner_availability")
    .insert({
      practitioner_id: profile.id,
      weekday,
      start_time: startTime,
      end_time: endTime,
    });

  if (error) return { success: false, error: "שגיאה בשמירת זמינות" };
  return { success: true };
}

export async function deleteAvailabilitySlot(slotId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("practitioner_availability")
    .delete()
    .eq("id", slotId);

  if (error) return { success: false, error: "שגיאה במחיקת זמינות" };
  return { success: true };
}

export async function addBlockedDate(date: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { success: false, error: "לא מחובר" };

  const { data: profile } = await supabase
    .from("practitioner_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single();

  if (!profile) return { success: false, error: "פרופיל לא נמצא" };

  const { error } = await supabase
    .from("availability_blocks")
    .insert({
      practitioner_id: profile.id,
      blocked_date: date,
    });

  if (error) return { success: false, error: "שגיאה בחסימת תאריך" };
  return { success: true };
}

export async function removeBlockedDate(blockId: string): Promise<ActionResult> {
  const supabase = await createClient();
  const { error } = await supabase
    .from("availability_blocks")
    .delete()
    .eq("id", blockId);

  if (error) return { success: false, error: "שגיאה בהסרת חסימה" };
  return { success: true };
}
