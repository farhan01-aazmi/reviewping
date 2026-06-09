import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

const ALLOWED_ORIGIN = Deno.env.get("CORS_ORIGIN") || "https://reviewping.pro";

const CORS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "GET, OPTIONS",
  "Access-Control-Allow-Headers": "content-type",
  "Content-Type": "application/json",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "GET") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  }

  try {
    const url = new URL(req.url);
    const slug = url.searchParams.get("slug");

    if (!slug || typeof slug !== "string" || slug.length > 100) {
      return new Response(JSON.stringify({ error: "Invalid slug" }), { status: 400, headers: CORS });
    }

    // Sanitize slug
    const cleanSlug = slug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();

    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase
      .from("business_settings")
      .select("slug, business_name, business_category, gbp_url, google_link, logo_url, website_url")
      .eq("slug", cleanSlug)
      .maybeSingle();

    if (error) {
      console.error("get-business-for-review DB error:", error);
      return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: CORS });
    }

    if (!data) {
      return new Response(JSON.stringify({
        error: "not_found",
        message: "This review link is invalid. Please contact the business directly.",
      }), { status: 404, headers: CORS });
    }

    const gbpUrl = data.gbp_url || "";
    const googleLink = data.google_link || "";
    return new Response(JSON.stringify({
      business_name: data.business_name || "",
      business_category: data.business_category || "",
      has_gbp: !!gbpUrl,
      gbp_url: gbpUrl,
      google_link: googleLink,
      logo_url: data.logo_url || "",
      website_url: data.website_url || "",
    }), { headers: CORS });

  } catch (err) {
    console.error("get-business-for-review error:", err);
    return new Response(JSON.stringify({ error: "Server error" }), { status: 500, headers: CORS });
  }
});
