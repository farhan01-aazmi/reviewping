// ============================================================
// submit-gateway-feedback — Public edge function
// Handles feedback submission from the Smart Review Gateway.
// - 4-5★ reviews: customer posts on Google; request marked reviewed
// - 1-3★: private feedback ONLY — never goes to Google
// Inserts review_submission, updates review_requests, and
// marks review_gateway_clicks as converted.
//
// Called by: POST /submit-gateway-feedback (public)
// Body: { token?, user_id?, rating, feedback, click_id }
//   - token: /r/:token flow (resolves review_request)
//   - user_id: /biz/:slug flow (no request binding)
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";
import { captureServerEvent } from "../_shared/posthog.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { token, user_id, rating, feedback, click_id } = await req.json();
    if ((!token && !user_id) || !rating) throw new Error("Missing required fields");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Resolve the review request from token (if provided)
    let reqData = null;
    if (token) {
      const { data, error } = await supabase
        .from("review_requests")
        .select("id, user_id, customer_name, customer_email, customer_phone")
        .eq("gateway_token", token)
        .single();

      if (error || !data) throw new Error("Invalid or expired link");
      reqData = data;
    }

    const ownerId = reqData?.user_id || user_id;

    // 1. Insert into review_submissions
    const { data: submission, error: subError } = await supabase
      .from("review_submissions")
      .insert({
        user_id: ownerId,
        request_id: reqData?.id || null,
        rating,
        review_text: feedback || "",
        author_name: reqData?.customer_name || "Anonymous",
        author_email: reqData?.customer_email,
        status: "pending",
        source: reqData ? "reviewping_form" : "reviewping_qr",
        moderation_status: rating <= 3 ? "flagged" : "approved",
      })
      .select("id")
      .single();

    if (subError) throw subError;

    // 2. Update review_requests with gateway data (token flow only)
    if (reqData) {
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
    }

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

    await captureServerEvent(ownerId, "review_gateway.rating_selected", {
      rating,
    }, ownerId);

    if (rating >= 4) {
      await captureServerEvent(ownerId, "review_gateway.completed", {
        rating,
        used_suggested_template: true,
      }, ownerId);
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
