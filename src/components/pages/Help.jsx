import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";

export default function Help() {
  const [open, setOpen] = useState(null);

  const faqs = [
    {
      q: "How do I find my Google review link?",
      a: "Open Google Maps, search your business, tap 'Share' → 'Copy link'. Paste this into Settings → Google review link.",
    },
    {
      q: "How does the AI message writing work?",
      a: "When you tap '✦ AI Write', ReviewPing uses Claude (Anthropic's AI) to write a personalised, human-sounding message based on the customer's name and service. Every message is unique.",
    },
    {
      q: "SMS vs Email — which is better?",
      a: "SMS has a 98% open rate and gets read within 3 minutes on average. Email is better if you only have an email address. 'Both' covers all bases.",
    },
    {
      q: "Can I customise templates?",
      a: "Yes! Go to Templates in the nav. Edit any default template or create your own using {name}, {link}, and {service} as placeholders.",
    },
    {
      q: "Is my data safe?",
      a: "All data is encrypted in transit and at rest. We are fully GDPR compliant. We never sell customer data. Every SMS includes an opt-out link as required by law.",
    },
    {
      q: "How do I cancel?",
      a: "Go to Billing → your plan → Downgrade. Or email hello@reviewping.io. You keep access until the billing period ends.",
    },
    {
      q: "Why isn't the customer receiving the message?",
      a: "Check the number includes a country code (+1 for USA, +44 for UK). Some carriers filter messages — try Email as an alternative.",
    },
  ];

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
        Help & Support
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Everything you need to get the most from ReviewPing.
      </p>
      <div
        className="rgrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 22,
        }}
      >
        {[
          { e: "✉️", t: "Email support", s: "hello@reviewping.io" },
          { e: "💬", t: "Live chat", s: "Mon–Fri, 9am–5pm GMT" },
          { e: "📖", t: "Documentation", s: "docs.reviewping.io" },
          { e: "🎥", t: "Video tutorials", s: "YouTube channel" },
        ].map((a) => (
          <Card key={a.t} sx={{ cursor: "pointer", padding: 16 }} hoverable>
            <div style={{ fontSize: 22, marginBottom: 8 }}>{a.e}</div>
            <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 3 }}>
              {a.t}
            </div>
            <div style={{ fontSize: 12, color: G.accent }}>{a.s}</div>
          </Card>
        ))}
      </div>
      <div
        style={{
          fontWeight: 700,
          fontSize: 14,
          marginBottom: 14,
          color: G.inkSoft,
        }}
      >
        Frequently asked questions
      </div>
      {faqs.map((f, i) => (
        <div
          key={i}
          style={{
            borderBottom: `1px solid ${G.border}`,
            overflow: "hidden",
          }}
        >
          <div
            onClick={() => setOpen(open === i ? null : i)}
            style={{
              padding: "15px 0",
              cursor: "pointer",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              gap: 12,
            }}
          >
            <span
              style={{
                fontWeight: 600,
                fontSize: 14,
                color: G.inkSoft,
                flex: 1,
              }}
            >
              {f.q}
            </span>
            <span
              style={{
                color: G.muted,
                fontSize: 16,
                flexShrink: 0,
                transform: open === i ? "rotate(180deg)" : "none",
                transition: "transform 0.2s",
              }}
            >
              ▾
            </span>
          </div>
          {open === i && (
            <div
              style={{
                paddingBottom: 16,
                fontSize: 13.5,
                color: G.muted,
                lineHeight: 1.7,
              }}
            >
              {f.a}
            </div>
          )}
        </div>
      ))}
      <Card
        sx={{
          marginTop: 20,
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 6 }}>
          Still need help?
        </div>
        <p
          style={{
            margin: "0 0 14px",
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          Our team typically responds within 2 hours during business hours.
        </p>
        <Btn>✉ Email hello@reviewping.io</Btn>
      </Card>
    </div>
  );
}
