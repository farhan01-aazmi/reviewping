import { serve } from "https://deno.land/std@0.177.0/http/server.ts"
import { CORS, verifyAuth } from "../_shared/auth.ts"

interface RequestBody {
  review_text: string
  rating: number
  author_name: string
  tone: "Professional" | "Friendly" | "Apologetic"
}

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), {
      status: 405, headers: CORS,
    })
  }

  // Verify JWT authentication
  const auth = await verifyAuth(req);
  if (auth instanceof Response) return auth;

  try {
    const { review_text, rating, author_name, tone } = await req.json() as RequestBody

    if (!author_name) {
      return new Response(JSON.stringify({ error: "author_name is required" }), {
        status: 400, headers: CORS,
      })
    }

    const toneInstruction = tone === "Professional"
      ? "Write a professional, polite response. Keep it to 2-3 sentences."
      : tone === "Apologetic"
      ? "Write an apologetic response acknowledging the feedback. Keep it to 2-3 sentences."
      : "Write a warm, friendly response. Keep it to 2-3 sentences."

    const isPositive = rating >= 4
    const sentimentInstruction = isPositive
      ? "Thank the customer for their positive feedback."
      : "Acknowledge their feedback and mention you'll share it with the team."

    const nvidiaApiKey = Deno.env.get("NVIDIA_API_KEY")

    if (nvidiaApiKey) {
      const prompt = `You are a business owner responding to a customer review.

Review: "${review_text || "No review text provided"}"
Rating: ${rating}/5
Customer: ${author_name}

${toneInstruction}
${sentimentInstruction}

Reply:`

      const res = await fetch("https://api.nvcf.nvidia.com/v2/nvcf/pexec/functions/a1b2c3d4", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${nvidiaApiKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          messages: [
            { role: "system", content: "You are a helpful business owner assistant. Generate short, genuine review replies." },
            { role: "user", content: prompt },
          ],
          temperature: 0.7,
          max_tokens: 200,
        }),
      })

      if (res.ok) {
        const data = await res.json()
        const reply = data.choices?.[0]?.message?.content || data.message || ""
        return new Response(JSON.stringify({ reply: reply.trim() }), {
          headers: CORS,
        })
      }
    }

    // Fallback: generate a template-based reply
    const templates: Record<string, string[]> = {
      Professional: [
        `Dear ${author_name}, thank you for your review! We're delighted to hear about your positive experience and appreciate you taking the time to share your feedback. We look forward to serving you again.`,
        `Dear ${author_name}, thank you for sharing your feedback. We truly value your input and will use it to improve our service. Please don't hesitate to reach out if you have any further concerns.`,
      ],
      Friendly: [
        `Hey ${author_name}, thanks so much for the kind words! We're thrilled you had a great experience. Can't wait to see you again! 😊`,
        `Hi ${author_name}! We really appreciate you taking the time to leave a review. Your feedback means the world to us!`,
      ],
      Apologetic: [
        `Dear ${author_name}, we're sorry to hear about your experience. This is not the standard we aim for. We'd love the opportunity to make things right — please contact us directly.`,
        `Hi ${author_name}, thank you for your honest feedback. We apologize for falling short of your expectations and will address this with our team. We hope you'll give us another chance.`,
      ],
    }

    const toneTemplates = templates[tone] || templates.Professional
    const reply = toneTemplates[Math.floor(Math.random() * toneTemplates.length)]

    return new Response(JSON.stringify({ reply }), {
      headers: CORS,
    })
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500, headers: CORS,
    })
  }
})
