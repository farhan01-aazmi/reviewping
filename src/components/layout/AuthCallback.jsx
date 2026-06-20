import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { LogoMark, Spinner, Btn, Field } from "../ui";

/**
 * AuthCallback — handles OAuth redirect and password reset callbacks.
 *
 * The component detects three scenarios:
 * 1. OAuth login (PKCE or implicit) — exchanges tokens and calls onDone
 * 2. Password recovery (type=recovery) — shows a new-password form
 * 3. Already signed in — calls onDone immediately
 *
 * Props:
 *   - onDone(user): called on successful OAuth auth
 *   - onError(msg): called on auth failure (not recovery)
 */
export default function AuthCallback({ onDone, onError }) {
  const [status, setStatus] = useState("Processing…");
  const [mode, setMode] = useState("loading"); // "loading" | "reset" | "done" | "error"

  // Reset-password form state
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [resetError, setResetError] = useState("");
  const [resetLoading, setResetLoading] = useState(false);

  useEffect(() => {
    let cancelled = false;

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

        // — Password recovery flow (type=recovery in hash) —
        if (hash.includes("type=recovery")) {
          setStatus("Verifying recovery link…");
          // Let Supabase set the session from the hash tokens
          const { data, error } = await supabase.auth.getSession();
          if (error) throw error;
          if (data?.session?.user) {
            setMode("reset");
            setStatus("");
            return;
          }
          // If no session yet, try setting it via the URL hash
          const { data: userData, error: userError } = await supabase.auth.getUser();
          if (userError) {
            // Try exchanging manually
            const params = new URLSearchParams(hash.replace("#", "?"));
            const accessToken = params.get("access_token");
            const refreshToken = params.get("refresh_token");
            if (accessToken) {
              const { data: setData, error: setError } = await supabase.auth.setSession({
                access_token: accessToken,
                refresh_token: refreshToken || "",
              });
              if (setError) throw setError;
              if (setData?.session?.user) {
                setMode("reset");
                setStatus("");
                return;
              }
            }
            throw new Error("Could not verify recovery link");
          }
          if (userData?.user) {
            setMode("reset");
            setStatus("");
            return;
          }
          throw new Error("Invalid recovery link");
        }

        // — OAuth PKCE flow (code= in query) —
        if (query.includes("code=")) {
          setStatus("Completing sign in…");
          const { data, error } = await supabase.auth.exchangeCodeForSession(
            new URLSearchParams(query).get("code")
          );
          if (error) throw error;
          if (data?.session?.user) {
            finish(data.session.user, await fetchProfile(data.session.user.id));
            cleanupUrl();
            return;
          }
        }

        // — Implicit flow (hash with access_token) —
        if (hash.includes("access_token=") && !hash.includes("type=recovery")) {
          setStatus("Verifying session…");
          await new Promise((r) => setTimeout(r, 1500));
          const { data: { session } } = await supabase.auth.getSession();
          if (session?.user) {
            finish(session.user, await fetchProfile(session.user.id));
            cleanupUrl();
            return;
          }
        }

        // — Already signed in —
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          finish(session.user, await fetchProfile(session.user.id));
          cleanupUrl();
          return;
        }

        // — Nothing worked —
        if (!cancelled) {
          onError("Sign-in could not be completed. Please try again.");
        }
      } catch (err) {
        console.error("AuthCallback error:", err);
        if (!cancelled) {
          // If we haven't switched to reset mode, report error
          if (mode === "loading") {
            onError(err.message || "Authentication failed.");
          }
        }
      }
    }

    handleCallback();
    return () => { cancelled = true; };
  }, []);

  /** Submit new password */
  const handleResetPassword = async () => {
    if (!password || password.length < 6) {
      setResetError("Password must be at least 6 characters");
      return;
    }
    if (password !== confirm) {
      setResetError("Passwords do not match");
      return;
    }
    setResetLoading(true);
    setResetError("");
    const { error } = await supabase.auth.updateUser({ password });
    setResetLoading(false);
    if (error) {
      setResetError(error.message);
      return;
    }
    setMode("done");
  };

  // — Render: Loading —
  if (mode === "loading") {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", color: G.ink }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ marginBottom: 24 }}><LogoMark size={64} /></div>
          <Spinner size={32} />
          <p style={{ marginTop: 16, fontSize: 14, color: G.muted }}>{status}</p>
        </div>
      </div>
    );
  }

  // — Render: New password form —
  if (mode === "reset") {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", color: G.ink, padding: 24 }}>
        <div style={{ width: "100%", maxWidth: 400 }}>
          <div style={{ textAlign: "center", marginBottom: 28 }}>
            <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}><LogoMark size={68} /></div>
            <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400, margin: "0 0 6px", letterSpacing: "-0.5px" }}>
              Set new password
            </h1>
            <p style={{ color: G.muted, margin: 0, fontSize: 14 }}>
              Choose a strong password for your account.
            </p>
          </div>
          <div style={{ background: G.cardBg, border: `1px solid ${G.border}`, borderRadius: 16, padding: 24 }}>
            <Field label="New password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="At least 6 characters" type="password" />
            <div style={{ height: 16 }} />
            <Field label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder="Repeat your password" type="password" error={resetError} />
            <div style={{ height: 20 }} />
            <Btn onClick={handleResetPassword} fullWidth loading={resetLoading}>Update password →</Btn>
          </div>
        </div>
      </div>
    );
  }

  // — Render: Success —
  if (mode === "done") {
    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", color: G.ink, padding: 24 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✓</div>
          <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400, margin: "0 0 8px" }}>
            Password updated
          </h1>
          <p style={{ color: G.muted, fontSize: 14, margin: "0 0 24px" }}>
            You can now sign in with your new password.
          </p>
          <button onClick={() => window.location.href = "/"} style={{ background: G.accent, color: "white", border: "none", padding: "12px 24px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>
            Sign in →
          </button>
        </div>
      </div>
    );
  }

  return null;
}

/** Fetch user profile — creates a default one if none exists */
async function fetchProfile(userId) {
  try {
    const { data } = await supabase.from("profiles").select("*").eq("id", userId).single();
    if (data) return { name: data.name, email: data.email, biz: data.business_name, id: data.id };
    // No profile yet — upsert one with free plan
    await supabase.from("profiles").upsert({
      id: userId,
      email: "",
      name: "",
      business_name: "",
      plan: "free",
    });
    return { name: "", email: "", biz: "", id: userId };
  } catch (e) { console.error("Profile fetch error:", e); }
  return null;
}

function cleanupUrl() {
  window.history.replaceState({}, "", "/");
}
