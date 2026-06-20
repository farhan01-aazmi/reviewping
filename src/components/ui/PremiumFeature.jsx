import { useState } from "react";
import { G } from "../../data/theme";
import { hasFeature, planForFeature } from "../../data/constants";
import PricingModal from "./PricingModal";

/**
 * Wraps a premium feature. If the user's plan doesn't include it,
 * renders a clean upgrade CTA card instead of the children.
 *
 * Usage:
 *   <PremiumFeature feature="competitorRadar" plan={userPlan}>
 *     <CompetitorRadar />
 *   </PremiumFeature>
 */
export default function PremiumFeature({
  feature,
  plan,
  children,
  style,
}) {
  const [showPricing, setShowPricing] = useState(false);

  const hasAccess = hasFeature(plan, feature);
  const requiredPlan = planForFeature(feature);

  const handleUpgrade = (planId) => {
    setShowPricing(false);
    // Navigate to billing page
    window.history.pushState({}, "", "/billing");
    window.dispatchEvent(new PopStateEvent("popstate"));
  };

  if (hasAccess) {
    return <>{children}</>;
  }

  return (
    <>
      <div
        onClick={() => setShowPricing(true)}
        style={{
          background: G.surface,
          border: `1.5px dashed ${G.border}`,
          borderRadius: 16,
          padding: "32px 24px",
          textAlign: "center",
          cursor: "pointer",
          transition: "border-color 0.15s, background 0.15s",
          ...style,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.borderColor = G.accent;
          e.currentTarget.style.background = G.accentBg;
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.borderColor = G.border;
          e.currentTarget.style.background = G.surface;
        }}
        role="button"
        tabIndex={0}
        onKeyDown={(e) => e.key === "Enter" && setShowPricing(true)}
      >
        <div style={{ fontSize: 32, marginBottom: 8 }}>🔒</div>
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 20,
            color: G.ink,
            marginBottom: 4,
          }}
        >
          {requiredPlan.name} Feature
        </div>
        <div
          style={{
            fontSize: 13,
            color: G.muted,
            marginBottom: 16,
            lineHeight: 1.6,
          }}
        >
          This feature is available on the <strong>{requiredPlan.name}</strong> plan and above.
        </div>
        <div
          style={{
            display: "inline-flex",
            alignItems: "center",
            gap: 6,
            background: G.accent,
            color: "#fff",
            padding: "10px 24px",
            borderRadius: 10,
            fontSize: 13,
            fontWeight: 700,
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          Upgrade to {requiredPlan.name} — ${requiredPlan.price}/mo →
        </div>
      </div>

      <PricingModal
        open={showPricing}
        plan={plan}
        onClose={() => setShowPricing(false)}
        onUpgrade={handleUpgrade}
      />
    </>
  );
}
