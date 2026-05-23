import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { CORS, verifyAuth } from "../_shared/auth.ts";

/**
 * Stripe Checkout Session Creator
 *
 * Creates a Stripe Checkout Session for subscription payments.
 * Called from the frontend when a user clicks "Subscribe".
 * Requires JWT authentication — the user_id is extracted from the verified token.
 */
serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: CORS,
      });
    }

    // Verify JWT authentication using Supabase Auth API (signature-verified)
    const auth = await verifyAuth(req);
    if (auth instanceof Response) return auth;
    const userId = auth.userId;

    const stripeKey = Deno.env.get("STRIPE_SECRET_KEY");
    if (!stripeKey) {
      throw new Error("STRIPE_SECRET_KEY environment variable not configured");
    }

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: CORS,
      });
    }

    const { price_id, return_url } = body || {};

    if (!price_id) {
      return new Response(
        JSON.stringify({ error: "Missing required field: 'price_id'" }),
        { status: 400, headers: CORS },
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
      headers: CORS,
    });
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(JSON.stringify({ error: "Failed to create checkout session. Please try again." }), {
      status: 500,
      headers: CORS,
    });
  }
});
