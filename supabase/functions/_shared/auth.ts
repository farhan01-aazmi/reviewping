import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

// Restrict CORS to production domain + localhost for development.
// Override via CORS_ORIGIN env var if needed.
const ALLOWED_ORIGIN = Deno.env.get("CORS_ORIGIN") || "https://reviewping-seven.vercel.app";

const CORS_HEADERS = {
  "Access-Control-Allow-Origin": ALLOWED_ORIGIN,
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Access-Control-Allow-Headers": "authorization, content-type",
  "Content-Type": "application/json",
};

export const CORS = CORS_HEADERS;

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
        headers: CORS_HEADERS,
      });
    }

    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Authentication required" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0].toLowerCase() !== "bearer") {
      return new Response(JSON.stringify({ error: "Invalid authorization header format" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    const token = parts[1];
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      console.error("JWT verification failed:", error?.message);
      return new Response(JSON.stringify({ error: "Invalid or expired token" }), {
        status: 401,
        headers: CORS_HEADERS,
      });
    }

    return { userId: user.id };
  } catch (err) {
    console.error("verifyAuth unexpected error:", err);
    return new Response(JSON.stringify({ error: "Authentication failed" }), {
      status: 401,
      headers: CORS_HEADERS,
    });
  }
}
