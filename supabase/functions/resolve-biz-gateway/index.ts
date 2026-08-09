import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { slug } = await req.json();
    if (!slug || typeof slug !== "string") throw new Error("Missing slug");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const cleanSlug = slug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

    const { data: bizData, error: bizError } = await supabase
      .from("business_settings")
      .select("user_id, business_name, biz_type, business_category, google_link, review_link, logo_url")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (bizError) throw bizError;
    if (!bizData) throw new Error("Business not found");

    // Check subscription status — free plan users cannot use gateway
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan, grace_period_end")
      .eq("id", bizData.user_id)
      .single();

    const isFree = !profile || profile.plan === "free";
    const hasGracePeriod = profile?.grace_period_end && new Date(profile.grace_period_end) > new Date();

    if (isFree && !hasGracePeriod) {
      // Increment blocked scans counter (RPC created in migration 016)
      await supabase.rpc("increment_blocked_scans", { user_uuid: bizData.user_id }).catch(() => {});

      return new Response(JSON.stringify({
        blocked: true,
        reason: "free_plan",
        business_name: bizData.business_name || "Business",
      }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    // Increment QR scans counter (RPC created in migration 018)
    await supabase.rpc("increment_qr_scans", { user_uuid: bizData.user_id }).catch(() => {});

    return new Response(JSON.stringify({
      blocked: false,
      business_name: bizData.business_name || "Business",
      biz_type: bizData.biz_type || bizData.business_category || "default",
      google_review_link: bizData.google_link || bizData.review_link || "",
      logo_url: bizData.logo_url || "",
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
