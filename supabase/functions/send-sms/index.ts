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

    // Verify JWT authentication — all SMS sending requires an authenticated user
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

    const { to, message } = body || {};

    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to' and 'message'" }),
        { status: 400, headers: CORS },
      );
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const from = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!accountSid || !authToken || !from) {
      throw new Error("Twilio environment variables not configured");
    }

    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({ To: to, From: from, Body: message }),
      },
    );

    if (!twilioRes.ok) {
      const errText = await twilioRes.text();
      throw new Error(`Twilio API error: ${twilioRes.status} - ${errText}`);
    }

    const result = await twilioRes.json();

    return new Response(
      JSON.stringify({ success: true, sid: result.sid }),
      { headers: CORS },
    );
  } catch (err) {
    console.error("send-sms error:", err);
    return new Response(JSON.stringify({ error: "Failed to send SMS. Please try again." }), {
      status: 500,
      headers: CORS,
    });
  }
});
