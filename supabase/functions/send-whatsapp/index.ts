import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS, verifyAuth, checkDailyLimit } from "../_shared/auth.ts"
import { captureServerEvent } from "../_shared/posthog.ts"

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS })
  }

  let userId
  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405, headers: CORS,
      })
    }

    const auth = await verifyAuth(req)
    if (auth instanceof Response) return auth
    userId = auth.userId

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    )
    const { data: profile } = await supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single()
    const limit = await checkDailyLimit(supabase, userId, profile?.plan || "free")
    if (limit instanceof Response) return limit

    let body
    try {
      body = await req.json()
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400, headers: CORS,
      })
    }

    const { to, message, customer_name, review_link, contact_id, source, ai_generated, template_used } = body || {}
    if (!to || !message) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: 'to' and 'message'" }),
        { status: 400, headers: CORS },
      )
    }

    const accountSid = Deno.env.get("TWILIO_ACCOUNT_SID")
    const authToken = Deno.env.get("TWILIO_AUTH_TOKEN")
    const twilioPhone = Deno.env.get("TWILIO_PHONE_NUMBER")

    if (!accountSid || !authToken || !twilioPhone) {
      throw new Error("Twilio environment variables not configured")
    }

    // Send via Twilio WhatsApp API
    const twilioRes = await fetch(
      `https://api.twilio.com/2010-04-01/Accounts/${accountSid}/Messages.json`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
          "Authorization": `Basic ${btoa(`${accountSid}:${authToken}`)}`,
        },
        body: new URLSearchParams({
          To: `whatsapp:${to}`,
          From: `whatsapp:${twilioPhone}`,
          Body: message,
        }),
      },
    )

    const twilioResult = await twilioRes.json()
    let status = "failed"
    let providerMessageId = ""
    let failedReason = ""

    if (twilioRes.ok) {
      status = "sent"
      providerMessageId = twilioResult.sid || ""
    } else {
      failedReason = twilioResult.message || twilioResult.error || `Twilio error: ${twilioRes.status}`
      console.error("send-whatsapp: Twilio API error", twilioRes.status, failedReason)
    }

    // Save to review_requests with delivery tracking
    const { error: reqError } = await supabase.from("review_requests").insert({
      user_id: userId,
      customer_name: customer_name || "Customer",
      customer_phone: to,
      channel: "whatsapp",
      status,
      delivery_status: status,
      provider_message_id: providerMessageId,
      failed_reason: failedReason || null,
      review_link: review_link || "",
      sent_at: new Date().toISOString(),
    })

    if (reqError) throw reqError

    await captureServerEvent(userId, "review_request.sent", {
      channel: "whatsapp",
      source: source || "manual",
      ai_generated: ai_generated ?? false,
      template_used: template_used ?? false,
      contact_id: contact_id || "",
    }, userId)

    return new Response(JSON.stringify({ ok: status === "sent", status, error: failedReason || null }), {
      headers: { ...CORS, "Content-Type": "application/json" },
      status: 200,
    })
  } catch (err) {
    console.error("send-whatsapp error:", err)
    const msg = err instanceof Error ? err.message : "Failed to send WhatsApp"
    if (userId) {
      await captureServerEvent(userId, "review_request.failed", {
        channel: "whatsapp",
        reason: msg,
      }, userId)
    }
    return new Response(JSON.stringify({ error: msg }), {
      status: 500, headers: CORS,
    })
  }
})