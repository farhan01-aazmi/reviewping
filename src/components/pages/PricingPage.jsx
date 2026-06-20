import { useState } from "react";
import { G } from "../../data/theme";
import { PLANS } from "../../data/constants";
import Btn from "../ui/Btn";
import Pill from "../ui/Pill";

const PRO_ID = "growth";

const TIERS = ["free", "starter", "growth", "agency"];

function tierIndex(id) {
  return TIERS.indexOf(id);
}

export default function PricingPage({ plan, onNav }) {
  const [annual, setAnnual] = useState(false);

  return (
    <div>
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 26,
            fontWeight: 400,
            margin: "0 0 4px",
            letterSpacing: "-0.5px",
          }}
        >
          Choose your plan
        </h2>
        <p style={{ margin: "0 0 18px", color: G.muted, fontSize: 13.5 }}>
          Pick the right plan for your business.
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

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(4, 1fr)",
          gap: 14,
          alignItems: "start",
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
                <div style={{ fontSize: 12, color: G.muted, marginBottom: 14 }}>
                  {p.sub}
                </div>
              )}

              <div style={{ marginBottom: 16 }}>
                <span
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 34,
                    color: G.ink,
                  }}
                >
                  ${price}
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
                    ${p.annual} billed annually
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
                    ${p.annual}/year
                  </div>
                )}
              </div>

              <div style={{ flex: 1, marginBottom: 18 }}>
                {(p.f || []).map((f, i) => (
                  <div
                    key={i}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: 8,
                      marginBottom: 7,
                      fontSize: 12.5,
                      color: p.id === "free" && i > 0 ? G.mutedLo : G.inkSoft,
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
                    {f}
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
                  {isUpgrade ? "Upgrade →" : "Downgrade"}
                </Btn>
              )}
            </div>
          );
        })}
      </div>

      <style>{`
        @media (max-width: 860px) {
          .pricing-grid {
            grid-template-columns: repeat(2, 1fr) !important;
          }
        }
        @media (max-width: 540px) {
          .pricing-grid {
            grid-template-columns: 1fr !important;
          }
        }
      `}</style>
    </div>
  );
}
