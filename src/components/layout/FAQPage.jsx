import { useState } from "react";
import { G } from "../../data/theme";
import { Wordmark, Btn } from "../ui";
import SEO from "../SEO";
import { FAQ_DATA } from "../../data/seoPages";

export default function FAQPage({ onSignup, onLogin, onBack }) {
  const [openIndex, setOpenIndex] = useState(null);

  const toggle = (i) => setOpenIndex(openIndex === i ? null : i);

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: FAQ_DATA.map((item) => ({
      "@type": "Question",
      name: item.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: item.a,
      },
    })),
  };

  return (
    <>
      <SEO
        title="Frequently Asked Questions"
        description="Find answers to common questions about ReviewPing — review request automation, pricing, GDPR compliance, SMS vs email, and more."
        path="/faq"
      />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
      >
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        <style>{`
          @keyframes faqIn{from{opacity:0;max-height:0}to{opacity:1;max-height:600px}}
          .faq-content{animation:faqIn 0.3s ease forwards;overflow:hidden}
          .faq-btn{transition:all 0.15s ease}
          .faq-btn:hover{background:${G.accentBg}!important}
        `}</style>

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
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <Btn variant="ghost" size="sm" onClick={onBack}>
              ← Back
            </Btn>
            <Wordmark size={30}/>
          </div>
          <nav style={{ display: "flex", alignItems: "center", gap: 6 }}>
            <Btn variant="ghost" size="sm" onClick={onLogin}>
              Sign in
            </Btn>
            <Btn size="sm" onClick={onSignup}>
              Start free →
            </Btn>
          </nav>
        </header>

        {/* Hero */}
        <section
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "60px 22px 20px",
            textAlign: "center",
          }}
        >
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
            Frequently Asked
            <br />
            <em style={{ color: G.accent }}>Questions</em>
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.7,
              color: G.muted,
              maxWidth: 480,
              margin: "0 auto 0",
            }}
          >
            Everything you need to know about ReviewPing. Can't find what you're
            looking for? Reach out and we'll help.
          </p>
        </section>

        {/* FAQ Accordion */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto",
            padding: "28px 22px 48px",
          }}
        >
          {FAQ_DATA.map((item, i) => {
            const isOpen = openIndex === i;
            return (
              <div
                key={i}
                style={{
                  background: G.surface,
                  border: `1.5px solid ${isOpen ? G.accent : G.border}`,
                  borderRadius: 12,
                  marginBottom: 10,
                  overflow: "hidden",
                  transition: "border-color 0.2s",
                }}
              >
                <button
                  onClick={() => toggle(i)}
                  className="faq-btn"
                  aria-expanded={isOpen}
                  aria-controls={`faq-answer-${i}`}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    width: "100%",
                    padding: "18px 22px",
                    border: "none",
                    background: "transparent",
                    cursor: "pointer",
                    fontFamily: "'Manrope',sans-serif",
                    fontSize: 15.5,
                    fontWeight: 600,
                    color: G.ink,
                    textAlign: "left",
                    gap: 16,
                    lineHeight: 1.4,
                  }}
                >
                  <span>{item.q}</span>
                  <span
                    style={{
                      flexShrink: 0,
                      fontSize: 18,
                      color: isOpen ? G.accent : G.muted,
                      transition: "transform 0.2s ease, color 0.2s",
                      transform: isOpen ? "rotate(45deg)" : "rotate(0deg)",
                      lineHeight: 1,
                    }}
                  >
                    +
                  </span>
                </button>
                <div
                  id={`faq-answer-${i}`}
                  role="region"
                  style={{
                    maxHeight: isOpen ? "600px" : "0px",
                    opacity: isOpen ? 1 : 0,
                    overflow: "hidden",
                    transition: "max-height 0.35s ease, opacity 0.25s ease",
                  }}
                >
                  <div
                    className="faq-content"
                    style={{
                      padding: isOpen ? "0 22px 20px" : "0 22px",
                      fontSize: 14.5,
                      lineHeight: 1.8,
                      color: G.inkSoft,
                    }}
                  >
                    {item.a}
                  </div>
                </div>
              </div>
            );
          })}
        </section>

        {/* CTA — Still have questions? */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto",
            padding: "0 22px 56px",
            textAlign: "center",
          }}
        >
          <div
            style={{
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 16,
              padding: "40px 28px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 28,
                fontWeight: 400,
                margin: "0 0 10px",
                letterSpacing: "-0.5px",
              }}
            >
              Still have questions?
            </h2>
            <p
              style={{
                fontSize: 14.5,
                color: G.muted,
                lineHeight: 1.7,
                margin: "0 auto 24px",
                  maxWidth: 400,
              }}
            >
              We're here to help. Reach out to our team and we'll get back to you
              within a few hours.
            </p>
            <a
              href="mailto:hello@reviewping.io"
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: 8,
                padding: "14px 28px",
                background: G.accent,
                color: "#fff",
                borderRadius: 12,
                fontFamily: "'Manrope',sans-serif",
                fontWeight: 600,
                fontSize: 15,
                textDecoration: "none",
                transition: "background 0.15s ease",
              }}
              onMouseEnter={(e) => (e.currentTarget.style.background = G.accentHi)}
              onMouseLeave={(e) => (e.currentTarget.style.background = G.accent)}
            >
              hello@reviewping.io →
            </a>
          </div>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "22px",
            textAlign: "center",
          }}
        >
          <Wordmark size={26}/>
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
              style={{ fontSize: 12.5, color: G.muted, cursor: "default" }}
            >
              Privacy Policy
            </span>
            <span
              style={{ fontSize: 12.5, color: G.muted, cursor: "default" }}
            >
              Terms of Service
            </span>
            <span
              style={{ fontSize: 12.5, color: G.muted, cursor: "default" }}
            >
              Free Review Link Tool
            </span>
            <span
              style={{ fontSize: 12.5, color: G.muted, cursor: "default" }}
            >
              Help
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

