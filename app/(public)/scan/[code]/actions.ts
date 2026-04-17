"use server";

import { createClient } from "@/lib/supabase/server";

interface AttendanceResult {
  success: boolean;
  error?: string;
  practitionerName?: string;
}

export async function confirmAttendance(qrCode: string): Promise<AttendanceResult> {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) return { success: false, error: "יש להתחבר כדי לאשר נוכחות" };

  // Find practitioner by QR code URL
  const { data: practitioner } = await supabase
    .from("practitioner_profiles")
    .select("id, qr_code_url, users!inner(full_name)")
    .eq("qr_code_url", qrCode)
    .single();

  if (!practitioner) {
    return { success: false, error: "קוד QR לא תקין" };
  }

  // Find the nearest upcoming confirmed booking for this patient with this practitioner
  const today = new Date().toISOString().split("T")[0];

  const { data: booking } = await supabase
    .from("bookings")
    .select("id, scheduled_date, scheduled_time")
    .eq("patient_id", user.id)
    .eq("practitioner_id", practitioner.id)
    .eq("status", "confirmed")
    .gte("scheduled_date", today)
    .order("scheduled_date", { ascending: true })
    .order("scheduled_time", { ascending: true })
    .limit(1)
    .single();

  if (!booking) {
    return { success: false, error: "לא נמצאה הזמנה מאושרת למטפל/ת זו" };
  }

  // Mark as completed
  const { error: updateError } = await supabase
    .from("bookings")
    .update({
      status: "completed",
      qr_scanned_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    })
    .eq("id", booking.id);

  if (updateError) {
    return { success: false, error: "שגיאה באישור הנוכחות" };
  }

  // TODO: Trigger Inngest job to send satisfaction survey after 2 hours

  const users = practitioner.users as unknown as { full_name: string };
  return { success: true, practitionerName: users.full_name };
}
