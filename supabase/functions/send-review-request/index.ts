import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"
import { CORS, verifyAuth } from "../_shared/auth.ts"

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  // Only allow POST
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405,
      headers: CORS,
    });
  }

  // Verify JWT authentication
  const auth = await verifyAuth(req);
  if (auth instanceof Response) return auth;

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const { customer_name, customer_email, review_link, business_name } = await req.json()
  const from = Deno.env.get("FROM_EMAIL") || "ReviewPing <reviews@reviewping.io>"
  const resendKey = Deno.env.get("RESEND_API_KEY")

  if (!resendKey) {
    return new Response(JSON.stringify({ error: "Resend API key not configured" }), {
      status: 500, headers: CORS,
    })
  }

  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h2>Hi ${customer_name}!</h2>
      <p>Thank you for choosing ${business_name}. We'd love to hear about your experience.</p>
      <a href="${review_link}"
         style="display:inline-block;padding:12px 24px;background:#2563eb;
                color:#fff;border-radius:8px;text-decoration:none;margin:16px 0;">
        Leave a Review ⭐
      </a>
      <p style="color:#888;font-size:12px;">Takes less than 60 seconds.</p>
    </div>
  `

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${resendKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${business_name || "ReviewPing"} <${from.replace(/.*<(.*)>/, "$1") || "reviews@reviewping.io"}>`,
      to: customer_email,
      subject: `How was your experience at ${business_name}?`,
      html,
    }),
  })

  const status = res.ok ? 'sent' : 'failed'

  await supabase.from('review_requests').insert({
    user_id: auth.userId,
    customer_name,
    customer_email,
    channel: 'email',
    review_link,
    status,
    sent_at: new Date().toISOString(),
  })

  return new Response(
    JSON.stringify({ success: res.ok }),
    { headers: CORS }
  )
})
