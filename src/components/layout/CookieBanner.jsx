import { G } from "../../data/theme";
import { Btn } from "../ui";

export default function CookieBanner({ onAccept }) {
  return (
    <div
      style={{
        position: "fixed",
        bottom: 0,
        left: 0,
        right: 0,
        background: G.surface,
        borderTop: `1.5px solid ${G.border}`,
        padding: "14px 20px",
        zIndex: 200,
        display: "flex",
        gap: 12,
        alignItems: "center",
        flexWrap: "wrap",
        boxShadow: "0 -4px 20px rgba(0,0,0,0.08)",
      }}
    >
      <div style={{ flex: 1, minWidth: 200 }}>
        <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 3 }}>
          🍪 We use cookies
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 12,
            color: G.muted,
            lineHeight: 1.6,
          }}
        >
          Essential cookies only — to keep you logged in and prevent fraud. No
          tracking, no advertising.
        </p>
      </div>
      <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
        <Btn size="sm" onClick={onAccept}>
          Got it
        </Btn>
      </div>
    </div>
  );
}
