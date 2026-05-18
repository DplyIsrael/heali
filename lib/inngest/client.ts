import { Inngest } from "inngest";

/**
 * Shared Inngest client. Functions register against this, and server-side
 * code emits events via `inngest.send(...)`.
 *
 * In environments without INNGEST_EVENT_KEY (local dev or pre-launch),
 * Inngest auto-falls back to the local dev server / no-op so emits don't
 * throw. Once you set INNGEST_EVENT_KEY + INNGEST_SIGNING_KEY in Vercel
 * and point an Inngest cloud project at /api/inngest, events route to
 * the cloud automatically.
 */
export const inngest = new Inngest({
  id: "heali",
  name: "Heali",
});
