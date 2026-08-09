import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { corsHeaders, verifyAuth } from "../_shared/auth.ts";

serve(async (req) => {
  const headers = corsHeaders(req);
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers });
  }
  if (req.method !== "POST") {
    return new Response(JSON.stringify({ error: "Method not allowed" }), { status: 405, headers });
  }

  try {
    const auth = await verifyAuth(req);
    if (auth instanceof Response) return auth;

    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), { status: 400, headers });
    }

    const { business_type, business_name, service_description, star_rating } = body || {};

    if (!business_type || !service_description || !star_rating) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: business_type, service_description, star_rating" }),
        { status: 400, headers },
      );
    }

    const NVIDIA_KEY = Deno.env.get("NVIDIA_API_KEY");
    if (!NVIDIA_KEY) {
      throw new Error("NVIDIA_API_KEY not configured");
    }

    const rating = parseInt(star_rating);
    let toneGuide: string;
    if (rating >= 4) {
      toneGuide = "Enthusiastic and glowing. Highlight what makes this business excellent. Use positive, excited language.";
    } else if (rating === 3) {
      toneGuide = "Neutral-positive and balanced. Acknowledge good points while gently noting areas for improvement. Constructive but fair.";
    } else {
      toneGuide = "Constructive and honest. The customer was disappointed. Focus on balanced critical feedback that helps the business improve.";
    }

    const systemPrompt = `You are a review template writer for small businesses. Generate review draft texts that customers can copy-paste to Google.

CRITICAL RULES:
- Keep templates GENERIC — describe general qualities like food quality, service speed, staff friendliness, cleanliness, professionalism, ambiance, pricing, wait times
- NEVER name specific dishes, menu items, products, services, or staff members
- NEVER mention specific prices ($ amounts)
- Each template should be 1-3 sentences, natural-sounding, as if a real customer wrote it
- Return ONLY valid JSON array of strings

${toneGuide}

Output format: JSON array of 3-4 template strings. Example: ["First template.", "Second template.", "Third template."]`;

    const userPrompt = `Generate review templates for this business:
Business type: ${business_type}
${business_name ? `Business name: ${business_name}` : ""}
Description of services: ${service_description}
Star rating the customer selected: ${rating}/5

Create 3-4 distinct review templates that sound like real customer reviews.`;

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
        max_tokens: 800,
        temperature: 0.7,
      }),
    });

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const raw = data?.choices?.[0]?.message?.content?.trim() || "[]";

    let templates: string[];
    try {
      templates = JSON.parse(raw);
      if (!Array.isArray(templates)) throw new Error("Not an array");
    } catch {
      const lines = raw.split("\n").filter(l => l.trim()).map(l => l.replace(/^["\d.\-–\s]+/, "").replace(/["]+$/, "").trim()).filter(l => l.length > 10);
      templates = lines.slice(0, 4);
    }

    templates = templates.filter(t => typeof t === "string" && t.length > 10).slice(0, 4);
    if (templates.length === 0) templates = ["Could not generate templates. Please try again."];

    const usage = data?.usage || { prompt_tokens: 0, completion_tokens: 0, total_tokens: 0 };

    try {
      const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
      const supabaseKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
      const { createClient } = await import("https://esm.sh/@supabase/supabase-js@2");
      const supabase = createClient(supabaseUrl, supabaseKey);
      await supabase.from("ai_usage_log").insert({
        user_id: auth.userId,
        feature: "review_template_generation",
        model: "meta/llama-3.1-70b-instruct",
        prompt_tokens: usage.prompt_tokens,
        completion_tokens: usage.completion_tokens,
        total_tokens: usage.total_tokens,
        estimated_cost: (usage.total_tokens || 0) * 0.0000009,
      }).maybeSingle();
    } catch { /* non-critical */ }

    return new Response(JSON.stringify({ templates, usage }), { headers });

  } catch (err) {
    console.error("generate-review-templates error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate templates. Please try again." }), {
      status: 500,
      headers,
    });
  }
});
