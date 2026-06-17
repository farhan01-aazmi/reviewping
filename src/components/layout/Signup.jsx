import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { validateEmail, validatePassword } from "../../utils/validators";
import { Card, Field, Btn, LogoMark } from "../ui";
import SEO from "../SEO";
import { toast } from "sonner";

export default function Signup({ onDone, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [biz, setBiz] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [checkEmail, setCheckEmail] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);

  const go = async () => {
    if (!name || !email || !password || !biz) {
      setError("All fields required.");
      return;
    }
    const emailErr = validateEmail(email);
    if (emailErr) {
      setError(emailErr);
      return;
    }
    const pwErr = validatePassword(password);
    if (pwErr) {
      setError(pwErr);
      return;
    }

    setLoading(true);
    setError("");

    const { data, error: authErr } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authErr) {
      setError(authErr.message);
      setLoading(false);
      return;
    }

    if (!data?.session) {
      setCheckEmail(true);
      setLoading(false);
      return;
    }

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      name,
      business_name: biz,
      plan: "free",
    });

    if (profileErr) {
      console.error("Profile insert error:", profileErr);
    }

    setLoading(false);
    onDone({ name, email, biz, id: data.user.id });
  };

  const handleResend = async () => {
    setResendLoading(true);
    try {
      const { error: err } = await supabase.auth.resend({
        type: "signup",
        email,
      });
      if (err) {
        toast.error(err.message);
        setResendLoading(false);
        return;
      }
      toast.success("Verification email resent!");
    } catch (e) {
      toast.error(e.message || "Failed to resend");
    }
    setResendLoading(false);
  };

  const doGoogle = async () => {
    setGoogleLoading(true);
    setError("");
    try {
      const redirectTo = window.location.origin;
      const { data, error: oauthErr } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: { redirectTo },
      });
      if (oauthErr) {
        setError(oauthErr.message.includes("not supported") ? "Google sign-up is not configured. Please use email & password." : oauthErr.message);
        setGoogleLoading(false);
        return;
      }
      if (data?.url) {
        window.location.href = data.url;
      }
    } catch (e) {
      setError("Failed to start Google sign-up. Check your Supabase Auth configuration.");
      setGoogleLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) go();
  };

  return (
    <>
      <SEO title="Create your account" description="Start your 14-day free trial. No credit card needed." path="/signup" />
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
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
            <LogoMark size={68} />
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
            Create your account
          </h1>
          <p style={{ color: G.muted, margin: 0, fontSize: 14 }}>
            14-day free trial. No card needed.
          </p>
        </div>

        <Card onKeyDown={handleKeyDown}>
          {/* Google OAuth */}
          <button
            onClick={doGoogle}
            disabled={googleLoading}
            aria-label="Sign up with Google"
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
            <svg width="18" height="18" viewBox="0 0 18 18" style={{ flexShrink: 0 }}>
              <path fill="#4285F4" d="M17.64 9.2c0-.637-.057-1.251-.164-1.84H9v3.481h4.844c-.209 1.125-.843 2.078-1.796 2.717v2.258h2.908c1.702-1.567 2.684-3.875 2.684-6.615z"/>
              <path fill="#34A853" d="M9 18c2.43 0 4.467-.806 5.956-2.184l-2.908-2.258c-.806.54-1.837.86-3.048.86-2.344 0-4.328-1.584-5.036-3.711H.957v2.332C2.438 15.983 5.482 18 9 18z"/>
              <path fill="#FBBC05" d="M3.964 10.707c-.18-.54-.282-1.117-.282-1.707s.102-1.167.282-1.707V4.961H.957C.347 6.175 0 7.55 0 9s.348 2.825.957 4.039l3.007-2.332z"/>
              <path fill="#EA4335" d="M9 3.58c1.321 0 2.508.454 3.44 1.345l2.582-2.58C13.463.891 11.426 0 9 0 5.482 0 2.438 2.017.957 4.961L3.964 7.293C4.672 5.163 6.656 3.58 9 3.58z"/>
            </svg>
            {googleLoading ? "Redirecting…" : "Sign up with Google"}
          </button>

          {/* Divider */}
          <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
            <div style={{ flex: 1, height: 1, background: G.border }} />
            <span style={{ fontSize: 11.5, color: G.muted }}>or</span>
            <div style={{ flex: 1, height: 1, background: G.border }} />
          </div>

          {checkEmail ? (
            <div style={{ textAlign: "center", padding: "8px 0" }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>✉️</div>
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 20,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  color: G.ink,
                }}
              >
                Check your email
              </h3>
              <p
                style={{
                  fontSize: 13.5,
                  color: G.muted,
                  margin: "0 0 20px",
                  lineHeight: 1.6,
                }}
              >
                We sent a confirmation link to <strong>{email}</strong>. Click the link to activate your account.
              </p>
              <Btn
                onClick={handleResend}
                fullWidth
                loading={resendLoading}
                variant="secondary"
                size="sm"
                style={{ marginBottom: 12 }}
              >
                Resend verification email
              </Btn>
              <p style={{ fontSize: 12, color: G.muted, margin: 0 }}>
                Didn't get it? Check your spam folder.
              </p>
            </div>
          ) : (
            <>
              <Field
                label="Full name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Mike Reynolds"
              />
              <Field
                label="Business name"
                value={biz}
                onChange={(e) => setBiz(e.target.value)}
                placeholder="Mike's Dental Clinic"
              />
              <Field
                label="Email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="mike@mydental.com"
                type="email"
              />
              <Field
                label="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
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

              <Btn onClick={go} fullWidth size="lg" loading={loading} disabled={loading}>
                Create account →
              </Btn>

              <div
                style={{
                  textAlign: "center",
                  marginTop: 14,
                  fontSize: 12,
                  color: G.muted,
                }}
              >
                By signing up you agree to our{" "}
                <span
                  style={{ color: G.accent, cursor: "pointer" }}
                  onClick={() => window.history.pushState({}, "", "/terms") && window.dispatchEvent(new PopStateEvent("popstate"))}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/terms"), window.dispatchEvent(new PopStateEvent("popstate")))}
                >
                  Terms
                </span> &{" "}
                <span
                  style={{ color: G.accent, cursor: "pointer" }}
                  onClick={() => window.history.pushState({}, "", "/privacy") && window.dispatchEvent(new PopStateEvent("popstate"))}
                  role="link"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/privacy"), window.dispatchEvent(new PopStateEvent("popstate")))}
                >
                  Privacy Policy
                </span>
              </div>
            </>
          )}
        </Card>

        <p
          style={{
            textAlign: "center",
            color: G.muted,
            fontSize: 13,
            marginTop: 16,
          }}
        >
          Have an account?{" "}
          <span
            onClick={onLogin}
            onKeyDown={(e) => e.key === "Enter" && onLogin()}
            role="link"
            tabIndex={0}
            style={{ color: G.accent, cursor: "pointer", fontWeight: 700 }}
          >
            Sign in →
          </span>
        </p>
      </div>
    </div>
    </>
  );
}
