import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLowProfileResult } from "@/lib/payments/cardcom";

/**
 * CardCom posts here async on payment completion (their "Notify URL").
 * Mirrors what /success does, but runs even if the patient closed the
 * tab — guarantees we don't lose the token.
 *
 * The payload comes as form-encoded fields. We extract LowProfileId +
 * ReturnValue, then re-verify with CardCom server-to-server so a forged
 * webhook can't poison a booking row.
 */
export async function POST(request: Request) {
  let lowProfileId: string | null = null;
  let bookingId: string | null = null;

  // CardCom sends application/x-www-form-urlencoded
  try {
    const contentType = request.headers.get("content-type") ?? "";
    if (contentType.includes("application/json")) {
      const body = (await request.json()) as Record<string, unknown>;
      lowProfileId = (body.LowProfileId as string | undefined) ?? null;
      bookingId = (body.ReturnValue as string | undefined) ?? null;
    } else {
      const form = await request.formData();
      lowProfileId = (form.get("LowProfileId") as string) ?? (form.get("lowprofilecode") as string) ?? null;
      bookingId = (form.get("ReturnValue") as string) ?? null;
    }
  } catch (err) {
    console.error("[cardcom/webhook] failed to parse body:", err);
    return NextResponse.json({ ok: false, error: "bad payload" }, { status: 400 });
  }

  if (!lowProfileId || !bookingId) {
    return NextResponse.json({ ok: false, error: "missing fields" }, { status: 400 });
  }

  const result = await getLowProfileResult(lowProfileId);
  if (!result.success) {
    console.error("[cardcom/webhook] verify failed:", result.error);
    return NextResponse.json({ ok: false, error: "verify failed" }, { status: 400 });
  }

  if (result.data.returnValue && result.data.returnValue !== bookingId) {
    console.error("[cardcom/webhook] booking id mismatch");
    return NextResponse.json({ ok: false, error: "mismatch" }, { status: 400 });
  }

  const admin = createAdminClient();
  await admin
    .from("bookings")
    .update({
      payment_low_profile_id: lowProfileId,
      payment_token: result.data.token ?? null,
      payment_status: "tokenized",
      updated_at: new Date().toISOString(),
    })
    .eq("id", bookingId)
    // Only flip to "tokenized" if we haven't already charged — avoids
    // the webhook clobbering a later state (e.g. "charged").
    .eq("payment_status", "pending");

  return NextResponse.json({ ok: true });
}
