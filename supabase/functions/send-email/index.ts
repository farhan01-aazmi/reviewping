import { serve } from "https://deno.land/std@0.177.0/http/server.ts";

serve(async (req) => {
  try {
    // Only allow POST
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: { "Content-Type": "application/json" },
      });
    }

    const { to, subject, message } = await req.json();

    if (!to || !subject || !message) {
      return new Response(
        JSON.stringify({
          error: "Missing required fields: 'to', 'subject', and 'message'",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } },
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
      { headers: { "Content-Type": "application/json" } },
    );
  } catch (err) {
    console.error("send-email error:", err);
    return new Response(JSON.stringify({ error: "Failed to send email. Please try again." }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
});
