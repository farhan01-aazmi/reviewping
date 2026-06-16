import { G } from "../../data/theme";
import { Wordmark, Btn, Pill } from "../ui";
import SEO from "../SEO";

export default function ContactPage({ onSignup, onLogin, onBack }) {
  return (
    <>
      <SEO
        title="Contact Us"
        description="Get in touch with ReviewPing. Email hello@reviewping.io for support, sales, or general inquiries. We reply within 2 hours during business hours."
        path="/contact"
      />

      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
      >
        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 22px",
            borderBottom: `1px solid ${G.border}`,
            background: G.surface,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <Wordmark size={40}/>
          <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
            <span
              onClick={onBack}
              style={{
                fontSize: 13.5,
                color: G.muted,
                cursor: "pointer",
                fontWeight: 500,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.color = G.ink)}
              onMouseLeave={(e) => (e.target.style.color = G.muted)}
            >
              Home
            </span>
            <span
              style={{
                fontSize: 13.5,
                color: G.muted,
                cursor: "default",
                fontWeight: 500,
              }}
            >
              About
            </span>
            <span
              style={{
                fontSize: 13.5,
                color: G.accent,
                cursor: "default",
                fontWeight: 700,
              }}
            >
              Contact
            </span>
            <Btn variant="ghost" size="sm" onClick={onLogin}>
              Sign in
            </Btn>
            <Btn size="sm" onClick={onSignup}>
              Start free →
            </Btn>
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "68px 22px 36px",
            textAlign: "center",
          }}
        >
          <Pill label="Contact" variant="inactive" />
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,8vw,52px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "16px 0 16px",
              fontWeight: 400,
            }}
          >
            Get in touch
          </h1>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.8,
              color: G.muted,
              maxWidth: 480,
              margin: "0 auto",
            }}
          >
            We'd love to hear from you. Email us directly and a real human will
            respond — usually within two hours.
          </p>
        </section>

        {/* Contact methods */}
        <section
          style={{
            maxWidth: 580,
            margin: "0 auto 48px",
            padding: "0 22px",
          }}
        >
          <div
            style={{
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 14,
              padding: "32px 28px",
            }}
          >
            {/* Email */}
            <div style={{ marginBottom: 28, textAlign: "center" }}>
              <div
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: G.accent,
                  letterSpacing: "1.5px",
                  textTransform: "uppercase",
                  margin: "0 0 10px",
                }}
              >
                Email us
              </div>
              <a
                href="mailto:hello@reviewping.io"
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 28,
                  color: G.ink,
                  textDecoration: "none",
                  fontWeight: 400,
                  letterSpacing: "-0.5px",
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.color = G.accent)}
                onMouseLeave={(e) => (e.target.style.color = G.ink)}
              >
                hello@reviewping.io
              </a>
              <p
                style={{
                  fontSize: 13.5,
                  color: G.muted,
                  margin: "8px 0 0",
                }}
              >
                We reply within 2 hours during business hours
              </p>
            </div>

            {/* Divider */}
            <div
              style={{
                height: 1,
                background: G.border,
                margin: "0 0 28px",
              }}
            />

            {/* Office hours */}
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: 20,
              }}
            >
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.accent,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Office Hours
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: G.inkSoft }}>
                  <div>Mon – Fri</div>
                  <div>8:00 AM — 6:00 PM</div>
                  <div style={{ color: G.muted, fontSize: 13 }}>UK & US timezones</div>
                </div>
              </div>
              <div>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.accent,
                    letterSpacing: "1.5px",
                    textTransform: "uppercase",
                    marginBottom: 8,
                  }}
                >
                  Response Time
                </div>
                <div style={{ fontSize: 14, lineHeight: 1.8, color: G.inkSoft }}>
                  <div>Email: &lt; 2 hours</div>
                  <div>Weekend: &lt; 12 hours</div>
                  <div style={{ color: G.muted, fontSize: 13 }}>
                    Emergencies: same-day
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Direct CTA note */}
          <div
            style={{
              textAlign: "center",
              marginTop: 18,
              padding: "14px 20px",
              background: G.accentBg,
              border: `1px solid ${G.accentBd}`,
              borderRadius: 10,
            }}
          >
            <p
              style={{
                fontSize: 13.5,
                color: G.inkSoft,
                margin: 0,
                lineHeight: 1.6,
              }}
            >
              <strong style={{ color: G.accent }}>hello@reviewping.io</strong> — email us
              directly and we'll get back to you within two hours.
            </p>
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            maxWidth: 580,
            margin: "0 auto 64px",
            padding: "0 22px",
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 24,
              fontWeight: 400,
              margin: "0 0 8px",
              letterSpacing: "-0.5px",
            }}
          >
            Not ready to email?
          </h2>
          <p style={{ fontSize: 14, color: G.muted, margin: "0 0 20px" }}>
            Start your free trial and see ReviewPing in action — no commitment
            needed.
          </p>
          <Btn size="lg" onClick={onSignup}>
            Start free trial →
          </Btn>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "22px",
            textAlign: "center",
          }}
        >
          <Wordmark size={34}/>
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            <span
              onClick={onBack}
              style={{ fontSize: 12.5, color: G.muted, cursor: "pointer" }}
            >
              Home
            </span>
            <span style={{ fontSize: 12.5, color: G.muted, cursor: "default" }}>
              About
            </span>
            <span
              style={{
                fontSize: 12.5,
                color: G.accent,
                cursor: "default",
                fontWeight: 600,
              }}
            >
              Contact
            </span>
          </div>
          <p
            style={{
              color: G.muted,
              fontSize: 12,
              marginTop: 10,
              marginBottom: 0,
            }}
          >
            © 2026 ReviewPing · USA & UK · GDPR Compliant · hello@reviewping.io
          </p>
        </footer>
      </div>
    </>
  );
}
