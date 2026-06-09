// ============================================================
// get-review-gateway — Public edge function
// Fetches business info + google_link for the Smart Review Gateway
//
// Called by: GET /r/:request_id
// Returns: { business_name, logo_url, google_link, request_id, customer_name }
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type, Authorization",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const requestId = url.searchParams.get("request_id");
    if (!requestId) {
      return new Response(JSON.stringify({ error: "Missing request_id" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Fetch the review request with business settings
    const { data: request, error: reqError } = await supabase
      .from("review_requests")
      .select(`
        id,
        customer_name,
        customer_email,
        user_id,
        status
      `)
      .eq("id", requestId)
      .single();

    if (reqError || !request) {
      return new Response(JSON.stringify({ error: "Invalid request" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Fetch business settings
    const { data: business, error: bizError } = await supabase
      .from("business_settings")
      .select("business_name, logo_url, google_link")
      .eq("user_id", request.user_id)
      .single();

    if (bizError || !business) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Mark as clicked if still pending/sent
    if (request.status === "pending" || request.status === "sent") {
      await supabase
        .from("review_requests")
        .update({ status: "clicked", clicked_at: new Date().toISOString() })
        .eq("id", requestId);
    }

    return new Response(
      JSON.stringify({
        request_id: request.id,
        customer_name: request.customer_name,
        customer_email: request.customer_email,
        business_name: business.business_name,
        logo_url: business.logo_url,
        google_link: business.google_link || "",
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
