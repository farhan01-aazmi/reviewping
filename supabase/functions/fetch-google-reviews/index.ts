import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }

  try {
    const authHeader = req.headers.get("Authorization")
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Missing Authorization header" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL") || ""
    const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
    const supabase = createClient(supabaseUrl, supabaseKey)

    // Verify the user's JWT and get their ID
    const token = authHeader.replace("Bearer ", "")
    const { data: { user }, error: authError } = await supabase.auth.getUser(token)
    if (authError || !user) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Get user's Google Business Profile settings
    const { data: settings } = await supabase
      .from("business_settings")
      .select("*")
      .eq("user_id", user.id)
      .single()

    if (!settings?.google_place_id) {
      return new Response(JSON.stringify({ error: "No Google Place ID configured" }), {
        status: 400,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Fetch reviews from Google Places API
    const apiKey = Deno.env.get("GOOGLE_PLACES_API_KEY")
    if (!apiKey) {
      return new Response(JSON.stringify({ error: "Google API key not configured" }), {
        status: 500,
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    const placesRes = await fetch(
      `https://maps.googleapis.com/maps/api/place/details/json?place_id=${settings.google_place_id}&fields=name,rating,reviews,user_ratings_total&key=${apiKey}`
    )
    const placesData = await placesRes.json()

    if (!placesData.result?.reviews) {
      return new Response(JSON.stringify({ reviews: [], message: "No reviews found" }), {
        headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
      })
    }

    // Store reviews in database
    const reviews = placesData.result.reviews.map((r: any) => ({
      user_id: user.id,
      name: r.author_name,
      rating: r.rating,
      text: r.text,
      status: "reviewed",
      channel: "google",
      sentAt: new Date(r.time * 1000).toISOString(),
    }))

    const { error: insertError } = await supabase.from("reviews").upsert(reviews, {
      onConflict: "id",
      ignoreDuplicates: true,
    })

    if (insertError) {
      console.error("Insert error:", insertError)
    }

    return new Response(JSON.stringify({
      success: true,
      count: reviews.length,
      reviews,
    }), {
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
    })
  }
})
