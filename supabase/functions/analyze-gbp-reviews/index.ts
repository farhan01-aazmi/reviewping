import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { CORS, verifyAuth } from "../_shared/auth.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const TOPIC_KEYWORDS: Record<string, string[]> = {
  Service: ["service", "staff", "rude", "unhelpful", "ignored", "waited", "waiting", "slow", "fast", "quick", "friendly", "helpful", "welcome"],
  Price: ["price", "expensive", "cost", "cheap", "money", "overpriced", "billing", "charge", "refund"],
  Quality: ["quality", "good", "great", "excellent", "amazing", "bad", "poor", "terrible", "worst", "best", "amazing", "delicious", "tasty", "workmanship"],
  Cleanliness: ["clean", "dirty", "messy", "hygiene", "sanitary", "tidy", "smell"],
  Communication: ["communication", "responsive", "response", "called", "call", "phone", "message", "email", "follow-up", "follow up", "explain", "update"],
  Delivery: ["delivery", "shipped", "shipping", "on time", "late", "packaging", "package", "arrived"],
  Ambience: ["ambience", "atmosphere", "environment", "interior", "decor", "music", "noise", "noisy", "loud"],
  Parking: ["parking", "park", "space", "location", "easy to find", "hard to find"],
}

const POSITIVE_WORDS = ["great", "good", "excellent", "amazing", "awesome", "love", "loved", "best", "fantastic", "wonderful", "perfect", "recommend", "delicious", "friendly", "helpful", "professional", "quick", "fast", "clean", "beautiful", "impressed", "satisfied", "happy", "pleased", "superb", "outstanding", "top-notch"]
const NEGATIVE_WORDS = ["bad", "poor", "terrible", "worst", "awful", "rude", "slow", "late", "dirty", "expensive", "overpriced", "disappointed", "unhappy", "frustrated", "angry", "ignored", "unhelpful", "refused", "broken", "damage", "dirty", "waiting", "refund", "complaint", "unprofessional", "worse"]

function analyzeReview(comment: string, rating: number) {
  const text = (comment || "").toLowerCase()
  const topics: string[] = []
  for (const [topic, words] of Object.entries(TOPIC_KEYWORDS)) {
    if (words.some((w) => text.includes(w))) topics.push(topic)
  }

  let sentiment: "positive" | "negative" | "neutral" = "neutral"
  const posCount = POSITIVE_WORDS.filter((w) => text.includes(w)).length
  const negCount = NEGATIVE_WORDS.filter((w) => text.includes(w)).length
  if (rating <= 2 || negCount > posCount) sentiment = "negative"
  else if (rating >= 4 || posCount > negCount) sentiment = "positive"

  return { topics, sentiment }
}

function buildInsights(reviews: any[]) {
  const distribution: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
  const topicCounts: Record<string, { total: number; negative: number }> = {}
  const issues: { topic: string; count: number; quotes: string[] }[] = []
  let positiveCount = 0
  let negativeCount = 0
  let ratingSum = 0

  for (const r of reviews) {
    const rating = r.rating || 0
    if (distribution[rating] !== undefined) distribution[rating]++
    ratingSum += rating
    const { topics, sentiment } = analyzeReview(r.comment || "", rating)
    if (sentiment === "positive") positiveCount++
    if (sentiment === "negative") negativeCount++

    for (const t of topics) {
      if (!topicCounts[t]) topicCounts[t] = { total: 0, negative: 0 }
      topicCounts[t].total++
      if (sentiment === "negative") topicCounts[t].negative++
    }
  }

  for (const [topic, counts] of Object.entries(topicCounts)) {
    if (counts.negative > 0) {
      issues.push({
        topic,
        count: counts.negative,
        quotes: reviews
          .filter((r) => {
            const { topics, sentiment } = analyzeReview(r.comment || "", r.rating || 0)
            return topics.includes(topic) && sentiment === "negative"
          })
          .slice(0, 3)
          .map((r) => (r.comment || "").slice(0, 140)),
      })
    }
  }

  const avgRating = reviews.length > 0 ? Math.round((ratingSum / reviews.length) * 10) / 10 : 0

  return {
    total: reviews.length,
    avgRating,
    distribution,
    sentiment: { positive: positiveCount, negative: negativeCount, neutral: reviews.length - positiveCount - negativeCount },
    topics: topicCounts,
    issues: issues.filter((i) => i.count > 0).sort((a, b) => b.count - a.count),
    repliesGiven: reviews.filter((r) => r.review_reply).length,
  }
}

async function aiInsights(reviews: any[], apiKey: string): Promise<string | null> {
  const sample = reviews.slice(0, 20).map((r) => ({
    rating: r.rating,
    comment: (r.comment || "").slice(0, 300),
  }))

  const prompt = `You are a business reputation analyst. Analyze these Google reviews and list concrete problems the business should fix (max 5). For each: name the issue, how often it appears, and a suggested fix. Be specific and actionable.

Reviews (JSON):
${JSON.stringify(sample)}

Respond in JSON format:
{"issues":[{"title":"short issue title","frequency":"how often it appears","fix":"concrete suggested fix"}]}`

  const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Authorization": `Bearer ${apiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      model: "meta/llama-3.1-8b-instruct",
      messages: [
        { role: "system", content: "You are a concise business reputation analyst. Always respond with valid JSON only." },
        { role: "user", content: prompt },
      ],
      temperature: 0.3,
      max_tokens: 800,
    }),
  })

  if (!res.ok) return null
  const data = await res.json()
  return data.choices?.[0]?.message?.content || null
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS })
  }

  const auth = await verifyAuth(req)
  if (auth instanceof Response) return auth

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL") || "", Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || "")

    const { data: reviews, error } = await supabase
      .from("gbp_reviews")
      .select("*")
      .eq("user_id", auth.userId)
      .order("create_time", { ascending: false })
      .limit(500)

    if (error) {
      return new Response(JSON.stringify({ error: error.message }), { status: 500, headers: CORS })
    }

    const insights = buildInsights(reviews || [])

    const apiKey = Deno.env.get("AI_API_KEY") || ""
    let aiIssues: { title: string; frequency: string; fix: string }[] | null = null
    if (apiKey && insights.total > 0) {
      const raw = await aiInsights(reviews || [], apiKey)
      if (raw) {
        try {
          const cleaned = raw.replace(/^```json\s*/, "").replace(/```$/, "").trim()
          const parsed = JSON.parse(cleaned)
          if (Array.isArray(parsed.issues)) {
            aiIssues = parsed.issues.slice(0, 5)
            await supabase
              .rpc("increment_ai_generations", { count: 1, user_uuid: auth.userId })
              .catch(() => {})
          }
        } catch {
          aiIssues = null
        }
      }
    }

    return new Response(JSON.stringify({ ...insights, aiIssues }), {
      headers: { ...CORS, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: CORS })
  }
})
