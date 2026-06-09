// ============================================================
// resolve-gateway — Public edge function
// Resolves a gateway token to fetch business info for the
// Smart Review Gateway page.
//
// Called by: POST /resolve-gateway (public, no auth needed)
// Returns: { business_name, google_review_link, customer_name,
//            request_id, user_id }
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token } = await req.json();
    if (!token) throw new Error("Missing token");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Get the review request + business info
    const { data: reqData, error: reqError } = await supabase
      .from("review_requests")
      .select("id, user_id, customer_name, customer_email, customer_phone, status")
      .eq("gateway_token", token)
      .single();

    if (reqError || !reqData) throw new Error("Invalid or expired link");

    const { data: bizData } = await supabase
      .from("business_settings")
      .select("business_name, review_link, google_link, logo_url")
      .eq("user_id", reqData.user_id)
      .single();

    // Mark as clicked if still pending/sent
    if (reqData.status === "pending" || reqData.status === "sent") {
      await supabase
        .from("review_requests")
        .update({ status: "clicked", clicked_at: new Date().toISOString() })
        .eq("id", reqData.id);
    }

    return new Response(JSON.stringify({
      business_name: bizData?.business_name || "Business",
      logo_url: bizData?.logo_url || "",
      google_review_link: bizData?.google_link || bizData?.review_link || "",
      customer_name: reqData.customer_name,
      request_id: reqData.id,
      user_id: reqData.user_id,
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 400,
    });
  }
});
