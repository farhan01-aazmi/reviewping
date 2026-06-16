import { G } from "../../data/theme";
import SEO from "../SEO";
import { INDUSTRIES_DATA } from "../../data/seoPages";
import { Btn, Wordmark } from "../ui";

const INDUSTRY_NAMES = {
  restaurants: "Restaurants",
  clinics: "Clinics",
  salons: "Salons",
  ecommerce: "E-Commerce",
};

const CTA_TEXTS = {
  restaurants: "Start getting more restaurant reviews",
  clinics: "Start getting more patient reviews",
  salons: "Start getting more client reviews",
  ecommerce: "Start getting more product reviews",
};

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

export default function IndustryPage({ type, onSignup, onLogin, onBack }) {
  const data = INDUSTRIES_DATA[type];

  /* ────────────── 404 / not found ────────────── */
  if (!data) {
    const valid = Object.keys(INDUSTRIES_DATA);
    return (
      <>
        <SEO title="Industry not found" description="This industry page doesn't exist." />
        <div
          style={{
            background: G.bg,
            minHeight: "100vh",
            fontFamily: "'Manrope',sans-serif",
            color: G.ink,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 22px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div
              style={{
                fontSize: 72,
                fontFamily: "'Instrument Serif',serif",
                color: G.accent,
                lineHeight: 1,
                marginBottom: 8,
                fontWeight: 400,
              }}
            >
              404
            </div>
            <div
              style={{
                width: 40,
                height: 3,
                background: G.accent,
                margin: "0 auto 20px",
                borderRadius: 2,
                opacity: 0.4,
              }}
            />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                margin: "0 0 10px",
                color: G.ink,
              }}
            >
              Industry not found
            </h1>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.7,
                color: G.muted,
                margin: "0 0 24px",
              }}
            >
              We don&rsquo;t have a page for &ldquo;{type}&rdquo; yet. Try one of
              our industry pages below.
            </p>
            <div
              style={{
                display: "flex",
                gap: 10,
                flexWrap: "wrap",
                justifyContent: "center",
                marginBottom: 28,
              }}
            >
              {valid.map((key) => (
                <span
                  key={key}
                  onClick={() => {
                    window.location.href = `/industry/${key}`;
                  }}
                  style={{
                    fontSize: 14,
                    color: G.accent,
                    textDecoration: "underline",
                    textUnderlineOffset: 3,
                    cursor: "pointer",
                  }}
                >
                  {INDUSTRY_NAMES[key]}
                </span>
              ))}
            </div>
            <Btn onClick={onBack}>← Back to home</Btn>
          </div>
        </div>
      </>
    );
  }

  const typeLabel = INDUSTRY_NAMES[type];
  const ctaText = CTA_TEXTS[type];
  const related = Object.keys(INDUSTRIES_DATA).filter((k) => k !== type);

  return (
    <>
      <SEO
        title={data.title}
        description={data.desc}
        path={`/industry/${type}`}
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
          @media(max-width:640px){.ind-header-nav{display:none!important}}
          @media(max-width:500px){.ind-hero-btns{flex-direction:column;align-items:stretch}}
        `}</style>

        {/* ────────── Header ────────── */}
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
          <div
            style={{ display: "flex", alignItems: "center", gap: 6 }}
            onClick={() => {
              window.location.href = "/";
            }}
          >
            <Wordmark size={56}/>
          </div>
          <nav
            className="ind-header-nav"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 6,
            }}
          >
            {/* Industry quick links */}
            {related.slice(0, 3).map((key) => (
              <Btn
                key={key}
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = `/industry/${key}`;
                }}
              >
                {INDUSTRY_NAMES[key]}
              </Btn>
            ))}
            {/* Spacer */}
            <span
              style={{
                width: 1,
                height: 20,
                background: G.border,
                margin: "0 4px",
              }}
            />
            {NAV_LINKS.map((link) => (
              <Btn
                key={link.label}
                variant="ghost"
                size="sm"
                onClick={() => {
                  window.location.href = link.href;
                }}
              >
                {link.label}
              </Btn>
            ))}
            <Btn variant="ghost" size="sm" onClick={onLogin}>
              Login
            </Btn>
            <Btn size="sm" onClick={onSignup}>
              Start Free Trial
            </Btn>
          </nav>
        </header>

        {/* ────────── Back link ────────── */}
        <div
          style={{ maxWidth: 680, margin: "0 auto", padding: "20px 22px 0" }}
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
              transition: "color 0.15s",
            }}
            onMouseOver={(e) => (e.currentTarget.style.color = G.accent)}
            onMouseOut={(e) => (e.currentTarget.style.color = G.muted)}
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10 12L6 8L10 4" />
            </svg>
            Back
          </div>
        </div>

        {/* ────────── Hero ────────── */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "38px 22px 48px",
          }}
        >
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,8vw,58px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "0 0 20px",
              fontWeight: 400,
            }}
          >
            {data.title}
          </h1>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.8,
              color: G.muted,
              maxWidth: 500,
              margin: "0 0 34px",
            }}
          >
            {data.desc}
          </p>
          <div
            className="ind-hero-btns"
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
              marginBottom: 14,
            }}
          >
            <Btn size="lg" onClick={onSignup}>
              Start free — no card needed
            </Btn>
            <Btn variant="secondary" size="lg" onClick={onLogin}>
              Sign in →
            </Btn>
          </div>
          <p style={{ fontSize: 12.5, color: G.muted, margin: 0 }}>
            14-day free trial · Setup in 2 minutes · Cancel anytime
          </p>
        </section>

        {/* ────────── Content ────────── */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 22px 64px",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: G.accent,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            About
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 32,
              fontWeight: 400,
              margin: "0 0 24px",
              letterSpacing: "-0.8px",
            }}
          >
            Why {typeLabel} choose ReviewPing
          </h2>
          {data.content.map((paragraph, i) => (
            <p
              key={i}
              style={{
                fontSize: 15,
                lineHeight: 1.8,
                color: G.inkSoft,
                margin: "0 0 18px",
              }}
            >
              {paragraph}
            </p>
          ))}
          <div style={{ marginTop: 22 }}>
            <a
              href="/features"
              style={{
                color: G.accent,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Explore all ReviewPing features →
            </a>
          </div>
        </section>

        {/* ────────── Benefits ────────── */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 22px 64px",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: G.accent,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              margin: "0 0 10px",
            }}
          >
            Benefits
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 32,
              fontWeight: 400,
              margin: "0 0 24px",
              letterSpacing: "-0.8px",
            }}
          >
            Built for {typeLabel}
          </h2>
          <div
            style={{
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 12,
              padding: "24px 28px",
            }}
          >
            {data.benefits.map((benefit, i) => (
              <div
                key={i}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 12,
                  marginBottom:
                    i < data.benefits.length - 1 ? 16 : 0,
                }}
              >
                <span
                  style={{
                    color: G.accent,
                    fontSize: 16,
                    fontWeight: 700,
                    flexShrink: 0,
                  }}
                >
                  ✓
                </span>
                <span style={{ fontSize: 15, color: G.inkSoft }}>
                  {benefit}
                </span>
              </div>
            ))}
          </div>
        </section>

        {/* ────────── CTA ────────── */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 22px 64px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 16,
              padding: "48px 28px",
              boxShadow: "0 4px 24px rgba(0,0,0,0.05)",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 28,
                fontWeight: 400,
                margin: "0 0 12px",
                letterSpacing: "-0.5px",
              }}
            >
              Ready to grow?
            </h2>
            <p
              style={{
                fontSize: 15,
                color: G.muted,
                lineHeight: 1.6,
                maxWidth: 400,
                margin: "0 auto 28px",
              }}
            >
              {ctaText}
            </p>
            <Btn
              size="lg"
              onClick={onSignup}
              style={{ minWidth: 260 }}
            >
              Start your free 14-day trial →
            </Btn>
            <p
              style={{
                color: G.muted,
                fontSize: 12.5,
                marginTop: 10,
              }}
            >
              No credit card required
            </p>
          </div>
        </section>

        {/* ────────── Related Industries ────────── */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "0 22px 64px",
            textAlign: "center",
          }}
        >
          <p
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: G.accent,
              letterSpacing: "1.5px",
              textTransform: "uppercase",
              margin: "0 0 14px",
            }}
          >
            Also serving
          </p>
          <div
            style={{
              display: "flex",
              gap: 10,
              justifyContent: "center",
              flexWrap: "wrap",
              marginBottom: 18,
            }}
          >
            {related.map((key) => (
              <span
                key={key}
                onClick={() => {
                  window.location.href = `/industry/${key}`;
                }}
                style={{
                  display: "inline-block",
                  padding: "9px 20px",
                  background: G.surface,
                  border: `1.5px solid ${G.border}`,
                  borderRadius: 8,
                  color: G.inkSoft,
                  fontSize: 14,
                  fontWeight: 500,
                  cursor: "pointer",
                  transition: "all 0.15s",
                }}
                onMouseOver={(e) => {
                  e.currentTarget.style.borderColor = G.accent;
                  e.currentTarget.style.color = G.accent;
                }}
                onMouseOut={(e) => {
                  e.currentTarget.style.borderColor = G.border;
                  e.currentTarget.style.color = G.inkSoft;
                }}
              >
                {INDUSTRY_NAMES[key]}
              </span>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 20,
              justifyContent: "center",
              flexWrap: "wrap",
            }}
          >
            <a
              href="/pricing"
              style={{
                color: G.accent,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              View pricing →
            </a>
            <a
              href="/features"
              style={{
                color: G.accent,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              See all features →
            </a>
            <a
              href="/blog"
              style={{
                color: G.accent,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: "underline",
                textUnderlineOffset: 3,
              }}
            >
              Read the blog →
            </a>
          </div>
        </section>

        {/* ────────── Footer ────────── */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "28px 22px",
            textAlign: "center",
          }}
        >
          <div
            onClick={() => {
              window.location.href = "/";
            }}
            style={{ cursor: "pointer", display: "inline-block" }}
          >
            <Wordmark size={44}/>
          </div>
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
              { label: "Pricing", href: "/pricing" },
              { label: "FAQ", href: "/faq" },
              { label: "Blog", href: "/blog" },
            ].map((link) => (
              <span
                key={link.label}
                onClick={() => {
                  window.location.href = link.href;
                }}
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  cursor: "pointer",
                  transition: "color 0.15s",
                }}
                onMouseOver={(e) =>
                  (e.currentTarget.style.color = G.accent)
                }
                onMouseOut={(e) =>
                  (e.currentTarget.style.color = G.muted)
                }
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
