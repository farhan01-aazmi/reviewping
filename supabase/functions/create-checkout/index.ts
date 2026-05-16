import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

/**
 * Stripe Checkout Session Creator
 *
 * Creates a Stripe Checkout Session for subscription payments.
 * Called from the frontend when a user clicks "Subscribe".
 * Requires JWT authentication — the user_id is extracted from the verified token.
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

    // Extract user_id from the verified JWT (set by Supabase when verify_jwt = true)
    const userId = req.headers.get("x-supabase-auth-uid");
    if (!userId) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable not configured");
    }

    const { price_id, return_url } = await req.json();

    if (!price_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: 'price_id'" }),
        { status: 400, headers: { "Content-Type": "application/json" } },
      );
    }

    const stripeRes = await fetch("https://api.stripe.com/v1/checkout/sessions", {
      method: "POST",
      headers: {
        "Content-Type": "application/x-www-form-urlencoded",
        "Authorization": `Bearer ${stripeKey}`,
      },
      body: new URLSearchParams({
        mode: "subscription",
        "line_items[0][price]": price_id,
        "line_items[0][quantity]": "1",
        success_url:
          `${return_url || "https://reviewping.io/dashboard"}?session_id={CHECKOUT_SESSION_ID}`,
        cancel_url: `${return_url || "https://reviewping.io/billing"}`,
        "metadata[user_id]": userId,
      }),
    });

    const session = await stripeRes.json();

    if (!stripeRes.ok) {
      throw new Error(session.error?.message || "Stripe API error");
    }

    return new Response(JSON.stringify({ url: session.url }), {
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(JSON.stringify({ error: "Failed to create checkout session. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
