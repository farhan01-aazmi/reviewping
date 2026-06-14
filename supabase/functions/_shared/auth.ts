import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// CORS helpers.
// CORS_ORIGIN env var can be a comma-separated list of allowed origins.
// Use corsHeaders(req) in response constructors for proper origin echo.
// Use CORS constant for quick responses (uses first allowed origin).

const ALLOWED_ORIGINS = [
  "https://reviewping.pro",
  "https://www.reviewping.pro",
  "http://localhost:5173",
  "http://localhost:3000",
];

function resolveOrigin(requestOrigin) {
  const raw = Deno.env.get("CORS_ORIGIN") || "";
  const origins = raw ? raw.split(",").map(s => s.trim()).filter(Boolean) : ALLOWED_ORIGINS;
  if (requestOrigin && origins.includes(requestOrigin)) return requestOrigin;
  return origins[0] || "*";
}

function corsObject(origin) {
  return {
    "Access-Control-Allow-Origin": origin,
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Access-Control-Allow-Headers": "authorization, content-type, x-client-info, apikey",
    "Content-Type": "application/json",
  };
}

/** Build CORS headers dynamically from the incoming request. */
export function corsHeaders(req) {
  const origin = req?.headers?.get("origin") || "";
  return corsObject(resolveOrigin(origin));
}

/**
 * Static CORS object — always returns the first allowed origin.
 * Fine for server-to-server calls and simple responses.
 */
export const CORS = corsObject(resolveOrigin(""));

/**
 * Verify the JWT token from an incoming request.
 *
 * Uses Supabase's built-in auth.getUser() to validate the token
 * against the Supabase Auth API. Returns the authenticated user's ID
 * or a 401 Response object.
 *
 * Usage:
 *   const auth = await verifyAuth(req);
 *   if (auth instanceof Response) return auth;
 *   // auth.userId is now safe to use
 */
export async function verifyAuth(req: Request): Promise<
  { userId: string } | Response
> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL");
    const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY");

    if (!supabaseUrl || !supabaseAnonKey) {
      console.error("Missing SUPABASE_URL or SUPABASE_ANON_KEY env vars");
      return new Response(JSON.stringify({ error: "Server configuration error" }), {
        status: 500,
        headers: CORS,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: CORS,
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return new Response(JSON.stringify({ error: "Invalid authorization header format" }), {
        status: 401,
        headers: CORS,
      });
    }

    const token = parts[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("JWT verification failed:", error?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: CORS,
      });
    }

    return { userId: user.id };
  } catch (err) {
    console.error("verifyAuth unexpected error:", err);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 401,
      headers: CORS,
    });
  }
}
