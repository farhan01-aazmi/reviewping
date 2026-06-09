import { useState } from "react";
import { G } from "../../data/theme";

const DIRECT_API = import.meta.env.VITE_API_URL || "";
const PROXY_API = window.location.origin + "/api/edge";
const GENRES = ["Barber", "Dentist", "Restaurant", "Auto Service", "Salon", "Medical", "Fitness", "Other"];

/** Call an edge function — first tries direct, falls back to same-origin proxy (bypasses ad blockers) */
async function callEdgeFn(path, body, token) {
  const directUrl = `${DIRECT_API}${path}`;
  const proxyUrl = `${PROXY_API}${path}`;
  const opts = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
    body: JSON.stringify(body),
  };

  try {
    const res = await fetch(directUrl, opts);
    return res;
  } catch (err) {
    console.warn("Direct edge function call failed, trying proxy:", err.message);
    const res = await fetch(proxyUrl, opts);
    return res;
  }
}

export default function AIEmailWriter({ onClose, onSave, user }) {
  const [step, setStep] = useState("form"); // form | preview | saving
  const [businessType, setBusinessType] = useState("");
  const [businessName, setBusinessName] = useState(user?.biz || "");
  const [customerName, setCustomerName] = useState("");
  const [specialNotes, setSpecialNotes] = useState("");
  const [tone, setTone] = useState("friendly");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [templateName, setTemplateName] = useState("");
  const [editedSubject, setEditedSubject] = useState("");
  const [editedBody, setEditedBody] = useState("");

  const handleGenerate = async () => {
    if (!businessType) {
      setError("Please select or enter a business type");
      return;
    }
    setLoading(true);
    setError("");

    try {
      const session = await import("../../config/supabase").then(m => m.supabase.auth.getSession());
      const token = session?.data?.session?.access_token;

      const res = await callEdgeFn("/ai-generate-email", {
        customer_name: customerName || undefined,
        business_type: businessType,
        business_name: businessName || undefined,
        special_notes: specialNotes || undefined,
        tone,
      }, token);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Generation failed" }));
        throw new Error(err.error || "Failed to generate");
      }

      const data = await res.json();
      setResult(data);
      setEditedSubject(data.subject);
      setEditedBody(data.body);
      setStep("preview");
    } catch (err) {
      setError(err.message || "Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!templateName.trim()) return;
    setStep("saving");

    try {
      const { supabase } = await import("../../config/supabase");
      const { error: saveErr } = await supabase.from("ai_email_templates").insert({
        name: templateName.trim(),
        subject: editedSubject,
        body: editedBody,
        tone,
        business_type: businessType,
        input_params: { customer_name: customerName, special_notes: specialNotes },
        usage_tokens: result?.usage?.total_tokens || 0,
      });

      if (saveErr) throw saveErr;

      if (onSave) {
        onSave({
          name: templateName.trim(),
          subject: editedSubject,
          body: editedBody,
        });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Failed to save template");
      setStep("preview");
    }
  };

  const handleUseInSendReq = () => {
    if (onSave) {
      onSave({
        name: templateName.trim() || "AI Generated",
        subject: editedSubject,
        body: editedBody,
        useNow: true,
      });
    }
    onClose();
  };

  // ──── FORM STEP ────
  if (step === "form") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.4)", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: "'Manrope',sans-serif",
      }}>
        <div style={{
          background: G.bg, borderRadius: 16, maxWidth: 480, width: "100%",
          padding: 28, maxHeight: "90vh", overflow: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
            <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif',serif", color: G.ink, margin: 0, fontWeight: 400 }}>
              ✨ AI Email Writer
            </h2>
            <button onClick={onClose} style={{
              background: "none", border: "none", fontSize: 20, cursor: "pointer",
              color: G.muted, padding: 4, lineHeight: 1,
            }}>✕</button>
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", color: "#991B1B", fontSize: 13, padding: "10px 14px",
              borderRadius: 8, marginBottom: 16, border: "1px solid #FECACA",
            }}>
              {error}
            </div>
          )}

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.ink, marginBottom: 6 }}>
              Business Type <span style={{ color: G.accent }}>*</span>
            </label>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: 8 }}>
              {GENRES.filter(g => g !== "Other").map(g => (
                <button
                  key={g}
                  onClick={() => setBusinessType(g)}
                  style={{
                    padding: "6px 14px", borderRadius: 20, border: `1.5px solid ${businessType === g ? G.accent : G.border}`,
                    background: businessType === g ? G.accentBg : "transparent",
                    color: businessType === g ? G.accent : G.muted,
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  {g}
                </button>
              ))}
            </div>
            <input
              type="text"
              placeholder="Or type your own..."
              value={businessType}
              onChange={(e) => setBusinessType(e.target.value)}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, outline: "none",
                fontFamily: "'Manrope',sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.ink, marginBottom: 6 }}>
              Business Name
            </label>
            <input
              type="text"
              value={businessName}
              onChange={(e) => setBusinessName(e.target.value)}
              placeholder="Your business name"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, outline: "none",
                fontFamily: "'Manrope',sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.ink, marginBottom: 6 }}>
              Customer Name <span style={{ color: G.mutedLo, fontWeight: 400 }}>(optional)</span>
            </label>
            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              placeholder="e.g. John"
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, outline: "none",
                fontFamily: "'Manrope',sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.ink, marginBottom: 6 }}>
              Special Notes <span style={{ color: G.mutedLo, fontWeight: 400 }}>(optional)</span>
            </label>
            <textarea
              value={specialNotes}
              onChange={(e) => setSpecialNotes(e.target.value)}
              placeholder="e.g. They had a root canal procedure today"
              rows={3}
              style={{
                width: "100%", padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, outline: "none", resize: "vertical",
                fontFamily: "'Manrope',sans-serif",
                boxSizing: "border-box",
              }}
            />
          </div>

          <div style={{ marginBottom: 24 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.ink, marginBottom: 6 }}>
              Tone
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              {[
                { value: "friendly", label: "😊 Friendly" },
                { value: "professional", label: "💼 Professional" },
                { value: "warm", label: "🤗 Warm" },
              ].map(t => (
                <button
                  key={t.value}
                  onClick={() => setTone(t.value)}
                  style={{
                    flex: 1, padding: "8px 12px", borderRadius: 10,
                    border: `1.5px solid ${tone === t.value ? G.accent : G.border}`,
                    background: tone === t.value ? G.accentBg : "transparent",
                    color: tone === t.value ? G.accent : G.muted,
                    fontSize: 12.5, fontWeight: 600, cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                  }}
                >
                  {t.label}
                </button>
              ))}
            </div>
          </div>

          <button
            onClick={handleGenerate}
            disabled={loading}
            style={{
              width: "100%", padding: "12px", borderRadius: 10, border: "none",
              background: loading ? G.border : G.accent, color: loading ? G.muted : "white",
              fontSize: 14, fontWeight: 700, cursor: loading ? "not-allowed" : "pointer",
              fontFamily: "'Manrope',sans-serif",
              display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: 16, height: 16, border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "white", borderRadius: "50%",
                  animation: "spin 0.8s linear infinite", display: "inline-block",
                }} />
                Generating...
              </>
            ) : "Generate Email ✨"}
          </button>
        </div>
      </div>
    );
  }

  // ──── PREVIEW STEP ────
  if (step === "preview") {
    return (
      <div style={{
        position: "fixed", inset: 0, zIndex: 9999,
        background: "rgba(0,0,0,0.4)", display: "flex",
        alignItems: "center", justifyContent: "center",
        padding: 16, fontFamily: "'Manrope',sans-serif",
      }}>
        <div style={{
          background: G.bg, borderRadius: 16, maxWidth: 520, width: "100%",
          padding: 28, maxHeight: "90vh", overflow: "auto",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ fontSize: 18, fontFamily: "'Instrument Serif',serif", color: G.ink, margin: 0, fontWeight: 400 }}>
              ✨ Preview Email
            </h2>
            <button onClick={onClose} style={{
              background: "none", border: "none", fontSize: 20, cursor: "pointer",
              color: G.muted, padding: 4, lineHeight: 1,
            }}>✕</button>
          </div>

          <div style={{
            background: G.surface, borderRadius: 12, border: `1px solid ${G.border}`,
            padding: 20, marginBottom: 16,
          }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 4, display: "block" }}>
              Subject
            </label>
            <input
              type="text"
              value={editedSubject}
              onChange={(e) => setEditedSubject(e.target.value)}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, fontWeight: 600,
                outline: "none", fontFamily: "'Manrope',sans-serif",
                boxSizing: "border-box", marginBottom: 12,
              }}
            />

            <label style={{ fontSize: 12, fontWeight: 600, color: G.muted, marginBottom: 4, display: "block" }}>
              Body
            </label>
            <textarea
              value={editedBody}
              onChange={(e) => setEditedBody(e.target.value)}
              rows={10}
              style={{
                width: "100%", padding: "8px 12px", borderRadius: 8, border: `1px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, outline: "none", resize: "vertical",
                fontFamily: "'Manrope',sans-serif", lineHeight: 1.6,
                boxSizing: "border-box",
              }}
            />

            <p style={{ fontSize: 11, color: G.mutedLo, marginTop: 8, marginBottom: 0 }}>
              💡 Use <code style={{ background: G.accentBg, padding: "1px 4px", borderRadius: 4, fontSize: 11 }}>[Customer Name]</code>,{" "}
              <code style={{ background: G.accentBg, padding: "1px 4px", borderRadius: 4, fontSize: 11 }}>[Business Name]</code>, and{" "}
              <code style={{ background: G.accentBg, padding: "1px 4px", borderRadius: 4, fontSize: 11 }}>[LINK]</code>{" "}
              as placeholders.
            </p>
          </div>

          {error && (
            <div style={{
              background: "#FEF2F2", color: "#991B1B", fontSize: 13, padding: "10px 14px",
              borderRadius: 8, marginBottom: 16, border: "1px solid #FECACA",
            }}>
              {error}
            </div>
          )}

          {/* Save as template */}
          <div style={{ marginBottom: 16 }}>
            <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.ink, marginBottom: 6 }}>
              Save as template
            </label>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                type="text"
                value={templateName}
                onChange={(e) => setTemplateName(e.target.value)}
                placeholder="Template name (e.g. Dental follow-up)"
                style={{
                  flex: 1, padding: "10px 14px", borderRadius: 10, border: `1.5px solid ${G.border}`,
                  background: G.surface, color: G.ink, fontSize: 13, outline: "none",
                  fontFamily: "'Manrope',sans-serif",
                }}
              />
              <button
                onClick={handleSave}
                disabled={!templateName.trim() || step === "saving"}
                style={{
                  padding: "10px 20px", borderRadius: 10, border: "none",
                  background: templateName.trim() ? G.accent : G.border,
                  color: templateName.trim() ? "white" : G.muted,
                  fontSize: 13, fontWeight: 700, cursor: templateName.trim() ? "pointer" : "not-allowed",
                  fontFamily: "'Manrope',sans-serif", whiteSpace: "nowrap",
                }}
              >
                {step === "saving" ? "Saving..." : "Save"}
              </button>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setStep("form")}
              style={{
                flex: 1, padding: "12px", borderRadius: 10, border: `1.5px solid ${G.border}`,
                background: G.surface, color: G.ink, fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Manrope',sans-serif",
              }}
            >
              ← Regenerate
            </button>
            <button
              onClick={handleUseInSendReq}
              style={{
                flex: 1, padding: "12px", borderRadius: 10, border: "none",
                background: G.accent, color: "white", fontSize: 13, fontWeight: 700,
                cursor: "pointer", fontFamily: "'Manrope',sans-serif",
              }}
            >
              Use in Send Request →
            </button>
          </div>

          {result?.usage && (
            <p style={{ fontSize: 11, color: G.mutedLo, marginTop: 12, textAlign: "center" }}>
              Used ~{result.usage.total_tokens} tokens
            </p>
          )}
        </div>
      </div>
    );
  }

  return null;
}
