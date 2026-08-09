import { G } from "../../data/theme";
import { Wordmark, Pill } from "../ui";
import {
  LayoutDashboard,
  Star,
  Send,
  QrCode,
  Settings,
  CreditCard,
  FileText,
} from "lucide-react";

const SIDEBAR_WIDTH = 220;

const ICON_SIZE = 18;
const ICON_STROKE = 1.75;

const NAV = [
  { id: "dashboard", label: "Dashboard", icon: LayoutDashboard },
  { id: "reviews", label: "Reviews", icon: Star },
  { id: "requests", label: "Requests", icon: Send },
  { id: "qr-gateway", label: "QR Gateway", icon: QrCode },
  { id: "templates", label: "Templates", icon: FileText },
  { id: "settings", label: "Settings", icon: Settings },
  { id: "billing", label: "Billing", icon: CreditCard },
];

export default function Sidebar({ screen, onNav, plan, unread }) {
  return (
    <aside
      style={{
        width: SIDEBAR_WIDTH,
        flexShrink: 0,
        background: G.surface,
        borderRight: `1px solid ${G.border}`,
        display: "flex",
        flexDirection: "column",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}
    >
      <div style={{ padding: "18px 16px 14px", borderBottom: `1px solid ${G.border}` }}>
        <Wordmark size={48} />
      </div>

      <nav style={{ flex: 1, padding: "8px 8px", display: "flex", flexDirection: "column", gap: 2 }}>
        {NAV.map((n) => {
          const active = screen === n.id;
          const Icon = n.icon;
          return (
            <button
              key={n.id}
              onClick={() => onNav(n.id)}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                padding: "10px 12px",
                borderRadius: 8,
                border: "none",
                background: active ? G.accentBg : "transparent",
                color: active ? G.accent : G.inkSoft,
                cursor: "pointer",
                fontSize: 13.5,
                fontWeight: active ? 700 : 500,
                fontFamily: "'Manrope',sans-serif",
                textAlign: "left",
                transition: "all 0.12s",
                width: "100%",
              }}
            >
              <Icon size={ICON_SIZE} strokeWidth={ICON_STROKE} style={{ flexShrink: 0 }} />
              <span>{n.label}</span>
              {n.id === "reviews" && unread > 0 && (
                <span
                  style={{
                    marginLeft: "auto",
                    background: G.accent,
                    color: "#fff",
                    fontSize: 10,
                    fontWeight: 700,
                    padding: "1px 6px",
                    borderRadius: 10,
                    minWidth: 18,
                    textAlign: "center",
                  }}
                >
                  {unread}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      <div style={{ padding: "12px 16px", borderTop: `1px solid ${G.border}` }}>
        <Pill
          label={
            plan === "free" ? "Free" : plan === "starter" ? "Starter" : plan === "agency" ? "Agency" : "Pro"
          }
          variant={plan === "free" ? "info" : "success"}
        />
      </div>
    </aside>
  );
}

export { SIDEBAR_WIDTH };