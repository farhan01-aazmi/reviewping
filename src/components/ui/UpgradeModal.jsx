import { G } from "../../data/theme";
import { PLANS } from "../../data/constants";
import Btn from "./Btn";

export default function UpgradeModal({
  open,
  feature = "this feature",
  plan,
  onUpgrade,
  onClose,
  loading,
}) {
  if (!open) return null;

  const targetPlan = PLANS.find((p) => p.id === plan) || PLANS[2];
  const priceLabel = targetPlan.price > 0 ? `$${targetPlan.price}/mo` : "Free";

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
          padding: 36,
          maxWidth: 400,
          width: "100%",
          textAlign: "center",
          boxShadow: "0 20px 60px rgba(0,0,0,0.3)",
        }}
      >
        <div style={{ fontSize: 44, marginBottom: 12 }}>🔒</div>
        <h3
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: 22,
            fontWeight: 600,
            color: G.ink,
            margin: "0 0 8px",
          }}
        >
          Upgrade to unlock
        </h3>
        <p
          style={{
            fontSize: 14,
            color: G.inkSoft,
            margin: "0 0 24px",
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: G.ink }}>{feature}</strong> is available on
          the{" "}
          <strong style={{ color: G.accent }}>
            {targetPlan.name}
          </strong>{" "}
          plan{plan === "starter" ? "" : " and above"}.
        </p>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
            marginBottom: 24,
            padding: "12px 16px",
            background: G.accentBg,
            borderRadius: 12,
            border: `1px solid ${G.accentBd}`,
          }}
        >
          <span style={{ fontSize: 13, color: G.inkSoft }}>{targetPlan.name}</span>
          <span style={{ fontSize: 20, fontWeight: 800, color: G.accent }}>
            {priceLabel}
          </span>
        </div>

        <Btn
          fullWidth
          size="lg"
          onClick={onUpgrade}
          loading={loading}
          style={{ marginBottom: 10 }}
        >
          Upgrade to {targetPlan.name} →
        </Btn>
        <Btn
          fullWidth
          variant="secondary"
          onClick={onClose}
          disabled={loading}
        >
          Maybe later
        </Btn>
      </div>
    </div>
  );
}
