import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { validateEmail, validatePassword } from "../../utils/validators";
import { Card, Field, Btn, LogoMark } from "../ui";

export default function Signup({ onDone, onLogin }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [biz, setBiz] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

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

    if (!data?.user) {
      setError("Please check your email for confirmation link.");
      setLoading(false);
      return;
    }

    const { error: profileErr } = await supabase.from("profiles").insert({
      id: data.user.id,
      email,
      name,
      business_name: biz,
      plan: "growth",
    });

    if (profileErr) {
      console.error("Profile insert error:", profileErr);
    }

    setLoading(false);
    onDone({ name, email, biz, id: data.user.id });
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) go();
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
      <div style={{ width: "100%", maxWidth: 420 }}>
        <div style={{ textAlign: "center", marginBottom: 28 }}>
          <div style={{ display: "flex", justifyContent: "center", marginBottom: 16 }}>
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
            Create your account
          </h1>
          <p style={{ color: G.muted, margin: 0, fontSize: 14 }}>
            14-day free trial. No card needed.
          </p>
        </div>

        <Card onKeyDown={handleKeyDown}>
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
            <span style={{ color: G.accent, cursor: "pointer" }}>Terms</span> &{" "}
            <span style={{ color: G.accent, cursor: "pointer" }}>
              Privacy Policy
            </span>
          </div>
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
            style={{ color: G.accent, cursor: "pointer", fontWeight: 700 }}
          >
            Sign in →
          </span>
        </p>
      </div>
    </div>
  );
}
