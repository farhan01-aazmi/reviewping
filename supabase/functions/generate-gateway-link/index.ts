// ============================================================
// generate-gateway-link — Edge function
// Generates a unique gateway token for a review request
// and stores it on the review_requests row.
//
// Called by: POST /generate-gateway-link (authenticated)
// Returns: { token, url }
// ============================================================
import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";
import { corsHeaders } from "../_shared/cors.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const authHeader = req.headers.get("Authorization")?.replace("Bearer ", "");
    if (!authHeader) throw new Error("Missing auth token");

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${authHeader}` } } }
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(authHeader);
    if (authError || !user) throw new Error("Unauthorized");

    const { request_id, customer_name, customer_email, customer_phone } = await req.json();
    if (!request_id || !customer_name) throw new Error("Missing required fields");

    // Generate unique gateway token using Web Crypto API
    const tokenBytes = new Uint8Array(16);
    crypto.getRandomValues(tokenBytes);
    const token = Array.from(tokenBytes)
      .map(b => b.toString(36).padStart(2, "0"))
      .join("")
      .slice(0, 12);

    // Store token on review_requests
    const { error: updateError } = await supabase
      .from("review_requests")
      .update({ gateway_token: token })
      .eq("id", request_id)
      .eq("user_id", user.id);

    if (updateError) throw updateError;

    const gatewayUrl = `https://reviewping-eight.vercel.app/r/${token}`;

    return new Response(JSON.stringify({ token, url: gatewayUrl }), {
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
