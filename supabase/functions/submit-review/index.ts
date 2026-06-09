import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ALLOWED_ORIGIN = Deno.env.get("CORS_ORIGIN") || "https://reviewping.pro";

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  }

  try {
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: CORS });
    }

    const { slug, event, request_id, customer_name } = body || {};
    const ip = req.headers.get("x-forwarded-for") || req.headers.get("x-real-ip") || "";
    const ua = req.headers.get("user-agent") || "";

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    if (event === "click") {
      // Track the click
      const { error: clickErr } = await supabase.from("review_clicks").insert({
        request_id: request_id || null,
        user_id: null,
        customer_name: customer_name || null,
        ip_address: ip,
        user_agent: ua,
      });

      if (clickErr) {
        console.error("submit-review click log error:", clickErr);
      }

      // Update review_requests status to 'clicked' if we have a request_id
      if (request_id) {
        await supabase
          .from("review_requests")
          .update({ status: "clicked", clicked_at: new Date().toISOString() })
          .eq("id", request_id)
          .eq("status", "sent")  // only update if currently 'sent'
          .then();
      }
    }

    return new Response(JSON.stringify({ success: true }), { headers: CORS });

  } catch (err) {
    console.error("submit-review error:", err);
    // Always return success to avoid confusing the customer
    return new Response(JSON.stringify({ success: true }), { headers: CORS });
  }
});
