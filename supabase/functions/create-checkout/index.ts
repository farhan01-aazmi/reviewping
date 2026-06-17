import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, verifyAuth } from "../_shared/auth.ts";

/**
 * Dodo Payments Checkout Session Creator
 *
 * Creates a hosted checkout session for subscription payments.
 * Accepts `plan` (starter/growth/agency) and `billing` (monthly/annual).
 * Resolves Dodo Payments product IDs from environment variables.
 *
 * Products must be created in Dodo Payments dashboard first.
 *
 * Required env vars:
 *   DODO_PAYMENTS_API_KEY
 *   DODO_PRODUCT_STARTER_MONTHLY
 *   DODO_PRODUCT_STARTER_ANNUAL
 *   DODO_PRODUCT_GROWTH_MONTHLY
 *   DODO_PRODUCT_GROWTH_ANNUAL
 *   DODO_PRODUCT_AGENCY_MONTHLY
 *   DODO_PRODUCT_AGENCY_ANNUAL
 *   DODO_MODE (optional: "test" or "live", defaults to "test")
 */
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: CORS,
      });
    }

    const auth = await verifyAuth(req);
    if (auth instanceof Response) return auth;
    const userId = auth.userId;

    const apiKey = Deno.env.get("DODO_PAYMENTS_API_KEY");
    if (!apiKey) {
      throw new Error("DODO_PAYMENTS_API_KEY not configured");
    }

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: CORS,
      });
    }

    const { plan, billing, return_url } = body || {};

    if (!plan || !["starter", "growth", "agency"].includes(plan)) {
      return new Response(JSON.stringify({ error: "Invalid plan. Must be starter, growth, or agency" }), {
        status: 400, headers: CORS,
      });
    }

    if (!billing || !["monthly", "annual"].includes(billing)) {
      return new Response(JSON.stringify({ error: "Invalid billing. Must be monthly or annual" }), {
        status: 400, headers: CORS,
      });
    }

    // Resolve product ID from env vars
    const envKey = `DODO_PRODUCT_${plan.toUpperCase()}_${billing.toUpperCase()}`;
    const productId = Deno.env.get(envKey);

    if (!productId) {
      throw new Error(
        `Missing product ID: set ${envKey} in Supabase Edge Function environment variables.`
      );
    }

    // Fetch user profile to get email for Dodo customer pre-fill
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, name")
      .eq("id", userId)
      .single();

    // Determine Dodo API endpoint (test vs live)
    const mode = Deno.env.get("DODO_MODE") || "test";
    const baseUrl = mode === "live"
      ? "https://live.dodopayments.com"
      : "https://test.dodopayments.com";

    // Call Dodo Payments API to create checkout session
    const dodoBody: Record<string, unknown> = {
      product_cart: [{ product_id: productId, quantity: 1 }],
      return_url: return_url || "https://reviewping-eight.vercel.app/dashboard",
      metadata: {
        user_id: userId,
        plan: plan,
        billing: billing,
      },
    };

    // Pre-fill customer email if available (reduces checkout friction)
    if (profile?.email) {
      dodoBody.customer = { email: profile.email };
      if (profile?.name) dodoBody.customer.name = profile.name;
    }

    const dodoRes = await fetch(`${baseUrl}/checkouts`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${apiKey}`,
      },
      body: JSON.stringify(dodoBody),
    });

    const session = await dodoRes.json();

    if (!dodoRes.ok) {
      // Log full error for debugging
      console.error("Dodo API error response:", JSON.stringify(session));
      throw new Error(
        session.error?.message
        || session.message
        || `Dodo Payments API error (HTTP ${dodoRes.status})`
      );
    }

    // Store the session info in database for webhook verification
    const { error: dbError } = await supabase.from("dodo_sessions").upsert({
      user_id: userId,
      session_id: session.session_id,
      plan: plan,
      billing: billing,
      status: "pending",
      created_at: new Date().toISOString(),
    }, { onConflict: "session_id" });

    if (dbError) {
      console.error("Failed to store session metadata:", dbError);
      // Non-fatal — session was already created in Dodo
    }

    return new Response(JSON.stringify({ url: session.checkout_url }), {
      headers: CORS,
    });
  } catch (err) {
    console.error("create-checkout error:", err);
    return new Response(JSON.stringify({ error: err.message || "Failed to create checkout session" }), {
      status: 500, headers: CORS,
    });
  }
});
