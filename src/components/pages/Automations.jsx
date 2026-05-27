import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import Pill from "../ui/Pill";
import { toast } from "sonner";

export default function Automations() {
  const [rules, setRules] = useState([]);
  const [showNew, setShowNew] = useState(false);
  const [nName, setNName] = useState("");
  const [nDelay, setNDelay] = useState("1 hour");
  const [nCh, setNCh] = useState("SMS");

  const toggle = (id) => {
    setRules((p) =>
      p.map((r) => (r.id === id ? { ...r, active: !r.active } : r))
    );
    toast("Automation updated");
  };

  const add = () => {
    if (!nName) return;
    setRules((p) => [
      ...p,
      {
        id: Date.now(),
        name: nName,
        trigger: "After service ends",
        delay: nDelay,
        channel: nCh,
        active: true,
        sent: 0,
      },
    ]);
    setShowNew(false);
    setNName("");
    toast("Automation created");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
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
            Automations
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            Send review requests automatically — no manual effort.
          </p>
        </div>
        <Btn size="sm" onClick={() => setShowNew(true)}>
          + New rule
        </Btn>
      </div>
      <Card
        sx={{
          background: G.successBg,
          border: `1.5px solid ${G.successBd}`,
          marginBottom: 16,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          ⚡ <strong>How it works:</strong> Connect your booking system or POS,
          and ReviewPing automatically sends a review request when a service is
          marked complete — no clicks needed.
        </p>
      </Card>
      {showNew && (
        <Card
          sx={{
            marginBottom: 16,
            border: `1.5px solid ${G.accentBd}`,
            background: G.accentBg,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
            New automation rule
          </div>
          <Field
            label="Rule name"
            value={nName}
            onChange={(e) => setNName(e.target.value)}
            placeholder="e.g. Post-appointment SMS"
          />
          <Sel
            label="Send after"
            value={nDelay}
            onChange={(e) => setNDelay(e.target.value)}
            options={[
              "30 minutes",
              "1 hour",
              "2 hours",
              "4 hours",
              "24 hours",
              "48 hours",
            ]}
          />
          <Sel
            label="Channel"
            value={nCh}
            onChange={(e) => setNCh(e.target.value)}
            options={["SMS", "Email", "Both"]}
          />
          <div style={{ display: "flex", gap: 8 }}>
            <Btn variant="secondary" onClick={() => setShowNew(false)}>
              Cancel
            </Btn>
            <Btn onClick={add}>Create rule</Btn>
          </div>
        </Card>
      )}
      {rules.map((r) => (
        <Card key={r.id} sx={{ marginBottom: 10, padding: "16px 18px" }}>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "flex-start",
              gap: 12,
            }}
          >
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 8,
                  marginBottom: 5,
                }}
              >
                <span style={{ fontWeight: 700, fontSize: 14 }}>
                  {r.name}
                </span>
                {r.active && <Pill color={G.success}>Active</Pill>}
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  marginBottom: 3,
                }}
              >
                📅 {r.trigger} → wait {r.delay} → send {r.channel}
              </div>
              {r.sent > 0 && (
                <div style={{ fontSize: 12, color: G.inkSoft }}>
                  📤 {r.sent} sends total
                </div>
              )}
            </div>
            <div
              onClick={() => toggle(r.id)}
              style={{
                width: 44,
                height: 24,
                borderRadius: 12,
                background: r.active ? G.accent : G.border,
                position: "relative",
                cursor: "pointer",
                flexShrink: 0,
                transition: "background 0.2s",
              }}
            >
              <div
                style={{
                  position: "absolute",
                  top: 3,
                  left: r.active ? "unset" : "3px",
                  right: r.active ? "3px" : "unset",
                  width: 18,
                  height: 18,
                  borderRadius: "50%",
                  background: "white",
                  transition: "all 0.2s",
                  boxShadow: "0 1px 4px rgba(0,0,0,0.15)",
                }}
              />
            </div>
          </div>
        </Card>
      ))}
      <Card
        sx={{
          marginTop: 8,
          background: G.goldBg,
          border: `1.5px solid ${G.goldBd}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          🔌 Connect your tools
        </div>
        <p
          style={{
            margin: "0 0 12px",
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          Connect Square, Shopify, Mindbody, or your booking system to trigger
          automations automatically. Go to Integrations to connect.
        </p>
        <Btn variant="secondary" size="sm">
          View Integrations →
        </Btn>
      </Card>
    </div>
  );
}
