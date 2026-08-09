// Auto-generated from .telemetry/tracking-plan.yaml v1 + .telemetry/instrument.md
// Ã¢â‚¬â€ regenerate with the product-tracking-implement-tracking skill if the plan
// changes. Server-side (Deno edge function) PostHog helper.
//
// Edge functions are stateless and short-lived Ã¢â‚¬â€ a fresh client is created
// per invocation, flushAt is set to 1 so nothing sits in an internal buffer,
// and every capture() must pass `groups` explicitly (unlike the stateful
// browser SDK).

import { PostHog } from "npm:posthog-node@4";

export function getPostHogClient() {
  return new PostHog(Deno.env.get("POSTHOG_KEY")!, {
    host: Deno.env.get("POSTHOG_HOST") ?? "https://us.i.posthog.com",
    flushAt: 1,
    flushInterval: 0,
  });
}

/**
 * Capture a business-level event and flush immediately. Use this for the
 * common case Ã¢â‚¬â€ an event attributed to the `business` group.
 */
export async function captureServerEvent(
  distinctId: string,
  event: string,
  properties: Record<string, unknown>,
  businessId: string,
) {
  try {
    const posthog = getPostHogClient();
    posthog.capture({
      distinctId,
      event,
      properties,
      groups: { business: businessId },
    });
    await posthog.flush();
  } catch (err) {
    // Never let a tracking failure block the actual user-facing action.
    console.error(`posthog capture failed for ${event}:`, err);
  }
}

/** Update business group traits (e.g. after a plan change). */
export async function updateBusinessGroup(
  businessId: string,
  properties: Record<string, unknown>,
) {
  try {
    const posthog = getPostHogClient();
    posthog.groupIdentify({
      groupType: "business",
      groupKey: businessId,
      properties,
    });
    await posthog.flush();
  } catch (err) {
    console.error("posthog groupIdentify failed:", err);
  }
}
