import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const GOOGLE_PLACES_API_KEY = Deno.env.get("GOOGLE_PLACES_API_KEY") || ""

const CORS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS, "Content-Type": "application/json" },
  })
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: CORS })

  const url = new URL(req.url)
  const action = url.searchParams.get("action") || "list"
  const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

  // Auth check
  const authHeader = req.headers.get("Authorization") || ""
  const token = authHeader.replace("Bearer ", "")
  const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
  if (authErr || !user) return json({ error: "Unauthorized" }, 401)

  // LIST
  if (action === "list") {
    const { data, error } = await supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    if (error) return json({ error: error.message }, 500)
    return json({ competitors: data || [] })
  }

  // ADD
  if (action === "add") {
    const body = await req.json().catch(() => ({}))
    const { name, google_place_id, google_maps_url, business_category, city } = body
    if (!name?.trim()) return json({ error: "Business name is required" }, 400)

    const { count } = await supabase
      .from("competitors")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
    if ((count || 0) >= 5) return json({ error: "Maximum 5 competitors allowed" }, 400)

    let currentRating = null
    let currentReviewCount = 0
    if (google_place_id && GOOGLE_PLACES_API_KEY) {
      try {
        const r = await fetch(
          `https://places.googleapis.com/v1/places/${google_place_id}?fields=rating,userRatingCount&key=${GOOGLE_PLACES_API_KEY}`
        )
        const d = await r.json()
        currentRating = d.rating || null
        currentReviewCount = d.userRatingCount || 0
      } catch (_) { /* silently skip */ }
    }

    const { data, error } = await supabase
      .from("competitors")
      .insert({
        user_id: user.id,
        name: name.trim(),
        google_place_id: google_place_id || null,
        google_maps_url: google_maps_url || null,
        business_category: business_category || null,
        city: city || null,
        current_rating: currentRating,
        current_review_count: currentReviewCount,
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) return json({ error: error.message }, 500)
    return json({ success: true, competitor: data })
  }

  // SYNC
  if (action === "sync") {
    if (!GOOGLE_PLACES_API_KEY) return json({ error: "Google Places API key not configured" }, 500)
    const { data: competitors } = await supabase
      .from("competitors")
      .select("*")
      .eq("user_id", user.id)
    if (!competitors?.length) return json({ synced: 0 })

    const results = []
    for (const comp of competitors) {
      if (!comp.google_place_id) continue
      try {
        const r = await fetch(
          `https://places.googleapis.com/v1/places/${comp.google_place_id}?fields=rating,userRatingCount&key=${GOOGLE_PLACES_API_KEY}`
        )
        const d = await r.json()
        const newRating = d.rating || comp.current_rating
        const newCount = d.userRatingCount || comp.current_review_count
        await supabase.from("competitors").update({
          previous_rating: comp.current_rating,
          previous_review_count: comp.current_review_count,
          current_rating: newRating,
          current_review_count: newCount,
          last_synced_at: new Date().toISOString(),
        }).eq("id", comp.id)
        await supabase.from("competitor_history").insert({
          competitor_id: comp.id,
          user_id: user.id,
          rating: newRating,
          review_count: newCount,
        })
        results.push({ name: comp.name, rating: newRating, reviews: newCount })
      } catch (_) { /* continue */ }
    }
    return json({ synced: results.length, results })
  }

  // DELETE
  if (action === "delete") {
    const body = await req.json().catch(() => ({}))
    const { competitor_id } = body
    if (!competitor_id) return json({ error: "competitor_id required" }, 400)
    await supabase.from("competitors").delete().eq("id", competitor_id).eq("user_id", user.id)
    return json({ success: true })
  }

  // ANALYZE PATTERNS (review velocity)
  if (action === "analyze-patterns") {
    const now = Date.now()
    const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString()
    const sixtyDaysAgo = new Date(now - 60 * 86400000).toISOString()

    // Current period (last 30 days)
    const { data: currentReviews } = await supabase
      .from("reviews")
      .select("sentAt, rating, reply")
      .eq("user_id", user.id)
      .gte("sentAt", thirtyDaysAgo)

    // Previous period (30-60 days ago)
    const { data: previousReviews } = await supabase
      .from("reviews")
      .select("sentAt, rating, reply")
      .eq("user_id", user.id)
      .gte("sentAt", sixtyDaysAgo)
      .lt("sentAt", thirtyDaysAgo)

    const current = currentReviews || []
    const previous = previousReviews || []

    const currentCount = current.length
    const previousCount = previous.length

    const currentAvg = current.filter(r => r.rating).reduce((s, r) => s + (r.rating || 0), 0) / (current.filter(r => r.rating).length || 1)
    const previousAvg = previous.filter(r => r.rating).reduce((s, r) => s + (r.rating || 0), 0) / (previous.filter(r => r.rating).length || 1)

    const currentReplied = current.filter(r => !!r.reply).length
    const currentResponseRate = currentCount > 0 ? Math.round((currentReplied / currentCount) * 100) : 0

    // Day-of-week breakdown (current period)
    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dayCounts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
    current.forEach(r => {
      const day = dayNames[new Date(r.sentAt).getDay()]
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })

    // Best day
    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]

    // Velocity trend
    const velocityChange = previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0 ? 100 : 0

    // Rating trend
    const ratingChange = previousAvg > 0
      ? (currentAvg - previousAvg).toFixed(2)
      : "0.00"

    // Positive ratio
    const currentPositive = current.filter(r => (r.rating || 0) >= 4).length
    const currentPositiveRatio = currentCount > 0 ? Math.round((currentPositive / currentCount) * 100) : 0

    return json({
      patterns: {
        period: { from: thirtyDaysAgo, to: now },
        velocity: {
          current: currentCount,
          previous: previousCount,
          change: velocityChange,
          direction: velocityChange > 0 ? "up" : velocityChange < 0 ? "down" : "flat",
        },
        ratings: {
          current: Math.round(currentAvg * 10) / 10,
          previous: Math.round(previousAvg * 10) / 10,
          change: parseFloat(ratingChange),
        },
        responseRate: currentResponseRate,
        positiveRatio: currentPositiveRatio,
        bestDay: bestDay ? { day: bestDay[0], count: bestDay[1] } : null,
        dayDistribution: dayCounts,
      },
    })
  }

  return json({ error: "Invalid action" }, 400)
})