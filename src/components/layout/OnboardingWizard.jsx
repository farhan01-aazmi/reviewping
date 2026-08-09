import { useState } from "react";
import { G } from "../../data/theme";
import { CATEGORY_GROUPS } from "../../data/constants";
import { supabase } from "../../config/supabase";
import { toast } from "sonner";

const STEPS = [
  { id: "business", label: "Business", icon: "🏪" },
  { id: "gbp", label: "Connect Google", icon: "🔗" },
  { id: "qr", label: "QR Code", icon: "📱" },
  { id: "done", label: "Ready", icon: "🎉" },
];

export default function OnboardingWizard({ userId, biz, setBiz, onNav, onClose }) {
  const [step, setStep] = useState(0);
  const [bn, setBn] = useState(biz.bizName || "");
  const [bt, setBt] = useState(biz.bizType || "");
  const [otherCat, setOtherCat] = useState("");
  const [saving, setSaving] = useState(false);

  const canContinue = () => {
    if (step === 0) return bn.trim().length > 0 && (bt !== "" || otherCat.trim().length > 0);
    return true;
  };

  const handleNext = async () => {
    if (step === 0) {
      setSaving(true);
      const finalType = bt === "Other" ? otherCat : bt;
      const { error } = await supabase
        .from("business_settings")
        .upsert({
          user_id: userId,
          business_name: bn,
          biz_type: finalType,
          other_business_type: bt === "Other" ? otherCat : null,
        }, { onConflict: "user_id" });
      if (error) { toast.error("Failed to save"); setSaving(false); return; }
      setBiz((b) => ({ ...b, bizName: bn, bizType: finalType, otherBusinessType: otherCat }));
      setSaving(false);
    }
    if (step === 1) {
      onNav("integrations");
      onClose();
      return;
    }
    if (step === 2) {
      onNav("qrcode");
      onClose();
      return;
    }
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  };

  return (
    <div style={{
      position: "fixed", inset: 0, zIndex: 1000,
      background: "rgba(0,0,0,0.4)", display: "flex",
      alignItems: "center", justifyContent: "center",
      fontFamily: "'Manrope',sans-serif",
    }}>
      <div style={{
        background: "white", borderRadius: 24, padding: 40, maxWidth: 480,
        width: "90%", boxShadow: "0 24px 64px rgba(0,0,0,0.15)",
        animation: "fs 0.3s ease",
      }}>
        <div style={{ display: "flex", gap: 4, marginBottom: 32, justifyContent: "center" }}>
          {STEPS.map((s, i) => (
            <div key={s.id} style={{
              display: "flex", alignItems: "center", gap: 4,
              opacity: i <= step ? 1 : 0.3,
            }}>
              {i > 0 && <div style={{ width: 24, height: 2, background: i <= step ? G.accent : G.border }} />}
              <div style={{
                width: 32, height: 32, borderRadius: "50%",
                background: i <= step ? G.accent : G.border,
                display: "flex", alignItems: "center", justifyContent: "center",
                fontSize: 14, color: "white", fontWeight: 700,
              }}>{s.icon}</div>
            </div>
          ))}
        </div>

        {step === 0 && (
          <>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 4px" }}>
              Welcome to ReviewPing! 🎉
            </h2>
            <p style={{ color: G.muted, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              Let's set up your business in 3 quick steps.
            </p>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.inkSoft, marginBottom: 6 }}>
                Business name <span style={{ color: G.accent }}>*</span>
              </label>
              <input
                value={bn} onChange={(e) => setBn(e.target.value)}
                placeholder="Your Business"
                style={{
                  width: "100%", padding: "10px 14px", fontSize: 14,
                  fontFamily: "Manrope, sans-serif", color: G.ink,
                  background: G.surface, border: `1.5px solid ${G.border}`,
                  borderRadius: 10, outline: "none", boxSizing: "border-box",
                }}
              />
            </div>
            <div style={{ marginBottom: bt === "Other" ? 12 : 24 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.inkSoft, marginBottom: 6 }}>
                Category <span style={{ color: G.accent }}>*</span>
              </label>
              <select
                value={bt} onChange={(e) => setBt(e.target.value)}
                style={{
                  width: "100%", padding: "10px 14px", fontSize: 14,
                  fontFamily: "Manrope, sans-serif", color: G.ink,
                  background: G.surface, border: `1.5px solid ${G.border}`,
                  borderRadius: 10, outline: "none", boxSizing: "border-box",
                  appearance: "none", cursor: "pointer",
                }}
              >
                <option value="" disabled>Select a category</option>
                {CATEGORY_GROUPS.map((group) => (
                  <optgroup key={group.label} label={group.label}>
                    {group.items.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>
            {bt === "Other" && (
              <div style={{ marginBottom: 24 }}>
                <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.inkSoft, marginBottom: 6 }}>
                  Describe your business type
                </label>
                <input
                  value={otherCat} onChange={(e) => setOtherCat(e.target.value)}
                  placeholder="e.g. Photography Studio, Pet Grooming"
                  style={{
                    width: "100%", padding: "10px 14px", fontSize: 14,
                    fontFamily: "Manrope, sans-serif", color: G.ink,
                    background: G.surface, border: `1.5px solid ${G.border}`,
                    borderRadius: 10, outline: "none", boxSizing: "border-box",
                  }}
                />
              </div>
            )}
          </>
        )}

        {step === 1 && (
          <>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 4px" }}>
              Connect Google Business Profile
            </h2>
            <p style={{ color: G.muted, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              Link your GBP to enable QR code reviews, auto-fetch reviews, and the smart review gateway.
            </p>
            <div style={{
              background: G.infoBg, border: `1.5px solid ${G.infoBd}`,
              borderRadius: 12, padding: 16, marginBottom: 24,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: G.ink }}>
                🔑 One-click Google Login
              </div>
              <p style={{ fontSize: 13, color: G.muted, margin: 0, lineHeight: 1.5 }}>
                We'll securely connect your Google Business Profile. Your review link will be used in QR codes so customers can post reviews directly.
              </p>
            </div>
          </>
        )}

        {step === 2 && (
          <>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 4px" }}>
              Generate Your QR Code
            </h2>
            <p style={{ color: G.muted, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6 }}>
              We'll create a unique QR code for your business. Print it on table tents, receipts, and window decals to collect reviews effortlessly.
            </p>
            <div style={{
              background: G.bg, borderRadius: 12, padding: 16, marginBottom: 24,
              border: `1px solid ${G.border}`,
            }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4, color: G.ink }}>
                📋 Placement Tips
              </div>
              <ul style={{ fontSize: 12.5, color: G.muted, margin: 0, paddingLeft: 20, lineHeight: 2 }}>
                <li><strong>Table tents</strong> — place on every table</li>
                <li><strong>Window decals</strong> — attract foot traffic reviewers</li>
                <li><strong>Receipts</strong> — print at the bottom of every receipt</li>
                <li><strong>Business cards</strong> — hand out with every purchase</li>
              </ul>
            </div>
          </>
        )}

        {step === 3 && (
          <>
            <div style={{ fontSize: 64, textAlign: "center", marginBottom: 16 }}>🎉</div>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 4px", textAlign: "center" }}>
              You're all set!
            </h2>
            <p style={{ color: G.muted, fontSize: 14, margin: "0 0 24px", lineHeight: 1.6, textAlign: "center" }}>
              Your business is configured and ready to collect reviews with QR codes.
            </p>
            <div style={{ background: G.successBg, borderRadius: 12, padding: 16, marginBottom: 24, border: `1.5px solid ${G.successBd}` }}>
              <div style={{ fontSize: 13, color: G.ink, lineHeight: 1.6 }}>
                ✅ Business info saved<br />
                ✅ GBP connected (or set up later)<br />
                ✅ QR code ready to generate<br /><br />
                Head to the QR Code page to download and print your QR code.
              </div>
            </div>
          </>
        )}

        <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
          {step < 3 && (
            <button onClick={onClose} style={{
              padding: "12px 20px", background: "none", border: `1.5px solid ${G.border}`,
              borderRadius: 10, fontSize: 14, fontWeight: 600, cursor: "pointer",
              fontFamily: "'Manrope',sans-serif", color: G.muted,
            }}>
              Skip for now
            </button>
          )}
          <button
            onClick={step === 3 ? onClose : handleNext}
            disabled={!canContinue() || saving}
            style={{
              padding: "12px 24px", background: canContinue() && !saving ? G.accent : G.border,
              color: "white", border: "none", borderRadius: 10, fontSize: 14, fontWeight: 700,
              cursor: canContinue() && !saving ? "pointer" : "not-allowed", opacity: saving ? 0.6 : 1,
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            {saving ? "Saving..." : step === 3 ? "Go to Dashboard →" : step === 1 ? "Open Integrations →" : step === 2 ? "Generate QR Code →" : "Next →"}
          </button>
        </div>
      </div>
    </div>
  );
}