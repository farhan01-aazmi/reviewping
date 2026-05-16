import { useState } from "react";
import { G } from "../../data/theme";
import { Card, Field, Btn, Wordmark, Pill } from "../ui";

export default function FreeTool({ onSignup }) {
  const [bizName, setBizName] = useState("");
  const [placeId, setPlaceId] = useState("");
  const [generated, setGenerated] = useState(false);
  const [copied, setCopied] = useState(false);

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
        <Wordmark size={15} />
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
            Google Review Link Generator
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
            Generate a direct link to your Google review page in seconds. Share it
            anywhere — SMS, email, receipts, or social media.
          </p>
        </div>

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

        {generated && (
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
        <Wordmark size={13} />
        <div style={{ display: "flex", gap: 16 }}>
          {["Privacy Policy", "Terms of Service", "Help"].map((l) => (
            <span
              key={l}
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
            >
              {l}
            </span>
          ))}
        </div>
      </footer>
    </div>
  );
}
