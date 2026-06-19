import { NextResponse } from "next/server";
import { checkRateLimit } from "@/lib/rate-limit";
import { GATE_COOKIE, expectedToken, gateEnabled, verifyPassword } from "@/lib/gate";

/**
 * Site-gate unlock endpoint.
 *
 * Receives the access password, validates it server-side against
 * `SITE_GATE_PASSWORD`, and — only on success — sets the signed HttpOnly gate
 * cookie that the middleware checks on every subsequent request. The password
 * itself never reaches the client and is never stored anywhere.
 *
 * This route is allow-listed in `middleware.ts` so it stays reachable while the
 * rest of the app is locked.
 */

// How long an unlock lasts before the password must be re-entered.
const COOKIE_MAX_AGE_SECONDS = 60 * 60 * 24 * 7; // 7 days

export async function POST(request: Request) {
  if (!gateEnabled()) {
    // Nothing to unlock when no password is configured.
    return NextResponse.json({ error: "gate_disabled" }, { status: 404 });
  }

  // Throttle brute-force attempts. No-op when Upstash isn't configured
  // (see lib/rate-limit.ts) — see the security notes for the implication.
  const rl = await checkRateLimit({ bucket: "site-gate", max: 10, windowSeconds: 60 });
  if (!rl.success) {
    return NextResponse.json(
      { error: "rate_limited" },
      { status: 429, headers: { "retry-after": String(rl.retryAfterSeconds) } }
    );
  }

  let password = "";
  try {
    const body = await request.json();
    password = typeof body?.password === "string" ? body.password : "";
  } catch {
    return NextResponse.json({ error: "bad_request" }, { status: 400 });
  }

  if (!(await verifyPassword(password))) {
    return NextResponse.json({ error: "invalid" }, { status: 401 });
  }

  const res = NextResponse.json({ success: true });
  res.cookies.set(GATE_COOKIE, await expectedToken(), {
    httpOnly: true, // not readable by JS — mitigates XSS theft
    secure: process.env.NODE_ENV === "production", // dev runs on http://localhost
    sameSite: "lax",
    path: "/",
    maxAge: COOKIE_MAX_AGE_SECONDS,
  });
  return res;
}
