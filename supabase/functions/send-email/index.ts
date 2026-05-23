import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { CORS, verifyAuth } from "../_shared/auth.ts";

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
    return new Response(JSON.stringify({ error: "Failed to send email. Please try again." }), {
      status: 500,
      headers: CORS,
    });
  }
});
