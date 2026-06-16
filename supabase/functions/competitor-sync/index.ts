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

  // ─── LIST ─────────────────────────────────────────────
  if (action === "list") {
    const { data, error } = await supabase
      .from("competitor_tracking")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: true })
    if (error) return json({ error: error.message }, 500)
    return json({ competitors: data || [] })
  }

  // ─── ADD ──────────────────────────────────────────────
  if (action === "add") {
    const body = await req.json().catch(() => ({}))
    const { business_name, google_place_id, website_url, category } = body

    if (!business_name?.trim()) return json({ error: "Business name is required" }, 400)

    // Check max 5 competitors
    const { count } = await supabase
      .from("competitor_tracking")
      .select("*", { count: "exact", head: true })
      .eq("user_id", user.id)
    if ((count || 0) >= 5) return json({ error: "Maximum 5 competitors allowed" }, 400)

    // Fetch initial data from Google Places API
    let googleRating = null
    let googleReviewCount = 0
    let address = null
    if (google_place_id && GOOGLE_PLACES_API_KEY) {
      try {
        const r = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${google_place_id}&fields=rating,user_ratings_total,formatted_address,name&key=${GOOGLE_PLACES_API_KEY}`
        )
        const d = await r.json()
        if (d.result) {
          googleRating = d.result.rating || null
          googleReviewCount = d.result.user_ratings_total || 0
          address = d.result.formatted_address || null
        }
      } catch (_) { /* silently skip */ }
    }

    const { data, error } = await supabase
      .from("competitor_tracking")
      .insert({
        user_id: user.id,
        business_name: business_name.trim(),
        google_place_id: google_place_id || null,
        google_rating: googleRating,
        google_review_count: googleReviewCount,
        website_url: website_url || null,
        address: address || null,
        category: category || null,
        last_synced_at: new Date().toISOString(),
      })
      .select()
      .single()
    if (error) return json({ error: error.message }, 500)

    return json({ success: true, competitor: data })
  }

  // ─── SYNC (single or all) ────────────────────────────
  if (action === "sync" || action === "sync-all") {
    if (!GOOGLE_PLACES_API_KEY) return json({ error: "Google Places API key not configured" }, 500)

    let competitors
    if (action === "sync") {
      const body = await req.json().catch(() => ({}))
      // If competitor_id specified, sync just that one
      if (body?.competitor_id) {
        const { data } = await supabase
          .from("competitor_tracking")
          .select("*")
          .eq("id", body.competitor_id)
          .eq("user_id", user.id)
          .single()
        competitors = data ? [data] : []
      } else {
        // Sync all user's competitors
        const { data } = await supabase
          .from("competitor_tracking")
          .select("*")
          .eq("user_id", user.id)
        competitors = data || []
      }
    } else {
      // sync-all
      const { data } = await supabase
        .from("competitor_tracking")
        .select("*")
        .eq("user_id", user.id)
      competitors = data || []
    }

    if (!competitors?.length) return json({ synced: 0 })

    const results = []
    for (const comp of competitors) {
      if (!comp.google_place_id) continue
      try {
        const r = await fetch(
          `https://maps.googleapis.com/maps/api/place/details/json?place_id=${comp.google_place_id}&fields=rating,user_ratings_total,business_status,name&key=${GOOGLE_PLACES_API_KEY}`
        )
        const d = await r.json()
        if (!d.result) continue
        const newRating = d.result.rating || comp.google_rating
        const newCount = d.result.user_ratings_total || comp.google_review_count

        await supabase
          .from("competitor_tracking")
          .update({
            google_rating: newRating,
            google_review_count: newCount,
            last_synced_at: new Date().toISOString(),
          })
          .eq("id", comp.id)

        // Insert snapshot
        await supabase
          .from("competitor_snapshots")
          .insert({
            competitor_id: comp.id,
            user_id: user.id,
            rating: newRating,
            review_count: newCount,
          })
          .catch(() => {}) // silently fail if table doesn't exist

        results.push({
          id: comp.id,
          name: comp.business_name,
          rating: newRating,
          reviews: newCount,
        })
      } catch (_) { /* continue */ }
    }

    return json({ synced: results.length, results })
  }

  // ─── DELETE ───────────────────────────────────────────
  if (action === "delete") {
    const body = await req.json().catch(() => ({}))
    const { competitor_id } = body
    if (!competitor_id) return json({ error: "competitor_id required" }, 400)
    await supabase.from("competitor_tracking").delete().eq("id", competitor_id).eq("user_id", user.id)
    return json({ success: true })
  }

  // ─── ANALYZE PATTERNS (unchanged — uses reviews table) ─
  if (action === "analyze-patterns") {
    const now = Date.now()
    const thirtyDaysAgo = new Date(now - 30 * 86400000).toISOString()
    const sixtyDaysAgo = new Date(now - 60 * 86400000).toISOString()

    const { data: currentReviews } = await supabase
      .from("reviews")
      .select("sentAt, rating, reply")
      .eq("user_id", user.id)
      .gte("sentAt", thirtyDaysAgo)

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

    const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const dayCounts: Record<string, number> = { Sun: 0, Mon: 0, Tue: 0, Wed: 0, Thu: 0, Fri: 0, Sat: 0 }
    current.forEach(r => {
      const day = dayNames[new Date(r.sentAt).getDay()]
      dayCounts[day] = (dayCounts[day] || 0) + 1
    })

    const bestDay = Object.entries(dayCounts).sort((a, b) => b[1] - a[1])[0]

    const velocityChange = previousCount > 0
      ? Math.round(((currentCount - previousCount) / previousCount) * 100)
      : currentCount > 0 ? 100 : 0

    const ratingChange = previousAvg > 0
      ? (currentAvg - previousAvg).toFixed(2)
      : "0.00"

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
