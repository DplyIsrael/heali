import { NextResponse } from "next/server";
import { createAdminClient } from "@/lib/supabase/admin";

/**
 * CardCom redirects the user here when the Low Profile session fails or
 * the patient bails out. We mark the booking as payment-failed so the
 * practitioner doesn't think it's pending and the slot reopens.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const bookingId = url.searchParams.get("ReturnValue");
  const reason = url.searchParams.get("Description") ?? "תשלום לא הושלם";

  if (bookingId) {
    const admin = createAdminClient();
    await admin
      .from("bookings")
      .update({
        payment_status: "failed",
        payment_failure_reason: reason,
        status: "canceled",
        updated_at: new Date().toISOString(),
      })
      .eq("id", bookingId)
      // Only a still-pending (never-tokenized) booking may be failed here.
      // Prevents an unauthenticated GET from canceling a charged/confirmed
      // booking by guessing its id.
      .eq("payment_status", "pending");
  }

  return NextResponse.redirect(new URL(`/my-treatments?payment=failed`, request.url));
}
