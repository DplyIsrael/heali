// scripts/test-resend-smtp.mjs
//
// Heali — Resend smoke test
// =========================
// DEV-ONLY. Do not import or invoke from production code paths or deploy hooks.
// This script proves that:
//   1. RESEND_API_KEY is valid
//   2. The configured RESEND_FROM (a verified heali.co.il sender) is accepted by Resend
//   3. End-to-end delivery to a real inbox works
//
// Usage:
//   node scripts/test-resend-smtp.mjs you@example.com
//
// The recipient address MUST be passed as argv[2] — the script refuses to run
// without it so you can't accidentally spam a hard-coded address.
//
// Requirements (already in package.json):
//   - "resend"   (runtime dep)
//   - "dotenv"   (dev dep) — install with: npm install --save-dev dotenv
//
// Exit codes:
//   0 = email accepted by Resend (check the inbox to confirm delivery)
//   1 = configuration error (missing env, missing recipient, invalid email, missing dep)
//   2 = Resend API rejected the send (bad API key, unverified from, etc.)

import { Resend } from "resend";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

// --- Constants -------------------------------------------------------------
const SUPABASE_PROJECT_REF = "lwdpbbyjoilrhaytqbrg";
const SCRIPT_NAME = "test-resend-smtp.mjs";

// --- Load .env.local from the repo root, with a friendly error if dotenv is missing
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const envPath = resolve(__dirname, "..", ".env.local");

let dotenv;
try {
  dotenv = (await import("dotenv")).default;
} catch {
  console.error(
    `[${SCRIPT_NAME}] FATAL: dotenv is not installed.\n` +
      `  Install it with: npm install --save-dev dotenv\n` +
      `  Then re-run this script.`,
  );
  process.exit(1);
}
dotenv.config({ path: envPath });

// --- Validate environment --------------------------------------------------
const apiKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM;

if (!apiKey) {
  console.error(
    `[${SCRIPT_NAME}] FATAL: RESEND_API_KEY is not set.\n` +
      `  Looked in: ${envPath}\n` +
      `  Add it to .env.local and try again.`,
  );
  process.exit(1);
}

if (!from) {
  console.error(
    `[${SCRIPT_NAME}] FATAL: RESEND_FROM is not set.\n` +
      `  Looked in: ${envPath}\n` +
      `  Set it to something like: Heali <noreply@heali.co.il>`,
  );
  process.exit(1);
}

// --- SANDBOX-MODE WARNING --------------------------------------------------
// If RESEND_FROM is still pointing at the resend.dev sandbox, Resend's API
// will accept the send and the script will print "OK sent id=...", but the
// email will ONLY actually deliver to the Resend account owner's email.
// To anyone else passed as argv[2], no email will ever arrive.
// This is the #1 reason the playbook exists — so make it impossible to miss.
if (from.includes("resend.dev")) {
  console.warn(
    `\n[${SCRIPT_NAME}] ============================================================`,
  );
  console.warn(
    `[${SCRIPT_NAME}] WARNING: RESEND_FROM is still the resend.dev SANDBOX sender.`,
  );
  console.warn(
    `[${SCRIPT_NAME}]   from = "${from}"`,
  );
  console.warn(
    `[${SCRIPT_NAME}] Resend will ACCEPT this send and return an id, but will ONLY`,
  );
  console.warn(
    `[${SCRIPT_NAME}] deliver to the email address that owns your Resend account.`,
  );
  console.warn(
    `[${SCRIPT_NAME}] If the recipient below is NOT your Resend account email,`,
  );
  console.warn(
    `[${SCRIPT_NAME}] no inbox delivery will occur — even though the API call`,
  );
  console.warn(
    `[${SCRIPT_NAME}] reports success. Complete Phase A (domain verify) + Phase B`,
  );
  console.warn(
    `[${SCRIPT_NAME}] (env update) before trusting this test.`,
  );
  console.warn(
    `[${SCRIPT_NAME}] ============================================================\n`,
  );
}

// --- Validate recipient ----------------------------------------------------
const recipient = process.argv[2];

if (!recipient) {
  console.error(
    `[${SCRIPT_NAME}] FATAL: recipient email is required as argv[2].\n` +
      `  Usage: node scripts/${SCRIPT_NAME} you@example.com`,
  );
  process.exit(1);
}

// Loose RFC-5322-ish check — good enough to catch typos like "tools@" or "tools".
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
if (!EMAIL_RE.test(recipient)) {
  console.error(
    `[${SCRIPT_NAME}] FATAL: "${recipient}" does not look like a valid email.`,
  );
  process.exit(1);
}

// --- Build the test email --------------------------------------------------
const now = new Date();
const stamp = now.toISOString();

const subject = "Heali SMTP smoke test";

const html = `<!doctype html>
<html lang="en">
  <body style="margin:0;padding:24px;font-family:Rubik,Heebo,Assistant,'Segoe UI',Arial,sans-serif;background:#FAFAFA;color:#0C2826;">
    <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:0 auto;background:#ffffff;border:1px solid #CDDBDB;border-radius:8px;">
      <tr>
        <td style="padding:24px;">
          <h1 style="margin:0 0 16px 0;font-size:20px;color:#21544E;">Heali SMTP smoke test</h1>
          <p style="margin:0 0 12px 0;font-size:14px;line-height:1.5;">
            If you are reading this, the Resend API key works and the
            <code style="background:#F0F4F4;padding:2px 6px;border-radius:4px;">RESEND_FROM</code>
            address has been accepted.
          </p>
          <table role="presentation" cellpadding="0" cellspacing="0" border="0" width="100%" style="margin-top:16px;font-size:13px;color:#9F9F9F;">
            <tr><td style="padding:4px 0;">Sent at</td><td style="padding:4px 0;color:#0C2826;">${stamp}</td></tr>
            <tr><td style="padding:4px 0;">From</td><td style="padding:4px 0;color:#0C2826;">${from}</td></tr>
            <tr><td style="padding:4px 0;">To</td><td style="padding:4px 0;color:#0C2826;">${recipient}</td></tr>
            <tr><td style="padding:4px 0;">Supabase project</td><td style="padding:4px 0;color:#0C2826;">${SUPABASE_PROJECT_REF}</td></tr>
          </table>
          <p style="margin:24px 0 0 0;font-size:12px;color:#9F9F9F;">
            This message was generated by scripts/${SCRIPT_NAME}. It is safe to ignore and delete.
          </p>
        </td>
      </tr>
    </table>
  </body>
</html>`;

const text = [
  "Heali SMTP smoke test",
  "",
  "If you are reading this, the Resend API key works and the RESEND_FROM",
  "address has been accepted.",
  "",
  `Sent at:           ${stamp}`,
  `From:              ${from}`,
  `To:                ${recipient}`,
  `Supabase project:  ${SUPABASE_PROJECT_REF}`,
  "",
  `This message was generated by scripts/${SCRIPT_NAME}. Safe to delete.`,
].join("\n");

// --- Send ------------------------------------------------------------------
console.log(`[${SCRIPT_NAME}] sending test email...`);
console.log(`  from: ${from}`);
console.log(`  to:   ${recipient}`);

const resend = new Resend(apiKey);

try {
  const { data, error } = await resend.emails.send({
    from,
    to: recipient,
    subject,
    html,
    text,
  });

  if (error) {
    console.error(`[${SCRIPT_NAME}] Resend rejected the send:`);
    console.error(`  name:    ${error.name}`);
    console.error(`  message: ${error.message}`);
    console.error(
      `  Common causes:\n` +
        `    - RESEND_FROM domain not verified in Resend dashboard\n` +
        `    - RESEND_API_KEY is a test-mode key but RESEND_FROM is a live domain (or vice versa)\n` +
        `    - Recipient domain is on Resend's suppression list`,
    );
    process.exit(2);
  }

  console.log(
    `[${SCRIPT_NAME}] OK sent id=${data?.id ?? "<unknown>"} to=${recipient} from="${from}"`,
  );
  console.log(`[${SCRIPT_NAME}] Check the inbox now. If nothing arrives within 60s, check`);
  console.log(`[${SCRIPT_NAME}] https://resend.com/emails for the delivery status of id ${data?.id}.`);
  if (from.includes("resend.dev")) {
    console.log(
      `[${SCRIPT_NAME}] NOTE: sandbox sender in use — re-read the WARNING above if no email arrives.`,
    );
  }
  process.exit(0);
} catch (err) {
  console.error(`[${SCRIPT_NAME}] Unexpected error talking to Resend:`);
  console.error(err);
  process.exit(2);
}