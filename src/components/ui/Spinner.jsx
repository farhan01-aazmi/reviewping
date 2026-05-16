import { G } from "../../data/theme";

export default function Spinner({ size = 32, color = G.accent, style, ...rest }) {
  return (
    <span
      role="status"
      aria-label="Loading"
      style={{
        display: "inline-block",
        width: size,
        height: size,
        border: `3px solid ${G.border}`,
        borderTopColor: color,
        borderRadius: "50%",
        animation: "spin 0.7s linear infinite",
        ...style,
      }}
      {...rest}
    >
      <span style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
        Loading...
      </span>
    </span>
  );
}
