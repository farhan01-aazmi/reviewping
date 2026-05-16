import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";

const INTEGRATIONS = [
  {
    name: "Square",
    cat: "POS / Payments",
    desc: "Auto-trigger review requests when a Square payment is processed.",
    icon: "⬛",
    connected: false,
    popular: true,
  },
  {
    name: "Shopify",
    cat: "eCommerce",
    desc: "Send review requests after order fulfilment.",
    icon: "🛍️",
    connected: false,
    popular: true,
  },
  {
    name: "Mindbody",
    cat: "Fitness / Wellness",
    desc: "Trigger requests after class bookings are completed.",
    icon: "🧘",
    connected: false,
    popular: true,
  },
  {
    name: "Vagaro",
    cat: "Salon / Spa",
    desc: "Connect your Vagaro appointments to auto-send after each visit.",
    icon: "💅",
    connected: false,
    popular: false,
  },
  {
    name: "Zapier",
    cat: "Automation",
    desc: "Connect 5,000+ apps via Zapier triggers and actions.",
    icon: "⚡",
    connected: false,
    popular: true,
  },
  {
    name: "Stripe",
    cat: "Payments",
    desc: "Send review requests after a Stripe payment is confirmed.",
    icon: "💳",
    connected: false,
    popular: false,
  },
  {
    name: "Google Calendar",
    cat: "Scheduling",
    desc: "Auto-trigger requests when a calendar appointment ends.",
    icon: "📅",
    connected: false,
    popular: false,
  },
  {
    name: "Acuity",
    cat: "Scheduling",
    desc: "Send requests after Acuity appointments are marked complete.",
    icon: "📆",
    connected: false,
    popular: false,
  },
  {
    name: "Webhooks",
    cat: "Developer",
    desc: "Build custom integrations using our REST webhook API.",
    icon: "🔗",
    connected: false,
    popular: false,
  },
];

export default function Integrations({ plan, toast }) {
  const [ints, setInts] = useState(INTEGRATIONS);
  const [search, setSearch] = useState("");

  const list = search
    ? ints.filter(
        (i) =>
          i.name.toLowerCase().includes(search.toLowerCase()) ||
          i.cat.toLowerCase().includes(search.toLowerCase())
      )
    : ints;

  const connect = (name) => {
    if (plan === "starter") {
      toast("Upgrade to Growth to connect integrations", "error");
      return;
    }
    setInts((p) =>
      p.map((i) =>
        i.name === name ? { ...i, connected: !i.connected } : i
      )
    );
    toast(
      `${name} ${
        ints.find((i) => i.name === name)?.connected
          ? "disconnected"
          : "connected"
      }`
    );
  };

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
        Integrations
      </h2>
      <p style={{ margin: "0 0 20px", color: G.muted, fontSize: 13.5 }}>
        Connect your existing tools to trigger review requests automatically.
      </p>
      <div style={{ position: "relative", marginBottom: 16 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: G.muted,
          }}
        >
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search integrations…"
          aria-label="Search integrations"
          style={{
            width: "100%",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            padding: "10px 14px 10px 36px",
            fontSize: 13.5,
            color: G.ink,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "'Manrope',sans-serif",
          }}
        />
      </div>
      {list.filter((i) => i.popular).length > 0 && (
        <div
          style={{
            fontSize: 10.5,
            fontWeight: 700,
            color: G.muted,
            letterSpacing: "1px",
            textTransform: "uppercase",
            marginBottom: 12,
          }}
        >
          Popular
        </div>
      )}
      {list.map((i) => (
        <Card
          key={i.name}
          sx={{ marginBottom: 10, padding: "14px 16px" }}
        >
          <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
            <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 10,
                background: G.bg,
                border: `1.5px solid ${G.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 20,
                flexShrink: 0,
              }}
            >
              {i.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 3,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {i.name}
                </span>
                <Pill color={G.purple}>{i.cat}</Pill>
                {i.connected && (
                  <Pill color={G.success}>Connected</Pill>
                )}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  lineHeight: 1.55,
                }}
              >
                {i.desc}
              </div>
            </div>
            <Btn
              size="sm"
              variant={i.connected ? "danger" : "secondary"}
              onClick={() => connect(i.name)}
              sx={{ flexShrink: 0 }}
            >
              {i.connected ? "Disconnect" : "Connect"}
            </Btn>
          </div>
        </Card>
      ))}
      <Card
        sx={{
          marginTop: 8,
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          Don't see your tool?
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          We're adding new integrations every month. Request one or use our
          Webhook API to build your own.
        </p>
        <Btn size="sm">Request an integration →</Btn>
      </Card>
    </div>
  );
}
