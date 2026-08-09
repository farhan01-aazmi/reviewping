import { useEffect, useState, useRef } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Spinner } from "../ui";
import { getDefaultReviewTemplates, getCategoryGroup } from "../../data/reviewTemplates";
import SEO from "../SEO";

const STAR_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];
const API_BASE = import.meta.env.VITE_SUPABASE_URL || "";
const GATEWAY_URL = import.meta.env.VITE_SITE_URL || "https://reviewping.pro";

/**
 * Smart Review Gateway Page (/r/:token)
 *
 * A public, branded page where customers land after clicking a review request link.
 * - Shows business name + star rating selector
 * - 4–5★ → celebration UI with option to post on Google or leave private review
 * - 1–3★ → private feedback form (never goes to Google)
 * - Tracks everything in review_gateway_clicks + review_requests
 */
export default function ReviewGatewayPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateway, setGateway] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [done, setDone] = useState(false);
  const [clickId, setClickId] = useState(null);
  const [confetti, setConfetti] = useState(false);
  const [reviewText, setReviewText] = useState("");
  const [copied, setCopied] = useState(false);
  const [templateOptions, setTemplateOptions] = useState([]);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [gatewayToken, setGatewayToken] = useState("");
  const [privateMode, setPrivateMode] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const trackedRef = useRef(false);
  const eventLogged = useRef(false);

  // ── Parse token & resolve gateway info ──
  useEffect(() => {
    const path = window.location.pathname;
    const isBiz = /^\/biz\//.test(path);

    if (isBiz) {
      const slug = path.replace("/biz/", "").replace(/\/+$/, "").replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
      if (!slug || slug.length < 2) {
        setError("Invalid business link");
        setLoading(false);
        return;
      }

      fetch(`${API_BASE}/functions/v1/resolve-biz-gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          if (data.blocked) {
            setError("unavailable");
            setLoading(false);
            return;
          }
          setGateway({ ...data, isBiz: true });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Could not load business page");
          setLoading(false);
        });
    } else {
      const token = path.replace("/r/", "");
      if (!token || token.length < 6) {
        setError("Invalid review link");
        setLoading(false);
        return;
      }
      setGatewayToken(token);

      fetch(`${API_BASE}/functions/v1/resolve-gateway`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      })
        .then((r) => r.json())
        .then((data) => {
          if (data.error) throw new Error(data.error);
          setGateway({ ...data, isBiz: false });
          setLoading(false);
        })
        .catch((err) => {
          setError(err.message || "Could not load review page");
          setLoading(false);
        });
    }
  }, []);

  // ── Track the click on first load (fire once) ──
  useEffect(() => {
    if (trackedRef.current || !gateway) return;
    trackedRef.current = true;

    const device = /Mobi|Android|iPhone|iPad/i.test(navigator.userAgent)
      ? "mobile"
      : "desktop";

    supabase
      .from("review_gateway_clicks")
      .insert({
        user_id: gateway.user_id,
        request_id: gateway.request_id,
        customer_name: gateway.customer_name,
        clicked_at: new Date().toISOString(),
        device,
      })
      .select("id")
      .single()
      .then(({ data, error }) => {
        if (!error && data?.id) {
          setClickId(data.id);
        }
      })
      .catch(() => {});
  }, [gateway]);

  // ── Handle star selection ──
  const handleStarClick = async (star) => {
    setRating(star);
    setCopied(false);
    setConfetti(true);
    setSelectedTemplate(null);
    setReviewText("");
    setTimeout(() => setConfetti(false), 2000);

    const bizName = gateway?.business_name || "this business";
    const bizType = gateway?.business_type || "default";

    // Templates only for public Google reviews (4-5★); private feedback stays blank
    let options = [];
    if (star >= 4) {
      try {
        const { data } = await supabase
          .from("review_templates")
          .select("id, template_text")
          .eq("user_id", gateway?.user_id)
          .eq("biz_type", bizType)
          .eq("star_rating", star);
        if (data && data.length > 0) {
          options = data.map((t) => ({ id: t.id, text: t.template_text.replace(/{business}/g, bizName) }));
        }
      } catch (_) {}

      // Fall back to category defaults
      if (options.length === 0) {
        const defaults = getDefaultReviewTemplates(bizType, star);
        options = defaults.map((text, i) => ({ id: `default-${i}`, text: text.replace(/{business}/g, bizName), isDefault: true }));
      }

      setTemplateOptions(options);
      if (options.length > 0) {
        setSelectedTemplate(options[0].id);
        setReviewText(options[0].text);
      }
    } else {
      setTemplateOptions([]);
      setSelectedTemplate(null);
      setReviewText("");
    }

    // Track rating
    if (clickId) {
      supabase.from("review_gateway_clicks").update({ rating: star }).eq("id", clickId).then().catch(() => {});
    }

    // Log event to review_events
    supabase.from("review_events").insert({
      user_id: gateway?.user_id,
      slug: gateway?.slug,
      star_rating: star,
      template_used: options[0]?.text || "",
      destination_url: gateway?.google_review_link || "",
      source: gateway?.isBiz ? "qr" : "link",
    }).then().catch(() => {});
  };

  const handleSelectTemplate = (id, text) => {
    setSelectedTemplate(id);
    setReviewText(text);
  };

  // ── Copy review text & open Google in one click (4-5★ only) ──
  const handleCopyAndGo = () => {
    if (!reviewText) return;
    navigator.clipboard.writeText(reviewText).catch(() => {});
    setCopied(true);

    supabase.from("review_events").update({ copied_at: new Date().toISOString() }).eq("slug", gateway?.slug).eq("star_rating", rating).order("created_at", { ascending: false }).limit(1).then().catch(() => {});

    setTimeout(() => {
      if (gateway?.google_review_link) {
        window.location.href = gateway.google_review_link;
      }
      supabase.from("review_events").update({ redirected_at: new Date().toISOString() }).eq("slug", gateway?.slug).eq("star_rating", rating).order("created_at", { ascending: false }).limit(1).then().catch(() => {});
      setDone(true);
    }, 1500);
  };

  // ── Send private feedback (1-3★) — NEVER goes to Google ──
  const handlePrivateFeedback = async () => {
    if (submitting) return;
    setSubmitting(true);

    const payload = { rating, feedback: reviewText, click_id: clickId };
    if (gatewayToken) payload.token = gatewayToken;
    else payload.user_id = gateway?.user_id;

    try {
      const res = await fetch(`${API_BASE}/functions/v1/submit-gateway-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        setPrivateMode(true);
        setDone(true);
      }
    } catch (_) {}
    setSubmitting(false);
  };

  // ── Confetti particles ──
  const confettiParticles = Array.from({ length: 30 }).map((_, i) => ({
    id: i,
    left: `${Math.random() * 100}%`,
    delay: `${Math.random() * 0.5}s`,
    duration: `${0.8 + Math.random() * 1.2}s`,
    color: ["#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1", "#96CEB4", "#FFEAA7"][
      i % 6
    ],
    size: 6 + Math.random() * 8,
  }));

  // ─────────────────────────────────────────────────────────────────
  // RENDER STATES
  // ─────────────────────────────────────────────────────────────────

  // Loading state
  if (loading) {
    return (
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Manrope',sans-serif",
        }}
      >
        <div style={{ textAlign: "center" }}>
          <Spinner size={32} />
          <p style={{ color: G.muted, fontSize: 14, marginTop: 16 }}>
            Loading review…
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    const isUnavailable = error === "unavailable";
    return (
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
          textAlign: "center",
        }}
      >
        <div>
          <div style={{ fontSize: 48, marginBottom: 16 }}>{isUnavailable ? "⏳" : "🔗"}</div>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 8px",
            }}
          >
            {isUnavailable
              ? "This page is not available right now"
              : error.includes("business") || error.includes("Business")
                ? "Business not found"
                : "Invalid review link"}
          </h2>
          <p style={{ color: G.muted, fontSize: 14, margin: 0 }}>
            {isUnavailable
              ? "Please check back later or contact the business directly."
              : error.includes("business") || error.includes("Business")
                ? "This business link is invalid. Please check the URL or contact the business directly."
                : "This link is invalid or has expired. Please contact the business for a new link."}
          </p>
        </div>
      </div>
    );
  }

  // Done / Thank you state
  if (done) {
    return (
      <div
        style={{
          background: "linear-gradient(135deg, #f0f5ff 0%, #faf5ff 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: 24,
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
          textAlign: "center",
        }}
      >
        <div
          style={{
            background: "white",
            borderRadius: 20,
            padding: "48px 40px",
            maxWidth: 480,
            width: "100%",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            animation: "fs 0.5s ease",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>{privateMode ? "📨" : "★".repeat(rating)}</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 8px" }}>
            {privateMode ? "Thank you for your feedback!" : "Thank you for your review!"}
          </h2>
          <p style={{ color: G.muted, fontSize: 14, margin: 0, lineHeight: 1.6 }}>
            {privateMode
              ? "Your feedback has been sent privately to the business. It won't be posted publicly."
              : "Redirecting you to Google to post your review..."}
          </p>
          <p style={{ color: G.mutedLo, fontSize: 11, marginTop: 32, opacity: 0.6 }}>
            Powered by ReviewPing
          </p>
        </div>
      </div>
    );
  }

  // ── Main gateway UI ──
  return (
    <>
      <SEO
        title="Submit a Review"
        description="Share your experience with this business. Leave a Google review through our review request platform."
        path={window.location.pathname}
      />
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@type": "WebPage",
          name: `Submit a review for ${gateway?.business_name || "this business"}`,
          description: "Share your experience and leave feedback on this page.",
          url: `${GATEWAY_URL}${window.location.pathname}`,
          potentialAction: {
            "@type": "ReviewAction",
            target: {
              "@type": "EntryPoint",
              urlTemplate: `${GATEWAY_URL}${window.location.pathname}`,
            },
          },
        })}
      </script>
      <div
        style={{
          background: "linear-gradient(135deg, #f0f5ff 0%, #faf5ff 100%)",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
          padding: 24,
          position: "relative",
          overflow: "hidden",
        }}
      >
      {/* ── Confetti overlay ── */}
      {confetti && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            pointerEvents: "none",
            zIndex: 10,
          }}
        >
          {confettiParticles.map((p) => (
            <div
              key={p.id}
              style={{
                position: "absolute",
                top: "-10px",
                left: p.left,
                width: p.size,
                height: p.size,
                background: p.color,
                borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                animation: `confetti-fall ${p.duration} ${p.delay} ease-out forwards`,
                opacity: 0,
              }}
            />
          ))}
        </div>
      )}

      {/* ── Card ── */}
      <div
        style={{
          background: "white",
          borderRadius: 20,
          padding: "48px 40px",
          maxWidth: 480,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
          animation: "fs 0.4s ease",
          position: "relative",
          zIndex: 1,
        }}
      >
        {/* Business logo / initial */}
        {gateway?.logo_url ? (
          <img
            src={gateway.logo_url}
            alt={gateway.business_name}
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              objectFit: "cover",
              marginBottom: 16,
            }}
          />
        ) : (
          <div
            style={{
              width: 72,
              height: 72,
              borderRadius: 18,
              background: G.accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 28,
              margin: "0 auto 16px",
              color: G.accent,
              fontWeight: 700,
            }}
          >
            {gateway?.business_name?.charAt(0) || "B"}
          </div>
        )}

        {/* Business name */}
        <h1
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 4px",
            letterSpacing: "-0.5px",
            color: G.ink,
          }}
        >
          {gateway?.business_name || "Business"}
        </h1>

        {/* Question */}
        {rating === 0 && (
          <p style={{ color: G.muted, fontSize: 14, margin: "8px 0 28px", lineHeight: 1.6 }}>
            {gateway?.isBiz ? `How was your experience at ${gateway?.business_name || "this business"}?` : `Hi ${gateway?.customer_name || "there"}, how was your experience?`}
          </p>
        )}

        {/* Template + Copy button */}
        {rating > 0 && (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>{"★".repeat(rating)}</div>
            <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 6px" }}>
              {rating >= 4 ? "Amazing! 🤩" : rating === 3 ? "Thanks for your feedback" : "We appreciate your honesty"}
            </h2>
            <p style={{ color: G.muted, fontSize: 14, margin: "0 0 16px", lineHeight: 1.6 }}>
              {rating >= 4 ? "Share your experience with one click" : "Help the business improve — your feedback stays private"}
            </p>

            {rating >= 4 ? (<>
            {/* Template options */}
            {templateOptions.length > 1 && (
              <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
                {templateOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectTemplate(opt.id, opt.text)}
                    style={{
                      textAlign: "left", width: "100%", padding: "12px 14px", borderRadius: 10,
                      border: `1.5px solid ${selectedTemplate === opt.id ? G.accent : G.border}`,
                      background: selectedTemplate === opt.id ? G.accentBg : G.surface,
                      cursor: "pointer", fontFamily: "'Manrope',sans-serif", fontSize: 13, lineHeight: 1.6,
                      color: G.ink, transition: "all 0.12s",
                    }}
                  >
                    {opt.text}
                  </button>
                ))}
              </div>
            )}

            {reviewText && (
              <div style={{
                background: G.bg,
                borderRadius: 12,
                padding: "16px 18px",
                marginBottom: 16,
                textAlign: "left",
                border: `1px solid ${G.border}`,
                fontSize: 14,
                lineHeight: 1.7,
                color: G.ink,
              }}>
                {reviewText}
              </div>
            )}

            {reviewText && (
              <button
                onClick={handleCopyAndGo}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  background: copied ? "#16a34a" : G.accent,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "all 0.2s",
                  boxShadow: copied ? "none" : `0 4px 16px ${G.accent}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
                onMouseEnter={(e) => { if (!copied) e.target.style.transform = "scale(1.02)"; }}
                onMouseLeave={(e) => { e.target.style.transform = "scale(1)"; }}
              >
                {copied ? "✅ Copied! Opening Google…" : "📋 Copy & Post on Google →"}
              </button>
            )}
            </>) : (
            <>
              <textarea
                value={reviewText}
                onChange={(e) => setReviewText(e.target.value)}
                placeholder="Share your honest experience — what went well and where the business can improve. This goes only to the business, not to Google."
                rows={4}
                style={{
                  width: "100%",
                  padding: "14px 16px",
                  borderRadius: 12,
                  border: `1.5px solid ${G.border}`,
                  background: G.surface,
                  fontFamily: "'Manrope',sans-serif",
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: G.ink,
                  resize: "vertical",
                  boxSizing: "border-box",
                  outline: "none",
                  marginBottom: 14,
                }}
              />
              <button
                onClick={handlePrivateFeedback}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "16px 24px",
                  background: G.accent,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting ? "default" : "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "all 0.2s",
                  boxShadow: `0 4px 16px ${G.accent}40`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  opacity: submitting ? 0.7 : 1,
                }}
              >
                {submitting ? "Sending…" : "📨 Send Private Feedback"}
              </button>
            </>
            )}
          </>
        )}

        {/* Stars */}
        <div style={{ marginTop: rating > 0 ? 24 : 0, marginBottom: rating === 0 ? 0 : 16 }}>
          <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 10 }}>
            {[1, 2, 3, 4, 5].map((star) => {
              const filled = star <= (hover || rating);
              return (
                <button
                  key={star}
                  onClick={() => handleStarClick(star)}
                  onMouseEnter={() => setHover(star)}
                  onMouseLeave={() => setHover(0)}
                  style={{
                    background: "none",
                    border: "none",
                    fontSize: 42,
                    cursor: "pointer",
                    padding: "4px 2px",
                    transition: "transform 0.15s, filter 0.2s",
                    transform: hover >= star ? "scale(1.2)" : "scale(1)",
                    filter: filled ? "none" : "grayscale(1) opacity(0.3)",
                    outline: "none",
                  }}
                  aria-label={`${star} star${star > 1 ? "s" : ""}`}
                >
                  {filled ? "★" : "☆"}
                </button>
              );
            })}
          </div>
          {rating === 0 && (
            <p style={{ fontSize: 13, color: G.muted, margin: 0 }}>
              {hover > 0 ? STAR_LABELS[hover - 1] : "Tap a star to rate"}
            </p>
          )}
        </div>

        {/* Powered by */}
        {!done && (
          <p
            style={{
              color: G.mutedLo,
              fontSize: 11,
              marginTop: 32,
              opacity: 0.5,
            }}
          >
            Powered by ReviewPing
          </p>
        )}
      </div>
      {/* Why your feedback matters */}
      <div
        style={{
          maxWidth: 480,
          width: "100%",
          margin: "24px auto 0",
          textAlign: "center",
        }}
      >
        <p
          style={{
            color: G.muted,
            fontSize: 13,
            lineHeight: 1.7,
            margin: 0,
          }}
        >
          Your feedback helps this business understand what they're doing right 
          and where they can improve. Every review — whether public or private — 
          is read and valued. Thank you for taking the time to share your 
          experience.
        </p>
      </div>
    </div>
    </>
  );
}
