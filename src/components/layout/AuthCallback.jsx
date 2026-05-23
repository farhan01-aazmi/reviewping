import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { LogoMark, Spinner } from "../ui";

/**
 * AuthCallback — handles the Supabase OAuth redirect callback.
 *
 * After a user signs in with Google (or any OAuth provider), Supabase
 * redirects back to SITE_URL/auth/callback with tokens in the URL hash
 * (implicit flow) or a code in the URL query (PKCE flow).
 *
 * This component:
 * 1. Detects OAuth tokens/code in the URL
 * 2. Exchanges them for a Supabase session (PKCE) or picks up existing session
 * 3. On success → redirects the parent app to the dashboard/onboarding
 * 4. On failure → redirects to login with an error
 *
 * Props:
 *   - onDone(user): called on successful auth with user object
 *   - onError(msg): called on auth failure
 */
export default function AuthCallback({ onDone, onError }) {
  const [status, setStatus] = useState("Processing…");

  useEffect(() => {
    let cancelled = false;

    /** Strip OAuth params from the URL so back-button doesn't reprocess stale codes.
     *  Always clean to "/" (landing page) to avoid landing on an orphan path. */
    function cleanupUrl() {
      window.history.replaceState({}, "", "/");
    }

    /** Build user object and call onDone, then clean URL */
    function finish(user, profile) {
      if (!cancelled) {
        onDone(
          profile || {
            name: user.email?.split("@")[0] || "User",
            email: user.email,
            biz: "",
            id: user.id,
          }
        );
      }
    }

    async function handleCallback() {
      try {
        const hash = window.location.hash;
        const query = window.location.search;

        // Step 1: Try PKCE flow (code exchange)
        if (query.includes("code=")) {
          setStatus("Completing sign in…");
          const { data, error } =
            await supabase.auth.exchangeCodeForSession(
              new URLSearchParams(query).get("code")
            );
          if (error) throw error;
          if (data?.session?.user) {
            finish(data.session.user, await fetchProfile(data.session.user.id));
            return;
          }
        }

        // Step 2: Try implicit flow (hash fragment with tokens)
        if (hash.includes("access_token=")) {
          setStatus("Verifying session…");
          await new Promise((r) => setTimeout(r, 1500));
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            finish(session.user, await fetchProfile(session.user.id));
            return;
          }
        }

        // Step 3: Already have a session (check once more)
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          finish(session.user, await fetchProfile(session.user.id));
          return;
        }

        // Step 4: Nothing worked — error
        if (!cancelled) {
          onError("Sign-in could not be completed. Please try again.");
        }
      } catch (err) {
        console.error("AuthCallback error:", err);
        if (!cancelled) {
          onError(err.message || "Authentication failed. Please try again.");
        }
      } finally {
        if (!cancelled) cleanupUrl();
      }
    }

    handleCallback();
    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
      }}
    >
      <div style={{ textAlign: "center" }}>
        <div style={{ marginBottom: 24 }}>
          <LogoMark size={48} />
        </div>
        <Spinner size={32} />
        <p
          style={{
            marginTop: 16,
            fontSize: 14,
            color: G.muted,
          }}
        >
          {status}
        </p>
      </div>
    </div>
  );
}

/** Fetch user profile from Supabase */
async function fetchProfile(userId) {
  try {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (data) {
      return {
        name: data.name,
        email: data.email,
        biz: data.business_name,
        id: data.id,
      };
    }
  } catch (e) {
    console.error("Profile fetch error:", e);
  }
  return null;
}
