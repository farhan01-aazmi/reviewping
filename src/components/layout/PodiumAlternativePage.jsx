import { G } from "../../data/theme";
import SEO from "../SEO";
import { Btn, Wordmark } from "../ui";
import { PODIUM_ALTERNATIVE_DATA } from "../../data/seoPages";

/* ─── Section renderer (shared with BlogArticle) ─── */
function renderSection(section, i) {
  if (typeof section === "string") return <p key={i} style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.85, color: G.inkSoft }}>{section}</p>;
  switch (section.type) {
    case "h2":
      return <h2 key={i} style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "36px 0 14px", letterSpacing: "-0.5px", lineHeight: 1.25 }}>{section.text}</h2>;
    case "h3":
      return <h3 key={i} style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400, margin: "28px 0 10px", letterSpacing: "-0.3px", lineHeight: 1.3 }}>{section.text}</h3>;
    case "p":
      return <p key={i} style={{ margin: "0 0 20px", fontSize: 16, lineHeight: 1.85, color: G.inkSoft }}>{section.text}</p>;
    case "ul":
      return (
        <ul key={i} style={{ margin: "0 0 20px", paddingLeft: 24, lineHeight: 2, color: G.inkSoft, fontSize: 15 }}>
          {section.items.map((item, j) => <li key={j}>{item}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} style={{ margin: "0 0 20px", paddingLeft: 24, lineHeight: 2, color: G.inkSoft, fontSize: 15 }}>
          {section.items.map((item, j) => <li key={j}>{item}</li>)}
        </ol>
      );
    case "table": {
      const isHighlight = (r, h) => r === 0 && h === rows.length - 1;
      const rows = section.rows || [];
      return (
        <div key={i} style={{ overflowX: "auto", margin: "0 0 24px", borderRadius: 10, border: `1px solid ${G.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            <thead>
              <tr style={{ background: G.bg, borderBottom: `2px solid ${G.border}` }}>
                {(section.headers || []).map((h, j) => (
                  <th key={j} style={{ padding: "12px 16px", textAlign: "left", fontWeight: 700, fontSize: 12.5, textTransform: "uppercase", letterSpacing: "0.04em", color: G.muted }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, r) => (
                <tr key={r} style={r % 2 === 1 ? { background: G.bg } : undefined}>
                  {row.map((cell, c) => (
                    <td key={c} style={{ padding: "12px 16px", borderTop: `1px solid ${G.border}`, color: c === 0 ? G.ink : G.inkSoft, fontWeight: c === 0 ? 600 : 400, fontSize: 13.5 }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    }
    case "blockquote":
      return (
        <blockquote key={i} style={{ margin: "0 0 24px", padding: "18px 22px", background: G.accentBg, borderLeft: `4px solid ${G.accent}`, borderRadius: "0 10px 10px 0", fontSize: 16, lineHeight: 1.7, color: G.inkSoft, fontStyle: "italic" }}>
          {section.text}
        </blockquote>
      );
    case "tip":
      return (
        <div key={i} style={{ margin: "0 0 24px", padding: "16px 20px", background: "#FFF9E6", border: "1px solid #F5E6B8", borderRadius: 10, fontSize: 14, lineHeight: 1.7, color: "#6B5B0E" }}>
          <strong style={{ display: "block", marginBottom: 4 }}>💡 Pro tip</strong>
          {section.text}
        </div>
      );
    case "cta":
      return (
        <div key={i} style={{ margin: "36px 0 24px", padding: "32px 28px", background: G.ink, borderRadius: 16, textAlign: "center", color: G.surface }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, marginBottom: 10, letterSpacing: "-0.3px" }}>{section.heading}</div>
          <p style={{ fontSize: 14, opacity: 0.75, margin: "0 0 22px", lineHeight: 1.6, maxWidth: 480, marginLeft: "auto", marginRight: "auto" }}>{section.text}</p>
          <button onClick={() => {}} style={{ background: G.surface, color: G.ink, border: "none", padding: "14px 28px", borderRadius: 10, fontSize: 15, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}>{section.btn || "Start free trial →"}</button>
        </div>
      );
    case "faq":
      return (
        <div key={i} style={{ margin: "0 0 24px" }}>
          {(section.items || []).map((item, j) => (
            <div key={j} style={{ marginBottom: 20, padding: "18px 20px", background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: G.ink }}>{item.q}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: G.inkSoft }}>{item.a}</div>
            </div>
          ))}
        </div>
      );
    default:
      return null;
  }
}

const NAV_LINKS = [
  { label: "Features", href: "/features" },
  { label: "Pricing", href: "/pricing" },
  { label: "ReviewPing vs Podium", href: "/vs/podium" },
  { label: "Blog", href: "/blog" },
  { label: "FAQ", href: "/faq" },
];

export default function PodiumAlternativePage({ onSignup, onLogin, onBack }) {
  const data = PODIUM_ALTERNATIVE_DATA;

  return (
    <div style={{ background: G.bg, minHeight: "100vh", fontFamily: "'Manrope',sans-serif", color: G.ink }}>
      <SEO title={data.title} description={data.desc} path={`/${data.slug}`} image={data.image} />

      {/* ── Header ── */}
      <header style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "16px 32px", borderBottom: `1px solid ${G.border}`, background: G.surface }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8, cursor: "pointer" }} onClick={onBack}>
          <Wordmark />
        </div>
        <nav style={{ display: "flex", gap: 24 }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={onBack} style={{ fontSize: 14, fontWeight: 500, color: G.muted, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit" }}>{l.label}</button>
          ))}
        </nav>
        <div style={{ display: "flex", gap: 10 }}>
          <Btn variant="ghost" onClick={onLogin}>Log in</Btn>
          <Btn onClick={onSignup}>Start Free Trial</Btn>
        </div>
      </header>

      {/* ── Hero ── */}
      <section style={{ textAlign: "center", padding: "64px 32px 40px", maxWidth: 800, margin: "0 auto" }}>
        <div style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: 13, fontWeight: 600, color: G.accent, background: G.accentBg, border: `1px solid ${G.accentBd}`, borderRadius: 100, padding: "4px 14px", marginBottom: 20 }}>
          🏆 #1 Podium Alternative
        </div>
        <h1 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 42, fontWeight: 400, letterSpacing: "-1px", lineHeight: 1.15, margin: "0 0 14px" }}>
          Podium is great.<br />
          <span style={{ color: G.accent }}>But not for $400/mo.</span>
        </h1>
        <p style={{ fontSize: 17, color: G.muted, maxWidth: 560, margin: "0 auto 28px", lineHeight: 1.7 }}>
          Same core review request features — email, WhatsApp, WhatsApp, automation — at <strong>93% less cost</strong>. No bloated contracts. No enterprise upsells.
        </p>
        <div style={{ display: "flex", justifyContent: "center", gap: 12, flexWrap: "wrap" }}>
          <Btn size="lg" onClick={onSignup}>Start Free Trial — ₹599/mo</Btn>
          <Btn variant="secondary" size="lg" onClick={onLogin}>See My Dashboard →</Btn>
        </div>
        <p style={{ fontSize: 13, color: G.mutedLo, marginTop: 14 }}>No credit card required • Cancel anytime • Free setup support</p>
      </section>

      {/* ── Content ── */}
      <article style={{ maxWidth: 700, margin: "0 auto", padding: "0 24px 64px" }}>
        {data.content.map((section, i) => renderSection(section, i))}
      </article>

      {/* ── Read next ── */}
      <section
        style={{
          maxWidth: 700,
          margin: "0 auto",
          padding: "0 24px 56px",
        }}
      >
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 24,
            fontWeight: 400,
            margin: "0 0 18px",
          }}
        >
          Read next
        </h2>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
          {[
            ["ReviewPing vs Podium: Full Comparison", "/blog/reviewping-vs-podium-comparison"],
            ["Podium Pricing 2026: Real Cost Breakdown", "/blog/podium-pricing-2026"],
            ["ReviewPing vs Podium (Side by Side)", "/vs/podium"],
            ["WhatsApp Review Requests Guide", "/blog/whatsapp-review-requests-guide"],
          ].map(([label, path]) => (
            <a
              key={path}
              href={path}
              style={{
                fontSize: 13.5,
                fontWeight: 600,
                color: G.ink,
                background: G.surface,
                border: `1px solid ${G.border}`,
                borderRadius: 999,
                padding: "8px 16px",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* ── Footer ── */}
      <footer style={{ borderTop: `1px solid ${G.border}`, padding: "28px 32px", textAlign: "center" }}>
        <div style={{ display: "flex", justifyContent: "center", gap: 20, marginBottom: 10, flexWrap: "wrap" }}>
          {NAV_LINKS.map((l) => (
            <button key={l.label} onClick={onBack} style={{ color: G.mutedLo, cursor: "pointer", background: "none", border: "none", fontFamily: "inherit", fontSize: 13, textDecoration: "underline", textUnderlineOffset: 2 }}>{l.label}</button>
          ))}
        </div>
        <div style={{ fontSize: 13, color: G.mutedLo }}>© {new Date().getFullYear()} ReviewPing. All rights reserved.</div>
      </footer>
    </div>
  );
}
