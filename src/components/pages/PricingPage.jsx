import { useState } from "react";
import { G } from "../../data/theme";
import { PLANS } from "../../data/constants";
import Btn from "../ui/Btn";
import Pill from "../ui/Pill";
import SEO from "../SEO";

const PRO_ID = "premium";

const TIERS = ["starter", "premium", "agency"];

function tierIndex(id) {
  return TIERS.indexOf(id);
}

const COMPARISON_FEATURES = [
  { label: "Review requests", starter: "100/mo", premium: "Unlimited", agency: "Unlimited" },
  { label: "Sending channel", starter: "Email", premium: "Email + WhatsApp", agency: "Email + WhatsApp" },
  { label: "AI reply generator", starter: true, premium: true, agency: true },
  { label: "AI-personalized messages", starter: false, premium: true, agency: true },
  { label: "Analytics & charts", starter: true, premium: true, agency: true },
  { label: "Custom templates", starter: true, premium: true, agency: true },
  { label: "Reputation Score", starter: false, premium: true, agency: true },
  { label: "QR Codes", starter: true, premium: true, agency: true },
  { label: "Widget embed", starter: true, premium: true, agency: true },
  { label: "Team members", starter: "1", premium: "3", agency: "10" },
  { label: "Multi-location", starter: false, premium: false, agency: true },
  { label: "White-label", starter: false, premium: false, agency: true },
  { label: "API access", starter: false, premium: false, agency: true },
  { label: "Priority support", starter: false, premium: true, agency: true },
  { label: "Dedicated onboarding", starter: false, premium: false, agency: true },
];

const FAQ_ITEMS = [
  {
    q: "Is there a per-message or per-request fee?",
    a: "No. ReviewPing uses a flat monthly model with no hidden fees. The Starter tier has a monthly limit on review requests, but once you are on Premium or Agency you get unlimited requests. You never pay extra for sending more. WhatsApp is included on Premium and above.",
  },
  {
    q: "Can I switch between plans at any time?",
    a: "Yes, you can upgrade or downgrade at any time. Upgrades take effect immediately and you are charged a prorated difference for the remainder of the month. Downgrades apply at the next billing cycle. All your data, contacts, templates, and settings are preserved across plan changes — nothing is lost.",
  },
  {
    q: "What happens if I exceed my review request limit?",
    a: "Your Starter account will still accept incoming requests; they will simply be queued and processed once the next monthly cycle resets. You will receive an email notification when you reach 80% of your limit so you can plan ahead. Upgrade to Premium or Agency at any time to unlock unlimited requests instantly.",
  },
  {
    q: "Do you offer a non-profit or educational discount?",
    a: "Yes, we offer a 30% discount for verified non-profit organizations and accredited educational institutions. Please email us at hello@reviewping.io with your organization details and proof of status. We will send you a custom sign-up link at the discounted rate within one business day.",
  },
  {
    q: "How does the free trial work?",
    a: "We offer a 14-day free trial on the Starter plan with no credit card required. You get full access to Starter features during the trial so you can evaluate everything before committing. Cancel anytime with no penalties.",
  },
];

export default function PricingPage({ plan, onNav }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <SEO
        title="Pricing"
        description="Simple, transparent pricing for review request automation. Starter at ₹599/mo. No contracts. No per-message fees. Cancel anytime."
        path="/pricing"
      />
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "12px 20px", marginBottom: 20 }}>
        <span style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, fontWeight: 700, color: "#fff", cursor: "pointer", letterSpacing: "-1px" }} onClick={() => onNav && onNav("landing")}>ReviewPing</span>
        <div style={{ display: "flex", gap: 10 }}>
          <span style={{ color: G.muted, fontSize: 14, cursor: "pointer", padding: "8px 16px" }} onClick={() => onNav && onNav("login")}>Sign in</span>
           <span style={{ background: G.accentBd || "#10b981", color: "#000", fontSize: 14, fontWeight: 600, cursor: "pointer", padding: "8px 16px", borderRadius: 8 }} onClick={() => onNav && onNav("signup")}>Get Started &rarr;</span>
        </div>
      </div>

      {/* Header */}
      <div style={{ textAlign: "center", marginBottom: 16 }}>
        <Pill label="Pricing" variant="inactive" />
      </div>

      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
          }}
        >
          Choose your plan
        </h2>
        <p
          style={{
            margin: "0 auto 18px",
            color: G.muted,
            fontSize: 14.5,
            lineHeight: 1.6,
            maxWidth: 500,
          }}
        >
          Simple, transparent pricing for review request automation. No hidden
          fees, no per-message surcharges, and no contracts. Pick the plan that
          fits your team size and review volume.
        </p>

        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 10,
            padding: "4px 6px",
            background: G.border,
            borderRadius: 100,
          }}
        >
          <span
            onClick={() => setAnnual(false)}
            style={{
              fontSize: 13,
              fontWeight: annual ? 500 : 700,
              color: annual ? G.muted : G.ink,
              cursor: "pointer",
              padding: "6px 14px",
              borderRadius: 100,
              background: annual ? "transparent" : G.surface,
              transition: "all 0.2s",
            }}
          >
            Monthly
          </span>
          <span
            onClick={() => setAnnual(true)}
            style={{
              fontSize: 13,
              fontWeight: annual ? 700 : 500,
              color: annual ? G.ink : G.muted,
              cursor: "pointer",
              padding: "6px 14px",
              borderRadius: 100,
              background: annual ? G.surface : "transparent",
              transition: "all 0.2s",
            }}
          >
            Annual{" "}
            <span style={{ color: G.success, fontWeight: 700, fontSize: 11 }}>
              Save ~17%
            </span>
          </span>
        </div>
      </div>

      {/* Plan comparison table */}
      <div
        style={{
          maxWidth: 960,
          margin: "0 auto 32px",
          padding: "0 20px",
        }}
      >
        <div
          style={{
            background: G.surface,
            borderRadius: 16,
            border: `1.5px solid ${G.border}`,
            padding: "24px 20px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 4px",
              letterSpacing: "-0.5px",
            }}
          >
            Plan comparison
          </h3>
          <p
            style={{
              fontSize: 13,
              color: G.muted,
              margin: "0 0 18px",
            }}
          >
            See exactly what you get at each tier. All plans include our core
            dashboard and Google review link generator.
          </p>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "2fr repeat(3, 1fr)",
              gap: 0,
              fontSize: 13,
              lineHeight: 1.4,
            }}
          >
            {/* Header row */}
            <div style={{ fontWeight: 700, padding: "6px 8px", borderBottom: `1px solid ${G.border}` }}></div>
            <div style={{ fontWeight: 700, padding: "6px 8px", borderBottom: `1.5px solid ${G.border}`, textAlign: "center", fontSize: 12, color: G.muted }}>Starter</div>
            <div style={{ fontWeight: 700, padding: "6px 8px", borderBottom: `1.5px solid ${G.border}`, textAlign: "center", fontSize: 12, color: G.success }}>Premium</div>
            <div style={{ fontWeight: 700, padding: "6px 8px", borderBottom: `1.5px solid ${G.border}`, textAlign: "center", fontSize: 12, color: G.muted }}>Agency</div>

            {COMPARISON_FEATURES.map((feat, i) => (
              <div key={i} style={{ display: "contents" }}>
                <div
                  style={{
                    padding: "8px 8px",
                    borderBottom: i < COMPARISON_FEATURES.length - 1 ? `1px solid ${G.border}` : "none",
                    fontWeight: 500,
                    fontSize: 12.5,
                    color: G.inkSoft,
                  }}
                >
                  {feat.label}
                </div>
                {TIERS.map((tier) => {
                  const val = feat[tier];
                  return (
                    <div
                      key={tier}
                      style={{
                        padding: "8px 4px",
                        borderBottom: i < COMPARISON_FEATURES.length - 1 ? `1px solid ${G.border}` : "none",
                        textAlign: "center",
                        fontSize: 12,
                        color: val === false ? G.mutedLo : G.inkSoft,
                      }}
                    >
                      {val === false ? "\u2014" : val === true ? "\u2713" : val}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Plans grid */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: 14,
          alignItems: "start",
          maxWidth: 960,
          margin: "0 auto 48px",
          padding: "0 20px",
        }}
        className="pricing-grid"
      >
        {PLANS.map((p) => {
          const isCurrent = p.id === plan;
          const isPro = p.id === PRO_ID;
          const price = annual ? Math.round(p.annual / 12) : p.price;
          const userTier = tierIndex(plan);
          const thisTier = tierIndex(p.id);
          const isDowngrade = isCurrent ? false : thisTier < userTier;
          const isUpgrade = isCurrent ? false : thisTier > userTier;

          const descriptions = {
            starter: "For solo owners and independent operators. Includes email requests, custom templates, QR codes, and embedded widgets at an affordable price.",
            premium: "For growing businesses that need unlimited review requests, AI-powered message personalization, detailed analytics, and WhatsApp channel access.",
            agency: "For agencies, franchises, and multi-location enterprises that require white-label reporting, API access, dedicated onboarding, and multi-location support.",
          };

          return (
            <div
              key={p.id}
              style={{
                background: isPro ? `${G.accentBg}` : G.surface,
                borderRadius: 16,
                border: isPro
                  ? `1.5px solid ${G.accentBd}`
                  : `1px solid ${G.border}`,
                padding: "24px 20px",
                display: "flex",
                flexDirection: "column",
                position: "relative",
                transition: "box-shadow 0.15s",
              }}
            >
              {isPro && (
                <div
                  style={{
                    position: "absolute",
                    top: -10,
                    left: "50%",
                    transform: "translateX(-50%)",
                    background: G.accent,
                    color: "#fff",
                    fontSize: 10.5,
                    fontWeight: 700,
                    letterSpacing: "0.8px",
                    textTransform: "uppercase",
                    padding: "4px 14px",
                    borderRadius: 100,
                    whiteSpace: "nowrap",
                  }}
                >
                  Most Popular
                </div>
              )}

              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 20,
                  fontWeight: 400,
                  marginBottom: 2,
                }}
              >
                {p.name}
              </div>

              {p.sub && (
                <div style={{ fontSize: 12, color: G.muted, marginBottom: 4 }}>
                  {p.sub}
                </div>
              )}

              {/* Expanded description */}
              <div
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  lineHeight: 1.6,
                  marginBottom: 16,
                  borderBottom: `1px solid ${p.id === PRO_ID ? G.accentBd : G.border}`,
                  paddingBottom: 16,
                }}
              >
                {descriptions[p.id] || ""}
              </div>

              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 34,
                    color: G.ink,
                  }}
                >
                  ₹{price}
                </span>
                <span style={{ fontSize: 13, color: G.muted }}>
                  /month
                </span>
                {annual && p.price > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: G.success,
                      fontWeight: 600,
                      marginTop: 2,
                    }}
                  >
                    ₹{p.annual} billed annually
                  </div>
                )}
                {!annual && p.annual > 0 && (
                  <div
                    style={{
                      fontSize: 11,
                      color: G.mutedLo,
                      marginTop: 2,
                    }}
                  >
                    ₹{p.annual} / year
                  </div>
                )}
              </div>

              <div style={{ flex: 1, marginBottom: 18 }}>
                {(p.f || []).map((feature, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 7,
                      fontSize: 12.5,
                      color: G.inkSoft,
                      lineHeight: 1.5,
                    }}
                  >
                    <span
                      style={{
                        color: G.success,
                        fontSize: 13,
                        flexShrink: 0,
                        marginTop: 1,
                      }}
                    >
                      ✓
                    </span>
                    {feature}
                  </div>
                ))}
              </div>

              {isCurrent ? (
                <Pill
                  color={G.success}
                  style={{
                    width: "100%",
                    justifyContent: "center",
                    padding: "8px 14px",
                    fontSize: 13,
                  }}
                >
                  Current plan
                </Pill>
              ) : (
                <Btn
                  fullWidth
                  size="sm"
                  variant={isPro ? "primary" : "secondary"}
                  onClick={() => onNav && onNav("billing")}
                >
                  {isUpgrade ? "Upgrade \u2192" : "Downgrade"}
                </Btn>
              )}
            </div>
          );
        })}
      </div>

      {/* FAQ section */}
      <div
        style={{
          maxWidth: 720,
          margin: "0 auto 48px",
          padding: "0 22px",
        }}
      >
        <div
          style={{
            background: G.surface,
            borderRadius: 16,
            border: `1.5px solid ${G.border}`,
            padding: "32px 28px",
          }}
        >
          <h3
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 22,
              fontWeight: 400,
              margin: "0 0 6px",
              letterSpacing: "-0.5px",
            }}
          >
            Frequently asked questions about pricing
          </h3>
          <p
            style={{
              fontSize: 13.5,
              color: G.muted,
              margin: "0 0 22px",
              lineHeight: 1.6,
            }}
          >
            Can't find what you're looking for? Email us at
            hello@reviewping.io and we'll answer within hours.
          </p>
          {FAQ_ITEMS.map((item, i) => (
            <div
              key={i}
              style={{
                marginBottom: i < FAQ_ITEMS.length - 1 ? 20 : 0,
                paddingBottom: i < FAQ_ITEMS.length - 1 ? 20 : 0,
                borderBottom: i < FAQ_ITEMS.length - 1 ? `1px solid ${G.border}` : "none",
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
      </div>

      <style>{`
        @media (max-width: 720px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
