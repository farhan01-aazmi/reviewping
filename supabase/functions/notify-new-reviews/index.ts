import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS } from "../_shared/auth.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY") || ""
const RESEND_FROM = Deno.env.get("RESEND_FROM") || "ReviewPing <noreply@reviewping.pro>"
const DASHBOARD_URL = "https://reviewping.pro/dashboard"
const CRON_SECRET = Deno.env.get("CRON_SECRET") || ""

const emailTemplate = (businessName: string, review: any) => {
  const stars = "★".repeat(review.rating || 0) + "☆".repeat(5 - (review.rating || 0))
  const tone = (review.rating || 5) <= 2 ? "#c93d10" : "#1a7a4a"
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; line-height: 1.6; margin: 0; padding: 0; background: #f5f5f0; }
    .container { max-width: 560px; margin: 0 auto; padding: 24px; background: white; }
    .review-card { padding: 14px; background: #fdf0eb; border-radius: 10px; margin: 16px 0; }
    .cta { display: block; background: #c93d10; color: white !important; text-align: center; padding: 14px 24px; border-radius: 8px; text-decoration: none; font-weight: 700; font-size: 15px; margin: 24px 0; }
    .footer { font-size: 12px; color: #999; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h1 style="font-size: 24px; margin-bottom: 4px;">⭐ New review for ${businessName || "your business"}</h1>
    <p style="color: #666; font-size: 14px;">A customer just reviewed you on Google.</p>
    <div class="review-card">
      <div style="display: flex; justify-content: space-between; font-size: 13px; margin-bottom: 6px;">
        <strong>${review.reviewer_name || "Customer"}</strong>
        <span style="color: ${tone}; font-weight: 600;">${stars}</span>
      </div>
      ${review.comment ? `<p style="font-size: 13px; color: #666; margin: 0; font-style: italic;">"${review.comment}"</p>` : ""}
    </div>
    ${(review.rating || 5) <= 2 ? `
    <div style="background: #fef2f2; border: 1.5px solid #fca5a5; border-radius: 10px; padding: 12px 14px; margin: 12px 0;">
      <div style="font-size: 13px; font-weight: 700; color: #991b1b; margin-bottom: 4px;">⚠️ Negative review — respond fast</div>
      <p style="font-size: 12.5px; color: #991b1b; margin: 0;">Reply within 24 hours to protect your rating. ReviewPing can auto-generate an apologetic reply for you.</p>
    </div>` : ""}
    <a href="${DASHBOARD_URL}" class="cta">View & Reply in Dashboard →</a>
    <div class="footer">
      <p>Sent by ReviewPing · You get notified automatically when customers review you on Google.</p>
    </div>
  </div>
</body>
</html>`
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS })
  }

  const authHeader = req.headers.get("Authorization") || ""
  const token = authHeader.replace("Bearer ", "")
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const cronMode = req.headers.get("x-cron-secret") === CRON_SECRET
  let userId: string | null = null

  if (!cronMode) {
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS })
    }
    userId = user.id
  }

  try {
    if (!RESEND_API_KEY) {
      return new Response(JSON.stringify({ error: "Resend API key not configured" }), { status: 500, headers: CORS })
    }

    let query = supabase
      .from("gbp_reviews")
      .select("*")
      .is("notified_at", null)
      .limit(20)

    if (userId) {
      query = query.eq("user_id", userId)
    }

    const { data: pendingReviews } = await query

    const notified: string[] = []
    const failed: string[] = []

    for (const review of pendingReviews || []) {
      const { data: profile } = await supabase
        .from("profiles")
        .select("email, business_name")
        .eq("id", review.user_id)
        .single()

      if (!profile?.email) {
        failed.push(review.reviewer_name || review.id)
        continue
      }

      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${RESEND_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: RESEND_FROM,
          to: [profile.email],
          subject: `⭐ New ${review.rating || ""}★ Google review from ${review.reviewer_name || "a customer"}`,
          html: emailTemplate(profile.business_name || "", review),
        }),
      })

      if (!res.ok) {
        failed.push(review.reviewer_name || review.id)
        continue
      }

      const { error: updateErr } = await supabase
        .from("gbp_reviews")
        .update({ notified_at: new Date().toISOString() })
        .eq("id", review.id)

      if (!updateErr) notified.push(review.reviewer_name || review.id)
    }

    return new Response(JSON.stringify({ notified, failed, pending: (pendingReviews || []).length }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS })
  }
})
