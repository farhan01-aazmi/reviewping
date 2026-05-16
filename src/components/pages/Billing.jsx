import { useState } from "react";
import { G } from "../../data/theme";
import { PLANS } from "../../data/constants";
import { createSubscription } from "../../api";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import ConfirmModal from "../ui/ConfirmModal";

export default function Billing({ plan, setPlan, toast }) {
  const cur = PLANS.find((p) => p.id === plan) || PLANS[1];
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);

  const doSwitch = async (p) => {
    setLoading(true);
    try {
      const result = await createSubscription({ price_id: p.price_id, return_url: window.location.href });
      // Redirect to Stripe Checkout
      if (result?.url) {
        window.location.href = result.url;
      }
    } catch (err) {
      toast(err.message || "Failed to start checkout", "error");
    }
    setLoading(false);
    setConfirm(null);
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
        Billing & Plan
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Manage your subscription and payments.
      </p>
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: G.muted,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Current plan
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 24,
                color: G.accent,
              }}
            >
              {cur.name}
            </div>
            <div style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>
              {cur.f.slice(0, 2).join(" · ")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 30,
                color: G.ink,
              }}
            >
              ${cur.price}
            </div>
            <div style={{ fontSize: 12, color: G.muted }}>/month</div>
          </div>
        </div>
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
          This month's usage
        </div>
        {[
          { l: "Review requests", v: 23, max: plan === "starter" ? 50 : null },
          { l: "SMS messages", v: 18, max: null },
          { l: "Email messages", v: 5, max: null },
        ].map((u) => (
          <div key={u.l} style={{ marginBottom: 14 }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                marginBottom: 5,
              }}
            >
              <span style={{ fontSize: 13.5, color: G.inkSoft }}>
                {u.l}
              </span>
              <span style={{ fontSize: 13, color: G.muted, fontWeight: 600 }}>
                {u.v}
                {u.max ? ` / ${u.max}` : " sent"}
              </span>
            </div>
            <div
              style={{
                height: 6,
                background: G.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background:
                    u.max && u.v / u.max > 0.8 ? G.gold : G.accent,
                  borderRadius: 3,
                  width: `${
                    u.max ? Math.min((u.v / u.max) * 100, 100) : 30
                  }%`,
                }}
              />
            </div>
          </div>
        ))}
      </Card>
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
        Available plans
      </div>
      {PLANS.map((p) => (
        <Card
          key={p.id}
          sx={{
            marginBottom: 10,
            border: `1.5px solid ${p.id === plan ? G.accent : G.border}`,
          }}
        >
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 20,
                  marginBottom: 2,
                }}
              >
                {p.name} — ${p.price}/mo
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                {p.f.slice(0, 2).join(" · ")}
              </div>
            </div>
                {p.id === plan ? (
              <Pill color={G.success}>Current</Pill>
            ) : (
              <Btn
                size="sm"
                variant="secondary"
                onClick={() => setConfirm(p)}
                loading={loading}
                disabled={loading}
              >
                {p.price > cur.price ? "Upgrade →" : "Downgrade"}
              </Btn>
            )}
          </div>
        </Card>
      ))}
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          Payment method
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: 12,
            padding: "12px 14px",
            background: G.bg,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
          }}
        >
          <span style={{ fontSize: 22 }}>💳</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 600, fontSize: 14 }}>
              Visa ending 4242
            </div>
            <div style={{ fontSize: 12, color: G.muted }}>Expires 12/27</div>
          </div>
          <Btn variant="secondary" size="sm">
            Update
          </Btn>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          Billing history
        </div>
        {[
          { d: "1 May 2026", a: `$${cur.price}.00` },
          { d: "1 Apr 2026", a: `$${cur.price}.00` },
          { d: "1 Mar 2026", a: `$${cur.price}.00` },
        ].map((inv, i) => (
          <div
            key={i}
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "10px 0",
              borderBottom: i < 2 ? `1px solid ${G.border}` : "none",
            }}
          >
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>{inv.d}</div>
              <div style={{ fontSize: 11.5, color: G.muted }}>
                {cur.name} Plan
              </div>
            </div>
            <div
              style={{
                textAlign: "right",
                display: "flex",
                alignItems: "center",
                gap: 8,
              }}
            >
              <span style={{ fontSize: 13.5, fontWeight: 600 }}>{inv.a}</span>
              <Pill color={G.success}>Paid</Pill>
            </div>
          </div>
        ))}
      </Card>
    </div>
  );
}
