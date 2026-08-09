import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { captureServerEvent } from "../_shared/posthog.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""

async function refreshAccessToken(refreshToken: string): Promise<{ accessToken: string; expiresAt: string } | null> {
  const clientId = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") || ""
  const clientSecret = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") || ""

  const res = await fetch("https://oauth2.googleapis.com/token", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      grant_type: "refresh_token",
    }),
  })
  const data = await res.json()
  if (!data.access_token) return null

  return {
    accessToken: data.access_token,
    expiresAt: new Date(Date.now() + (data.expires_in || 3600) * 1000).toISOString(),
  }
}

serve(async (req) => {
  try {
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

    if (req.method !== "POST") {
      return new Response("Method not allowed", { status: 405 })
    }

    // Authenticate user
    const authHeader = req.headers.get("Authorization") || ""
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Get GBP connection
    const { data: conn } = await supabase
      .from("gbp_connections")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!conn?.is_connected || !conn?.gbp_location_id) {
      return new Response(JSON.stringify({ error: "No GBP connection found. Connect your Google Business Profile first." }), {
        status: 400,
        headers: { "Content-Type": "application/json" },
      })
    }

    // Refresh token if expired
    let accessToken = conn.access_token
    let expiresAt = conn.token_expires_at
    if (new Date(expiresAt) < new Date() && conn.refresh_token) {
      const refreshed = await refreshAccessToken(conn.refresh_token)
      if (refreshed) {
        accessToken = refreshed.accessToken
        expiresAt = refreshed.expiresAt
        await supabase.from("gbp_connections").update({
          access_token: accessToken,
          token_expires_at: expiresAt,
        }).eq("user_id", user.id)
      } else {
        return new Response(JSON.stringify({ error: "Failed to refresh token. Reconnect your Google Business Profile." }), {
          status: 401,
          headers: { "Content-Type": "application/json" },
        })
      }
    }

    // Fetch reviews from GBP API
    const reviewsRes = await fetch(
      `https://mybusinessbusinessinformation.googleapis.com/v1/${conn.gbp_location_id}/reviews?pageSize=50`,
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )

    if (reviewsRes.status === 401 || reviewsRes.status === 403) {
      return new Response(JSON.stringify({ error: "Google access revoked. Reconnect your profile." }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      })
    }

    const reviewsData = await reviewsRes.json()
    const gbpReviews = reviewsData.reviews || []

    // Store reviews in database
    let stored = 0
    for (const r of gbpReviews) {
      const existing = await supabase
        .from("gbp_reviews")
        .select("id")
        .eq("gbp_review_id", r.reviewId)
        .single()

      if (existing.data) continue

      const { error: insertErr } = await supabase.from("gbp_reviews").insert({
        user_id: user.id,
        gbp_review_id: r.reviewId,
        reviewer_name: r.reviewer?.displayName || "Anonymous",
        reviewer_avatar_url: r.reviewer?.profilePhotoUrl || "",
        rating: r.starRating,
        comment: r.comment,
        review_reply: r.reviewReply?.comment || "",
        review_reply_timestamp: r.reviewReply?.updateTime || null,
        create_time: r.createTime,
        update_time: r.updateTime,
        is_synced: true,
      })

      if (!insertErr) stored++
      if (!insertErr) {
        await captureServerEvent(user.id, "review.received", {
          rating: r.starRating,
          source: "gbp_sync",
        }, user.id)
      }
    }

    // Update last sync timestamp
    await supabase.from("gbp_connections").update({
      last_sync_at: new Date().toISOString(),
    }).eq("user_id", user.id)

    // Auto-reply to new reviews (non-fatal if it fails)
    let autoReply = { replied: 0, failed: [] as string[] }
    try {
      const replyRes = await fetch(`${SUPABASE_URL}/functions/v1/auto-reply-gbp`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: "{}",
      })
      if (replyRes.ok) {
        autoReply = await replyRes.json()
      }
    } catch {
      // ignore — auto-reply failure should not fail the sync
    }

    // Email the business owner about new reviews (non-fatal if it fails)
    let notified = 0
    try {
      const notifyRes = await fetch(`${SUPABASE_URL}/functions/v1/notify-new-reviews`, {
        method: "POST",
        headers: {
          "Authorization": authHeader,
          "Content-Type": "application/json",
        },
        body: "{}",
      })
      if (notifyRes.ok) {
        const notifyData = await notifyRes.json()
        notified = notifyData.notified?.length || 0
      }
    } catch {
      // ignore — notification failure should not fail the sync
    }

    return new Response(JSON.stringify({
      success: true,
      stored,
      total: gbpReviews.length,
      autoReply,
      notified,
    }), {
      headers: { "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    })
  }
})
