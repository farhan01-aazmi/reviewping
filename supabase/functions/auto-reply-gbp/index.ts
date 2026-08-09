import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS } from "../_shared/auth.ts"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const AI_API_KEY = Deno.env.get("AI_API_KEY") || ""
const AI_BASE_URL = Deno.env.get("AI_BASE_URL") || "https://integrate.api.nvidia.com/v1"
const AI_MODEL = Deno.env.get("AI_MODEL") || "meta/llama-3.1-8b-instruct"

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

async function generateAiReply(reviewText: string, rating: number, authorName: string): Promise<string | null> {
  if (!AI_API_KEY) return null
  const toneInstruction = rating <= 2
    ? "Write an apologetic response acknowledging the feedback. Keep it to 2-3 sentences."
    : rating >= 4
    ? "Write a warm, friendly response. Keep it to 2-3 sentences."
    : "Write a professional, polite response. Keep it to 2-3 sentences."

  const sentimentInstruction = rating >= 4
    ? "Thank the customer for their positive feedback."
    : "Acknowledge their feedback and mention you'll share it with the team."

  const prompt = `You are a business owner responding to a customer review.

Review: "${reviewText || "No review text provided"}"
Rating: ${rating}/5
Customer: ${authorName}

${toneInstruction}
${sentimentInstruction}

Reply:`

  const res = await fetch(`${AI_BASE_URL}/chat/completions`, {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${AI_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: AI_MODEL,
      messages: [
        { role: "system", content: "You are a helpful business owner assistant. Generate short, genuine review replies. Do not include a signature." },
        { role: "user", content: prompt },
      ],
      temperature: 0.7,
      max_tokens: 200,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  const reply = data.choices?.[0]?.message?.content || ""
  return reply.trim() ? reply : null
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS })
  }

  const authHeader = req.headers.get("Authorization") || ""
  const token = authHeader.replace("Bearer ", "")
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  const { data: { user }, error: authError } = await supabase.auth.getUser(token)
  if (authError || !user) {
    return new Response(JSON.stringify({ error: "Unauthorized" }), { status: 401, headers: CORS })
  }

  try {
    const { data: conn } = await supabase
      .from("gbp_connections")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!conn?.is_connected || !conn?.gbp_location_id) {
      return new Response(JSON.stringify({ error: "No GBP connection found. Connect your Google Business Profile first." }), {
        status: 400,
        headers: CORS,
      })
    }

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
          headers: CORS,
        })
      }
    }

    // Fetch reviews that have no reply yet
    const { data: pendingReviews, error: fetchErr } = await supabase
      .from("gbp_reviews")
      .select("*")
      .eq("user_id", user.id)
      .is("review_reply", null)
      .limit(20)

    if (fetchErr) {
      return new Response(JSON.stringify({ error: fetchErr.message }), { status: 500, headers: CORS })
    }

    if (!AI_API_KEY) {
      return new Response(JSON.stringify({ replied: 0, skipped: (pendingReviews || []).length, error: "AI_API_KEY not configured" }), {
        headers: CORS,
      })
    }

    const replied: string[] = []
    const failed: string[] = []

    for (const review of pendingReviews || []) {
      const reply = await generateAiReply(review.comment || "", review.rating || 5, review.reviewer_name || "Customer")
      if (!reply) {
        failed.push(review.reviewer_name || review.gbp_review_id)
        continue
      }

      const reviewName = `${conn.gbp_location_id}/reviews/${review.gbp_review_id}`
      const googleRes = await fetch(`https://mybusiness.googleapis.com/v4/${reviewName}/reply`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ comment: reply }),
      })

      if (!googleRes.ok) {
        failed.push(review.reviewer_name || review.gbp_review_id)
        continue
      }

      const { error: updateErr } = await supabase
        .from("gbp_reviews")
        .update({ review_reply: reply, review_reply_timestamp: new Date().toISOString() })
        .eq("id", review.id)

      if (!updateErr) {
        replied.push(review.reviewer_name || review.gbp_review_id)
        await supabase
          .rpc("increment_ai_generations", { count: 1, user_uuid: user.id })
          .catch(() => {})
      }
    }

    return new Response(JSON.stringify({ replied, failed }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS })
  }
})
