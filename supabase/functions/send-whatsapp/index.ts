import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS, verifyAuth, checkDailyLimit } from "../_shared/auth.ts"

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS })
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: CORS,
      })
    }

    // Verify JWT authentication
    const auth = await verifyAuth(req)
    if (auth instanceof Response) return auth
    const { userId } = auth

    // Check daily limit for free plan
    const supabaseCheck = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )
    const { data: profile } = await supabaseCheck
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single()
    const limit = await checkDailyLimit(supabaseCheck, userId, profile?.plan || "free")
    if (limit instanceof Response) return limit

    // Parse and validate request body
    let body
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: CORS,
      })
    }

    const { to, message, customer_name, review_link } = body || {}
    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to' and 'message'" }),
        { status: 400, headers: CORS },
      )
    }

    const supabaseUrl = Deno.env.get("SUPABASE_URL")
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error("Supabase environment variables not configured")
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey, {
      global: { headers: { Authorization: `Bearer ${req.headers.get("Authorization")?.replace("Bearer ", "")}` } },
    })

    // Save to review_requests
    const { data: request, error: reqError } = await supabase.from("review_requests").insert({
      user_id: userId,
      customer_name: customer_name || "Customer",
      customer_phone: to,
      channel: "whatsapp",
      status: "sent",
      review_link: review_link || "",
      sent_at: new Date().toISOString(),
    }).select().single()

    if (reqError) throw reqError

    return new Response(JSON.stringify({ ok: true, request_id: request.id }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    console.error("send-whatsapp error:", err)
    const msg = err instanceof Error ? err.message : "Failed to send WhatsApp"
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: CORS,
    })
  }
})
