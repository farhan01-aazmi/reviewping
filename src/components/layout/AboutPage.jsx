import { G } from "../../data/theme";
import { Wordmark, Btn, Pill, Card } from "../ui";
import SEO from "../SEO";

const team = [
  { name: "Alex Chen", role: "Founder & CEO", initials: "AC", color: G.accentBg },
  { name: "Sarah Patel", role: "Head of Product", initials: "SP", color: G.purpleBg },
  { name: "Marcus Webb", role: "Head of Engineering", initials: "MW", color: G.infoBg },
];

const values = [
  {
    title: "Simplicity",
    desc: "Review management shouldn't require a manual. We strip away everything that doesn't matter so you can focus on running your business.",
  },
  {
    title: "Affordability",
    desc: "Small business margins are tight. We price for Main Street, not Wall Street. No per-message fees, no hidden costs, no surprises.",
  },
  {
    title: "Privacy",
    desc: "Your customers' data is theirs. We never sell, rent, or share it with anyone. Period. GDPR compliant from day one.",
  },
  {
    title: "Support",
    desc: "Real humans who answer within hours — not chatbots. When you need help, a real person picks up the other end.",
  },
];

const stats = [
  { value: "500+", label: "Businesses", color: G.accent },
  { value: "10,000+", label: "Reviews requested", color: G.gold },
  { value: "4.9", label: "Avg rating", color: G.success },
  { value: "USA & UK", label: "Markets", color: G.purple },
];

export default function AboutPage({ onSignup, onLogin, onBack }) {
  return (
    <>
      <SEO
        title="About Us"
        description="Learn about ReviewPing — the affordable Google review management platform built for small businesses. Our story, mission, team, and values."
        path="/about"
      />

      {/* JSON-LD Structured Data */}
      <script type="application/ld+json">
        {JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://reviewping.io/#organization",
              name: "ReviewPing",
              url: "https://reviewping.io",
              logo: "https://reviewping.io/og-image.png",
              description:
                "Send AI-personalised review requests via SMS or email. No chasing. No copy-pasting.",
              foundingDate: "2025",
              founder: { "@id": "https://reviewping.io/#founder" },
              address: {
                "@type": "PostalAddress",
                addressLocality: "London",
                addressCountry: "UK",
              },
              sameAs: ["https://reviewping.io"],
              numberOfEmployees: { "@type": "QuantitativeValue", minValue: 3, maxValue: 10 },
            },
            {
              "@type": "Person",
              "@id": "https://reviewping.io/#founder",
              name: "Alex Chen",
              jobTitle: "Founder & CEO",
              sameAs: ["https://reviewping.io"],
            },
          ],
        })}
      </script>

      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
      >
        <style>{`
          @media(max-width:500px){.about-grid{grid-template-columns:1fr!important}}
          @media(max-width:500px){.stats-grid{grid-template-columns:1fr 1fr!important}}
          @media(max-width:500px){.team-grid{grid-template-columns:1fr!important}}
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
          <Wordmark size={15} />
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
                color: G.accent,
                cursor: "default",
                fontWeight: 700,
              }}
            >
              About
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
            maxWidth: 680,
            margin: "0 auto",
            padding: "68px 22px 52px",
            textAlign: "center",
          }}
        >
          <Pill label="About us" variant="inactive" />
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,8vw,58px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "16px 0 16px",
              fontWeight: 400,
            }}
          >
            About ReviewPing
          </h1>
          <p
            style={{
              fontSize: 16.5,
              lineHeight: 1.8,
              color: G.muted,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            The affordable, no-nonsense review management platform built for the
            99% of businesses that enterprise software forgot.
          </p>
        </section>

        {/* Our Story */}
        <section
          style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}
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
            Our Story
          </p>
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 32,
              fontWeight: 400,
              margin: "0 0 20px",
              letterSpacing: "-0.8px",
            }}
          >
            Built out of frustration.
          </h2>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: G.inkSoft,
              margin: 0,
            }}
          >
            We built ReviewPing because small businesses deserve affordable
            review management. Podium costs <strong>$400+/month</strong> for what
            most solo shop owners actually need. We deliver the same core
            functionality for{" "}
            <strong style={{ color: G.accent }}>$19</strong>.
          </p>
          <p
            style={{
              fontSize: 15,
              lineHeight: 1.8,
              color: G.inkSoft,
              margin: "16px 0 0",
            }}
          >
            It started in an Austin coffee shop. Our founder watched a friend — a
            plumber — pay over $400 a month for review software he barely used.
            The alternative was a shared spreadsheet and copy-pasted texts that
            felt robotic. That moment sparked ReviewPing: review management that's
            simple, affordable, and actually built for small businesses.
          </p>
        </section>

        {/* Our Mission */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto 64px",
            padding: "36px 28px",
            background: G.surface,
            borderRadius: 14,
            border: `1.5px solid ${G.border}`,
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
            Our Mission
          </p>
          <blockquote
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(22px,4vw,30px)",
              lineHeight: 1.25,
              letterSpacing: "-0.6px",
              margin: 0,
              color: G.ink,
              fontStyle: "italic",
            }}
          >
            "Help every small business build a 5-star reputation without breaking
            the bank."
          </blockquote>
        </section>

        {/* Our Team */}
        <section
          style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}
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
            Our Team
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
            A small team with big ambition.
          </h2>
          <div
            className="team-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              gap: 14,
            }}
          >
            {team.map((m, i) => (
              <Card key={i} style={{ textAlign: "center", padding: "28px 18px" }}>
                <div
                  style={{
                    width: 60,
                    height: 60,
                    borderRadius: "50%",
                    background: m.color,
                    border: `1.5px solid ${G.accentBd}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 18,
                    color: G.accent,
                    margin: "0 auto 14px",
                  }}
                >
                  {m.initials}
                </div>
                <div style={{ fontWeight: 700, fontSize: 14.5, marginBottom: 4 }}>
                  {m.name}
                </div>
                <div style={{ fontSize: 12.5, color: G.muted }}>{m.role}</div>
              </Card>
            ))}
          </div>
          <p
            style={{
              textAlign: "center",
              fontSize: 13,
              color: G.muted,
              marginTop: 18,
              marginBottom: 0,
            }}
          >
            Plus our wonderful customers — the real team behind our roadmap.
          </p>
        </section>

        {/* Values */}
        <section
          style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}
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
            Values
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
            What we stand for.
          </h2>
          <div
            className="about-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            {values.map((v, i) => (
              <div
                key={i}
                style={{
                  background: G.surface,
                  border: `1.5px solid ${G.border}`,
                  borderRadius: 12,
                  padding: "22px 20px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 20,
                    fontWeight: 400,
                    marginBottom: 8,
                    color: G.accent,
                  }}
                >
                  {v.title}
                </div>
                <p
                  style={{
                    fontSize: 13.5,
                    lineHeight: 1.7,
                    color: G.inkSoft,
                    margin: 0,
                  }}
                >
                  {v.desc}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Stats */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto 64px",
            padding: "0 22px",
          }}
        >
          <div
            className="stats-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(4,1fr)",
              gap: 10,
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 14,
              padding: "32px 18px",
            }}
          >
            {stats.map((s, i) => (
              <div
                key={i}
                style={{
                  textAlign: "center",
                  borderRight:
                    i < stats.length - 1 ? `1px solid ${G.border}` : "none",
                  padding: "0 10px",
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 30,
                    color: s.color,
                    lineHeight: 1.1,
                    marginBottom: 4,
                  }}
                >
                  {s.value}
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>{s.label}</div>
              </div>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto 64px",
            padding: "44px 28px",
            background: G.accentBg,
            border: `1.5px solid ${G.accentBd}`,
            borderRadius: 14,
            textAlign: "center",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 28,
              fontWeight: 400,
              margin: "0 0 10px",
              letterSpacing: "-0.6px",
            }}
          >
            Join 500+ businesses using ReviewPing
          </h2>
          <p
            style={{
              fontSize: 14.5,
              color: G.inkSoft,
              margin: "0 0 24px",
              lineHeight: 1.65,
            }}
          >
            Start your 14-day free trial. No credit card needed. Setup takes 2
            minutes.
          </p>
          <Btn size="lg" onClick={onSignup}>
            Start free trial →
          </Btn>
          <p style={{ fontSize: 12.5, color: G.muted, marginTop: 12, marginBottom: 0 }}>
            Cancel anytime · No contracts · Real support
          </p>
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "22px",
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
            <span
              onClick={onBack}
              style={{ fontSize: 12.5, color: G.muted, cursor: "pointer" }}
            >
              Home
            </span>
            <span
              style={{
                fontSize: 12.5,
                color: G.accent,
                cursor: "default",
                fontWeight: 600,
              }}
            >
              About
            </span>
            <span style={{ fontSize: 12.5, color: G.muted, cursor: "default" }}>
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
