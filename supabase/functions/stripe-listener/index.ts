import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET");
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

    if (!stripeKey || !supabaseUrl || !supabaseServiceKey) {
      throw new Error("Missing required environment variables");
    }

    // Initialize Supabase admin client (bypasses RLS)
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Read the raw body for signature verification
    const body = await req.text();
    const signature = req.headers.get("stripe-signature") || "";

    // Verify webhook signature if secret is configured
    if (webhookSecret) {
      const verified = await verifyStripeSignature(
        body,
        signature,
        webhookSecret,
        stripeKey,
      );
      if (!verified) {
        return new Response(JSON.stringify({ error: "Invalid signature" }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    const event = JSON.parse(body);

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
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("stripe-listener error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});

/**
 * Map Stripe price IDs to plan names.
 * Update these with your actual Stripe price IDs.
 */
function getPlanNameFromPriceId(priceId: string | undefined): string {
  // ⚠️ IMPORTANT: Update these with your actual Stripe Price IDs before deploying.
  // Get them from: Stripe Dashboard → Products → [Product] → API ID
  const PLAN_MAP: Record<string, string> = {
    // "price_starter_monthly_xxxx": "starter",
    // "price_growth_monthly_xxxx":  "growth",
    // "price_agency_monthly_xxxx":  "agency",
  };
  const plan = priceId && PLAN_MAP[priceId];
  if (plan) return plan;
  console.warn(`Unknown price ID: ${priceId}, defaulting to "growth"`);
  return "growth";
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
