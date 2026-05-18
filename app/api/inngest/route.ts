import { serve } from "inngest/next";
import { inngest } from "@/lib/inngest/client";
import { sendSurveyAfterScan, practitionerApprovalReminder } from "@/lib/inngest/functions";

// Inngest receives function invocations on this endpoint and dispatches
// to the registered handlers. Inert until INNGEST_EVENT_KEY +
// INNGEST_SIGNING_KEY are set in Vercel — the route still mounts so
// Inngest can fingerprint the registered functions when wiring up.
export const { GET, POST, PUT } = serve({
  client: inngest,
  functions: [sendSurveyAfterScan, practitionerApprovalReminder],
});
