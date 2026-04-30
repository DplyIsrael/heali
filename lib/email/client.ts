import { Resend } from "resend";

const FROM = process.env.RESEND_FROM ?? "Heali <noreply@heali.app>";

export async function sendEmail(params: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ success: boolean; error?: string }> {
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.warn("[email] RESEND_API_KEY not set — skipping send", params.subject, "→", params.to);
    return { success: true };
  }

  try {
    const resend = new Resend(apiKey);
    const { error } = await resend.emails.send({
      from: FROM,
      to: params.to,
      subject: params.subject,
      html: params.html,
    });
    if (error) {
      console.error("[email] send failed", error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (err) {
    console.error("[email] send threw", err);
    return { success: false, error: "Email send failed" };
  }
}
