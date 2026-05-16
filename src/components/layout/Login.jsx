import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Card, Field, Btn, LogoMark } from "../ui";

export default function Login({ onDone, onSignup, onBack, onForgot }) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);

  const doLogin = async () => {
    if (!email || !password) {
      setError("All fields required.");
      return;
    }
    if (!/@/.test(email)) {
      setError("Invalid email format.");
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", data.user.id)
      .single();

    setLoading(false);
    onDone({
      name: profile?.name || email,
      email,
      biz: profile?.business_name || "",
      id: data.user.id,
    });
  };

  const doGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const { error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
      });
      if (oauthErr) {
        setError(oauthErr.message);
        setGoogleLoading(false);
      }
      // Don't set loading false here — OAuth redirects away
    } catch (e) {
      setError("Failed to start Google sign-in.");
      setGoogleLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) doLogin();
  };

  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 24,
      }}
    >
      <div style={{ width: "100%", maxWidth: 400 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              marginBottom: 16,
            }}
          >
            <LogoMark size={52} />
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 28,
              fontWeight: 400,
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
            }}
          >
            Welcome back
          </h1>
          <p style={{ color: G.muted, margin: 0, fontSize: 14 }}>
            Sign in to ReviewPing
          </p>
        </div>

        <Card onKeyDown={handleKeyDown}>
          {/* Google OAuth */}
          <button
            onClick={doGoogle}
            disabled={googleLoading}
            aria-label="Continue with Google"
            style={{
              width: "100%",
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 8,
              padding: "12px",
              fontSize: 14,
              fontWeight: 600,
              cursor: googleLoading ? "not-allowed" : "pointer",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 10,
              marginBottom: 18,
              fontFamily: "'Manrope',sans-serif",
              color: G.inkSoft,
              opacity: googleLoading ? 0.6 : 1,
            }}
          >
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              style={{ flexShrink: 0 }}
            >
              <path
                fill="#4285F4"
                d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"
              />
              <path
                fill="#34A853"
                d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"
              />
              <path
                fill="#FBBC05"
                d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"
              />
              <path
                fill="#EA4335"
                d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"
              />
            </svg>
            {googleLoading ? "Redirecting…" : "Continue with Google"}
          </button>

          {/* Divider */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 18,
            }}
          >
            <div style={{ flex: 1, height: 1, background: G.border }} />
            <span style={{ fontSize: 11.5, color: G.muted }}>or</span>
            <div style={{ flex: 1, height: 1, background: G.border }} />
          </div>

          <Field
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@business.com"
            type="email"
          />
          <Field
            label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="••••••••"
            type="password"
          />

          {error && (
            <p
              role="alert"
              style={{
                color: G.accent,
                fontSize: 12.5,
                marginBottom: 12,
                marginTop: -8,
              }}
            >
              {error}
            </p>
          )}

          <div
            style={{
              textAlign: "right",
              marginTop: -10,
              marginBottom: 16,
            }}
          >
            <span
              onClick={onForgot}
              style={{ fontSize: 12.5, color: G.accent, cursor: "pointer" }}
            >
              Forgot password?
            </span>
          </div>

          <Btn onClick={doLogin} fullWidth loading={loading} disabled={loading}>
            Sign in →
          </Btn>
        </Card>

        <p
          style={{
            textAlign: "center",
            color: G.muted,
            fontSize: 13,
            marginTop: 16,
          }}
        >
          No account?{" "}
          <span
            onClick={onSignup}
            style={{ color: G.accent, cursor: "pointer", fontWeight: 700 }}
          >
            Start free trial →
          </span>
        </p>

        <p style={{ textAlign: "center", marginTop: 6 }}>
          <span
            onClick={onBack}
            style={{ color: G.muted, fontSize: 12.5, cursor: "pointer" }}
          >
            ← Back to homepage
          </span>
        </p>
      </div>
    </div>
  );
}
