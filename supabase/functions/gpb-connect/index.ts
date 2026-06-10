import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const GOOGLE_CLIENT_ID = Deno.env.get("GOOGLE_OAUTH_CLIENT_ID") || ""
const GOOGLE_CLIENT_SECRET = Deno.env.get("GOOGLE_OAUTH_CLIENT_SECRET") || ""
const SUPABASE_URL = Deno.env.get("SUPABASE_URL") || ""
const SUPABASE_SERVICE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") || ""
const SITE_URL = Deno.env.get("SITE_URL") || "https://reviewping-eight.vercel.app"

const FUNCTION_URL = `${SUPABASE_URL}/functions/v1/gpb-connect`

const SCOPES = [
  "https://www.googleapis.com/auth/business.manage",
  "https://www.googleapis.com/auth/userinfo.email",
  "https://www.googleapis.com/auth/userinfo.profile",
]

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY)

function json(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...CORS_HEADERS, "Content-Type": "application/json" },
  })
}

function html(body) {
  return new Response(body, {
    headers: { ...CORS_HEADERS, "Content-Type": "text/html" },
  })
}

function popupResponse(type, payload, redirectOnNoOpener = true) {
  const data = JSON.stringify(payload)
  const isError = type === "gbp_error"
  const redirectParams = isError ? `gbp=error&msg=${payload?.error || "unknown"}` : `gbp=connected`
  return html(
    `<html><body><script>
      (function() {
        try {
          if (window.opener && !window.opener.closed) {
            window.opener.postMessage({ type: ${JSON.stringify(type)}, ...JSON.parse(${JSON.stringify(data)}) }, "${SITE_URL}");
            window.close();
            return;
          }
        } catch(e) {}
        ${redirectOnNoOpener ? `window.location.href = "${SITE_URL}/dashboard?${redirectParams}";` : 'window.close();'}
      })();
    </script><noscript><p>Redirecting...</p><meta http-equiv="refresh" content="0;url=${SITE_URL}/dashboard?${redirectParams}"></noscript></body></html>`
  )
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS_HEADERS })
  }

  const url = new URL(req.url)
  const step = url.searchParams.get("step")
  const code = url.searchParams.get("code")
  const state = url.searchParams.get("state")
  const errParam = url.searchParams.get("error")
  const action = url.searchParams.get("action")

  if (errParam) {
    return popupResponse("gbp_error", { error: "Access denied by user" })
  }

  // --- DISCONNECT ---
  if (action === "disconnect") {
    const token = req.headers.get("Authorization")?.replace("Bearer ", "") || ""
    if (!token) {
      return json({ error: "Authentication required" }, 401)
    }
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) {
      return json({ error: "Unauthorized" }, 401)
    }
    await supabase.from("gbp_connections").delete().eq("user_id", user.id)
    return json({ success: true })
  }

  // --- OAUTH CALLBACK ---
  if (code && state) {
    const { data: stateRow } = await supabase
      .from("gbp_oauth_states")
      .select("user_id")
      .eq("state_token", state)
      .gte("expires_at", new Date().toISOString())
      .single()

    if (!stateRow) {
      return Response.redirect(`${SITE_URL}/dashboard?gbp=error&msg=expired`, 302)
    }

    const userId = stateRow.user_id
    await supabase.from("gbp_oauth_states").delete().eq("state_token", state)

    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: GOOGLE_CLIENT_ID,
        client_secret: GOOGLE_CLIENT_SECRET,
        redirect_uri: FUNCTION_URL,
        grant_type: "authorization_code",
      }),
    })
    const tokens = await tokenRes.json()
    if (!tokens.access_token) {
      return popupResponse("gbp_error", { error: "Failed to exchange authorization code" })
    }

    const accessToken = tokens.access_token
    const refreshToken = tokens.refresh_token || ""
    const expiresAt = new Date(Date.now() + (tokens.expires_in || 3600) * 1000).toISOString()

    const userInfoRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    const userInfo = await userInfoRes.json()

    let accountName = ""
    let accountId = ""
    let locationName = ""
    let locationId = ""
    let locationAddress = ""
    let locationPhone = ""
    const accountsRes = await fetch(
      "https://mybusinessaccountmanagement.googleapis.com/v1/accounts",
      { headers: { Authorization: `Bearer ${accessToken}` } }
    )
    const accounts = await accountsRes.json()
    const account = accounts.accounts?.[0]
    if (account) {
      accountName = account.accountName || ""
      accountId = account.name || ""
      const locRes = await fetch(
        `https://mybusinessbusinessinformation.googleapis.com/v1/accounts/${account.name}/locations?pageSize=1`,
        { headers: { Authorization: `Bearer ${accessToken}` } }
      )
      const locData = await locRes.json()
      const loc = locData.locations?.[0]
      if (loc) {
        locationName = loc.locationName || loc.title || ""
        locationId = loc.name || ""
        locationAddress = loc.address?.addressLines?.[0] || ""
        locationPhone = loc.phoneNumbers?.primaryPhone || ""
      }
    }

    await supabase.from("gbp_connections").upsert({
      user_id: userId,
      gbp_account_name: accountName,
      gbp_account_id: accountId,
      gbp_location_name: locationName,
      gbp_location_id: locationId,
      gbp_location_address: locationAddress,
      gbp_location_phone: locationPhone,
      access_token: accessToken,
      refresh_token: refreshToken,
      token_expires_at: expiresAt,
      is_connected: true,
      last_sync_at: new Date().toISOString(),
    }, { onConflict: "user_id" })

    // ── Auto-save Google review link after successful GBP connect ──
    try {
      if (locationId) {
        const locMetaRes = await fetch(
          `https://mybusinessbusinessinformation.googleapis.com/v1/${locationId}?readMask=metadata`,
          { headers: { Authorization: `Bearer ${accessToken}` } }
        )
        const locMeta = await locMetaRes.json()
        const placeId = locMeta?.metadata?.placeId || ""
        if (placeId) {
          const reviewUrl = `https://search.google.com/local/writereview?placeid=${placeId}`
          await supabase.from("business_settings").upsert({
            user_id: userId,
            google_link: reviewUrl,
            updated_at: new Date().toISOString(),
          }, { onConflict: "user_id" })
        }
      }
    } catch (_e) {
      // Silently fail — user can set link manually in Settings
    }

    // Return HTML that:
    // 1. If in a popup (window.opener exists): send postMessage to parent, closes popup
    // 2. If in the main window (old full-page redirect): redirect back to dashboard
    return html(
      `<html><body><script>
        (function() {
          try {
            if (window.opener && !window.opener.closed) {
              window.opener.postMessage({ type: "gbp_success" }, "${SITE_URL}");
              window.close();
              return;
            }
          } catch(e) {}
          // No opener — redirect back to dashboard (handles cached old JS)
          window.location.href = "${SITE_URL}/dashboard?gbp=connected";
        })();
      </script><noscript><p>GBP connected! Redirecting...</p><meta http-equiv="refresh" content="0;url=${SITE_URL}/dashboard?gbp=connected"></noscript></body></html>`
    )
  }

  // --- INIT: Generate OAuth URL ---
  if (step === "init") {
    const auth = req.headers.get("Authorization") || ""
    const token = auth.replace("Bearer ", "")
    const { data: { user }, error: authErr } = await supabase.auth.getUser(token)
    if (authErr || !user) {
      return json({ error: "Unauthorized" }, 401)
    }

    const stateToken = crypto.randomUUID()
    await supabase.from("gbp_oauth_states").insert({
      user_id: user.id,
      state_token: stateToken,
    })

    const authUrl = new URL("https://accounts.google.com/o/oauth2/v2/auth")
    authUrl.searchParams.set("client_id", GOOGLE_CLIENT_ID)
    authUrl.searchParams.set("redirect_uri", FUNCTION_URL)
    authUrl.searchParams.set("response_type", "code")
    authUrl.searchParams.set("scope", SCOPES.join(" "))
    authUrl.searchParams.set("access_type", "offline")
    authUrl.searchParams.set("prompt", "consent")
    authUrl.searchParams.set("state", stateToken)

    return json({ url: authUrl.toString() })
  }

  return json({ error: "Invalid request" }, 400)
})
