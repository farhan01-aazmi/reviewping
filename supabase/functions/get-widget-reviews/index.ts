// ============================================================
// get-widget-reviews — Public edge function for Review Widget
// Fetches approved reviews for a business by slug or user_id
//
// Called by: GET /functions/v1/get-widget-reviews?slug=xxx
//            GET /functions/v1/get-widget-reviews?user_id=xxx
// Returns:   { business_name, avg_rating, total_reviews, reviews[] }
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

serve(async (req) => {
  const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET, OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Cache-Control": "public, max-age=300, s-maxage=300",
  };

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");
    const userId = url.searchParams.get("user_id");

    if (!slug && !userId) {
      return new Response(
        JSON.stringify({ error: "Missing slug or user_id" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } }
    );

    // Resolve user_id from slug if needed
    let targetUserId = userId;
    if (slug && !targetUserId) {
      const { data: biz, error: bizErr } = await supabase
        .from("business_settings")
        .select("user_id, business_name, logo_url")
        .eq("slug", slug)
        .single();

      if (bizErr || !biz) {
        return new Response(JSON.stringify({ error: "Business not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }
      targetUserId = biz.user_id;

      // Return business info + reviews
      const { data: reviews, error: revErr } = await supabase
        .from("review_submissions")
        .select("rating, review_text, author_name, submitted_at")
        .eq("user_id", targetUserId)
        .eq("moderation_status", "approved")
        .neq("review_text", "")
        .not("review_text", "is", null)
        .order("submitted_at", { ascending: false })
        .limit(50);

      if (revErr) throw revErr;

      const total = reviews?.length || 0;
      const avgRating = total > 0
        ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / total)
        : 0;

      return new Response(JSON.stringify({
        business_name: biz.business_name,
        logo_url: biz.logo_url,
        avg_rating: Math.round(avgRating * 10) / 10,
        total_reviews: total,
        reviews: reviews || [],
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Direct user_id query
    const { data: biz, error: bizErr } = await supabase
      .from("business_settings")
      .select("business_name, logo_url")
      .eq("user_id", targetUserId)
      .single();

    if (bizErr) {
      return new Response(JSON.stringify({ error: "Business not found" }), {
        status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: reviews, error: revErr } = await supabase
      .from("review_submissions")
      .select("rating, review_text, author_name, submitted_at")
      .eq("user_id", targetUserId)
      .eq("moderation_status", "approved")
      .neq("review_text", "")
      .not("review_text", "is", null)
      .order("submitted_at", { ascending: false })
      .limit(50);

    if (revErr) throw revErr;

    const total = reviews?.length || 0;
    const avgRating = total > 0
      ? (reviews!.reduce((sum, r) => sum + r.rating, 0) / total)
      : 0;

    return new Response(JSON.stringify({
      business_name: biz.business_name,
      logo_url: biz.logo_url,
      avg_rating: Math.round(avgRating * 10) / 10,
      total_reviews: total,
      reviews: reviews || [],
    }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: { "Access-Control-Allow-Origin": "*", "Content-Type": "application/json" },
    });
  }
});
