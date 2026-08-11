import SEO from "../SEO";
import { G } from "../../data/theme";

/* ───────────── helper components ───────────── */

const Check = () => (
  <span style={{ color: G.success, fontWeight: 700, fontSize: 18 }}>✓</span>
);
const Cross = () => (
  <span style={{ color: G.accent, fontWeight: 700, fontSize: 18 }}>✗</span>
);

const styles = {
  /* ───────────── layout ───────────── */
  page: {
    background: G.bg,
    color: G.ink,
    fontFamily: '"Inter", system-ui, -apple-system, sans-serif',
    minHeight: "100vh",
    lineHeight: 1.5,
  },

  /* ───────────── header ───────────── */
  header: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    padding: "16px 32px",
    borderBottom: `1px solid ${G.border}`,
    background: G.surface,
    position: "sticky",
    top: 0,
    zIndex: 50,
  },
  logo: {
    display: "flex",
    alignItems: "center",
    gap: 8,
    cursor: "pointer",
  },
  wordmark: {
    fontSize: 22,
    fontWeight: 700,
    color: G.ink,
    letterSpacing: "-0.02em",
  },
  wordmarkAccent: { color: G.accent },
  nav: {
    display: "flex",
    alignItems: "center",
    gap: 28,
  },
  navLink: {
    fontSize: 14,
    fontWeight: 500,
    color: G.muted,
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    fontFamily: "inherit",
    transition: "color 0.2s",
  },
  navRight: {
    display: "flex",
    alignItems: "center",
    gap: 12,
  },
  loginBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: G.inkSoft,
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: "8px 16px",
    fontFamily: "inherit",
    borderRadius: 8,
    transition: "background 0.2s",
  },
  trialBtn: {
    fontSize: 14,
    fontWeight: 600,
    color: G.surface,
    background: G.accent,
    cursor: "pointer",
    border: "none",
    padding: "10px 22px",
    fontFamily: "inherit",
    borderRadius: 10,
    transition: "background 0.2s, transform 0.2s",
    boxShadow: "0 2px 8px rgba(201,61,16,0.25)",
  },

  /* ───────────── hero ───────────── */
  heroSection: {
    textAlign: "center",
    padding: "80px 32px 56px",
    maxWidth: 800,
    margin: "0 auto",
  },
  heroBadge: {
    display: "inline-flex",
    alignItems: "center",
    gap: 6,
    fontSize: 13,
    fontWeight: 600,
    color: G.accent,
    background: G.accentBg,
    border: `1px solid ${G.accentBd}`,
    borderRadius: 100,
    padding: "4px 14px",
    marginBottom: 24,
  },
  heroTitle: {
    fontSize: 48,
    fontWeight: 800,
    lineHeight: 1.1,
    letterSpacing: "-0.03em",
    margin: "0 0 16px",
    color: G.ink,
  },
  heroTitleEm: {
    color: G.accent,
  },
  heroSub: {
    fontSize: 18,
    color: G.mutedLo,
    maxWidth: 560,
    margin: "0 auto 32px",
    lineHeight: 1.6,
  },
  heroCtaRow: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 12,
    flexWrap: "wrap",
  },
  primaryCta: {
    fontSize: 16,
    fontWeight: 700,
    color: G.surface,
    background: G.accent,
    cursor: "pointer",
    border: "none",
    padding: "14px 32px",
    fontFamily: "inherit",
    borderRadius: 12,
    transition: "background 0.2s, transform 0.2s",
    boxShadow: "0 4px 14px rgba(201,61,16,0.3)",
  },
  secondaryCta: {
    fontSize: 16,
    fontWeight: 600,
    color: G.inkSoft,
    cursor: "pointer",
    background: G.surface,
    border: `1px solid ${G.border}`,
    padding: "14px 28px",
    fontFamily: "inherit",
    borderRadius: 12,
    transition: "border-color 0.2s",
  },
  heroDisclaimer: {
    fontSize: 13,
    color: G.mutedLo,
    marginTop: 16,
  },

  /* ───────────── comparison table ───────────── */
  tableSection: {
    padding: "48px 32px 64px",
    maxWidth: 900,
    margin: "0 auto",
  },
  tableWrap: {
    overflowX: "auto",
    borderRadius: 16,
    border: `1px solid ${G.border}`,
    background: G.surface,
    boxShadow: "0 4px 24px rgba(26,23,20,0.06)",
  },
  table: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 15,
  },
  th: {
    textAlign: "left",
    padding: "16px 20px",
    fontWeight: 700,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: `2px solid ${G.border}`,
    background: G.bg,
  },
  thPodium: {
    color: G.mutedLo,
  },
  thReviewPing: {
    color: G.accent,
  },
  td: {
    padding: "14px 20px",
    borderBottom: `1px solid ${G.border}`,
    verticalAlign: "middle",
  },
  tdFeature: {
    fontWeight: 600,
    color: G.ink,
  },
  tdCenter: {
    textAlign: "center",
  },
  priceHighlight: {
    fontWeight: 800,
    fontSize: 16,
  },
  podiumPrice: {
    color: G.accent,
    textDecoration: "line-through",
    textDecorationColor: G.accent,
  },
  reviewPingPrice: {
    color: G.success,
  },
  tableBadge: {
    display: "inline-block",
    fontSize: 11,
    fontWeight: 700,
    color: G.surface,
    background: G.accent,
    borderRadius: 100,
    padding: "2px 10px",
    marginLeft: 6,
    verticalAlign: "middle",
    textTransform: "uppercase",
    letterSpacing: "0.03em",
  },
  rowHighlight: {
    background: G.accentBg,
  },

  /* ───────────── sticky header on table ───────────── */
  thead: {
    position: "sticky",
    top: 0,
    zIndex: 2,
  },

  /* ───────────── why section ───────────── */
  whySection: {
    padding: "40px 32px 56px",
    maxWidth: 900,
    margin: "0 auto",
  },
  whyHeading: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: "0 0 8px",
    color: G.ink,
  },
  whySub: {
    fontSize: 16,
    color: G.mutedLo,
    marginBottom: 32,
  },
  cardsGrid: {
    display: "grid",
    gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
    gap: 20,
  },
  card: {
    background: G.surface,
    borderRadius: 14,
    border: `1px solid ${G.border}`,
    padding: "24px 20px",
    transition: "box-shadow 0.25s, transform 0.25s",
  },
  cardIcon: {
    fontSize: 28,
    marginBottom: 12,
    display: "block",
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: 700,
    margin: "0 0 6px",
    color: G.ink,
  },
  cardText: {
    fontSize: 14,
    color: G.mutedLo,
    lineHeight: 1.6,
    margin: 0,
  },

  /* ───────────── cta banner ───────────── */
  ctaSection: {
    textAlign: "center",
    padding: "56px 32px",
    maxWidth: 720,
    margin: "0 auto",
  },
  ctaWrap: {
    background: G.ink,
    borderRadius: 20,
    padding: "48px 32px",
    color: G.surface,
  },
  ctaTitle: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: "0 0 12px",
  },
  ctaSub: {
    fontSize: 16,
    color: G.mutedLo,
    marginBottom: 28,
    opacity: 0.75,
  },
  ctaBtn: {
    fontSize: 17,
    fontWeight: 700,
    color: G.ink,
    background: G.surface,
    cursor: "pointer",
    border: "none",
    padding: "14px 36px",
    fontFamily: "inherit",
    borderRadius: 12,
    transition: "transform 0.2s",
    boxShadow: "0 4px 20px rgba(0,0,0,0.2)",
  },
  ctaSmall: {
    display: "block",
    fontSize: 13,
    color: G.mutedLo,
    marginTop: 14,
    opacity: 0.6,
  },

  /* ───────────── footer ───────────── */
  footer: {
    borderTop: `1px solid ${G.border}`,
    padding: "32px",
    textAlign: "center",
    fontSize: 13,
    color: G.mutedLo,
  },
  footerLinks: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 20,
    marginBottom: 12,
    flexWrap: "wrap",
  },
  footerLink: {
    color: G.mutedLo,
    cursor: "pointer",
    background: "none",
    border: "none",
    padding: 0,
    fontFamily: "inherit",
    fontSize: 13,
    textDecoration: "underline",
    textUnderlineOffset: 2,
  },

  /* ───────────── detailed comparison ───────────── */
  detailedSection: {
    padding: "8px 32px 56px",
    maxWidth: 900,
    margin: "0 auto",
  },
  detailedHeading: {
    fontSize: 32,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: "0 0 8px",
    color: G.ink,
    textAlign: "center",
  },
  detailedSub: {
    fontSize: 16,
    color: G.mutedLo,
    marginBottom: 32,
    textAlign: "center",
    maxWidth: 640,
    margin: "0 auto 32px",
    lineHeight: 1.6,
  },
  detailGrid: {
    overflowX: "auto",
    borderRadius: 16,
    border: `1px solid ${G.border}`,
    background: G.surface,
    boxShadow: "0 4px 24px rgba(26,23,20,0.06)",
  },
  detailTable: {
    width: "100%",
    borderCollapse: "collapse",
    fontSize: 15,
  },
  detailTh: {
    textAlign: "left",
    padding: "14px 20px",
    fontWeight: 700,
    fontSize: 14,
    textTransform: "uppercase",
    letterSpacing: "0.04em",
    borderBottom: `2px solid ${G.border}`,
    background: G.bg,
  },
  detailThCenter: {
    textAlign: "center",
    width: "30%",
  },
  detailThCompetitor: {
    color: G.mutedLo,
  },
  detailThPing: {
    color: G.accent,
  },
  detailTd: {
    padding: "12px 20px",
    borderBottom: `1px solid ${G.border}`,
    verticalAlign: "middle",
  },
  detailTdCenter: {
    textAlign: "center",
  },
  detailTdFeature: {
    fontWeight: 600,
    color: G.ink,
  },
  detailRowAlt: {
    background: G.bg,
  },

  /* ───────────── who section ───────────── */
  whoSection: {
    padding: "8px 32px 48px",
    maxWidth: 900,
    margin: "0 auto",
  },
  whoHeading: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: "0 0 16px",
    color: G.ink,
  },
  whoText: {
    fontSize: 16,
    color: G.mutedLo,
    lineHeight: 1.7,
    margin: 0,
  },

  /* ───────────── faq section ───────────── */
  faqSection: {
    padding: "40px 32px 56px",
    maxWidth: 720,
    margin: "0 auto",
  },
  faqHeading: {
    fontSize: 28,
    fontWeight: 800,
    letterSpacing: "-0.02em",
    margin: "0 0 32px",
    color: G.ink,
    textAlign: "center",
  },
  faqItem: {
    borderBottom: `1px solid ${G.border}`,
    padding: "20px 0",
  },
  faqQuestion: {
    fontSize: 17,
    fontWeight: 700,
    color: G.ink,
    margin: "0 0 8px",
    lineHeight: 1.4,
  },
  faqAnswer: {
    fontSize: 15,
    color: G.mutedLo,
    lineHeight: 1.7,
    margin: 0,
  },
};

/* ───────────── main component ───────────── */

export default function VSNicejobPage({ onSignup, onLogin, onBack }) {
  const rows = [
    {
      feature: "Price",
      nicejob: (
        <span style={styles.priceHighlight}>
          <span style={styles.podiumPrice}>$75–$125</span>/mo
          <br />
          <span style={{ fontSize: 12, color: G.mutedLo }}>~$99/mo typical</span>
        </span>
      ),
      ping: (
        <span style={{ ...styles.priceHighlight, ...styles.reviewPingPrice }}>
          ₹599/mo
        </span>
      ),
      highlight: true,
    },
    {
      feature: "Review Requests",
      nicejob: <Check />,
      ping: <Check />,
    },
    {
      feature: "AI Reply Generator",
      nicejob: <Cross />,
      ping: <Check />,
    },
    {
      feature: "WhatsApp Review Requests",
      nicejob: <Cross />,
      ping: (
        <>
          <Check />{" "}
          <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span>
        </>
      ),
    },
    {
      feature: "Analytics Dashboard",
      nicejob: (
        <span style={{ fontSize: 13, color: G.mutedLo }}>Basic</span>
      ),
      ping: <Check />,
    },
    {
      feature: "Custom Templates",
      nicejob: <Check />,
      ping: <Check />,
    },
    {
      feature: "14-Day Free Trial",
      nicejob: <Cross />,
      ping: <Check />,
    },
    {
      feature: "Cancel Anytime",
      nicejob: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Cross /> Contracts
        </span>
      ),
      ping: (
        <span style={{ color: G.success, fontWeight: 600 }}>
          <Check /> Cancel anytime
        </span>
      ),
    },
    {
      feature: "Multi-Location",
      nicejob: <Check />,
      ping: (
        <>
          <Check />{" "}
          <span style={{ fontSize: 13, color: G.mutedLo }}>₹1,499/mo</span>
        </>
      ),
      highlight: true,
    },
  ];

  return (
    <div style={styles.page}>
      <SEO
        title="ReviewPing vs Nicejob: Honest Comparison (2026)"
        description="Compare ReviewPing (₹599/mo) vs Nicejob ($75-$125/mo). See how ReviewPing's AI features and affordable pricing stack up against Nicejob's review automation."
        path="/vs/nicejob"
      />

      {/* ── header ── */}
      <header style={styles.header}>
        <div style={styles.logo} onClick={onBack}>
          <span style={styles.wordmark}>
            Review<span style={styles.wordmarkAccent}>Ping</span>
          </span>
        </div>

        <nav style={styles.nav}>
          <button style={styles.navLink} onClick={onBack}>Features</button>
          <button style={styles.navLink} onClick={onBack}>Pricing</button>
          <button style={styles.navLink} onClick={onBack}>Reviews</button>
        </nav>

        <div style={styles.navRight}>
          <button style={styles.loginBtn} onClick={onLogin}>
            Log in
          </button>
          <button style={styles.trialBtn} onClick={onSignup}>
            Start Free Trial
          </button>
        </div>
      </header>

      {/* ── hero ── */}
      <section style={styles.heroSection}>
        <div style={styles.heroBadge}>🏆 Smarter Than Nicejob</div>
        <h1 style={styles.heroTitle}>
          Nicejob is decent.{" "}
          <span style={styles.heroTitleEm}>But overpriced.</span>
        </h1>
        <p style={styles.heroSub}>
          Nicejob asks <strong>$75–$125/mo</strong> for basic review requests
          and monitoring — with no AI capabilities, no WhatsApp integration,
          and no free trial to test before you buy. ReviewPing gives you
          <strong> AI-powered reply generation</strong>, WhatsApp review
          requests, a full analytics dashboard, and a 14-day free trial —
          all starting at just <strong>₹599/mo</strong> with no contracts
          required.
        </p>
        <div style={styles.heroCtaRow}>
          <button style={styles.primaryCta} onClick={onSignup}>
            Start Free Trial — ₹599/mo
          </button>
          <button style={styles.secondaryCta} onClick={onLogin}>
            See My Dashboard
          </button>
        </div>
        <p style={styles.heroDisclaimer}>
          No credit card required • Cancel anytime • Free setup support
        </p>
      </section>

      {/* ── comparison table ── */}
      <section style={styles.tableSection}>
        <div style={styles.tableWrap}>
          <table style={styles.table}>
            <thead style={styles.thead}>
              <tr>
                <th style={styles.th}>Feature</th>
                <th style={{ ...styles.th, ...styles.thPodium, ...styles.tdCenter }}>
                  Nicejob
                </th>
                <th style={{ ...styles.th, ...styles.thReviewPing, ...styles.tdCenter }}>
                  ReviewPing
                </th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr
                  key={i}
                  style={
                    row.highlight
                      ? styles.rowHighlight
                      : i % 2 === 1
                      ? { background: G.bg }
                      : undefined
                  }
                >
                  <td style={{ ...styles.td, ...styles.tdFeature }}>
                    {row.feature}
                    {row.highlight && i === 0 && (
                      <span style={styles.tableBadge}>Save 60%+</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    {row.nicejob}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    {row.ping}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ── why reviewping section ── */}
      <section style={styles.whySection}>
        <h2 style={styles.whyHeading}>
          What Nicejob doesn't tell you
        </h2>
        <p style={styles.whySub}>
          Nicejob is a perfectly capable review platform — but it is
          expensive for what it delivers, lacks AI-powered features that
          save you hours each week, and often locks customers into annual
          contracts with hefty cancellation fees. Here is what you actually
          get with ReviewPing: smarter automation, more communication
          channels, and transparent month-to-month pricing that grows with
          you rather than trapping you.
        </p>

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <span style={styles.cardIcon}>🤖</span>
            <h3 style={styles.cardTitle}>AI Reply Generator</h3>
            <p style={styles.cardText}>
              Nicejob makes you write replies manually. ReviewPing
              auto-generates thoughtful responses to every review — saving
              hours each week.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>💬</span>
            <h3 style={styles.cardTitle}>WhatsApp Requests</h3>
            <p style={styles.cardText}>
              Nicejob doesn't support WhatsApp. ReviewPing lets you request
              reviews via WhatsApp on Growth plans and above.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🆓</span>
            <h3 style={styles.cardTitle}>Free to Start</h3>
            <p style={styles.cardText}>
              Nicejob starts at $75/mo with no free tier. ReviewPing has a
              14-day free trial so you can try before you buy.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🔓</span>
            <h3 style={styles.cardTitle}>No Contracts</h3>
            <p style={styles.cardText}>
              Nicejob requires annual commitments. ReviewPing lets you cancel
              anytime — no questions asked, no fees.
            </p>
          </div>
        </div>
      </section>

      {/* ── detailed feature comparison ── */}
      <section style={styles.detailedSection}>
        <h2 style={styles.detailedHeading}>
          Detailed Feature Comparison
        </h2>
        <p style={styles.detailedSub}>
          When you look past the marketing, Nicejob and ReviewPing differ
          in some important ways. Here is a transparent feature-by-feature
          comparison so you can see exactly what each platform delivers
          and where your money actually goes.
        </p>

        <div style={styles.detailGrid}>
          <table style={styles.detailTable}>
            <thead>
              <tr>
                <th style={styles.detailTh}>Feature</th>
                <th style={{...styles.detailTh, ...styles.detailThCenter, ...styles.detailThCompetitor}}>Nicejob</th>
                <th style={{...styles.detailTh, ...styles.detailThCenter, ...styles.detailThPing}}>ReviewPing</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Core review requests (Email + WhatsApp)</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>AI reply generation</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>14-day free trial</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Monthly pricing range</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontWeight: 600 }}>$75–$125/mo</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.success, fontWeight: 600 }}>₹599/mo flat</span></td>
              </tr>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>WhatsApp integration</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Month-to-month contracts</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontWeight: 600 }}><Cross /> Annual required</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.success, fontWeight: 600 }}><Check /> Cancel anytime</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── who should choose ── */}
      <section style={styles.whoSection}>
        <h2 style={styles.whoHeading}>
          Who should choose ReviewPing instead of Nicejob?
        </h2>
        <p style={styles.whoText}>
          ReviewPing is the better fit for budget-conscious business owners
          who want modern features like AI reply generation and WhatsApp
          outreach without paying for features they will never use.
          Independent restaurants, dental practices, and local service
          providers will appreciate the <strong>14-day free trial</strong>
          that lets them validate the platform before upgrading. Anyone
          frustrated by Nicejob's annual contract requirements will love
          ReviewPing's month-to-month flexibility. And e-commerce operators
          who need multi-channel review requests will find ReviewPing's
          email and WhatsApp coverage unmatched at this price point.
        </p>
      </section>

      {/* ── faq ── */}
      <section style={styles.faqSection}>
        <h2 style={styles.faqHeading}>
          Frequently asked questions about Nicejob alternatives
        </h2>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Is ReviewPing as feature-rich as Nicejob?
          </h3>
          <p style={styles.faqAnswer}>
            In many ways, ReviewPing is actually more feature-rich. While
            Nicejob covers the basics of review requests and monitoring,
            ReviewPing adds AI-powered reply generation, WhatsApp review
            requests, and a free trial — three things Nicejob simply does
            not offer. ReviewPing also provides a more modern analytics
            dashboard with actionable insights rather than just raw data.
            The only area where Nicejob may have an edge is in advanced
            enterprise reporting, which most small businesses never need.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Can ReviewPing handle multi-location review management?
          </h3>
          <p style={styles.faqAnswer}>
            Absolutely. ReviewPing's Agency plan at <strong>₹1,499/month</strong>
            supports up to 5 locations with white-label branding, making
            it ideal for multi-location businesses and marketing agencies.
            Nicejob also supports multiple locations, but at a significantly
            higher price point. ReviewPing gives you predictable flat-rate
            pricing that does not increase as you add more locations or
            team members — a critical advantage for growing operations.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Does ReviewPing require a long-term contract like Nicejob?
          </h3>
          <p style={styles.faqAnswer}>
            Not at all. ReviewPing is proudly month-to-month with no
            annual commitments and no cancellation fees. You can upgrade,
            downgrade, or cancel at any time with a single click. Nicejob
            often requires annual contracts that lock you in even if your
            needs change. If flexibility matters to your business,
            ReviewPing's transparent no-contract approach is a breath of
            fresh air compared to Nicejob's rigid commitment requirements.
          </p>
        </div>
      </section>

      
      {/* ── more comparisons ── */}
      <section
        style={{
          maxWidth: 760,
          margin: "0 auto",
          padding: "0 32px 40px",
          textAlign: "center",
        }}
      >
        <div
          style={{
            fontSize: 12.5,
            fontWeight: 600,
            color: G.muted,
            textTransform: "uppercase",
            letterSpacing: "0.08em",
            marginBottom: 14,
          }}
        >
          More comparisons
        </div>
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: 10,
            justifyContent: "center",
          }}
        >
          {[
            ["Podium", "/vs/podium"],
            ["Birdeye", "/vs/birdeye"],
            ["Grade.us", "/vs/grade-us"],
            ["Nicejob", "/vs/nicejob"],
            ["TrueReview", "/vs/truereview"],
            ["Podium Alternative", "/podium-alternative"],
          ].map(([label, path]) => (
            <a
              key={path}
              href={path}
              style={{
                fontSize: 14,
                fontWeight: 600,
                color: G.ink,
                background: G.surface,
                border: `1px solid ${G.border}`,
                borderRadius: 999,
                padding: "9px 18px",
                textDecoration: "none",
              }}
            >
              {label}
            </a>
          ))}
        </div>
      </section>

      {/* ── cta ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaWrap}>
          <h2 style={styles.ctaTitle}>
            Ditch the expensive contract. Start at{" "}
            <span style={{ color: G.gold }}>₹599/mo</span>.
          </h2>
          <p style={styles.ctaSub}>
            No setup fees, no onboarding calls, and definitely no long-term
            contracts — just honest pricing and a platform that works out of
            the box. You will be up and running in 5 minutes with your first
            review request sent in under an hour. Already using Nicejob? Our
            team offers free migration support to help you transfer your
            settings and get comfortable with ReviewPing quickly.
          </p>
          <button style={styles.ctaBtn} onClick={onSignup}>
            Start Free Trial
          </button>
          <span style={styles.ctaSmall}>
            Already using Nicejob? We'll help you migrate your data — free.
          </span>
        </div>
      </section>

      {/* ── footer ── */}
      <footer style={styles.footer}>
        <div style={styles.footerLinks}>
          <button style={styles.footerLink} onClick={onBack}>
            Features
          </button>
          <button style={styles.footerLink} onClick={onBack}>
            Pricing
          </button>
          <button style={styles.footerLink} onClick={onBack}>
            Privacy
          </button>
          <button style={styles.footerLink} onClick={onBack}>
            Terms
          </button>
          <button style={styles.footerLink} onClick={onBack}>
            Contact
          </button>
        </div>
        <div>© {new Date().getFullYear()} ReviewPing. All rights reserved.</div>
      </footer>
    </div>
  );
}
