import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { CORS, verifyAuth, checkDailyLimit } from "../_shared/auth.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: CORS,
      });
    }

    // Verify JWT authentication — all email sending requires an authenticated user
    const auth = await verifyAuth(req);
    if (auth instanceof Response) return auth;

    // Check daily limit for free plan
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", auth.userId)
      .single();
    const plan = profile?.plan || "free";
    const limit = await checkDailyLimit(supabase, auth.userId, plan);
    if (limit instanceof Response) return limit;

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: CORS,
      });
    }

    const { to, subject, message } = body || {};

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: 'to', 'subject', and 'message'",
        }),
        { status: 400, headers: CORS },
      );
    }

    const RESEND_KEY = Deno.env.get("RESEND_API_KEY");
    const FROM_EMAIL = Deno.env.get("FROM_EMAIL") || "noreply@reviewping.io";

    if (!RESEND_KEY) {
      throw new Error("RESEND_API_KEY environment variable not configured");
    }

    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${RESEND_KEY}`,
      },
      body: JSON.stringify({
        from: `ReviewPing <${FROM_EMAIL}>`,
        to: [to],
        subject,
        text: message,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Resend API error: ${res.status} - ${errText}`);
    }

    const result = await res.json();

    return new Response(
      JSON.stringify({ success: true, id: result.id }),
      { headers: CORS },
    );
  } catch (err) {
    console.error("send-email error:", err);
    const msg = err instanceof Error ? err.message : "Failed to send email";
    return new Response(JSON.stringify({ error: msg }), {
      status: 500,
      headers: CORS,
    });
  }
});
