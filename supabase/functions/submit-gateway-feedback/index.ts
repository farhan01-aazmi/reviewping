// ============================================================
// submit-gateway-feedback — Public edge function
// Handles feedback submission from the Smart Review Gateway.
// Inserts review_submission, updates review_requests, and
// marks review_gateway_clicks as converted.
//
// Called by: POST /submit-gateway-feedback (public)
// Body: { token, rating, feedback, click_id }
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token, rating, feedback, click_id } = await req.json();
    if (!token || !rating) throw new Error("Missing required fields");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve the review request from token
    const { data: reqData, error: reqError } = await supabase
      .from("review_requests")
      .select("id, user_id, customer_name, customer_email, customer_phone")
      .eq("gateway_token", token)
      .single();

    if (reqError || !reqData) throw new Error("Invalid or expired link");

    // 1. Insert into review_submissions
    const { data: submission, error: subError } = await supabase
      .from("review_submissions")
      .insert({
        user_id: reqData.user_id,
        request_id: reqData.id,
        rating,
        review_text: feedback || "",
        author_name: reqData.customer_name || "Anonymous",
        author_email: reqData.customer_email,
        status: "pending",
        source: "reviewping_form",
        moderation_status: rating <= 3 ? "flagged" : "approved",
      })
      .select("id")
      .single();

    if (subError) throw subError;

    // 2. Update review_requests with gateway data
    await supabase
      .from("review_requests")
      .update({
        gateway_rating: rating,
        gateway_feedback: feedback || null,
        gateway_converted: true,
        status: "reviewed",
        reviewed_at: new Date().toISOString(),
      })
      .eq("id", reqData.id);

    // 3. Update review_gateway_clicks if click_id provided
    if (click_id) {
      await supabase
        .from("review_gateway_clicks")
        .update({
          converted: true,
          rating,
          feedback: feedback || null,
          review_posted_on: rating >= 4 ? "google" : "reviewping",
        })
        .eq("id", click_id);
    }

    return new Response(JSON.stringify({
      success: true,
      submission_id: submission?.id,
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
