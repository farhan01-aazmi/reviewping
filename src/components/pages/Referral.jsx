import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import { fmtDate } from "../../utils/formatters";

export default function Referral({ user, toast }) {
  const code = `RP-${(user?.name || "USER")
    .toUpperCase()
    .replace(/\s/g, "")
    .slice(0, 6)}`;
  const link = `https://reviewping.io/?ref=${code}`;
  const [copied, setCopied] = useState(false);
  const [refs] = useState([
    { name: "David Chen", status: "active", earned: "$39", joined: Date.now() - 10 * 86400000 },
    { name: "Priya Sharma", status: "trial", earned: "Pending", joined: Date.now() - 3 * 86400000 },
    { name: "Sam Wilson", status: "active", earned: "$39", joined: Date.now() - 20 * 86400000 },
  ]);

  const total = refs.filter((r) => r.status === "active").length * 39;

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast("Link copied to clipboard!");
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
        Referral program
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Earn $39 account credit for every business you refer.
      </p>
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
          marginBottom: 14,
          textAlign: "center",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 44,
            color: G.accent,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          ${total}
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: G.muted,
            marginBottom: 20,
          }}
        >
          Total earned · {refs.filter((r) => r.status === "active").length}{" "}
          active referrals
        </div>
        <div
          style={{
            padding: "12px 16px",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 12.5,
            color: G.inkSoft,
            marginBottom: 14,
            wordBreak: "break-all",
            textAlign: "left",
          }}
        >
          {link}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Btn onClick={copy}>
            {copied ? "✓ Copied!" : "Copy link"}
          </Btn>
          <Btn
            variant="secondary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "ReviewPing",
                  text: "Get more Google reviews automatically",
                  url: link,
                });
              } else {
                toast("Share not supported in this browser", "info");
              }
            }}
          >
            Share →
          </Btn>
        </div>
      </Card>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          { i: "🔗", t: "Share your link" },
          { i: "✅", t: "They sign up" },
          { i: "💰", t: "You earn $39" },
        ].map((s) => (
          <Card key={s.t} sx={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <div
              style={{ fontWeight: 700, fontSize: 12.5, color: G.inkSoft }}
            >
              {s.t}
            </div>
          </Card>
        ))}
      </div>
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
        Your referrals
      </div>
      {refs.map((r) => (
        <Card
          key={r.name}
          sx={{ marginBottom: 8, padding: "12px 14px" }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 12 }}
          >
            <div
              style={{
                width: 34,
                height: 34,
                borderRadius: "50%",
                background: G.accentBg,
                border: `1.5px solid ${G.accentBd}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontWeight: 800,
                fontSize: 13,
                color: G.accent,
                flexShrink: 0,
              }}
            >
              {r.name[0]}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                Joined {fmtDate(r.joined)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Pill
                color={r.status === "active" ? G.success : G.gold}
              >
                {r.status === "active" ? "Active" : "Trial"}
              </Pill>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: r.status === "active" ? G.success : G.muted,
                  marginTop: 4,
                }}
              >
                {r.earned}
              </div>
            </div>
          </div>
        </Card>
      ))}
      <Card
        sx={{
          marginTop: 10,
          background: G.bg,
          border: `1.5px solid ${G.border}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: G.muted,
            lineHeight: 1.7,
          }}
        >
          Credits apply when the referred user makes their first payment. No
          limit on referrals. Credits applied to your next invoice
          automatically.
        </p>
      </Card>
    </div>
  );
}
