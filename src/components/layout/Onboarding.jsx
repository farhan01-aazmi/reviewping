import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Card, Field, Btn, Wordmark } from "../ui";

const CATEGORIES = [
  "Restaurant",
  "Clinic/Hospital",
  "Salon/Spa",
  "E-commerce",
  "Agency",
  "Other",
];

export default function Onboarding({ user, onComplete }) {
  const [step, setStep] = useState(1);
  const [bn, setBn] = useState(user.biz || "");
  const [bt, setBt] = useState("");
  const [gl, setGl] = useState("");
  const [ph, setPh] = useState(user.phone || "");
  const [web, setWeb] = useState("");
  const [saving, setSaving] = useState(false);

  const steps = [
    { n: 1, l: "Business info" },
    { n: 2, l: "Review link" },
    { n: 3, l: "All set" },
  ];

  const handleComplete = async () => {
    setSaving(true);
    const uid = user?.id;
    if (uid) {
      await Promise.all([
        supabase.from("business_settings").upsert({
          user_id: uid,
          business_name: bn,
          business_category: bt,
          business_phone: ph,
          business_website: web,
          review_link: gl,
        }, { onConflict: "user_id" }),
        supabase.from("profiles").update({
          onboarding_completed: true,
        }).eq("id", uid),
      ]);
    }
    setSaving(false);
    onComplete({ bizName: bn, bizType: bt, googleLink: gl, phone: ph });
  };

  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <div
        style={{
          padding: "16px 22px",
          borderBottom: `1px solid ${G.border}`,
          background: G.surface,
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <Wordmark size={14} />
        <span style={{ fontSize: 12.5, color: G.muted }}>
          Step {step} of 3
        </span>
      </div>

      <div style={{ height: 3, background: G.border }}>
        <div
          style={{
            height: 3,
            background: G.accent,
            width: `${(step / 3) * 100}%`,
            transition: "width 0.4s ease",
          }}
        />
      </div>

      <div
        style={{
          flex: 1,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "32px 22px",
        }}
      >
        <div style={{ width: "100%", maxWidth: 440 }}>
          <div
            style={{
              display: "flex",
              gap: 0,
              marginBottom: 36,
            }}
          >
            {steps.map((s, i) => (
              <div
                key={s.n}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  position: "relative",
                }}
              >
                {i > 0 && (
                  <div
                    style={{
                      position: "absolute",
                      top: 13,
                      right: "50%",
                      width: "100%",
                      height: 2,
                      background: step > i ? G.accent : G.border,
                      zIndex: 0,
                    }}
                  />
                )}
                <div
                  style={{
                    width: 26,
                    height: 26,
                    borderRadius: "50%",
                    background: step >= s.n ? G.accent : G.surface,
                    border: `2px solid ${
                      step >= s.n ? G.accent : G.border
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontSize: 11,
                    fontWeight: 700,
                    color: step >= s.n ? "white" : G.muted,
                    zIndex: 1,
                    position: "relative",
                  }}
                >
                  {step > s.n ? "✓" : s.n}
                </div>
                <div
                  style={{
                    fontSize: 10.5,
                    color: step === s.n ? G.accent : G.muted,
                    marginTop: 5,
                    fontWeight: step === s.n ? 700 : 400,
                    textAlign: "center",
                  }}
                >
                  {s.l}
                </div>
              </div>
            ))}
          </div>

          {/* Step 1: Business info */}
          {step === 1 && (
            <div onKeyDown={(e) => e.key === "Enter" && bn && bt && setStep(2)}>
              <h2
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 28,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  letterSpacing: "-0.5px",
                }}
              >
                Set up your business
              </h2>
              <p
                style={{
                  color: G.muted,
                  marginBottom: 24,
                  fontSize: 14,
                }}
              >
                This appears in your dashboard and messages.
              </p>
              <Field
                label="Business name"
                value={bn}
                onChange={(e) => setBn(e.target.value)}
                placeholder="Mike's Dental Clinic"
              />
              <div style={{ marginBottom: 16 }}>
                <label
                  style={{
                    display: "block",
                    fontSize: 13,
                    fontWeight: 600,
                    color: G.inkSoft,
                    marginBottom: 6,
                  }}
                >
                  Business category
                </label>
                <select
                  value={bt}
                  onChange={(e) => setBt(e.target.value)}
                  style={{
                    width: "100%",
                    padding: "10px 14px",
                    fontSize: 14,
                    fontFamily: "Manrope, sans-serif",
                    color: bt ? G.ink : G.muted,
                    background: G.surface,
                    border: `1.5px solid ${G.border}`,
                    borderRadius: 10,
                    outline: "2px solid transparent",
                    cursor: "pointer",
                    appearance: "none",
                    backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='12' viewBox='0 0 12 12'%3E%3Cpath fill='%239A9186' d='M6 8L1 3h10z'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 12px center",
                    boxSizing: "border-box",
                  }}
                >
                  <option value="" disabled>
                    Select a category
                  </option>
                  {CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
              <Field
                label="Business phone (optional)"
                value={ph}
                onChange={(e) => setPh(e.target.value)}
                placeholder="+1 (555) 000-0000"
              />
              <Field
                label="Website (optional)"
                value={web}
                onChange={(e) => setWeb(e.target.value)}
                placeholder="https://mybusiness.com"
              />
              <Btn
                fullWidth
                size="lg"
                onClick={() => bn && bt && setStep(2)}
                disabled={!bn || !bt}
              >
                Continue →
              </Btn>
            </div>
          )}

          {/* Step 2: Review link */}
          {step === 2 && (
            <div onKeyDown={(e) => e.key === "Enter" && setStep(3)}>
              <h2
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 28,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  letterSpacing: "-0.5px",
                }}
              >
                Add your Google review link
              </h2>
              <p
                style={{
                  color: G.muted,
                  marginBottom: 24,
                  fontSize: 14,
                  lineHeight: 1.7,
                }}
              >
                Customers click this to leave your review.
              </p>
              <Field
                label="Google review link"
                value={gl}
                onChange={(e) => setGl(e.target.value)}
                placeholder="https://g.page/r/..."
                hint="Google Maps → Your Business → Share → Copy review link"
              />
              <div
                style={{
                  padding: "14px 16px",
                  background: G.accentBg,
                  border: `1.5px solid ${G.accentBd}`,
                  borderRadius: 10,
                  marginBottom: 20,
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
                  Don't have it yet?
                </div>
                <p
                  style={{
                    color: G.muted,
                    margin: 0,
                    fontSize: 13,
                    lineHeight: 1.65,
                  }}
                >
                  Skip for now. Add it later from Settings.
                </p>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <Btn variant="secondary" onClick={() => setStep(1)}>
                  ← Back
                </Btn>
                <Btn fullWidth onClick={() => setStep(3)}>
                  Continue →
                </Btn>
              </div>
            </div>
          )}

          {/* Step 3: Success */}
          {step === 3 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 24 }}>
                <div
                  style={{
                    fontSize: 64,
                    marginBottom: 12,
                    animation: "fs 0.6s ease",
                  }}
                >
                  🎉
                </div>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 28,
                    fontWeight: 400,
                    margin: "0 0 6px",
                    letterSpacing: "-0.5px",
                  }}
                >
                  You're all set!
                </h2>
                <p
                  style={{
                    color: G.muted,
                    marginBottom: 24,
                    fontSize: 14,
                    lineHeight: 1.7,
                  }}
                >
                  Your business profile is ready. Start collecting reviews.
                </p>
              </div>
              <Card
                style={{
                  marginBottom: 20,
                  background: G.accentBg,
                  border: `1.5px solid ${G.accentBd}`,
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.muted,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    marginBottom: 10,
                  }}
                >
                  SMS Preview
                </div>
                <p
                  style={{
                    margin: 0,
                    fontSize: 14.5,
                    lineHeight: 1.75,
                    color: G.inkSoft,
                    fontFamily: "'Instrument Serif',serif",
                    fontStyle: "italic",
                  }}
                >
                  "Hi [Customer Name]! Thanks for visiting {bn || "us"} today.
                  A quick Google review would mean the world — 30 seconds:{" "}
                  {gl || "your-link"}
                </p>
              </Card>
              {[
                { t: "AI personalises every message" },
                { t: "Sent instantly via SMS or email" },
                { t: "You're notified when reviews arrive" },
              ].map((i, x) => (
                <div
                  key={x}
                  style={{
                    display: "flex",
                    gap: 10,
                    alignItems: "center",
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      color: G.success,
                      fontWeight: 700,
                      fontSize: 13,
                    }}
                  >
                    ✓
                  </span>
                  <span style={{ fontSize: 13.5, color: G.inkSoft }}>
                    {i.t}
                  </span>
                </div>
              ))}
              <div style={{ display: "flex", gap: 8, marginTop: 20 }}>
                <Btn
                  variant="secondary"
                  onClick={() => setStep(2)}
                  disabled={saving}
                >
                  ← Back
                </Btn>
                <Btn
                  fullWidth
                  size="lg"
                  onClick={handleComplete}
                  loading={saving}
                  disabled={saving}
                >
                  {saving ? "Saving…" : "Go to dashboard →"}
                </Btn>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
