import { inngest } from "./client";
import { createAdminClient } from "@/lib/supabase/admin";
import { sendEmail } from "@/lib/email/client";
import { surveyEmail } from "@/lib/email/templates";

/**
 * Fires ~2 hours after a patient scans the practitioner's QR. Sends them
 * the satisfaction survey link.
 *
 * Triggered by emitting `booking/qr.scanned` from the QR scan handler.
 */
export const sendSurveyAfterScan = inngest.createFunction(
  { id: "send-survey-after-scan", name: "Send survey 2h after QR scan" },
  { event: "booking/qr.scanned" },
  async ({ event, step }) => {
    const bookingId = event.data.bookingId as string;
    if (!bookingId) {
      return { skipped: "missing bookingId" };
    }

    // Wait 2 hours after the scan before nudging.
    await step.sleep("wait-2h", "2h");

    await step.run("send-email", async () => {
      const admin = createAdminClient();
      const { data: booking } = await admin
        .from("bookings")
        .select(`
          id, patient_id, practitioner_id, qr_scanned_at,
          practitioner_profiles!inner (users!inner (full_name))
        `)
        .eq("id", bookingId)
        .single();
      if (!booking) return { skipped: "booking not found" };

      const { data: patient } = await admin
        .from("users")
        .select("full_name, email")
        .eq("id", booking.patient_id)
        .single();
      if (!patient?.email) return { skipped: "no patient email" };

      const profile = booking.practitioner_profiles as unknown as { users: { full_name: string } };
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://heali.co.il";

      const { subject, html } = surveyEmail({
        patientName: patient.full_name ?? "",
        practitionerName: profile.users?.full_name ?? "",
        surveyUrl: `${siteUrl}/survey/${bookingId}`,
      });
      await sendEmail({ to: patient.email, subject, html });
      return { sent: patient.email };
    });
  }
);

/**
 * Daily reminder for admins about practitioner applications that have
 * been sitting in "submitted" state for more than 3 days.
 *
 * Triggered by a cron schedule (Inngest "cron" trigger). Inert until
 * Inngest cloud picks up the cron.
 */
export const practitionerApprovalReminder = inngest.createFunction(
  { id: "practitioner-approval-reminder", name: "Practitioner approval reminder" },
  { cron: "0 9 * * *" }, // 09:00 daily, server time
  async ({ step }) => {
    return await step.run("scan", async () => {
      const admin = createAdminClient();
      const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString();
      const { data: stale } = await admin
        .from("practitioner_profiles")
        .select("id, user_id, updated_at, users!inner(full_name)")
        .eq("verification_status", "submitted")
        .lt("updated_at", threeDaysAgo);
      if (!stale || stale.length === 0) return { reminded: 0 };

      // Notify every admin user via the in-app notifications table.
      const { data: admins } = await admin.from("users").select("id").eq("role", "admin");
      if (!admins || admins.length === 0) return { reminded: 0 };

      const rows = stale.flatMap((p) => {
        const profile = p as Record<string, unknown>;
        const users = profile.users as unknown as { full_name: string };
        return admins.map((a) => ({
          user_id: (a as { id: string }).id,
          type: "practitioner_approval_stale",
          payload: {
            practitionerId: profile.id,
            practitionerName: users?.full_name ?? "",
          },
        }));
      });
      if (rows.length > 0) {
        await admin.from("notifications").insert(rows);
      }
      return { reminded: stale.length };
    });
  }
);
