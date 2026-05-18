import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { getLowProfileResult } from "@/lib/payments/cardcom";

/**
 * CardCom redirects the user here after a successful Low Profile session.
 *
 * The query string carries `lowprofilecode` (CardCom's session id) and our
 * `ReturnValue` (booking id). We verify with CardCom server-side, store the
 * resulting token + transaction id on the booking, then bounce the user to
 * the booking confirmation page.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const lowProfileId = url.searchParams.get("lowprofilecode") ?? url.searchParams.get("LowProfileId");
  const bookingId = url.searchParams.get("ReturnValue");

  if (!lowProfileId || !bookingId) {
    return NextResponse.redirect(new URL("/my-treatments?payment=error", request.url));
  }

  const result = await getLowProfileResult(lowProfileId);
  if (!result.success) {
    console.error("[cardcom/success] verify failed:", result.error);
    return NextResponse.redirect(new URL(`/my-treatments?payment=error&bookingId=${bookingId}`, request.url));
  }

  // Sanity check: the booking id CardCom echoed back matches what's in the URL.
  if (result.data.returnValue && result.data.returnValue !== bookingId) {
    console.error("[cardcom/success] booking id mismatch:", { url: bookingId, echoed: result.data.returnValue });
    return NextResponse.redirect(new URL("/my-treatments?payment=error", request.url));
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
    .eq("id", bookingId);

  return NextResponse.redirect(new URL(`/my-treatments?payment=ok&bookingId=${bookingId}`, request.url));
}
