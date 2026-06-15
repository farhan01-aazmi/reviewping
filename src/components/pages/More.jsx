import { G } from "../../data/theme";
import { useTheme } from "../../data/ThemeProvider";
import Btn from "../ui/Btn";
import Card from "../ui/Card";

export default function More({ onNav, onLogout, unreadCount }) {
  const { isDark, toggleDark } = useTheme();
  const items = [
    { e: "📋", l: "Sent Log", s: "sentlog" },
    { e: "📤", l: "Bulk Send", s: "bulk" },
    { e: "📒", l: "Contacts", s: "contacts" },
    { e: "📱", l: "QR Code", s: "qrcode" },
    { e: "🖼️", l: "Widget", s: "widget" },
    { e: "🔌", l: "Integrations", s: "integrations" },
    { e: "🤖", l: "Automations", s: "automations" },
    { e: "👥", l: "Team", s: "team" },
    { e: "🔗", l: "Referral", s: "referral" },
    { e: "📝", l: "Changelog", s: "changelog" },
    { e: "🔔", l: "Notifications", s: "notifications", badge: unreadCount > 0 ? unreadCount : null },
    { e: "💳", l: "Billing", s: "billing" },
    { e: "⚙️", l: "Settings", s: "settings" },
    { e: "❓", l: "Help", s: "help" },
    { e: isDark ? "☀️" : "🌙", l: isDark ? "Light Mode" : "Dark Mode", s: "_dark", toggle: toggleDark },
  ];

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "0 0 20px",
          letterSpacing: "-0.5px",
        }}
      >
        More
      </h2>
      {items.map((i) => (
        <Card
          key={i.s}
          sx={{ marginBottom: 8, cursor: "pointer", padding: "13px 16px" }}
          hoverable
          onClick={() => (i.toggle ? i.toggle() : onNav(i.s))}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 19 }}>{i.e}</span>
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: G.inkSoft,
                flex: 1,
              }}
            >
              {i.l}
            </span>
            {i.badge && (
              <div
                style={{
                  width: 20,
                  height: 20,
                  borderRadius: "50%",
                  background: G.accent,
                  color: "white",
                  fontSize: 11,
                  fontWeight: 700,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {i.badge}
              </div>
            )}
            <span style={{ color: G.mutedLo, fontSize: 16 }}>›</span>
          </div>
        </Card>
      ))}
      <div
        style={{
          marginTop: 14,
          display: "flex",
          flexDirection: "column",
          gap: 8,
        }}
      >
        <Btn variant="secondary" fullWidth onClick={() => onNav("privacy")}>
          Privacy Policy
        </Btn>
        <Btn variant="secondary" fullWidth onClick={() => onNav("terms")}>
          Terms of Service
        </Btn>
        <Btn variant="danger" fullWidth onClick={onLogout}>
          Sign out
        </Btn>
      </div>
    </div>
  );
}
