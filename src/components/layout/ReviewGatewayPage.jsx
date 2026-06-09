import { useEffect, useState, useRef } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Spinner } from "../ui";

const STAR_LABELS = ["Poor", "Fair", "Good", "Great", "Excellent"];
const API_BASE = import.meta.env.VITE_SUPABASE_URL || "";
const GATEWAY_URL = "https://reviewping-eight.vercel.app";

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
  const [feedback, setFeedback] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [done, setDone] = useState(false);
  const [clickId, setClickId] = useState(null);
  const [showOptions, setShowOptions] = useState(false);
  const [showTextForm, setShowTextForm] = useState(false);
  const [confetti, setConfetti] = useState(false);
  const [submittedMsg, setSubmittedMsg] = useState("");
  const trackedRef = useRef(false);

  // ── Parse token & resolve gateway info ──
  useEffect(() => {
    const token = window.location.pathname.replace("/r/", "");
    if (!token || token.length < 6) {
      setError("Invalid review link");
      setLoading(false);
      return;
    }

    fetch(`${API_BASE}/functions/v1/resolve-gateway`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    })
      .then((r) => r.json())
      .then((data) => {
        if (data.error) throw new Error(data.error);
        setGateway(data);
        setLoading(false);
      })
      .catch((err) => {
        setError(err.message || "Could not load review page");
        setLoading(false);
      });
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
  const handleStarClick = (star) => {
    setRating(star);
    setShowOptions(false);
    setShowTextForm(false);

    // Track rating on review_gateway_clicks
    if (clickId) {
      supabase
        .from("review_gateway_clicks")
        .update({ rating: star })
        .eq("id", clickId)
        .then()
        .catch(() => {});
    }

    if (star >= 4) {
      // 4–5★ → show celebration + options
      setConfetti(true);
      setTimeout(() => setConfetti(false), 2000);
      setShowOptions(true);
    }
    // 1–3★ stays on page to show feedback form (no confetti)
  };

  // ── Handle "Post on Google" button ──
  const handlePostOnGoogle = () => {
    if (gateway?.google_review_link) {
      window.open(gateway.google_review_link, "_blank", "noopener");
      markConverted("google");
      setDone(true);
      setSubmittedMsg(
        "The Google review page opened in a new tab. Thank you!"
      );
    } else {
      // No GBP link — go straight to text form
      setShowTextForm(true);
      setShowOptions(false);
    }
  };

  // ── Show text form for writing a review here ──
  const handleWriteHere = () => {
    setShowTextForm(true);
    setShowOptions(false);
  };

  // ── Submit feedback / private review ──
  const handleSubmitFeedback = async () => {
    if (!feedback.trim() && rating < 4) return;
    setSubmitting(true);

    try {
      const token = window.location.pathname.replace("/r/", "");
      const res = await fetch(`${API_BASE}/functions/v1/submit-gateway-feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          token,
          rating,
          feedback: feedback.trim(),
          click_id: clickId,
        }),
      });

      const data = await res.json();
      if (!res.ok || data.error) {
        throw new Error(data.error || "Failed to submit");
      }

      setDone(true);
      if (rating >= 4) {
        setSubmittedMsg("Your review has been submitted. Thank you!");
      } else {
        setSubmittedMsg(
          "Thank you for your honest feedback. We'll use it to improve."
        );
      }
    } catch (err) {
      console.error("Submit error:", err);
    }
    setSubmitting(false);
  };

  // ── Mark converted in review_gateway_clicks ──
  const markConverted = (platform) => {
    if (!clickId) return;
    supabase
      .from("review_gateway_clicks")
      .update({
        converted: true,
        rating,
        review_posted_on: platform || "reviewping",
      })
      .eq("id", clickId)
      .then()
      .catch(() => {});
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 8px",
            }}
          >
            Invalid review link
          </h2>
          <p style={{ color: G.muted, fontSize: 14, margin: 0 }}>
            This link is invalid or has expired. Please contact the business
            for a new link.
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
            textAlign: "center",
            boxShadow: "0 8px 32px rgba(0,0,0,0.06)",
            animation: "fs 0.5s ease",
          }}
        >
          <div style={{ fontSize: 56, marginBottom: 16 }}>
            {rating >= 4 ? "⭐" : "💬"}
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 24,
              fontWeight: 400,
              margin: "0 0 8px",
            }}
          >
            {rating >= 4 ? "Amazing, thank you!" : "Thanks for sharing"}
          </h2>
          <p
            style={{
              color: G.muted,
              fontSize: 14,
              margin: 0,
              lineHeight: 1.6,
            }}
          >
            {submittedMsg}
          </p>
          <p
            style={{
              color: G.mutedLo,
              fontSize: 11,
              marginTop: 32,
              opacity: 0.6,
            }}
          >
            Powered by ReviewPing
          </p>
        </div>
      </div>
    );
  }

  // ── Main gateway UI ──
  return (
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

        {/* Rating not yet selected — show question */}
        {rating === 0 && !showOptions && (
          <>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "8px 0 28px",
                lineHeight: 1.6,
              }}
            >
              Hi {gateway?.customer_name || "there"}, how was your experience?
            </p>
          </>
        )}

        {/* 4–5★ options */}
        {showOptions && (
          <>
            <div style={{ fontSize: 48, marginBottom: 8 }}>
              {"★".repeat(rating)}
            </div>
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 6px",
              }}
            >
              Amazing! 🤩
            </h2>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              Would you like to share your experience on Google to help others
              discover this business?
            </p>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {gateway?.google_review_link ? (
                <button
                  onClick={handlePostOnGoogle}
                  style={{
                    padding: "14px 24px",
                    background: G.accent,
                    color: "white",
                    border: "none",
                    borderRadius: 12,
                    fontSize: 15,
                    fontWeight: 700,
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                    transition: "transform 0.15s, opacity 0.15s",
                    boxShadow: `0 4px 16px ${G.accent}40`,
                  }}
                  onMouseEnter={(e) => {
                    e.target.style.transform = "scale(1.02)";
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "scale(1)";
                  }}
                >
                  Post on Google ★
                </button>
              ) : null}
              <button
                onClick={handleWriteHere}
                style={{
                  padding: "14px 24px",
                  background: gateway?.google_review_link ? G.surface : G.accent,
                  color: gateway?.google_review_link ? G.inkSoft : "white",
                  border: gateway?.google_review_link ? `1.5px solid ${G.border}` : "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "transform 0.15s",
                  boxShadow: gateway?.google_review_link ? "none" : `0 4px 16px ${G.accent}40`,
                }}
                onMouseEnter={(e) => {
                  e.target.style.transform = "scale(1.02)";
                }}
                onMouseLeave={(e) => {
                  e.target.style.transform = "scale(1)";
                }}
              >
                {gateway?.google_review_link ? "Leave review here instead" : "Write a review ★"}
              </button>
            </div>
          </>
        )}

        {/* 1–3★ feedback form */}
        {rating >= 1 && rating <= 3 && !showTextForm && (
          <>
            <div style={{ fontSize: 40, marginBottom: 4 }}>💬</div>
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 6px",
              }}
            >
              Help us improve
            </h2>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "0 0 20px",
                lineHeight: 1.6,
              }}
            >
              We value your honesty. Tell us what went wrong — this is private
              and won't be posted publicly.
            </p>
            <div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What could be better?"
                rows={3}
                style={{
                  width: "100%",
                  border: `1.5px solid ${G.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 14,
                  fontFamily: "'Manrope',sans-serif",
                  resize: "none",
                  outline: "none",
                  marginBottom: 16,
                  background: G.bg,
                  boxSizing: "border-box",
                  color: G.ink,
                }}
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: submitting ? G.border : G.accent,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "opacity 0.15s",
                  opacity: submitting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Submitting…
                  </>
                ) : (
                  "Send feedback →"
                )}
              </button>
            </div>
          </>
        )}

        {/* 4–5★ text form (when "Leave review here" is chosen) */}
        {showTextForm && (
          <>
            <div style={{ fontSize: 40, marginBottom: 4 }}>✍️</div>
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 6px",
              }}
            >
              Share your experience
            </h2>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "0 0 20px",
                lineHeight: 1.6,
              }}
            >
              Write a quick review — it helps others discover this business.
            </p>
            <div>
              <textarea
                value={feedback}
                onChange={(e) => setFeedback(e.target.value)}
                placeholder="What did you love about your experience?"
                rows={3}
                style={{
                  width: "100%",
                  border: `1.5px solid ${G.border}`,
                  borderRadius: 12,
                  padding: "12px 14px",
                  fontSize: 14,
                  fontFamily: "'Manrope',sans-serif",
                  resize: "none",
                  outline: "none",
                  marginBottom: 16,
                  background: G.bg,
                  boxSizing: "border-box",
                  color: G.ink,
                }}
              />
              <button
                onClick={handleSubmitFeedback}
                disabled={submitting}
                style={{
                  width: "100%",
                  padding: "14px 24px",
                  background: submitting ? G.border : G.accent,
                  color: "white",
                  border: "none",
                  borderRadius: 12,
                  fontSize: 15,
                  fontWeight: 700,
                  cursor: submitting ? "not-allowed" : "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "opacity 0.15s",
                  opacity: submitting ? 0.6 : 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                }}
              >
                {submitting ? (
                  <>
                    <span
                      style={{
                        width: 16,
                        height: 16,
                        border: "2px solid rgba(255,255,255,0.3)",
                        borderTopColor: "white",
                        borderRadius: "50%",
                        animation: "spin 0.7s linear infinite",
                        display: "inline-block",
                      }}
                    />
                    Submitting…
                  </>
                ) : (
                  "Submit review →"
                )}
              </button>
            </div>
          </>
        )}

        {/* Stars — show unless options/text form shown */}
        {!showOptions && !showTextForm && (
          <div style={{ marginBottom: rating === 0 ? 0 : 16 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 8,
                marginBottom: 10,
              }}
            >
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
                      transform:
                        hover >= star ? "scale(1.2)" : "scale(1)",
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
            {rating >= 1 && rating <= 3 && (
              <p
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  margin: "8px 0 0",
                }}
              >
                You selected {rating} {rating === 1 ? "star" : "stars"}
              </p>
            )}
          </div>
        )}

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
    </div>
  );
}
