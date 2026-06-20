import { useState } from "react";
import { G } from "../../data/theme";
import { PLANS } from "../../data/constants";
import Btn from "./Btn";

const displayPlans = PLANS.filter((p) => p.id !== "free");

export default function PricingModal({ open, plan, onClose, onUpgrade }) {
  const [annual, setAnnual] = useState(false);
  if (!open) return null;

  return (
    <div
      role="presentation"
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 9999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.6)",
        backdropFilter: "blur(4px)",
        padding: 20,
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget && onClose) onClose();
      }}
    >
      <div
        role="dialog"
        aria-modal="true"
        style={{
          background: G.surface,
          borderRadius: 20,
          padding: "32px 28px",
          maxWidth: 680,
          width: "100%",
          maxHeight: "80vh",
          overflowY: "auto",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
          position: "relative",
        }}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          style={{
            position: "absolute",
            top: 16,
            right: 16,
            background: "none",
            border: "none",
            cursor: "pointer",
            fontSize: 20,
            color: G.inkSoft,
            lineHeight: 1,
            padding: 4,
          }}
        >
          ✕
        </button>

        <h2
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 26,
            fontWeight: 600,
            color: G.ink,
            textAlign: "center",
            margin: "0 0 24px",
          }}
        >
          Upgrade to unlock
        </h2>

        <div
          style={{
            display: "flex",
            justifyContent: "center",
            marginBottom: 28,
          }}
        >
          <div
            style={{
              display: "inline-flex",
              background: G.mutedLo,
              borderRadius: 12,
              padding: 4,
              gap: 4,
            }}
          >
            <button
              onClick={() => setAnnual(false)}
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "Manrope, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                background: !annual ? G.accent : "transparent",
                color: !annual ? "#fff" : G.inkSoft,
                transition: "all 0.15s ease",
              }}
            >
              Monthly
            </button>
            <button
              onClick={() => setAnnual(true)}
              style={{
                padding: "8px 20px",
                borderRadius: 10,
                border: "none",
                cursor: "pointer",
                fontFamily: "Manrope, sans-serif",
                fontSize: 14,
                fontWeight: 600,
                background: annual ? G.accent : "transparent",
                color: annual ? "#fff" : G.inkSoft,
                transition: "all 0.15s ease",
              }}
            >
              Annual
              <span
                style={{
                  fontSize: 11,
                  marginLeft: 4,
                  opacity: 0.8,
                }}
              >
                (save ~20%)
              </span>
            </button>
          </div>
        </div>

        <div
          style={{
            display: "flex",
            gap: 16,
            justifyContent: "center",
            alignItems: "stretch",
          }}
        >
          {displayPlans.map((p) => {
            const isCurrent = p.id === plan;
            const isPopular = p.id === "growth";
            const price = annual ? p.annual : p.price;
            const priceLabel = annual ? `/yr` : `/mo`;

            return (
              <div
                key={p.id}
                style={{
                  flex: "1 1 0",
                  minWidth: 0,
                  background: G.bg,
                  borderRadius: 16,
                  border: `1.5px solid ${isPopular ? G.goldBd : G.border}`,
                  padding: 24,
                  position: "relative",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                {isPopular && (
                  <div
                    style={{
                      position: "absolute",
                      top: -12,
                      left: "50%",
                      transform: "translateX(-50%)",
                      background: G.gold,
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                      fontFamily: "Manrope, sans-serif",
                      padding: "4px 14px",
                      borderRadius: 20,
                      whiteSpace: "nowrap",
                    }}
                  >
                    Most Popular
                  </div>
                )}

                <h3
                  style={{
                    fontFamily: "Instrument Serif, serif",
                    fontSize: 20,
                    fontWeight: 600,
                    color: G.ink,
                    margin: "0 0 4px",
                  }}
                >
                  {p.name}
                </h3>

                <p
                  style={{
                    fontFamily: "Manrope, sans-serif",
                    fontSize: 13,
                    color: G.inkSoft,
                    margin: "0 0 12px",
                  }}
                >
                  {p.sub}
                </p>

                <div style={{ marginBottom: 16 }}>
                  <span
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 32,
                      fontWeight: 800,
                      color: G.ink,
                    }}
                  >
                    ${price}
                  </span>
                  <span
                    style={{
                      fontFamily: "Manrope, sans-serif",
                      fontSize: 14,
                      color: G.inkSoft,
                      marginLeft: 4,
                    }}
                  >
                    {priceLabel}
                  </span>
                </div>

                <ul
                  style={{
                    listStyle: "none",
                    padding: 0,
                    margin: "0 0 20px",
                    flex: 1,
                  }}
                >
                  {p.f.slice(0, 5).map((f, i) => (
                    <li
                      key={i}
                      style={{
                        fontFamily: "Manrope, sans-serif",
                        fontSize: 13,
                        color: G.ink,
                        padding: "3px 0",
                        display: "flex",
                        alignItems: "center",
                        gap: 8,
                      }}
                    >
                      <span style={{ color: G.success, fontSize: 14 }}>
                        ✓
                      </span>
                      {f}
                    </li>
                  ))}
                </ul>

                <Btn
                  fullWidth
                  variant={isCurrent ? "secondary" : "primary"}
                  onClick={() => onUpgrade(p.id)}
                  style={
                    isPopular && !isCurrent
                      ? { background: G.gold, border: "none", color: "#fff" }
                      : undefined
                  }
                >
                  {isCurrent ? "Current Plan" : "Upgrade →"}
                </Btn>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
