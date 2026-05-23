import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const cors = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: cors })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  )

  const token = req.headers.get('Authorization')?.replace('Bearer ', '')
  const { data: { user } } = await supabase.auth.getUser(token ?? '')
  if (!user) return new Response('Unauthorized', { status: 401 })

  const { customer_name, customer_email, review_link, business_name } = await req.json()

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
      Authorization: `Bearer ${Deno.env.get('RESEND_API_KEY')}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: `${business_name} <reviews@yourdomain.com>`,
      to: customer_email,
      subject: `How was your experience at ${business_name}?`,
      html,
    }),
  })

  const status = res.ok ? 'sent' : 'failed'

  await supabase.from('review_requests').insert({
    user_id: user.id,
    customer_name,
    customer_email,
    channel: 'email',
    review_link,
    status,
    sent_at: new Date().toISOString(),
  })

  return new Response(
    JSON.stringify({ success: res.ok }),
    { headers: { ...cors, 'Content-Type': 'application/json' } }
  )
})
