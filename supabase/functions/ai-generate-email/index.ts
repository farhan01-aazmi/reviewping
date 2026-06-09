import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { CORS, verifyAuth } from "../_shared/auth.ts";

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers: CORS });
  }

  try {
    const auth = await verifyAuth(req);
    if (auth instanceof Response) return auth;

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers: CORS });
    }

    const { customer_name, business_type, business_name, special_notes, tone } = body || {};

    if (!business_type || typeof business_type !== "string") {
      return new Response(
        JSON.stringify({ error: "validation_error", fields: { business_type: "Business type is required" } }),
        { status: 400, headers: CORS },
      );
    }

    const NVIDIA_KEY = Deno.env.get("NVIDIA_API_KEY");
    if (!NVIDIA_KEY) {
      throw new Error("NVIDIA_API_KEY not configured");
    }

    const toneGuide = tone === "professional"
      ? "Professional and courteous. Use formal language."
      : tone === "warm"
      ? "Warm and friendly. Use heartfelt language."
      : "Friendly and approachable. Natural conversation tone.";

    const systemPrompt = `You are a professional email copywriter for small businesses. 
Generate a review request email. Return ONLY valid JSON with "subject" and "body" fields.
The body should use [Customer Name] and [Business Name] and [LINK] as placeholders.
Keep subject under 60 chars. Keep body under 300 words. ${toneGuide}`;

    const userPrompt = `Write a review request email for a ${business_type} business.
${business_name ? `Business name: ${business_name}` : ""}
${customer_name ? `Customer name: ${customer_name}` : "Customer name: [Customer Name]"}
${special_notes ? `Special context: ${special_notes}` : ""}`;

    const res = await fetch("https://integrate.api.nvidia.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${NVIDIA_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "meta/llama-3.1-70b-instruct",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt },
        ],
        max_tokens: 600,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "{}";

    // Try to parse JSON from AI response
    let parsed;
    try {
      parsed = JSON.parse(raw);
    } catch {
      // If AI didn't return clean JSON, try to extract subject/body
      const lines = raw.split("\n").filter(l => l.trim());
      parsed = {
        subject: "How was your experience?",
        body: raw,
      };
    }

    // Log usage for cost tracking
    const usage = data?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    // Insert usage log
    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("ai_usage_log").insert({
        user_id: auth.userId,
        feature: "email_generation",
        model: "meta/llama-3.1-70b-instruct",
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        estimated_cost: (usage.total_tokens || 0) * 0.0000009, // ~$0.90/M tokens
      }).maybeSingle();
    } catch { /* non-critical */ }

    return new Response(JSON.stringify({
      subject: parsed.subject || "How was your experience?",
      body: parsed.body || "",
      usage,
    }), { headers: CORS });

  } catch (err) {
    console.error("ai-generate-email error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate email. Please try again." }), {
      status: 500,
      headers: CORS,
    });
  }
});
