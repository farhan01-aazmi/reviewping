import { useState, useEffect } from "react";
import { G } from "../../data/theme";

const API_BASE = import.meta.env.VITE_API_URL || "";

export default function ReviewLanding({ slug, requestId, customerName }) {
  const [state, setState] = useState("loading"); // loading | loaded | notfound | error
  const [business, setBusiness] = useState(null);
  const [countdown, setCountdown] = useState(4);

  useEffect(() => {
    if (!slug) {
      setState("notfound");
      return;
    }

    const cleanSlug = slug.replace(/[^a-zA-Z0-9-]/g, "").toLowerCase();
    if (!cleanSlug) {
      setState("notfound");
      return;
    }

    fetch(`${API_BASE}/get-business-for-review?slug=${encodeURIComponent(cleanSlug)}`)
      .then((r) => {
        if (!r.ok) {
          if (r.status === 404) throw new Error("notfound");
          throw new Error("server_error");
        }
        return r.json();
      })
      .then((data) => {
        setBusiness(data);
        setState("loaded");

        // Track the click (fire and forget)
        try {
          fetch(`${API_BASE}/submit-review`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              slug: cleanSlug,
              event: "click",
              request_id: requestId || null,
              customer_name: customerName || null,
            }),
          }).catch(() => {});
        } catch { /* ignore */ }
      })
      .catch((err) => {
        if (err.message === "notfound") setState("notfound");
        else setState("error");
      });
  }, [slug]);

  // Determine redirect target: gbp_url > google_link > null
  const redirectUrl = business?.gbp_url || business?.google_link || "";

  // Auto-redirect countdown
  useEffect(() => {
    if (state !== "loaded") return;
    if (!redirectUrl) return;

    if (countdown <= 0) {
      window.location.href = redirectUrl;
      return;
    }

    const timer = setTimeout(() => setCountdown((c) => c - 1), 1000);
    return () => clearTimeout(timer);
  }, [state, countdown, redirectUrl]);

  const handleRedirectNow = () => {
    if (redirectUrl) {
      window.location.href = redirectUrl;
    }
  };

  // ───── LOADING STATE ─────
  if (state === "loading") {
    return (
      <div style={{
        background: G.bg, minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif",
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{
            width: 40, height: 40, border: `3px solid ${G.border}`,
            borderTopColor: G.accent, borderRadius: "50%", margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }} />
          <p style={{ color: G.muted, fontSize: 14 }}>Loading...</p>
        </div>
      </div>
    );
  }

  // ───── NOT FOUND ─────
  if (state === "notfound") {
    return (
      <div style={{
        background: G.bg, minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif",
        padding: 24,
      }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>🔗</div>
          <h1 style={{
            fontSize: 20, fontFamily: "'Instrument Serif',serif",
            color: G.ink, margin: "0 0 8px",
          }}>
            Link not found
          </h1>
          <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.6, margin: 0 }}>
            This review link is invalid or has expired. Please contact the business directly.
          </p>
        </div>
      </div>
    );
  }

  // ───── ERROR ─────
  if (state === "error") {
    return (
      <div style={{
        background: G.bg, minHeight: "100vh", display: "flex",
        alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif",
        padding: 24,
      }}>
        <div style={{ textAlign: "center", maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>😕</div>
          <h1 style={{
            fontSize: 20, fontFamily: "'Instrument Serif',serif",
            color: G.ink, margin: "0 0 8px",
          }}>
            Something went wrong
          </h1>
          <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.6, marginBottom: 16 }}>
            We couldn't load this page. Please try again or contact the business directly.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{
              background: G.accent, color: "white", border: "none",
              borderRadius: 8, padding: "10px 24px", fontSize: 14,
              fontWeight: 700, cursor: "pointer",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // ───── MAIN PAGE (LOADED) ─────
  const showGbpRedirect = !!redirectUrl;

  return (
    <div style={{
      background: G.bg, minHeight: "100vh", display: "flex",
      alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif",
      padding: 24,
    }}>
      <div style={{ textAlign: "center", maxWidth: 420, animation: "fs 0.4s ease" }}>
        {/* Logo or Business Name */}
        {business?.logo_url ? (
          <img
            src={business.logo_url}
            alt={business.business_name}
            style={{ width: 64, height: 64, borderRadius: 12, marginBottom: 16, objectFit: "cover" }}
            onError={(e) => { e.target.style.display = "none"; }}
          />
        ) : (
          <div style={{
            width: 64, height: 64, borderRadius: 12, background: G.accentBg,
            display: "flex", alignItems: "center", justifyContent: "center",
            margin: "0 auto 16px", fontSize: 28,
          }}>
            {(business?.business_name || "B")[0].toUpperCase()}
          </div>
        )}

        <h1 style={{
          fontSize: 22, fontFamily: "'Instrument Serif',serif",
          color: G.ink, margin: "0 0 6px", fontWeight: 400,
        }}>
          Thank you!
        </h1>

        <p style={{ color: G.inkSoft, fontSize: 14, lineHeight: 1.6, margin: "0 0 4px" }}>
          {customerName
            ? `${customerName}, thank you for choosing`
            : "Thank you for choosing"}{" "}
          <strong>{business?.business_name || "us"}</strong>.
        </p>

        {showGbpRedirect ? (
          <>
            <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.6, margin: "12px 0" }}>
              We'd love to hear about your experience. You'll be redirected to leave a review.
            </p>

            {/* Countdown + Redirect button */}
            <div style={{ marginTop: 20 }}>
              <button
                onClick={handleRedirectNow}
                style={{
                  background: G.accent, color: "white", border: "none",
                  borderRadius: 10, padding: "14px 32px", fontSize: 15,
                  fontWeight: 700, cursor: "pointer",
                  fontFamily: "'Manrope',sans-serif",
                  transition: "opacity 0.2s",
                }}
                onMouseEnter={(e) => { e.target.style.opacity = "0.9"; }}
                onMouseLeave={(e) => { e.target.style.opacity = "1"; }}
              >
                Leave a review {countdown > 0 ? `(${countdown}s)` : ""}
              </button>
              <p style={{ color: G.mutedLo, fontSize: 12, marginTop: 10 }}>
                Redirecting automatically in {countdown} seconds...
              </p>
            </div>
          </>
        ) : (
          <p style={{ color: G.muted, fontSize: 13, lineHeight: 1.6, margin: "16px 0" }}>
            Your feedback is very important to us.
          </p>
        )}

        {business?.website_url && (
          <a
            href={business.website_url}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              display: "inline-block", marginTop: 16, color: G.accent,
              fontSize: 13, textDecoration: "underline",
            }}
          >
            Visit {business.business_name}'s website
          </a>
        )}

        {/* Powered by */}
        <p style={{ color: G.mutedLo, fontSize: 11, marginTop: 32, opacity: 0.6 }}>
          Powered by ReviewPing
        </p>
      </div>
    </div>
  );
}
