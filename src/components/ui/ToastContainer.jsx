import { G } from "../../data/theme";

const typeStyles = {
  success: { bg: G.successBg, border: G.successBd, color: G.success, icon: "✓" },
  error: { bg: G.accentBg, border: G.accentBd, color: G.accent, icon: "✕" },
  info: { bg: G.infoBg, border: G.infoBd, color: G.info, icon: "ℹ" },
  warning: { bg: G.goldBg, border: G.goldBd, color: G.gold, icon: "!" },
};

export default function ToastContainer({ toasts, style, ...rest }) {
  if (!toasts || toasts.length === 0) return null;

  return (
    <div
      role="status"
      aria-live="polite"
      aria-label="Notifications"
      style={{
        position: "fixed",
        top: 20,
        right: 20,
        zIndex: 9999,
        display: "flex",
        flexDirection: "column",
        gap: 8,
        maxWidth: 380,
        width: "100%",
        pointerEvents: "none",
        ...style,
      }}
      {...rest}
    >
      {toasts.map((t) => {
        const ts = typeStyles[t.type] || typeStyles.success;
        return (
          <div
            key={t.id}
            role="alert"
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              padding: "12px 16px",
              background: ts.bg,
              border: `1px solid ${ts.border}`,
              borderRadius: 12,
              color: ts.color,
              fontSize: 14,
              fontWeight: 500,
              fontFamily: "Manrope, sans-serif",
              boxShadow: "0 4px 20px rgba(0,0,0,0.08)",
              pointerEvents: "auto",
              animation: "slideIn 0.25s ease",
            }}
          >
            <span
              style={{
                width: 22,
                height: 22,
                borderRadius: "50%",
                background: ts.color,
                color: "#fff",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 12,
                fontWeight: 700,
                flexShrink: 0,
              }}
            >
              {ts.icon}
            </span>
            <span>{t.message}</span>
          </div>
        );
      })}
    </div>
  );
}
