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
        <Wordmark size={56}/>
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
              : "Generate a direct link to your Google review page in seconds. Share it anywhere — email, WhatsApp, receipts, or social media. No sign-up required."}
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
            <div
              style={{
                fontSize: 12.5,
                color: G.muted,
                lineHeight: 1.6,
                marginBottom: 12,
                padding: "8px 12px",
                background: G.accentBg,
                borderRadius: 8,
              }}
            >
              Enter your business name above and click the button to instantly
              generate a direct Google review link. Adding your Place ID is
              optional but ensures the link points to the correct Google Maps
              listing if your business has multiple locations or a common name.
            </div>
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
        <>
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            📋 How to use your review link
          </div>

          {/* 5-step guide replacing the old 3-step */}
          {[
            {
              n: "01",
              t: "Find your Google Place ID",
              b: "Go to the Google Place ID Finder, search for your business, and copy the long alphanumeric ID (starts with ChI). You can paste it above to generate a precise link. Without a Place ID, the link still works but may not land on your exact listing.",
            },
            {
              n: "02",
              t: "Enter your business name",
              b: "Type your exact business name in the field above so ReviewPing can create a branded short link. This also helps identify your business when you share the link across different channels.",
            },
            {
              n: "03",
              t: "Copy the generated link",
              b: "Once generated, you will see both a full Google URL and a shorter reviewping.io link. Use whichever fits your channel. The short link is cleaner for printed materials, the full link works everywhere.",
            },
            {
              n: "04",
              t: "Test the link yourself",
              b: "Open the link in an incognito window and confirm it lands on your Google review form. If it redirects to a generic search page, double-check your Place ID. A correctly linked form means zero friction for your customers.",
            },
            {
              n: "05",
              t: "Share it everywhere",
              b: "Now that your link works, put it in front of every happy customer. The more places your link lives, the more reviews you collect. Read the sections below for ideas on exactly where to post it.",
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

        {/* Why a direct review link matters */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Why a direct review link matters for your business
          </div>
          <div style={{ fontSize: 13.5, color: G.muted, lineHeight: 1.7 }}>
            <p style={{ margin: "0 0 12px" }}>
              A direct Google review link removes every obstacle between a
              satisfied customer and their five-star review. Without one,
              customers have to search for your business on Google Maps, scroll
              past competitors, and figure out how to leave feedback. Many simply
              give up. With a direct link, they tap once and land exactly on your
              review form — no searching, no confusion.
            </p>
            <p style={{ margin: "0 0 12px" }}>
              More reviews mean more social proof, which directly influences
              purchase decisions. Businesses with a higher review count and higher
              average rating consistently rank better in local search results.
              Google&rsquo;s algorithm considers both the quantity and recency of
              reviews when determining local pack rankings. A steady stream of
              fresh reviews signals that your business is active and trusted.
            </p>
            <p style={{ margin: 0 }}>
              Each review also serves as fresh user-generated content for your
              Google Business Profile, keeping your listing dynamic and improving
              your visibility in the local pack. The best part? Once you have a
              working link, collecting reviews becomes a repeatable process that
              compounds over time.
            </p>
          </div>
        </Card>

        {/* Where to share your review link */}
        <Card style={{ marginBottom: 16 }}>
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            Where to share your review link
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {[
              { t: "Printed receipts", b: "Add a QR code that links directly to your review form." },
              { t: "Email signatures", b: "Paste the link below your name in every outgoing email." },
              { t: "QR codes on tables", b: "Perfect for restaurants, cafes, and service counters." },
              { t: "WhatsApp follow-ups", b: "Message the link after an appointment or delivery." },
              { t: "Your website footer", b: "Add a persistent &ldquo;Leave a review&rdquo; link." },
              { t: "Social media bios", b: "Pin it in your Instagram, Facebook, or LinkedIn bio." },
              { t: "WhatsApp messages", b: "Post-service message with the review link attached." },
              { t: "Invoice footers", b: "Include the link at the bottom of every digital invoice." },
            ].map((item, i) => (
              <div
                key={i}
                style={{
                  background: G.accentBg,
                  borderRadius: 10,
                  padding: "14px 12px",
                  textAlign: "center",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13,
                    color: G.ink,
                    marginBottom: 4,
                  }}
                >
                  {item.t}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: G.muted,
                    lineHeight: 1.5,
                  }}
                >
                  {item.b}
                </div>
              </div>
            ))}
          </div>
        </Card>
        </>
        )}

        {/* Tip: Automate with ReviewPing */}
        {!isResponseGen && (
        <Card
          style={{
            background: G.successBg,
            border: `1.5px solid ${G.successBd}`,
            textAlign: "center",
            padding: 28,
            marginBottom: 16,
          }}
        >
          <div
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 24,
              marginBottom: 8,
            }}
          >
            Tip: Automate review requests with ReviewPing
          </div>
          <p
            style={{
              color: G.muted,
              fontSize: 14,
              lineHeight: 1.7,
              marginBottom: 20,
            }}
          >
            Manually sharing your review link works, but it is easy to forget
            after a busy day. ReviewPing automates the entire process — sending
            your review link via email or WhatsApp after every service appointment,
            with AI-personalised messages that feel hand-written. Set it up once
            and watch your reviews grow on autopilot.
          </p>
          <Btn size="lg" onClick={onSignup}>
            Start free — no card needed →
          </Btn>
          <p style={{ color: G.muted, fontSize: 12, marginTop: 10 }}>
            14-day free trial · 2-minute setup
          </p>
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
            after every service — via email or WhatsApp, with AI-written personalised
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
        <Wordmark size={44}/>
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
