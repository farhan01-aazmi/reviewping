import { G } from "../../data/theme";
import { FEATURES_DATA } from "../../data/seoPages";
import SEO from "../SEO";
import { Btn, Wordmark } from "../ui";

export default function FeaturesPage({ onSignup, onLogin, onBack }) {
  return (
    <>
      <SEO
        title="Features — Everything you need to get more Google Reviews"
        description="ReviewPing helps businesses automate Google review requests via SMS and email. AI-powered replies, real-time analytics, multi-location support, and more."
        path="/features"
      />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
      >
        <style>{`
          @keyframes fs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          .ft{animation:fs 0.35s ease}
          .fade-in{animation:fs 0.4s ease both}
          @media(max-width:640px){.features-grid{grid-template-columns:1fr!important}}
        `}</style>

        {/* ────────────────────── Header ────────────────────── */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 22px",
            borderBottom: `1px solid ${G.border}`,
            background: G.bg,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Wordmark size={15} />
          </div>
          <nav
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => { window.location.href = "/features"; }}
            >
              Features
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => { window.location.href = "/pricing"; }}
            >
              Pricing
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => { window.location.href = "/blog"; }}
            >
              Blog
            </Btn>
            <Btn
              variant="ghost"
              size="sm"
              onClick={() => { window.location.href = "/faq"; }}
            >
              FAQ
            </Btn>
            <Btn variant="ghost" size="sm" onClick={onLogin}>
              Login
            </Btn>
            <Btn size="sm" onClick={onSignup}>
              Start Free Trial
            </Btn>
          </nav>
        </header>

        {/* ────────────────────── Hero ────────────────────── */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "72px 22px 52px",
            textAlign: "center",
          }}
        >
          <div
            onClick={onBack}
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: 6,
              fontSize: 13.5,
              color: G.muted,
              cursor: "pointer",
              marginBottom: 18,
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = G.accent)}
            onMouseOut={(e) => (e.currentTarget.style.color = G.muted)}
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10 12L6 8L10 4" />
            </svg>
            Back
          </div>

          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,7vw,52px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "0 0 16px",
              fontWeight: 400,
            }}
          >
            Everything you need to get more{" "}
            <em style={{ color: G.accent }}>Google Reviews</em>
          </h1>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.8,
              color: G.muted,
              maxWidth: 600,
              margin: "0 auto 0",
            }}
          >
            Automate review requests, track performance, respond intelligently,
            and grow your reputation — all from one simple dashboard.
          </p>
        </section>

        {/* ────────────────────── Features Grid ────────────────────── */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 22px 64px",
          }}
        >
          <div
            className="features-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 20,
            }}
          >
            {FEATURES_DATA.map((feature, i) => (
              <div
                key={feature.title}
                className="fade-in"
                style={{
                  animationDelay: `${i * 0.05}s`,
                  background: G.surface,
                  border: `1.5px solid ${G.border}`,
                  borderRadius: 14,
                  padding: "28px 26px",
                  transition: "box-shadow 0.2s, transform 0.2s",
                  cursor: "default",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.boxShadow = "0 8px 32px rgba(0,0,0,0.07)";
                  e.currentTarget.style.transform = "translateY(-2px)";
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.boxShadow = "none";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                <div
                  style={{
                    fontSize: 32,
                    lineHeight: 1,
                    marginBottom: 14,
                  }}
                >
                  {feature.icon}
                </div>
                <h2
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 21,
                    fontWeight: 500,
                    margin: "0 0 10px",
                    letterSpacing: "-0.3px",
                    color: G.ink,
                  }}
                >
                  {feature.title}
                </h2>
                <p
                  style={{
                    fontSize: 14,
                    lineHeight: 1.7,
                    color: G.muted,
                    margin: "0 0 16px",
                  }}
                >
                  {feature.desc}
                </p>
                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: 0,
                    display: "flex",
                    flexDirection: "column",
                    gap: 8,
                  }}
                >
                  {feature.points.map((point) => (
                    <li
                      key={point}
                      style={{
                        display: "flex",
                        alignItems: "flex-start",
                        gap: 8,
                        fontSize: 13.5,
                        color: G.inkSoft,
                        lineHeight: 1.5,
                      }}
                    >
                      <span
                        style={{
                          color: G.accent,
                          fontSize: 13,
                          fontWeight: 700,
                          flexShrink: 0,
                          marginTop: 2,
                        }}
                      >
                        ✓
                      </span>
                      {point}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </section>

        {/* ────────────────────── CTA ────────────────────── */}
        <section
          style={{
            maxWidth: 1100,
            margin: "0 auto",
            padding: "0 22px 72px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 16,
              padding: "52px 32px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: "clamp(28px,5vw,38px)",
                fontWeight: 400,
                margin: "0 0 10px",
                letterSpacing: "-0.8px",
              }}
            >
              Ready to get started?
            </h2>
            <p
              style={{
                fontSize: 15,
                color: G.muted,
                lineHeight: 1.6,
                maxWidth: 460,
                margin: "0 auto 28px",
              }}
            >
              Join thousands of businesses using ReviewPing to automate their
              review requests and grow their reputation.
            </p>
            <Btn size="lg" onClick={onSignup}>
              Start Free Trial →
            </Btn>
            <p
              style={{
                fontSize: 12.5,
                color: G.muted,
                margin: "12px 0 0",
              }}
            >
              No credit card required · 14-day free trial · Cancel anytime
            </p>
          </div>
        </section>

        {/* ────────────────────── Footer ────────────────────── */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "28px 22px",
            textAlign: "center",
          }}
        >
          <Wordmark size={13} />
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              marginTop: 14,
              flexWrap: "wrap",
            }}
          >
            {[
              { label: "Privacy Policy", href: "/privacy" },
              { label: "Terms of Service", href: "/terms" },
              { label: "Features", href: "/features" },
              { label: "FAQ", href: "/faq" },
              { label: "Blog", href: "/blog" },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => { window.location.href = link.href; }}
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) => (e.currentTarget.style.color = G.accent)}
                onMouseOut={(e) => (e.currentTarget.style.color = G.muted)}
              >
                {link.label}
              </span>
            ))}
          </div>
          <p
            style={{
              color: G.muted,
              fontSize: 12,
              marginTop: 12,
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
