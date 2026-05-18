"use server";

import { sendEmail } from "@/lib/email/client";
import { contactFormEmail } from "@/lib/email/templates";
import { checkRateLimit } from "@/lib/rate-limit";

const CONTACT_INBOX = process.env.CONTACT_INBOX_EMAIL ?? "info@heali.co.il";

interface ActionResult {
  success: boolean;
  error?: string;
}

export async function sendContactMessage(params: {
  name: string;
  phone: string;
  email: string;
  message: string;
}): Promise<ActionResult> {
  // 3 contact-form submissions per IP per 10 min — keeps the form
  // useful while blocking scripted spam.
  const rl = await checkRateLimit({ bucket: "contact", max: 3, windowSeconds: 600 });
  if (!rl.success) {
    return { success: false, error: `יותר מדי ניסיונות, נסה שוב בעוד ${rl.retryAfterSeconds} שניות` };
  }

  // Bare-minimum input validation. Form-level required attributes already
  // catch empties, but server actions can be invoked directly.
  if (!params.name?.trim() || !params.phone?.trim() || !params.email?.trim() || !params.message?.trim()) {
    return { success: false, error: "אנא מלא את כל השדות" };
  }

  const { subject, html, replyTo } = contactFormEmail(params);
  const result = await sendEmail({
    to: CONTACT_INBOX,
    subject,
    html,
    replyTo,
  });
  if (!result.success) {
    return { success: false, error: "שגיאה בשליחת ההודעה" };
  }
  return { success: true };
}
