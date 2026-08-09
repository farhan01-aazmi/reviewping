import { G } from "../../data/theme";
import { Wordmark, Btn, Pill } from "../ui";
import SEO from "../SEO";

export default function ContactPage({ onSignup, onLogin, onBack }) {
  const faqs = [
    {
      q: "Which plan is right for my business?",
      a: "It depends on your review volume and team size. The Free plan works well for solo businesses sending up to 25 requests per month. Starter ($29/mo) is ideal for growing businesses that want email and WhatsApp support. Pro ($79/mo) unlocks unlimited requests, AI personalisation, and advanced analytics. Agency ($149/mo) adds multi-location support, white-labeling, API access, and team accounts. If you are unsure, start with the Free plan — you can upgrade at any time with no penalties or data loss.",
    },
    {
      q: "Can I migrate from another review tool?",
      a: "Absolutely. Most tools let you export your customer list as a CSV. You can import that directly into ReviewPing, map your contact fields, and be up and running in under 10 minutes. We also offer a concierge migration service for Starter and above plans — our team will handle the import for you and verify everything is working. Just email us the export and we will take care of the rest at no additional charge.",
    },
    {
      q: "Can I get a demo before signing up?",
      a: "Yes — we offer personalised 15-minute walkthroughs for anyone evaluating the Pro or Agency plans. You will see our dashboard, review request flow, analytics, and AI reply generator in action. Simply email hello@reviewping.io with \"Demo request\" in the subject line and a few time slots that work for you. We will send a calendar invite within one business day. No sales pitch — just a product walkthrough followed by a Q&A.",
    },
    {
      q: "What information should I include in my first email?",
      a: "To help us respond as quickly as possible, please include: your business name and website URL, the plan tier you are interested in (or your current plan if you are an existing customer), a brief description of what you need help with, and any relevant screenshots or error messages. If you are reaching out about billing, include the email address associated with your ReviewPing account. This information helps our team route your inquiry to the right person on the first pass.",
    },
  ];

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
          <Wordmark size={56}/>
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
            We'd love to hear from you. Whether you have a question about your
            account, need help choosing a plan, or just want to say hello — email
            us directly and a real human will respond, usually within two hours.
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

        {/* FAQ: Common questions before reaching out */}
        <section
          style={{
            maxWidth: 640,
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
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 8px",
                letterSpacing: "-0.5px",
              }}
            >
              Common questions before reaching out
            </h2>
            <p
              style={{
                fontSize: 13.5,
                color: G.muted,
                margin: "0 0 24px",
                lineHeight: 1.6,
              }}
            >
              We answer these questions every day. If yours is listed below, the
              answer may already be here — saving you a reply wait.
            </p>
            {faqs.map((item, i) => (
              <div
                key={i}
                style={{
                  marginBottom: i < faqs.length - 1 ? 20 : 0,
                  paddingBottom: i < faqs.length - 1 ? 20 : 0,
                  borderBottom:
                    i < faqs.length - 1 ? `1px solid ${G.border}` : "none",
                }}
              >
                <div
                  style={{
                    fontWeight: 700,
                    fontSize: 13.5,
                    color: G.ink,
                    marginBottom: 6,
                    lineHeight: 1.5,
                  }}
                >
                  {item.q}
                </div>
                <div
                  style={{
                    fontSize: 13.5,
                    color: G.muted,
                    lineHeight: 1.7,
                  }}
                >
                  {item.a}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Response times & support hours */}
        <section
          style={{
            maxWidth: 640,
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
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 16px",
                letterSpacing: "-0.5px",
              }}
            >
              Response times & support hours
            </h2>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr 1fr",
                gap: 16,
                textAlign: "center",
              }}
            >
              <div
                style={{
                  background: G.accentBg,
                  borderRadius: 10,
                  padding: "16px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.accent,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Email Support
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.ink }}>
                  &lt; 2 hours
                </div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
                  Mon–Fri, 8 AM – 6 PM
                </div>
              </div>
              <div
                style={{
                  background: G.goldBg,
                  borderRadius: 10,
                  padding: "16px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.gold,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Weekend
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.ink }}>
                  &lt; 12 hours
                </div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
                  Sat–Sun, limited hours
                </div>
              </div>
              <div
                style={{
                  background: G.successBg,
                  borderRadius: 10,
                  padding: "16px 12px",
                }}
              >
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.success,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 6,
                  }}
                >
                  Emergencies
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: G.ink }}>
                  Same day
                </div>
                <div style={{ fontSize: 12, color: G.muted, marginTop: 4 }}>
                  Any day, response within hours
                </div>
              </div>
            </div>
            <p
              style={{
                fontSize: 13,
                color: G.muted,
                margin: "18px 0 0",
                lineHeight: 1.6,
              }}
            >
              Our team operates across UK and US timezones, so you will almost
              always catch someone awake during standard business hours. For
              urgent billing or account issues marked with &ldquo;Urgent&rdquo;
              in the subject line, we prioritise your message and respond same-day
              regardless of the day of the week.
            </p>
          </div>
        </section>

        {/* Office locations / remote team */}
        <section
          style={{
            maxWidth: 640,
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
              textAlign: "center",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 12px",
                letterSpacing: "-0.5px",
              }}
            >
              Where we are
            </h2>
            <p
              style={{
                fontSize: 14,
                color: G.inkSoft,
                lineHeight: 1.7,
                margin: "0 0 16px",
                maxWidth: 440,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              ReviewPing is a fully remote team with roots in the United States
              and the United Kingdom. We do not operate a public office, but our
              team members are located across London, New York, and Austin —
              which is why we cover overlapping business hours across both US and
              UK timezones. If you need to send us physical mail or legal
              correspondence, please email us first and we will provide our
              registered address.
            </p>
            <div
              style={{
                display: "flex",
                justifyContent: "center",
                gap: 24,
                flexWrap: "wrap",
              }}
            >
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.accent,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  London
                </div>
                <div style={{ fontSize: 13, color: G.muted }}>UK Team</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.accent,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  New York
                </div>
                <div style={{ fontSize: 13, color: G.muted }}>US East Coast</div>
              </div>
              <div style={{ textAlign: "center" }}>
                <div
                  style={{
                    fontSize: 11,
                    fontWeight: 700,
                    color: G.accent,
                    letterSpacing: "1px",
                    textTransform: "uppercase",
                    marginBottom: 4,
                  }}
                >
                  Austin
                </div>
                <div style={{ fontSize: 13, color: G.muted }}>US Central</div>
              </div>
            </div>
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
          <Wordmark size={44}/>
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
