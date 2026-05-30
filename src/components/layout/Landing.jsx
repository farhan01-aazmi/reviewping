import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Pill, Card, Stars, Wordmark } from "../ui";
import SEO from "../SEO";

export default function Landing({ onSignup, onLogin, onPrivacy, onTerms, onTool }) {
  const props = { onPrivacy, onTerms, onTool };
  const [tick, setTick] = useState(0);
  const [annual, setAnnual] = useState(false);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) window.location.href = "/dashboard";
    });
  }, []);
  const live = [
    "James P. left 5 stars — Austin Dental",
    "Sarah M. left 5 stars — London Salon",
    "Priya S. left 5 stars — Manchester Spa",
    "Dan K. left 4 stars — Chicago Plumbing",
  ];

  useEffect(() => {
    const t = setInterval(() => setTick((i) => (i + 1) % live.length), 3000);
    return () => clearInterval(t);
  }, []);

  return (
    <>
      <SEO
        title="Automate Your Google Reviews"
        description="Send AI-personalised review requests via SMS or email. No chasing. No copy-pasting. The $19/mo alternative to Podium. 2-minute setup, no contract."
        path="/"
      />
      <script type="application/ld+json" dangerouslySetInnerHTML={{
        __html: JSON.stringify({
          "@context": "https://schema.org",
          "@graph": [
            {
              "@type": "Organization",
              "@id": "https://reviewping-eight.vercel.app/#organization",
              "name": "ReviewPing",
              "url": "https://reviewping-eight.vercel.app",
              "description": "AI-powered review request automation for small businesses. The $19/mo alternative to Podium.",
              "foundingDate": "2025",
              "contactPoint": {
                "@type": "ContactPoint",
                "email": "hello@reviewping.io",
                "contactType": "customer support"
              }
            },
            {
              "@type": "SoftwareApplication",
              "@id": "https://reviewping-eight.vercel.app/#software",
              "name": "ReviewPing",
              "applicationCategory": "BusinessApplication",
              "operatingSystem": "Web",
              "description": "Automated review request platform for Google Reviews. Send AI-personalised SMS and email review requests.",
              "offers": [
                { "@type": "Offer", "name": "Starter", "price": "19", "priceCurrency": "USD" },
                { "@type": "Offer", "name": "Growth", "price": "49", "priceCurrency": "USD" },
                { "@type": "Offer", "name": "Agency", "price": "99", "priceCurrency": "USD" }
              ]
            },
            {
              "@type": "WebSite",
              "@id": "https://reviewping-eight.vercel.app/#website",
              "url": "https://reviewping-eight.vercel.app",
              "name": "ReviewPing",
              "publisher": { "@id": "https://reviewping-eight.vercel.app/#organization" }
            }
          ]
        })
      }} />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
      }}
    >
      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        .ft{animation:fs 0.35s ease}
        @keyframes toastIn{from{opacity:0;transform:translateY(-8px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .hrow:hover{background:${G.accentBg}!important}
        @media(max-width:500px){.resp-grid{grid-template-columns:1fr!important}}
      `}</style>

      {/* Header */}
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
        <Wordmark size={15} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div className="hide-xs" style={{ display: "flex", gap: 14, marginRight: 14 }}>
            {[
              ["Features", "/features"],
              ["Pricing", "#pricing"],
              ["Blog", "/blog"],
              ["FAQ", "/faq"],
            ].map(([label, href]) => (
              <span
                key={label}
                onClick={() => {
                  if (href.startsWith("#")) {
                    document.getElementById(href.slice(1))?.scrollIntoView({ behavior: "smooth" });
                  } else {
                    window.location.href = href;
                  }
                }}
                style={{
                  fontSize: 12.5,
                  color: G.inkSoft,
                  cursor: "pointer",
                  fontWeight: 500,
                  transition: "color 0.15s",
                }}
                onMouseEnter={(e) => (e.target.style.color = G.accent)}
                onMouseLeave={(e) => (e.target.style.color = G.inkSoft)}
              >
                {label}
              </span>
            ))}
          </div>
          <Btn variant="ghost" size="sm" onClick={onLogin}>
            Sign in
          </Btn>
          <Btn size="sm" onClick={onSignup}>
            Start free →
          </Btn>
        </div>
      </header>

      {/* Live ticker */}
      <div
        style={{
          background: G.accentBg,
          borderBottom: `1px solid ${G.accentBd}`,
          padding: "9px 22px",
          display: "flex",
          alignItems: "center",
          gap: 10,
        }}
      >
        <div
          style={{
            width: 7,
            height: 7,
            borderRadius: "50%",
            background: G.success,
            animation: "blink 2s infinite",
            flexShrink: 0,
          }}
        />
        <span
          key={tick}
          className="ft"
          style={{ fontSize: 12.5, color: G.accent, fontWeight: 600 }}
        >
          {live[tick]}
        </span>
        <span style={{ fontSize: 12, color: G.muted, marginLeft: "auto" }}>
          via ReviewPing
        </span>
      </div>

      {/* Hero */}
      <section
        style={{
          maxWidth: 680,
          margin: "0 auto",
          padding: "68px 22px 52px",
        }}
      >
        <div style={{ marginBottom: 20 }}>
          <Pill label="Used by 2,400+ businesses in USA & UK" variant="inactive" />
        </div>
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
          Turn happy customers into
          <br />
          <em style={{ color: G.accent }}>5-star reviews.</em> Automatically.
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
          Send AI-personalised review requests via SMS or email the moment a
          service ends. No chasing. No copy-pasting. Built for small businesses.
        </p>
        <div
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

      {/* Dashboard preview */}
      <section style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}>
        <div
          style={{
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 16,
            overflow: "hidden",
            boxShadow: "0 8px 40px rgba(0,0,0,0.10)",
          }}
        >
          {/* Window chrome */}
          <div
            style={{
              background: G.bg,
              padding: "11px 16px",
              borderBottom: `1px solid ${G.border}`,
              display: "flex",
              alignItems: "center",
              gap: 8,
            }}
          >
            <div style={{ display: "flex", gap: 5 }}>
              {["#FF5F57", "#FFBD2E", "#28C840"].map((c) => (
                <div
                  key={c}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: "50%",
                    background: c,
                  }}
                />
              ))}
            </div>
            <div
              style={{
                flex: 1,
                background: G.surface,
                borderRadius: 5,
                padding: "4px 12px",
                fontSize: 11,
                color: G.muted,
                textAlign: "center",
                border: `1px solid ${G.border}`,
              }}
            >
              reviewping.io/dashboard
            </div>
          </div>

          {/* Stats row */}
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(3,1fr)",
              borderBottom: `1px solid ${G.border}`,
            }}
          >
            {[
              ["48", "Reviews", G.accent],
              ["4.9★", "Rating", G.gold],
              ["71%", "Response", G.success],
            ].map(([v, l, c]) => (
              <div
                key={l}
                style={{
                  padding: "16px 18px",
                  borderRight: `1px solid ${G.border}`,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 26,
                    color: c,
                    lineHeight: 1,
                  }}
                >
                  {v}
                </div>
                <div style={{ fontSize: 11.5, color: G.muted, marginTop: 5 }}>
                  {l}
                </div>
              </div>
            ))}
          </div>

          {/* Review rows */}
          {[
            { n: "James P.", s: 5, t: "Absolutely wonderful experience." },
            { n: "Sarah M.", s: 5, t: "Best salon in London, period." },
            { n: "Tom B.", s: 4, t: "Fixed same day. Really impressed." },
          ].map((r, i) => (
            <div
              key={i}
              style={{
                display: "flex",
                gap: 12,
                padding: "13px 18px",
                borderBottom: `1px solid ${G.border}`,
                alignItems: "center",
              }}
            >
              <div
                style={{
                  width: 32,
                  height: 32,
                  borderRadius: "50%",
                  background: G.accentBg,
                  border: `1.5px solid ${G.accentBd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 12,
                  color: G.accent,
                  flexShrink: 0,
                }}
              >
                {r.n[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 13 }}>{r.n}</span>
                  <Stars rating={r.s} size={11} />
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>"{r.t}"</div>
              </div>
            </div>
          ))}

          {/* Live activity */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "12px 18px",
              background: G.accentBg,
            }}
          >
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <div
                style={{
                  width: 7,
                  height: 7,
                  borderRadius: "50%",
                  background: G.success,
                  animation: "blink 2s infinite",
                }}
              />
              <span style={{ fontSize: 12.5, color: G.inkSoft, fontWeight: 500 }}>
                Robert K. received review request · 3 min ago
              </span>
            </div>
            <span style={{ fontSize: 11, color: G.muted }}>SMS</span>
          </div>
        </div>
      </section>

      {/* Process */}
      <section style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}>
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
          Process
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
          Three steps. Under sixty seconds.
        </h2>
        {[
          {
            n: "01",
            t: "Service ends",
            b: "You finish a job, appointment, or meal.",
          },
          {
            n: "02",
            t: "Add the customer",
            b: "Enter their name and phone. Nothing more.",
          },
          {
            n: "03",
            t: "ReviewPing takes over",
            b: "AI writes a personalised message and sends it instantly.",
          },
        ].map((s, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              gap: 18,
              padding: "20px 22px",
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 10,
              marginBottom: 8,
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 26,
                color: G.mutedLo,
                lineHeight: 1,
                minWidth: 32,
                flexShrink: 0,
              }}
            >
              {s.n}
            </div>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15.5, marginBottom: 5 }}>
                {s.t}
              </div>
              <div
                style={{
                  fontSize: 13.5,
                  color: G.muted,
                  lineHeight: 1.65,
                }}
              >
                {s.b}
              </div>
            </div>
          </div>
        ))}
      </section>

      {/* Comparison */}
      <section style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}>
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
          Comparison
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
          Why not Podium?
        </h2>
        <Card style={{ padding: 0 }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontFamily: "'Manrope',sans-serif",
            }}
          >
            <thead>
              <tr>
                {["", "ReviewPing", "Podium"].map((h, i) => (
                  <th
                    key={i}
                    style={{
                      padding: "10px 14px",
                      textAlign: i === 0 ? "left" : "center",
                      fontSize: 12,
                      fontWeight: 700,
                      color: i === 1 ? G.accent : G.muted,
                      borderBottom: `1.5px solid ${G.border}`,
                    }}
                  >
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {[
                ["Price / month", "$19", "$249+"],
                ["Setup time", "2 minutes", "2 weeks + sales call"],
                ["AI messages", "Included", "Extra cost"],
                ["No contract", "✓", "✗"],
                ["Small biz focus", "✓", "✗"],
              ].map(([f, r, p], i) => (
                <tr
                  key={i}
                  className="hrow"
                  style={{ transition: "background 0.12s" }}
                >
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13.5,
                      color: G.inkSoft,
                      borderBottom: `1px solid ${G.border}`,
                    }}
                  >
                    {f}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13.5,
                      fontWeight: 700,
                      color: G.accent,
                      textAlign: "center",
                      borderBottom: `1px solid ${G.border}`,
                    }}
                  >
                    {r}
                  </td>
                  <td
                    style={{
                      padding: "12px 14px",
                      fontSize: 13.5,
                      color: G.muted,
                      textAlign: "center",
                      borderBottom: `1px solid ${G.border}`,
                    }}
                  >
                    {p}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </Card>
      </section>

      {/* Testimonials */}
      <section style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}>
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
          Stories
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
          Real businesses. Real numbers.
        </h2>
        {[
          {
            n: "Mike R.",
            biz: "Mike's Dental · Austin, TX",
            stars: 5,
            av: "M",
            text: "We went from 14 reviews to 89 in six weeks. New patients find us because of our Google rating. ReviewPing changed everything.",
          },
          {
            n: "Priya S.",
            biz: "Glow Salon · London",
            stars: 5,
            av: "P",
            text: "Setup took three minutes. I get four to five new reviews every week without doing anything. The AI messages feel surprisingly personal.",
          },
          {
            n: "Dan K.",
            biz: "FastFix Plumbing · Chicago",
            stars: 5,
            av: "D",
            text: "I was on Podium at $249 a month. Switched to ReviewPing and saved over $2,600 last year. Same results, fraction of the price.",
          },
        ].map((r, i) => (
          <Card key={i} style={{ marginBottom: 10 }}>
            <Stars rating={r.stars} size={14} />
            <blockquote
              style={{
                margin: "12px 0 16px",
                fontSize: 15,
                lineHeight: 1.72,
                color: G.inkSoft,
                fontFamily: "'Instrument Serif',serif",
                fontStyle: "italic",
              }}
            >
              "{r.text}"
            </blockquote>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div
                style={{
                  width: 36,
                  height: 36,
                  borderRadius: "50%",
                  background: G.accentBg,
                  border: `1.5px solid ${G.accentBd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 14,
                  color: G.accent,
                }}
              >
                {r.av}
              </div>
              <div>
                <div style={{ fontWeight: 700, fontSize: 13.5 }}>{r.n}</div>
                <div style={{ fontSize: 12, color: G.muted }}>{r.biz}</div>
              </div>
            </div>
          </Card>
        ))}
      </section>

      {/* Pricing */}
      <section id="pricing" style={{ maxWidth: 660, margin: "0 auto 64px", padding: "0 22px" }}>
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
          Pricing
        </p>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 32,
            fontWeight: 400,
            margin: "0 0 8px",
            letterSpacing: "-0.8px",
          }}
        >
          Simple. No surprises.
        </h2>
        <p style={{ color: G.muted, margin: "0 0 20px", fontSize: 14 }}>
          No per-message fees. No contracts. Cancel any time.
        </p>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 12,
            marginBottom: 24,
            padding: "10px 20px",
            background: G.surface,
            borderRadius: 50,
            border: `1.5px solid ${G.border}`,
            width: "fit-content",
            margin: "0 auto 24px",
          }}
        >
          <span
            onClick={() => setAnnual(false)}
            style={{
              fontSize: 13.5,
              fontWeight: annual ? 400 : 700,
              color: annual ? G.muted : G.ink,
              cursor: "pointer",
            }}
          >
            Monthly
          </span>
          <div
            onClick={() => setAnnual((a) => !a)}
            style={{
              width: 44,
              height: 24,
              borderRadius: 12,
              background: annual ? G.accent : G.border,
              position: "relative",
              cursor: "pointer",
              transition: "background 0.2s",
            }}
          >
            <div
              style={{
                position: "absolute",
                top: 3,
                left: annual ? "unset" : "3px",
                right: annual ? "3px" : "unset",
                width: 18,
                height: 18,
                borderRadius: "50%",
                background: "white",
                transition: "all 0.2s",
              }}
            />
          </div>
          <span
            onClick={() => setAnnual(true)}
            style={{
              fontSize: 13.5,
              fontWeight: annual ? 700 : 400,
              color: annual ? G.ink : G.muted,
              cursor: "pointer",
            }}
          >
            Annual{" "}
            <span style={{ color: G.success, fontWeight: 700, fontSize: 12 }}>
              Save 20%
            </span>
          </span>
        </div>
        {[
          {
            name: "Starter",
            price: 19,
            annualPrice: 190,
            sub: "Solo owners",
            f: ["50 review requests/mo", "Email only (SMS extra)", "Dashboard & analytics", "Google review link"],
            pop: false,
            hint: "Good for small shops testing the waters",
          },
          {
            name: "Growth",
            price: 49,
            annualPrice: 490,
            sub: "Most popular",
            pop: true,
            f: [
              "Unlimited review requests",
              "AI-personalized SMS & email",
              "AI reply generator",
              "Full analytics & charts",
            ],
            hint: "Best value for growing businesses",
          },
          {
            name: "Agency",
            price: 99,
            annualPrice: 990,
            sub: "Multi-location",
            pop: false,
            f: [
              "Everything in Growth",
              "Up to 5 locations",
              "White-label & API",
              "Team members",
            ],
            hint: "For agencies & multi-location brands",
          },
        ].map((p) => (
          <div
            key={p.name}
            style={{
              background: G.surface,
              border: `1.5px solid ${p.pop ? G.accent : G.border}`,
              borderRadius: 12,
              padding: "22px 24px",
              marginBottom: 10,
              position: "relative",
              boxShadow: p.pop ? `0 4px 20px ${G.accent}18` : "none",
            }}
          >
            {p.pop && (
              <div
                style={{
                  position: "absolute",
                  top: -12,
                  left: 20,
                  background: G.accent,
                  color: "white",
                  borderRadius: 4,
                  padding: "3px 10px",
                  fontSize: 10.5,
                  fontWeight: 800,
                  textTransform: "uppercase",
                }}
              >
                Most popular
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 22,
                    marginBottom: 2,
                  }}
                >
                  {p.name}
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: G.muted,
                    marginBottom: 14,
                  }}
                >
                  {p.sub}
                </div>
                {p.f.map((f) => (
                  <div
                    key={f}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      marginBottom: 7,
                    }}
                  >
                    <span
                      style={{
                        color: p.pop ? G.accent : G.success,
                        fontSize: 11,
                        fontWeight: 700,
                      }}
                    >
                      ✓
                    </span>
                    <span style={{ fontSize: 13.5, color: G.inkSoft }}>{f}</span>
                  </div>
                ))}
              </div>
              <div
                style={{
                  textAlign: "right",
                  flexShrink: 0,
                  paddingLeft: 20,
                }}
              >
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 38,
                    color: G.ink,
                    lineHeight: 1,
                  }}
                >
                  ${annual ? Math.round(p.annualPrice / 12) : p.price}
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>
                  / month{annual ? " · billed yearly" : ""}
                </div>
                {annual && (
                  <div
                    style={{
                      fontSize: 11,
                      color: G.success,
                      fontWeight: 700,
                    }}
                  >
                    ${p.price * 12 - p.annualPrice}/yr savings
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        <div style={{ textAlign: "center", marginTop: 22 }}>
          <Btn size="lg" onClick={onSignup} style={{ minWidth: 260 }}>
            Start your free 14-day trial →
          </Btn>
          <p style={{ color: G.muted, fontSize: 12.5, marginTop: 10 }}>
            No credit card required
          </p>
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
            ["Features", () => window.location.href="/features"],
            ["Pricing", () => document.getElementById("pricing")?.scrollIntoView({ behavior: "smooth" })],
            ["FAQ", () => window.location.href="/faq"],
            ["Blog", () => window.location.href="/blog"],
            ["About", () => window.location.href="/about"],
            ["Contact", () => window.location.href="/contact"],
            ["Privacy Policy", "onPrivacy"],
            ["Terms of Service", "onTerms"],
            ["Free Review Link Tool", "onTool"],
          ].map(([l, fn]) => (
            <span
              key={l}
              onClick={typeof fn === "function" ? fn : props[fn] ? props[fn] : undefined}
              style={{
                fontSize: 12.5,
                color: G.muted,
                cursor: typeof fn === "function" || props[fn] ? "pointer" : "default",
              }}
            >
              {l}
            </span>
          ))}
        </div>
        <p style={{ color: G.muted, fontSize: 12, marginTop: 10, marginBottom: 0 }}>
          © 2026 ReviewPing · USA & UK · GDPR Compliant · hello@reviewping.io
        </p>
      </footer>
    </div>
    </>
  );
}
