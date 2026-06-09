import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

/**
 * Dodo Payments Webhook Handler
 *
 * Processes incoming webhook events from Dodo Payments:
 * - checkout.session.completed → create/update subscription
 * - subscription.created / updated / cancelled → sync subscription status
 * - invoice.payment_succeeded / payment_failed → update billing status
 *
 * Required env vars:
 *   DODO_PAYMENTS_WEBHOOK_SECRET — for signature verification
 *   SUPABASE_URL
 *   SUPABASE_SERVICE_ROLE_KEY
 */

serve(async (req) => {
  try {
    // Verify signature
    const signature = req.headers.get("x-webhook-signature") || "";
    const webhookSecret = Deno.env.get("DODO_PAYMENTS_WEBHOOK_SECRET") || "";

    if (webhookSecret && signature !== webhookSecret) {
      console.error("Webhook signature mismatch");
      return new Response(JSON.stringify({ error: "Invalid signature" }), { status: 401 });
    }

    const body = await req.json();
    const eventType = body.type || body.event_type || "";
    const data = body.data || body;

    console.log("Dodo webhook received:", eventType);

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || "";
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "";
    if (!supabaseUrl || !supabaseKey) {
      throw new Error("Missing Supabase credentials");
    }
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Idempotency: skip already-processed events
    const eventId = body.id;
    if (eventId) {
      const { data: existing } = await supabase
        .from("webhook_events")
        .select("id")
        .eq("event_id", eventId)
        .maybeSingle();

      if (existing) {
        console.log("Dodo webhook: duplicate event skipped:", eventId);
        return new Response(JSON.stringify({ ok: true, skipped: true }), { status: 200, headers: { "Content-Type": "application/json" } });
      }

      // Reserve this event ID to prevent duplicate processing
      const { error: insertError } = await supabase
        .from("webhook_events")
        .insert({ event_id: eventId, event_type: body.type || "unknown" });

      if (insertError) {
        console.error("Dodo webhook: failed to record event:", insertError);
      }
    }

    switch (eventType) {
      // ── Checkout Completed ───────────────────────────
      case "checkout.session.completed": {
        const session = data.session || data;
        const metadata = session.metadata || {};
        const userId = metadata.user_id || session.metadata?.user_id;
        const plan = metadata.plan || session.metadata?.plan;
        const billing = metadata.billing || session.metadata?.billing;
        const customerId = session.customer_id || data.customer_id;
        const subscriptionId = session.subscription_id || "";
        const sessionId = session.session_id || body.session_id || "";

        if (userId && plan) {
          // Update user's plan in profiles
          await supabase.from("profiles").update({
            plan: plan,
            dodo_customer_id: customerId,
            dodo_subscription_id: subscriptionId,
            updated_at: new Date().toISOString(),
          }).eq("id", userId);

          // Mark session as completed
          if (sessionId) {
            await supabase.from("dodo_sessions").update({
              status: "completed",
              subscription_id: subscriptionId,
              customer_id: customerId,
            }).eq("session_id", sessionId);
          }

          console.log("Dodo webhook: updated plan to", plan, "for user", userId);
        }
        break;
      }

      // ── Subscription Events ──────────────────────────
      case "subscription.created":
      case "subscription.updated":
      case "subscription.plan_changed": {
        const subscription = data.subscription || data;
        const subUserId = subscription.metadata?.user_id || "";
        const subPlan = subscription.metadata?.plan || "";
        const subStatus = subscription.status || "";
        const subCustomerId = subscription.customer_id || data.customer_id || "";
        const subId = subscription.id || data.subscription_id || "";

        if (subUserId && subPlan) {
          const updateData: Record<string, unknown> = {
            dodo_subscription_id: subId,
            dodo_customer_id: subCustomerId,
            subscription_status: subStatus,
            updated_at: new Date().toISOString(),
          };

          if (subStatus === "active" || subStatus === "active") {
            updateData.plan = subPlan;
          }

          await supabase.from("profiles").update(updateData).eq("id", subUserId);
          console.log("Dodo webhook: subscription", subStatus, "for user", subUserId, "plan:", subPlan);
        }
        break;
      }

      case "subscription.cancelled":
      case "subscription.expired": {
        const cancelData = data.subscription || data;
        const cancelUserId = cancelData.metadata?.user_id || "";
        const cancelSubId = cancelData.id || data.subscription_id || "";

        if (cancelUserId) {
          await supabase.from("profiles").update({
            dodo_subscription_id: "",
            subscription_status: "cancelled",
            plan: "growth", // Revert to default free plan
            updated_at: new Date().toISOString(),
          }).eq("id", cancelUserId);

          // Update related session
          if (cancelSubId) {
            await supabase.from("dodo_sessions").update({
              status: "cancelled",
            }).eq("subscription_id", cancelSubId);
          }

          console.log("Dodo webhook: subscription cancelled for user", cancelUserId);
        }
        break;
      }

      // ── Invoice Events ──────────────────────────────
      case "invoice.payment_succeeded": {
        const invData = data.invoice || data;
        const invUserId = invData.metadata?.user_id || invData.user_id || "";
        const invSubId = invData.subscription_id || "";

        if (invUserId) {
          await supabase.from("profiles").update({
            last_payment_at: new Date().toISOString(),
            payment_status: "paid",
            updated_at: new Date().toISOString(),
          }).eq("id", invUserId);
        }
        break;
      }

      case "invoice.payment_failed": {
        const failData = data.invoice || data;
        const failUserId = failData.metadata?.user_id || failData.user_id || "";

        if (failUserId) {
          await supabase.from("profiles").update({
            payment_status: "failed",
            updated_at: new Date().toISOString(),
          }).eq("id", failUserId);
        }
        break;
      }

      default: {
        console.log("Dodo webhook: unhandled event type:", eventType);
      }
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("dodo-webhook error:", err);
    return new Response(JSON.stringify({ error: "Webhook processing failed" }), {
      status: 500,
    });
  }
});
