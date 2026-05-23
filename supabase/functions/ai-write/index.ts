import { serve } from "https://deno.land/std@0.177.0/http/server.ts";
import { CORS, verifyAuth } from "../_shared/auth.ts";

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 204, headers: CORS });
  }

  try {
    if (req.method !== "POST") {
      return new Response(JSON.stringify({ error: "Method not allowed" }), {
        status: 405,
        headers: CORS,
      });
    }

    // Verify JWT authentication — AI message generation requires an authenticated user
    const auth = await verifyAuth(req);
    if (auth instanceof Response) return auth;

    // Parse and validate request body
    let body;
    try {
      body = await req.json();
    } catch {
      return new Response(JSON.stringify({ error: "Invalid JSON body" }), {
        status: 400,
        headers: CORS,
      });
    }

    const { name, service, business } = body || {};
    if (!name || typeof name !== "string") {
      return new Response(
        JSON.stringify({ error: "Customer name is required" }),
        { status: 400, headers: CORS },
      );
    }

    const NVIDIA_KEY = Deno.env.get("NVIDIA_API_KEY");
    if (!NVIDIA_KEY) {
      throw new Error("NVIDIA_API_KEY not configured — set it in Supabase secrets");
    }

    const systemPrompt = "You generate short SMS review request messages for businesses. Keep responses under 115 characters. Include [LINK] where the review link goes. No emojis. Sound human and warm. Return ONLY the message text, nothing else.";
    const userPrompt = `Write a review request SMS for ${name} who just had a ${service} at ${business || "our business"}.`;

    const res = await fetch(
      "https://integrate.api.nvidia.com/v1/chat/completions",
      {
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
          max_tokens: 160,
          temperature: 0.7,
        }),
      },
    );

    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`NVIDIA API error: ${res.status} - ${errText}`);
    }

    const data = await res.json();
    const text = data?.choices?.[0]?.message?.content?.trim() || "";

    return new Response(JSON.stringify({ message: text }), {
      headers: CORS,
    });
  } catch (err) {
    console.error("ai-write error:", err);
    return new Response(JSON.stringify({ error: "Failed to generate message. Please try again." }), {
      status: 500,
      headers: CORS,
    });
  }
});
