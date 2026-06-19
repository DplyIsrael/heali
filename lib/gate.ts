/**
 * Site-wide access gate — utilities shared by the Edge middleware and the
 * /api/gate route handler.
 *
 * IMPORTANT: this module is imported by `middleware.ts`, which runs on the Edge
 * runtime. It must therefore use ONLY Web-standard APIs (Web Crypto, TextEncoder)
 * — no `node:crypto`, no `next/headers`, no Node-only globals.
 *
 * The gate is enabled simply by setting `SITE_GATE_PASSWORD`. Leave it unset to
 * disable the gate entirely (e.g. in production once the lockdown is lifted).
 */

/** Name of the HttpOnly cookie that proves the gate password was entered. */
export const GATE_COOKIE = "heali_gate";

/** The static payload signed into the gate cookie. Bump to force re-entry. */
const TOKEN_MESSAGE = "heali-gate-v1";

function gatePassword(): string | undefined {
  const pw = process.env.SITE_GATE_PASSWORD;
  return pw && pw.length > 0 ? pw : undefined;
}

/**
 * Key used to sign the gate cookie. A dedicated `SITE_GATE_SECRET` is preferred,
 * but we fall back to the password itself so a single env var is enough to get
 * going. Either way, changing the password (or secret) invalidates every
 * previously issued cookie.
 */
function gateSecret(): string {
  return process.env.SITE_GATE_SECRET || process.env.SITE_GATE_PASSWORD || "";
}

/** The gate is active only when a password is configured. */
export function gateEnabled(): boolean {
  return !!gatePassword();
}

/** HMAC-SHA256(message) under `key`, returned as lowercase hex. */
async function hmacHex(key: string, message: string): Promise<string> {
  const enc = new TextEncoder();
  const cryptoKey = await crypto.subtle.importKey(
    "raw",
    enc.encode(key),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const sig = await crypto.subtle.sign("HMAC", cryptoKey, enc.encode(message));
  return Array.from(new Uint8Array(sig))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

/** Constant-time comparison of two equal-length strings. */
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }
  return mismatch === 0;
}

/**
 * The expected cookie value for the current password/secret. Stored in the
 * cookie on unlock and recomputed on every request to validate it. Because it
 * is an HMAC of a fixed payload under a server-only secret, it cannot be forged
 * by a client and reveals nothing about the password.
 */
export async function expectedToken(): Promise<string> {
  return hmacHex(gateSecret(), TOKEN_MESSAGE);
}

/** True if the supplied cookie value is a valid, current gate token. */
export async function verifyGateCookie(value: string | undefined | null): Promise<boolean> {
  if (!value) return false;
  return timingSafeEqual(value, await expectedToken());
}

/**
 * Verify a user-submitted password against `SITE_GATE_PASSWORD` in constant
 * time. We compare HMACs of both values rather than the raw strings so neither
 * the length nor the content of the real password leaks through timing.
 */
export async function verifyPassword(submitted: string): Promise<boolean> {
  const real = gatePassword();
  if (!real) return false;
  const key = gateSecret();
  const [a, b] = await Promise.all([hmacHex(key, submitted), hmacHex(key, real)]);
  return timingSafeEqual(a, b);
}
