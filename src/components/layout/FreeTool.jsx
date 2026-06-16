import { useState } from "react";
import { G } from "../../data/theme";
import { Card, Field, Btn, Wordmark, Pill } from "../ui";
import SEO from "../SEO";

export default function FreeTool({ onSignup }) {
  const isResponseGen = window.location.pathname === "/tools/review-response-generator";
  const [bizName, setBizName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

  // Response generator state
  const [reviewText, setReviewText] = useState("");
  const [responseDraft, setResponseDraft] = useState("");

  const link = `https://search.google.com/local/writereview?placeid=${
    placeId || "ChIJxxxxxxxxxxxxxxxxxx"
  }`;
  const shortLink = `reviewping.io/r/${
    bizName.toLowerCase().replace(/\s+/g, "-") || "my-business"
  }`;

  const generate = () => {
    if (!bizName) return;
    setGenerated(true);
  };

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <>
      <SEO
        title={isResponseGen ? "Free Review Response Generator" : "Free Review Link Generator"}
        description={isResponseGen ? "Generate AI-powered responses to your Google reviews for free." : "Generate your Google Review link for free. No sign-up required."}
        path={isResponseGen ? "/tools/review-response-generator" : "/tools/review-link-generator"}
      />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 22px",
          borderBottom: `1px solid ${G.border}`,
          background: G.surface,
        }}
      >
        <Wordmark size={40}/>
        <Btn size="sm" onClick={onSignup}>
          Start free trial →
        </Btn>
      </header>

      <div style={{ maxWidth: 640, margin: "0 auto", padding: "52px 22px 64px" }}>
        <div style={{ textAlign: "center", marginBottom: 40 }}>
          <div style={{ marginBottom: 14 }}>
            <Pill label="Free Tool" variant="inactive" />
          </div>
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(32px,7vw,48px)",
              fontWeight: 400,
              margin: "0 0 16px",
              lineHeight: 1.1,
              letterSpacing: "-1px",
            }}
          >
            {isResponseGen ? "Google Review Response Generator" : "Google Review Link Generator"}
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.75,
              color: G.muted,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            {isResponseGen
              ? "Generate thoughtful AI-powered responses to your Google reviews. Save time and impress your customers."
              : "Generate a direct link to your Google review page in seconds. Share it anywhere — SMS, email, receipts, or social media."}
          </p>
        </div>

        {!isResponseGen && (
          <Card style={{ marginBottom: 16 }}>
            <Field
              label="Your business name"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="Mike's Dental Clinic"
            />
            <Field
              label="Google Place ID (optional)"
              value={placeId}
              onChange={(e) => setPlaceId(e.target.value)}
              placeholder="ChIJxxxxxxxxxxxxxxxxxx"
              hint="Find it at developers.google.com/maps/documentation/places/web-service/place-id"
            />
            <Btn fullWidth size="lg" onClick={generate}>
              Generate my review link →
            </Btn>
          </Card>
        )}

        {!isResponseGen && generated && (
          <Card style={{ marginBottom: 16 }}>
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
              Your Google review link
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: G.bg,
                border: `1.5px solid ${G.border}`,
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 12.5,
                color: G.inkSoft,
                wordBreak: "break-all",
                marginBottom: 12,
              }}
            >
              {link}
            </div>
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
              Short link (with ReviewPing)
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: G.accentBg,
                border: `1.5px solid ${G.accentBd}`,
                borderRadius: 8,
                fontFamily: "monospace",
                fontSize: 12.5,
                color: G.accent,
                wordBreak: "break-all",
                marginBottom: 14,
              }}
            >
              {shortLink}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn onClick={copy}>{copied ? "✓ Copied!" : "Copy link"}</Btn>
              <Btn variant="secondary" onClick={onSignup}>
                Get short link free →
              </Btn>
            </div>
          </Card>
        )}

        {isResponseGen && (
          <Card style={{ marginBottom: 16 }}>
            <Field
              label="Customer name"
              value={bizName}
              onChange={(e) => setBizName(e.target.value)}
              placeholder="e.g. Sarah Johnson"
            />
            <Field
              label="Review text (paste the customer's review)"
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              placeholder="e.g. Mike did an amazing job fixing my tooth. Highly recommended!"
              multiline
              rows={4}
            />
            <Btn
              fullWidth
              size="lg"
              onClick={() => {
                if (reviewText.trim()) {
                  setResponseDraft(
                    `Hi ${bizName || "there"}, thank you so much for your kind words! We're thrilled to hear you had a great experience. Your feedback means the world to us, and we look forward to serving you again soon! 🙏`
                  );
                }
              }}
              disabled={!reviewText.trim()}
            >
              Generate response →
            </Btn>
          </Card>
        )}

        {isResponseGen && responseDraft && (
          <Card style={{ marginBottom: 16 }}>
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
              Suggested response
            </div>
            <div
              style={{
                padding: "12px 14px",
                background: G.bg,
                border: `1.5px solid ${G.border}`,
                borderRadius: 8,
                fontSize: 13.5,
                color: G.inkSoft,
                lineHeight: 1.6,
                marginBottom: 12,
                whiteSpace: "pre-wrap",
              }}
            >
              {responseDraft}
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <Btn
                size="sm"
                variant="secondary"
                onClick={() => {
                  navigator.clipboard?.writeText(responseDraft);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied!" : "Copy to clipboard"}
              </Btn>
              <Btn
                size="sm"
                onClick={() => setResponseDraft("")}
              >
                Try again
              </Btn>
            </div>
          </Card>
        )}

        {!isResponseGen && (
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            📋 How to use your review link
          </div>
          {[
            {
              n: "01",
              t: "Copy the link above",
              b: "Use the full Google link or sign up for ReviewPing to get a branded short link.",
            },
            {
              n: "02",
              t: "Share it with customers",
              b: "Paste it in SMS messages, emails, WhatsApp, or print it as a QR code on receipts.",
            },
            {
              n: "03",
              t: "Watch reviews come in",
              b: "Customers click the link and land directly on your Google review form. Friction eliminated.",
            },
          ].map((s, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 14,
                marginBottom: 14,
              }}
            >
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 20,
                  color: G.mutedLo,
                  lineHeight: 1,
                  minWidth: 28,
                  flexShrink: 0,
                }}
              >
                {s.n}
              </div>
              <div>
                <div
                  style={{ fontWeight: 700, fontSize: 14, marginBottom: 3 }}
                >
                  {s.t}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: G.muted,
                    lineHeight: 1.6,
                  }}
                >
                  {s.b}
                </div>
              </div>
            </div>
          ))}
        </Card>
        )}

        <Card
          style={{
            background: G.accentBg,
            border: `1.5px solid ${G.accentBd}`,
            textAlign: "center",
            padding: 28,
          }}
        >
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 24,
              marginBottom: 8,
            }}
          >
            Want to automate this?
          </div>
          <p
            style={{
              color: G.muted,
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            ReviewPing automatically sends your review link to every customer
            after every service — via SMS or email, with AI-written personalised
            messages.
          </p>
          <Btn size="lg" onClick={onSignup}>
            Start free — no card needed →
          </Btn>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 10 }}>
            14-day free trial · 2-minute setup
          </p>
        </Card>
      </div>

      <footer
        style={{
          borderTop: `1px solid ${G.border}`,
          padding: "20px 22px",
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: 10,
        }}
      >
        <Wordmark size={34}/>
        <div style={{ display: "flex", gap: 16 }}>
          <span
            style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
            onClick={() => window.history.pushState({}, "", "/privacy") && window.dispatchEvent(new PopStateEvent("popstate"))}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/privacy"), window.dispatchEvent(new PopStateEvent("popstate")))}
          >
            Privacy Policy
          </span>
          <span
            style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
            onClick={() => window.history.pushState({}, "", "/terms") && window.dispatchEvent(new PopStateEvent("popstate"))}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/terms"), window.dispatchEvent(new PopStateEvent("popstate")))}
          >
            Terms of Service
          </span>
          <span
            style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
            onClick={() => window.location.href = "mailto:support@reviewping.io"}
            role="link"
            tabIndex={0}
            onKeyDown={(e) => e.key === "Enter" && (window.location.href = "mailto:support@reviewping.io")}
          >
            Help
          </span>
        </div>
      </footer>
    </div>
    </>
  );
}
