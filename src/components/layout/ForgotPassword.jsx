import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Card, Field, Btn, LogoMark } from "../ui";

export default function ForgotPassword({ onBack }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSend = async () => {
    if (!email) {
      setError("Enter your email address");
      return;
    }
    setLoading(true);
    setError("");
    const { error: err } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/callback`,
    });
    if (err) {
      setError(err.message);
      setLoading(false);
      return;
    }
    setSent(true);
    setLoading(false);
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
            {sent ? "Check your email" : "Reset your password"}
          </h1>
          <p style={{ color: G.muted, margin: 0, fontSize: 14 }}>
            {sent
              ? `We sent a reset link to ${email}.`
              : "Enter your email and we'll send a reset link."}
          </p>
        </div>

        {!sent ? (
          <Card>
            <Field
              label="Email address"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@business.com"
              type="email"
              error={error}
            />
            <Btn onClick={handleSend} fullWidth loading={loading}>
              Send reset link →
            </Btn>
          </Card>
        ) : (
          <Card style={{ textAlign: "center", padding: 32 }}>
            <div style={{ fontSize: 40, marginBottom: 16 }}>✉️</div>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                lineHeight: 1.7,
                margin: "0 0 20px",
              }}
            >
              Didn't get it? Check your spam folder or{" "}
              <span
                onClick={() => setSent(false)}
                style={{ color: G.accent, cursor: "pointer" }}
              >
                try again
              </span>
              .
            </p>
            <Btn variant="secondary" onClick={onBack}>
              ← Back to sign in
            </Btn>
          </Card>
        )}

        {!sent && (
          <p style={{ textAlign: "center", marginTop: 16 }}>
            <span
              onClick={onBack}
              style={{ color: G.muted, fontSize: 12.5, cursor: "pointer" }}
            >
              ← Back to sign in
            </span>
          </p>
        )}
      </div>
    </div>
  );
}
