import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGIN = Deno.env.get("CORS_ORIGIN") || "https://reviewping-seven.vercel.app";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Content-Type": "application/json",
};

/**
 * Stripe Webhook Listener
 *
 * Handles incoming Stripe webhook events to keep the local
 * subscriptions table in sync with Stripe.
 *
 * Events handled:
 *   - checkout.session.completed
 *   - invoice.payment_succeeded
 *   - customer.subscription.updated
 *   - customer.subscription.deleted
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: CORS_HEADERS,
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !webhookSecret || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables: STRIPE_SECRET_KEY, STRIPE_WEBHOOK_SECRET, SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY");
    }

    // Initialize Supabase admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature");
    if (!signature) {
      return new Response(JSON.stringify({ error: "Missing stripe-signature header" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    // Verify webhook signature — mandatory (not optional) for security
    const verified = await verifyStripeSignature(body, signature, webhookSecret, stripeKey);
    if (!verified) {
      return new Response(JSON.stringify({ error: "Invalid webhook signature" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    // Parse event body — catch edge case of invalid JSON after signature verification
    let event;
    try {
      event = JSON.parse(body);
    } catch {
      return new Response(JSON.stringify({ error: "Invalid webhook body" }), {
        status: 400,
        headers: CORS_HEADERS,
      });
    }

    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object;
        const userId = session.metadata?.user_id;
        const customerId = session.customer;
        const subscriptionId = session.subscription;

        if (userId && subscriptionId) {
          // Fetch subscription details from Stripe
          const subRes = await fetch(
            `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
            {
              headers: { Authorization: `Bearer ${stripeKey}` },
            },
          );
          const subscription = await subRes.json();

          // Upsert the subscription record
          await supabase.from("subscriptions").upsert({
            user_id: userId,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscriptionId,
            plan_id: subscription.items?.data?.[0]?.price?.id,
            status: subscription.status,
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
          });

          // Update the user's plan on their profile
          const priceId = subscription.items?.data?.[0]?.price?.id;
          const planName = getPlanNameFromPriceId(priceId);
          await supabase
            .from("profiles")
            .update({ plan: planName })
            .eq("id", userId);
        }
        break;
      }

      case "invoice.payment_succeeded": {
        const invoice = event.data.object;
        const subscriptionId = invoice.subscription;

        if (subscriptionId) {
          const subRes = await fetch(
            `https://api.stripe.com/v1/subscriptions/${subscriptionId}`,
            {
              headers: { Authorization: `Bearer ${stripeKey}` },
            },
          );
          const subscription = await subRes.json();

          await supabase
            .from("subscriptions")
            .update({
              status: subscription.status,
              current_period_start: new Date(
                subscription.current_period_start * 1000,
              ).toISOString(),
              current_period_end: new Date(
                subscription.current_period_end * 1000,
              ).toISOString(),
            })
            .eq("stripe_subscription_id", subscriptionId);
        }
        break;
      }

      case "customer.subscription.updated":
      case "customer.subscription.deleted": {
        const subscription = event.data.object;
        const subscriptionId = subscription.id;
        const status = subscription.status;

        await supabase
          .from("subscriptions")
          .update({
            status,
            current_period_start: new Date(
              subscription.current_period_start * 1000,
            ).toISOString(),
            current_period_end: new Date(
              subscription.current_period_end * 1000,
            ).toISOString(),
          })
          .eq("stripe_subscription_id", subscriptionId);

        // If cancelled, downgrade the plan
        if (status === "canceled" || status === "incomplete_expired") {
          // Find the user_id from the subscription
          const { data: subData } = await supabase
            .from("subscriptions")
            .select("user_id")
            .eq("stripe_subscription_id", subscriptionId)
            .single();

          if (subData?.user_id) {
            const priceId = subscription.items?.data?.[0]?.price?.id;
            const planName = getPlanNameFromPriceId(priceId);
            // If no valid plan, default to "free"
            await supabase
              .from("profiles")
              .update({ plan: planName || "free" })
              .eq("id", subData.user_id);
          }
        }
        break;
      }

      default:
        // Unhandled event type — acknowledged but not processed
        break;
    }

    return new Response(JSON.stringify({ received: true }), {
      headers: CORS_HEADERS,
    });
  } catch (err) {
    console.error("stripe-listener error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: CORS_HEADERS,
    });
  }
});

/**
 * Map Stripe price IDs to plan names.
 *
 * ╔══════════════════════════════════════════════════════════════════════════════╗
 * ║  SETUP REQUIRED BEFORE PRODUCTION USE                                       ║
 * ║  1. Go to Stripe Dashboard → Products → create 3 products:                  ║
 * ║     - Starter ($19/mo)                                                      ║
 * ║     - Growth ($49/mo)                                                       ║
 * ║     - Agency ($99/mo)                                                       ║
 * ║  2. Copy the API Price IDs (starts with "price_") into PLAN_MAP below.      ║
 * ║  3. Deploy the function.                                                    ║
 * ║  Until this is done, ALL subscriptions will map to "growth".                ║
 * ╚══════════════════════════════════════════════════════════════════════════════╝
 */
function getPlanNameFromPriceId(priceId: string | undefined): string {
  // ── Stripe Price ID → Plan Name mapping ───────────────────────────────
  // Paste your actual Stripe Price IDs here:
  const PLAN_MAP: Record<string, string> = {
    // "price_1ABC123starter": "starter",
    // "price_1ABC123growth":  "growth",
    // "price_1ABC123agency":  "agency",
  };

  // Allow override via environment variable (for testing):
  // Set STRIPE_DEFAULT_PLAN to "starter", "growth", or "agency"
  const DEFAULT_PLAN = Deno.env.get("STRIPE_DEFAULT_PLAN") || "growth";

  if (priceId && PLAN_MAP[priceId]) {
    return PLAN_MAP[priceId];
  }

  if (priceId) {
    console.warn(`Unknown price ID: ${priceId}, defaulting to "${DEFAULT_PLAN}"`);
  }
  return DEFAULT_PLAN;
}

/**
 * Verify a Stripe webhook signature.
 *
 * Stripe signs webhook payloads using HMAC-SHA256.
 * This reconstructs the expected signature and compares.
 */
async function verifyStripeSignature(
  body: string,
  signatureHeader: string,
  webhookSecret: string,
  _stripeKey: string,
): Promise<boolean> {
  try {
    // Parse the signature header
    const parts = signatureHeader.split(",");
    const kv: Record<string, string> = {};
    let sig = "";
    let timestamp = "";

    for (const part of parts) {
      const [k, v] = part.split("=");
      kv[k.trim()] = v.trim();
      if (k.trim() === "v1") sig = v.trim();
    }

    // Extract the timestamp from the payload's signature scheme
    // Stripe format: t=timestamp,v1=signature
    const tMatch = signatureHeader.match(/t=(\d+)/);
    if (tMatch) timestamp = tMatch[1];

    if (!sig || !timestamp) return false;

    // Recreate the expected payload
    const signedPayload = `${timestamp}.${body}`;

    // Compute HMAC
    const keyBytes = new TextEncoder().encode(webhookSecret);
    const msgBytes = new TextEncoder().encode(signedPayload);

    const cryptoKey = await crypto.subtle.importKey(
      "raw",
      keyBytes,
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"],
    );

    const signatureBytes = await crypto.subtle.sign(
      "HMAC",
      cryptoKey,
      msgBytes,
    );

    // Convert to hex
    const expectedSig = Array.from(new Uint8Array(signatureBytes))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");

    // Constant-time comparison
    if (expectedSig.length !== sig.length) return false;

    let result = 0;
    for (let i = 0; i < expectedSig.length; i++) {
      result |= expectedSig.charCodeAt(i) ^ sig.charCodeAt(i);
    }
    return result === 0;
  } catch {
    return false;
  }
}
