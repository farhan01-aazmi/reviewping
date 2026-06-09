import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS } from "../_shared/auth.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: CORS,
    })
  }

  try {
    const { review_id, rating, review_text, author_name, user_id } = await req.json()
    if (!review_id || !user_id) throw new Error("Missing required fields")

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )

    // Get user email and business name
    const { data: profile } = await supabase
      .from("profiles")
      .select("email, business_name")
      .eq("id", user_id)
      .single()

    if (profile?.email) {
      // Send alert via Resend
      const resendKey = Deno.env.get("RESEND_API_KEY")
      if (resendKey) {
        const res = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${resendKey}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "ReviewPing Alerts <alerts@reviewping.pro>",
            to: profile.email,
            subject: `🚨 New ${rating}-star review — Action needed`,
            html: `<div style="font-family:sans-serif;max-width:480px;margin:0 auto">
              <h2 style="color:#d32f2f">⚠️ Negative Review Alert</h2>
              <p><strong>${profile.business_name || "Your business"}</strong> received a ${rating}-star review.</p>
              <blockquote style="border-left:3px solid #ddd;padding:8px 16px;margin:16px 0;color:#555">
                "${review_text || "No text provided"}"
              </blockquote>
              <p style="color:#888;font-size:13px">— ${author_name || "Anonymous"}</p>
              <a href="https://reviewping-eight.vercel.app/dashboard"
                 style="display:inline-block;background:#d32f2f;color:white;padding:10px 20px;border-radius:6px;text-decoration:none;margin-top:12px">
                View in Dashboard →
              </a>
            </div>`,
          }),
        })
        if (!res.ok) console.error("Failed to send alert email:", await res.text())
      }
    }

    // Create notification
    const displayText = review_text
      ? `"${review_text.slice(0, 100)}${review_text.length > 100 ? '...' : ''}"`
      : "No comment left"
    await supabase.from("notifications").insert({
      user_id,
      type: "negative_review",
      title: `${rating}-star review from ${author_name || "a customer"}`,
      body: displayText,
      icon: "⚠️",
    }).maybeSingle()

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 400,
    })
  }
})
