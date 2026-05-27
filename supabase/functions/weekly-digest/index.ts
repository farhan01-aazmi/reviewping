import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS } from "../_shared/auth.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const resendApiKey = Deno.env.get("RESEND_API_KEY")

    if (!resendApiKey) {
      return new Response(JSON.stringify({ error: "Resend API key not configured" }), {
        status: 500,
        headers: { "Content-Type": "application/json" },
      })
    }

    const supabase = createClient(supabaseUrl, supabaseKey)
    const sevenDaysAgo = new Date(Date.now() - 7 * 86400000).toISOString()

    // Get all users who have reviews from the past week
    const { data: users } = await supabase.from("profiles").select("id, email, name, business_name")

    if (!users || users.length === 0) {
      return new Response(JSON.stringify({ message: "No users found" }), {
        headers: CORS,
      })
    }

    const results: Array<{ email: string; status: string }> = []

    for (const user of users) {
      if (!user.email) continue

      // Get reviews from the past week
      const { data: weekReviews } = await supabase
        .from("reviews")
        .select("*")
        .eq("user_id", user.id)
        .gte("sentAt", sevenDaysAgo)

      if (!weekReviews || weekReviews.length === 0) continue

      const total = weekReviews.length
      const reviewed = weekReviews.filter((r) => r.status === "reviewed")
      const positive = reviewed.filter((r) => (r.rating || 0) >= 4)
      const negative = reviewed.filter((r) => (r.rating || 0) <= 2)
      const avgRating = reviewed.length
        ? (reviewed.reduce((s, r) => s + (r.rating || 0), 0) / reviewed.length).toFixed(1)
        : "N/A"

      const topics: string[] = []
      reviewed.forEach((r) => {
        if (r.text?.toLowerCase().includes("service")) topics.push("Service")
        if (r.text?.toLowerCase().includes("food") || r.text?.toLowerCase().includes("dinner") || r.text?.toLowerCase().includes("lunch")) topics.push("Food")
        if (r.text?.toLowerCase().includes("price") || r.text?.toLowerCase().includes("cost") || r.text?.toLowerCase().includes("expensive") || r.text?.toLowerCase().includes("value")) topics.push("Price")
        if (r.text?.toLowerCase().includes("staff") || r.text?.toLowerCase().includes("friendly") || r.text?.toLowerCase().includes("helpful")) topics.push("Staff")
        if (r.text?.toLowerCase().includes("clean") || r.text?.toLowerCase().includes("ambience") || r.text?.toLowerCase().includes("atmosphere")) topics.push("Ambience")
      })
      const uniqueTopics = [...new Set(topics)]

      // Generate HTML email
      const html = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; color: #1a1a2e; line-height: 1.6; }
    .container { max-width: 560px; margin: 0 auto; padding: 24px; }
    h1 { font-size: 24px; margin-bottom: 4px; }
    .subtitle { color: #666; font-size: 14px; }
    .stat { display: inline-block; margin: 16px 8px; text-align: center; }
    .stat-value { font-size: 28px; font-weight: 700; color: #c93d10; }
    .stat-label { font-size: 12px; color: #666; text-transform: uppercase; letter-spacing: 0.5px; }
    .section { margin: 24px 0; }
    .section-title { font-size: 16px; font-weight: 700; margin-bottom: 8px; }
    .topic-tag { display: inline-block; padding: 4px 10px; background: #fdf0eb; border-radius: 12px; font-size: 12px; color: #c93d10; margin: 2px; }
    .footer { font-size: 12px; color: #999; margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Your Weekly Review Summary</h1>
    <p class="subtitle">${user.business_name || "Your Business"} · ${new Date().toLocaleDateString("en-GB", { month: "long", day: "numeric", year: "numeric" })}</p>

    <div style="text-align:center;margin:20px 0;">
      <div class="stat">
        <div class="stat-value">${total}</div>
        <div class="stat-label">Reviews</div>
      </div>
      <div class="stat">
        <div class="stat-value">${avgRating}★</div>
        <div class="stat-label">Avg Rating</div>
      </div>
      <div class="stat">
        <div class="stat-value">${positive.length}</div>
        <div class="stat-label">Positive</div>
      </div>
    </div>

    <div class="section">
      <div class="section-title">Top Praised Aspects</div>
      ${uniqueTopics.length > 0 ? uniqueTopics.map((t) => `<span class="topic-tag">✓ ${t}</span>`).join(" ") : "<p style='color:#666;font-size:13px;'>Not enough data to detect topics this week.</p>"}
    </div>

    ${negative.length > 0 ? `
    <div class="section">
      <div class="section-title">⚠ Areas for Improvement</div>
      <p style="font-size:13px;color:#666;">${negative.length} review(s) mentioned areas needing attention. Consider following up with these customers.</p>
    </div>` : ""}

    ${reviewed.length > 0 ? `
    <div class="section">
      <div class="section-title">Recent Reviews</div>
      ${reviewed.slice(0, 5).map((r) => `
        <div style="padding:10px 0;border-bottom:1px solid #f0f0f0;">
          <div style="display:flex;justify-content:space-between;font-size:13px;">
            <strong>${r.name}</strong>
            <span style="color:${(r.rating || 0) >= 4 ? "#1a7a4a" : (r.rating || 0) <= 2 ? "#c93d10" : "#b87a10"};">${"★".repeat(r.rating || 0)}${"☆".repeat(5 - (r.rating || 0))}</span>
          </div>
          ${r.text ? `<p style="font-size:13px;color:#666;margin:4px 0;">"${r.text}"</p>` : ""}
        </div>
      `).join("")}
    </div>` : ""}

    <div class="section">
      <div class="section-title">💡 Suggested Actions</div>
      <ul style="font-size:13px;color:#666;padding-left:20px;">
        ${negative.length > 0 ? "<li>Respond to negative reviews within 24 hours</li>" : ""}
        ${positive.length > 0 ? "<li>Thank your top promoters — they're your best marketers</li>" : ""}
        <li>Send review requests within 1 hour of service completion</li>
        <li>Aim for 3+ new reviews this coming week</li>
      </ul>
    </div>

    <div class="footer">
      <p>Sent by ReviewPing · <a href="https://reviewping-seven.vercel.app/dashboard">View full dashboard</a></p>
    </div>
  </div>
</body>
</html>`

      // Send via Resend
      const res = await fetch("https://api.resend.com/emails", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${resendApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          from: Deno.env.get("RESEND_FROM") || "ReviewPing <reviews@reviewping.io>",
          to: [user.email],
          subject: `Your Weekly Review Summary — ${user.business_name || "ReviewPing"}`,
          html,
        }),
      })

      if (res.ok) {
        results.push({ email: user.email, status: "sent" })
      } else {
        results.push({ email: user.email, status: "failed" })
      }
    }

    return new Response(JSON.stringify({ success: true, sent: results.length, results }), {
      headers: CORS,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: CORS,
    })
  }
})
