import { G } from "../../data/theme";

const colorMap = {
  reviewed: { bg: G.successBg, color: G.success },
  pending: { bg: G.goldBg, color: G.gold },
  sent: { bg: G.infoBg, color: G.info },
  active: { bg: G.successBg, color: G.success },
  inactive: { bg: G.accentBg, color: G.accent },
  success: { bg: G.successBg, color: G.success },
  warning: { bg: G.goldBg, color: G.gold },
  error: { bg: G.accentBg, color: G.accent },
  info: { bg: G.infoBg, color: G.info },
};

export default function Pill({ label, variant = "info", color, children, style, ...rest }) {
  // Support both APIs: variant="success" OR color={G.success}
  const resolvedVariant = color
    ? Object.keys(colorMap).find(k => colorMap[k].color === color) || "info"
    : variant;
  const colors = colorMap[resolvedVariant] || colorMap.info;
  const displayText = label || children;

  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        padding: "3px 10px",
        fontSize: 12,
        fontWeight: 600,
        borderRadius: 100,
        background: colors.bg,
        color: colors.color,
        whiteSpace: "nowrap",
        ...style,
      }}
      {...rest}
    >
      {displayText}
    </span>
  );
}
