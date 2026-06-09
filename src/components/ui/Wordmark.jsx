import { G } from "../../data/theme";
import LogoMark from "./LogoMark";

export default function Wordmark({ size = 28, showTagline = false, style, ...rest }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
      {...rest}
    >
      <LogoMark size={size} />
      <div>
        <span
          style={{
            fontFamily: "Instrument Serif, serif",
            fontSize: size * 0.85,
            fontWeight: 600,
            color: G.ink,
            lineHeight: 1.1,
          }}
        >
          ReviewPing
        </span>
        {showTagline && (
          <span
            style={{
              display: "block",
              fontFamily: "Manrope, sans-serif",
              fontSize: size * 0.32,
              color: G.muted,
              fontWeight: 500,
              letterSpacing: "0.02em",
            }}
          >
            Review requests, simplified.
          </span>
        )}
      </div>
    </div>
  );
}