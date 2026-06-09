import { useEffect, useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Spinner, Btn } from "../ui";

const STAR = ["Poor", "Fair", "Good", "Great", "Excellent"];

/**
 * Smart Review Gateway (/r/:request_id)
 *
 * Customers land here from a review request email.
 * They select a star rating:
 *  - 4–5★ → redirected to Google review link (happy path)
 *  - 1–3★ → private feedback form (save to DB, no public review)
 */
export default function ReviewGateway() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [gateway, setGateway] = useState(null);
  const [rating, setRating] = useState(0);
  const [hover, setHover] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    const token = window.location.pathname.replace("/r/", "");
    if (!token || token.length < 8) {
      setError("Invalid review link");
      setLoading(false);
      return;
    }

    fetch(
      `${
        import.meta.env.VITE_SUPABASE_URL
      }/functions/v1/get-review-gateway?request_id=${encodeURIComponent(token)}`
    )
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

  /** Handle star click */
  const handleStarClick = (star) => {
    setRating(star);
    if (star >= 4 && gateway?.google_link) {
      // 4–5★ → redirect to Google
      window.open(gateway.google_link, "_blank", "noopener");
      setDone(true);
    }
    // 1–3★ stays on page to show feedback form
  };

  /** Submit private feedback */
  const handleSubmitFeedback = async () => {
    if (!feedback.trim()) return;
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from("review_submissions").insert({
        user_id: gateway.user_id || "",
        request_id: gateway.request_id,
        rating,
        review_text: feedback,
        author_name: gateway.customer_name || "Anonymous",
        author_email: gateway.customer_email,
        status: "pending",
        source: "reviewping_form",
        moderation_status: "flagged", // 1–3★ auto-flagged for review
      });
      if (err) throw err;
      setDone(true);
    } catch (err) {
      console.error("Feedback submit error:", err);
    }
    setSubmitting(false);
  };

  // — Loading —
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

  // — Error —
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
            This link is invalid or expired. Please contact the business for a
            new link.
          </p>
        </div>
      </div>
    );
  }

  // — Done / Redirected —
  if (done) {
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
          <div style={{ fontSize: 48, marginBottom: 16 }}>
            {rating >= 4 ? "⭐" : "💬"}
          </div>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 8px",
            }}
          >
            {rating >= 4
              ? "Thank you for your feedback!"
              : "Thanks for sharing"}
          </h2>
          <p style={{ color: G.muted, fontSize: 14, margin: 0 }}>
            {rating >= 4
              ? "Your review helps the business grow. The Google review page opened in a new tab."
              : "Your private feedback has been submitted and will help the business improve."}
          </p>
        </div>
      </div>
    );
  }

  // — Main gateway UI —
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
        }}
      >
        {/* Logo / Business name */}
        {gateway?.logo_url && (
          <img
            src={gateway.logo_url}
            alt={gateway.business_name}
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              objectFit: "cover",
              marginBottom: 20,
            }}
          />
        )}
        {!gateway?.logo_url && (
          <div
            style={{
              width: 64,
              height: 64,
              borderRadius: 16,
              background: G.accentBg,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: 24,
              margin: "0 auto 20px",
              color: G.accent,
              fontWeight: 700,
            }}
          >
            {gateway?.business_name?.charAt(0) || "B"}
          </div>
        )}

        <p
          style={{
            fontSize: 12.5,
            color: G.muted,
            textTransform: "uppercase",
            letterSpacing: "1.5px",
            margin: "0 0 8px",
          }}
        >
          {gateway?.business_name || "Business"}
        </p>

        {rating === 0 && (
          <>
            <h1
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 26,
                fontWeight: 400,
                margin: "0 0 6px",
                letterSpacing: "-0.3px",
              }}
            >
              How was your experience?
            </h1>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "0 0 32px",
                lineHeight: 1.6,
              }}
            >
              Hi {gateway?.customer_name || "there"}, tap a star to rate your
              experience.
            </p>
          </>
        )}

        {rating >= 1 && rating <= 3 && (
          <>
            <h1
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 6px",
              }}
            >
              Help us improve
            </h1>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "0 0 24px",
              }}
            >
              We value your honesty. Tell us what went wrong — this is private
              and won't be posted publicly.
            </p>
          </>
        )}

        {rating >= 4 && (
          <>
            <h1
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 6px",
              }}
            >
              We're glad you loved it!
            </h1>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                margin: "0 0 24px",
              }}
            >
              Your review helps others discover this business. A new tab will
              open so you can leave a public review.
            </p>
          </>
        )}

        {/* Star selector */}
        {!done && (
          <div style={{ marginBottom: 24 }}>
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
                      fontSize: 40,
                      cursor: "pointer",
                      padding: "4px 2px",
                      transition: "transform 0.15s",
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
              <p style={{ fontSize: 12.5, color: G.muted, margin: 0 }}>
                {hover > 0 ? STAR[hover - 1] : "Tap a star to rate"}
              </p>
            )}
            {rating >= 1 && rating <= 3 && (
              <p
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  margin: "12px 0 0",
                }}
              >
                You selected {rating} {rating === 1 ? "star" : "stars"}
              </p>
            )}
          </div>
        )}

        {/* Feedback form for 1–3★ */}
        {rating >= 1 && rating <= 3 && (
          <div>
            <textarea
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="What could be better? (optional)"
              rows={3}
              style={{
                width: "100%",
                border: `1px solid ${G.border}`,
                borderRadius: 12,
                padding: "12px 14px",
                fontSize: 14,
                fontFamily: "'Manrope',sans-serif",
                resize: "none",
                outline: "none",
                marginBottom: 16,
                background: G.bg,
              }}
            />
            <Btn
              onClick={handleSubmitFeedback}
              fullWidth
              loading={submitting}
              disabled={!feedback.trim()}
            >
              Send feedback →
            </Btn>
          </div>
        )}
      </div>
    </div>
  );
}
