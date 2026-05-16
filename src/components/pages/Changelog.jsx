import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";

const CLOG = [
  {
    v: "1.4.0",
    date: "May 2026",
    tag: "New",
    tc: G.success,
    items: [
      "Bulk Send — upload CSV to send to hundreds at once",
      "Contact Book — save customers, manage opt-outs",
      "QR Code Generator — for receipts and signage",
      "Annual billing with 20% discount",
    ],
  },
  {
    v: "1.3.0",
    date: "Apr 2026",
    tag: "Improved",
    tc: G.purple,
    items: [
      "Automations — auto-send rules with custom delays",
      "Integrations — Square, Shopify, Mindbody, Zapier",
      "Team Members — invite staff",
      "Review Widget — embed on any website",
    ],
  },
  {
    v: "1.2.0",
    date: "Mar 2026",
    tag: "New",
    tc: G.success,
    items: [
      "Analytics — 8-week trend, rating distribution, service breakdown",
      "Templates — unlimited reusable message templates",
      "Review replies — respond from the dashboard",
      "Export reviews to CSV",
    ],
  },
  {
    v: "1.1.0",
    date: "Feb 2026",
    tag: "Improved",
    tc: G.purple,
    items: [
      "AI messages using Gemini 2.0 Flash — faster and more natural",
      "Send via SMS, Email, or Both",
      "Notifications centre with badge",
      "Settings — API keys, notifications",
    ],
  },
  {
    v: "1.0.0",
    date: "Jan 2026",
    tag: "Launch",
    tc: G.accent,
    items: [
      "ReviewPing launches publicly",
      "Dashboard, send requests, onboarding wizard",
      "SMS and email delivery",
      "14-day free trial for all new accounts",
    ],
  },
];

export default function Changelog() {
  return (
    <div>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "0 0 4px",
          letterSpacing: "-0.5px",
        }}
      >
        What's new
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Product updates and new features — shipped every 2–3 weeks.
      </p>
      {CLOG.map((r, i) => (
        <div
          key={r.v}
          style={{
            marginBottom: 24,
            paddingBottom: 24,
            borderBottom:
              i < CLOG.length - 1 ? `1px solid ${G.border}` : "none",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 20,
                color: G.ink,
                fontWeight: 400,
              }}
            >
              {r.v}
            </span>
            <Pill color={r.tc}>{r.tag}</Pill>
            <span
              style={{
                fontSize: 12.5,
                color: G.muted,
                marginLeft: "auto",
              }}
            >
              {r.date}
            </span>
          </div>
          <div style={{ paddingLeft: 4 }}>
            {r.items.map((item, j) => (
              <div
                key={j}
                style={{
                  display: "flex",
                  gap: 10,
                  marginBottom: 9,
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    color: G.accent,
                    fontSize: 11,
                    fontWeight: 700,
                    marginTop: 3,
                    flexShrink: 0,
                  }}
                >
                  →
                </span>
                <span
                  style={{
                    fontSize: 14,
                    color: G.inkSoft,
                    lineHeight: 1.6,
                  }}
                >
                  {item}
                </span>
              </div>
            ))}
          </div>
        </div>
      ))}
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
          textAlign: "center",
          padding: 20,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          Have a feature request?
        </div>
        <p style={{ margin: "0 0 14px", fontSize: 13.5, color: G.inkSoft }}>
          We build what our customers ask for.
        </p>
        <Btn size="sm">Submit a request →</Btn>
      </Card>
    </div>
  );
}
