import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Card, Field, Sel } from "../ui";
import { toast } from "sonner";
import { generateGatewayLink, createSubscription } from "../../api";
import { getDailyLimit } from "../../data/constants";
import { getLanguages } from "../../data/i18n";
import PricingModal from "../ui/PricingModal";

const DIRECT_API = import.meta.env.VITE_API_URL || "";
const PROXY_API = window.location.origin + "/api/edge";
const VITE_SITE_URL = import.meta.env.VITE_SITE_URL || "https://reviewping-eight.vercel.app";

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
    // Try direct Supabase URL first (faster, no proxy hop)
    const res = await fetch(directUrl, opts);
    return res;
  } catch (err) {
    // Network error (ad-blocker / firewall) — fall back to Vercel proxy
    console.warn("Direct edge function call failed, trying proxy:", err.message);
    const res = await fetch(proxyUrl, opts);
    return res;
  }
}

export default function SendReq({ onBack, onSent, biz, userId, plan }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("email");
  const [lang, setLang] = useState("en");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  // AI-generated message state
  const [subject, setSubject] = useState("");
  const [messageBody, setMessageBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [showPricing, setShowPricing] = useState(false);

  // Fallback review link (gateway link is generated per-request below)
  const reviewLink = biz.googleLink || biz.gbp_url || `${VITE_SITE_URL}/r/review`;

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Customer name is required";
    if (channel === "email" && !email.trim()) e.email = "Email is required";
    if ((channel === "sms" || channel === "whatsapp") && !phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  // ── AI Generate ──
  const handleAiGenerate = async () => {
    if (!name.trim()) {
      toast.error("Enter customer name first");
      return;
    }
    setAiLoading(true);
    try {
      const session = await supabase.auth.getSession();
      const token = session?.data?.session?.access_token;

      const res = await callEdgeFn("/ai-generate-email", {
        customer_name: name.trim(),
        business_type: biz.bizType || "general",
        business_name: biz.bizName || "",
        tone: "friendly",
      }, token);

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: "Failed" }));
        throw new Error(err.error || "AI generation failed");
      }

      const data = await res.json();
      if (data.subject) setSubject(data.subject);
      if (data.body) setMessageBody(data.body);
      toast.success("AI email generated!");
    } catch (err) {
      toast.error(err.message || "Failed to generate. Try again.");
    } finally {
      setAiLoading(false);
    }
  };

  // ── Send ──
  const send = async () => {
    if (!validate()) return;

    // ── Daily limit check ──
    const limit = getDailyLimit(plan);
    const todayStart = new Date().toISOString().slice(0, 10);
    const { count, error: countError } = await supabase
      .from("review_requests")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId)
      .gte("created_at", todayStart)
      .lt("created_at", todayStart + "T23:59:59.999Z");
    if (!countError && count !== null && count >= limit) {
      setLoading(false);
      setShowPricing(true);
      return;
    }

    // Use AI-generated message or fallback to default
    const finalSubject = subject.trim() || `How was your experience at ${biz.bizName || "My Business"}?`;
    const finalBody = messageBody.trim() ||
      `Hi ${name.trim()}! Thank you for choosing ${biz.bizName || "My Business"}. We'd love to hear about your experience.\n\nLeave a review here: [LINK]\n\nTakes less than 60 seconds.`;

    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const { data: reqData, error: reqError } = await supabase.from("review_requests").insert({
        user_id: userId,
        customer_name: name.trim(),
        customer_email: email.trim() || null,
        customer_phone: phone.trim() || null,
        channel,
        status: "pending",
        sent_at: new Date().toISOString(),
      }).select("id").single();

      if (reqError) {
        toast.error(reqError.message);
        setLoading(false);
        return;
      }

      const requestId = reqData?.id;

      // Generate gateway link for this request
      let gatewayUrl = reviewLink;
      if (requestId) {
        try {
          const gateway = await generateGatewayLink({
            request_id: requestId,
            customer_name: name.trim(),
            customer_email: email.trim() || null,
            customer_phone: phone.trim() || null,
          });
          if (gateway?.url) {
            gatewayUrl = gateway.url;
          }
        } catch (e) {
          console.warn("Gateway link generation failed, using direct link:", e.message);
        }

        supabase.from("review_requests").update({ review_link: gatewayUrl }).eq("id", requestId).then().catch(() => {});
      }

      // Replace [LINK] placeholder with gateway URL
      const msgWithLink = finalBody.replace(/\[LINK\]/g, gatewayUrl);

      try {
        const channelBody = channel === "email" ? { to: email.trim(), subject: finalSubject, message: msgWithLink }
          : channel === "sms" ? { to: phone.trim(), message: msgWithLink }
          : { to: phone.trim(), message: msgWithLink, customer_name: name.trim(), review_link: reviewLink };

        const res = await callEdgeFn(`/send-${channel}`, channelBody, token);
        if (!res.ok) {
          const err = await res.json().catch(() => ({ error: res.statusText }));
          throw new Error(err.error || `Failed to send ${channel}`);
        }
      } catch (e) {
        toast.error("Failed to send: " + (e.message || "Service unavailable"));
        setLoading(false);
        return;
      }

      setDone(true);
      onSent({ name: name.trim(), service: "", channel, sentAt: Date.now() });
    } catch (e) {
      toast.error("Failed to send: " + e.message);
      setLoading(false);
    }
  };

  if (done) {
    return (
      <div style={{ textAlign: "center", padding: "52px 0" }}>
        <div style={{
          width: 64, height: 64, borderRadius: "50%", background: G.successBg,
          border: `2px solid ${G.successBd}`, display: "flex",
          alignItems: "center", justifyContent: "center", fontSize: 26,
          margin: "0 auto 20px",
        }}>✓</div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 28, fontWeight: 400, margin: "0 0 8px", letterSpacing: "-0.5px" }}>
          Request sent.
        </h2>
        <p style={{ color: G.muted, marginBottom: 28, fontSize: 14, lineHeight: 1.7 }}>
          {channel === "email" ? `Your email was sent to ${name}.` : channel === "whatsapp" ? `Your WhatsApp was sent to ${name}.` : `Your SMS was sent to ${name}.`}
          <br />You'll be notified when they leave a review.
        </p>
        <Btn onClick={onBack} variant="secondary">← Back to dashboard</Btn>
      </div>
    );
  }

  return (
    <div>
      <button onClick={onBack} style={{
        background: "none", border: "none", color: G.muted, cursor: "pointer",
        marginBottom: 20, display: "flex", alignItems: "center", gap: 6,
        fontSize: 13, padding: 0, fontFamily: "'Manrope',sans-serif",
      }}>
        ← Back
      </button>

      <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
        Send review request
      </h2>
      <p style={{ color: G.muted, fontSize: 13.5, marginBottom: 22 }}>
        Send a review request via email, SMS, or WhatsApp.
      </p>

      {/* ── CARD 1: Customer Info ── */}
      <Card sx={{ marginBottom: 14 }}>
        <Field
          label="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. James Patterson"
          error={errors.name}
          disabled={loading}
        />
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: G.inkSoft, marginBottom: 6 }}>
            Channel
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button onClick={() => setChannel("email")} style={{
              flex: 1, padding: "10px 14px",
              background: channel === "email" ? G.accent : G.surface,
              color: channel === "email" ? "white" : G.ink,
              border: `1.5px solid ${channel === "email" ? G.accent : G.border}`,
              borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13,
              fontFamily: "'Manrope',sans-serif", transition: "all 0.15s",
            }}>
              ✉️ Email
            </button>
            <button onClick={() => setChannel("sms")} style={{
              flex: 1, padding: "10px 14px",
              background: channel === "sms" ? G.accent : G.surface,
              color: channel === "sms" ? "white" : G.ink,
              border: `1.5px solid ${channel === "sms" ? G.accent : G.border}`,
              borderRadius: 10, cursor: "pointer", fontWeight: 700, fontSize: 13,
              fontFamily: "'Manrope',sans-serif", transition: "all 0.15s",
            }}>
              💬 SMS
            </button>
            <button onClick={() => plan === "growth" || plan === "agency" ? setChannel("whatsapp") : null}
              style={{
                flex: 1, padding: "10px 14px",
                background: channel === "whatsapp" ? G.accent : G.surface,
                color: channel === "whatsapp" ? "white" : G.ink,
                border: `1.5px solid ${channel === "whatsapp" ? G.accent : G.border}`,
                borderRadius: 10,
                cursor: plan !== "free" && plan !== "starter" ? "pointer" : "not-allowed",
                fontWeight: 700, fontSize: 13,
                fontFamily: "'Manrope',sans-serif", transition: "all 0.15s",
                opacity: plan === "free" || plan === "starter" ? 0.5 : 1,
              }}>
              📱 WhatsApp <span style={{ fontSize: 10, opacity: 0.8 }}>
                {plan === "free" || plan === "starter" ? "🔒 Growth plan only" : "— 3x higher open rate"}
              </span>
            </button>
          </div>
        </div>
        <Sel label="Language" value={lang} onChange={(e) => setLang(e.target.value)}
          options={getLanguages().map(l => ({ value: l.code, label: l.native + " (" + l.name + ")" }))}
        />
        {channel === "email" && (
          <Field label="Email address" value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="james@gmail.com" type="email"
            error={errors.email} disabled={loading}
          />
        )}
        {(channel === "sms" || channel === "whatsapp") && (
          <Field label={channel === "whatsapp" ? "WhatsApp number" : "Phone number"} value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000" error={errors.phone} disabled={loading}
          />
        )}
      </Card>

      {/* ── CARD 2: Message / AI Writer ── */}
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
          <div style={{
            fontSize: 11, fontWeight: 700, color: G.muted,
            letterSpacing: "0.8px", textTransform: "uppercase",
          }}>
            Message
          </div>
          <button
            onClick={handleAiGenerate}
            disabled={aiLoading || !name.trim()}
            style={{
              display: "flex", alignItems: "center", gap: 5,
              padding: "6px 14px", borderRadius: 20, border: "none",
              background: aiLoading ? G.border : G.accentBg,
              color: aiLoading ? G.muted : G.accent,
              fontSize: 12, fontWeight: 700, cursor: aiLoading ? "not-allowed" : "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            {aiLoading ? (
              <>
                <span style={{
                  width: 12, height: 12, border: "2px solid rgba(0,0,0,0.15)",
                  borderTopColor: G.accent, borderRadius: "50%",
                  animation: "spin 0.8s linear infinite", display: "inline-block",
                }} />
                Generating...
              </>
            ) : "✨ Generate with AI"}
          </button>
        </div>

        {channel === "email" && (
          <input
            type="text"
            value={subject}
            onChange={(e) => setSubject(e.target.value)}
            placeholder="Email subject (e.g. How was your visit?)"
            disabled={loading}
            style={{
              width: "100%", padding: "10px 14px", borderRadius: 10,
              border: `1.5px solid ${G.border}`, background: G.surface,
              color: G.ink, fontSize: 13, fontWeight: 600, outline: "none",
              fontFamily: "'Manrope',sans-serif", marginBottom: 10,
              boxSizing: "border-box",
            }}
          />
        )}

        <textarea
          value={messageBody}
          onChange={(e) => setMessageBody(e.target.value)}
          placeholder={channel === "email"
            ? `Hi ${name || "[Customer Name]"}! Thank you for choosing ${biz.bizName || "us"}...\n\nLeave a review here: [LINK]\n\nTakes less than 60 seconds.`
            : `Hi ${name || "[Customer Name]"}! Thanks for visiting us today. A quick review would mean the world: [LINK]`}
          rows={channel === "email" ? 6 : 3}
          disabled={loading}
          style={{
            width: "100%", padding: "10px 14px", borderRadius: 10,
            border: `1.5px solid ${G.border}`, background: G.surface,
            color: G.ink, fontSize: 13, outline: "none", resize: "vertical",
            fontFamily: "'Manrope',sans-serif", lineHeight: 1.6,
            boxSizing: "border-box",
          }}
        />

        <p style={{ fontSize: 11, color: G.mutedLo, marginTop: 6, marginBottom: 0 }}>
          💡 Use <code style={{ background: G.accentBg, padding: "1px 4px", borderRadius: 4, fontSize: 11 }}>[LINK]</code> placeholder
          — it will be replaced with your Google review link automatically.
        </p>
      </Card>

      {/* ── CARD 3: Review Link ── */}
      <Card sx={{ marginBottom: 14 }}>
        <div style={{
          fontSize: 11, fontWeight: 700, color: G.muted,
          letterSpacing: "0.8px", textTransform: "uppercase", marginBottom: 4,
        }}>
          Google review link
        </div>
        <p style={{ fontSize: 14, color: G.ink, margin: 0, wordBreak: "break-all" }}>
          {reviewLink}
        </p>
        <p style={{ fontSize: 12, color: G.muted, margin: "4px 0 0" }}>
          Customer clicks this link → lands directly on your Google review page.
        </p>
      </Card>

      <Btn fullWidth size="lg" onClick={send} loading={loading} disabled={loading}>
        {loading ? "Sending…" : `Send ${channel === "email" ? "Email" : channel === "whatsapp" ? "WhatsApp" : "SMS"} →`}
      </Btn>
      <p style={{ textAlign: "center", fontSize: 12, color: G.muted, marginTop: 8 }}>
        GDPR compliant · Encrypted · Opt-out included
      </p>

      <PricingModal
        open={showPricing}
        plan={plan}
        onClose={() => setShowPricing(false)}
        onUpgrade={async (planId, billing) => {
          setShowPricing(false);
          try {
            const result = await createSubscription({
              plan: planId,
              billing: billing || "monthly",
              return_url: window.location.href,
            });
            if (result?.url) window.location.href = result.url;
            else toast.error("Checkout URL not returned");
          } catch (err) {
            toast.error(err.message || "Failed to start checkout");
          }
        }}
      />
    </div>
  );
}
