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

export default function VSTruereviewPage({ onSignup, onLogin, onBack }) {
  const rows = [
    {
      feature: "Price",
      truereview: <span style={styles.priceHighlight}>$49/mo</span>,
      ping: <span style={{ ...styles.priceHighlight, ...styles.reviewPingPrice }}>₹599/mo</span>,
      highlight: true,
    },
    {
      feature: "Review Requests",
      truereview: <Check />,
      ping: <Check />,
    },
    {
      feature: "AI Reply Generator",
      truereview: <Check />,
      ping: <Check />,
    },
    {
      feature: "WhatsApp Review Requests",
      truereview: <Cross />,
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span>
        </>
      ),
      highlight: true,
    },
    {
      feature: "Analytics Dashboard",
      truereview: <Check />,
      ping: <Check />,
    },
    {
      feature: "Custom Templates",
      truereview: <Check />,
      ping: <Check />,
    },
    {
      feature: "Multi-Location",
      truereview: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Check /> +$39/location
        </span>
      ),
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>₹1,499/mo Agency</span>
        </>
      ),
    },
    {
      feature: "14-Day Free Trial",
      truereview: <Cross />,
      ping: <Check />,
      highlight: true,
    },
    {
      feature: "Multiple Plans",
      truereview: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Cross /> Single plan
        </span>
      ),
      ping: <Check />,
    },
    {
      feature: "Cancel Anytime",
      truereview: <Check />,
      ping: <Check />,
    },
  ];

  return (
    <div style={styles.page}>
      <SEO
        title="ReviewPing vs TrueReview: Best Budget Review Tool?"
        description="Compare ReviewPing (₹599/mo) vs TrueReview ($49/mo). ReviewPing offers more features and a lower starting price than TrueReview."
        path="/vs/truereview"
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
        <div style={styles.heroBadge}>🏆 Best Budget Review Tool</div>
        <h1 style={styles.heroTitle}>
          TrueReview is great.{" "}
          <span style={styles.heroTitleEm}>But $49/mo for one plan?</span>
        </h1>
        <p style={styles.heroSub}>
          You get the same core review-requesting power — email, WhatsApp, and
          AI-powered replies — starting at just <strong>₹599/mo</strong>,
          which is nearly 40% less than TrueReview's single $49 plan.
          ReviewPing also offers multiple pricing tiers, a generous
          <strong>14-day free trial</strong>, and WhatsApp review
          requests that TrueReview does not support at any price level.
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
          No credit card required • Cancel anytime • 14-day free trial
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
                  TrueReview
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
                      <span style={styles.tableBadge}>Save 40%</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    {row.truereview}
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
          Why ReviewPing wins against TrueReview
        </h2>
        <p style={styles.whySub}>
          TrueReview is a capable review platform, but its single $49/mo
          plan leaves you with few options if your needs change or your
          budget is tight. ReviewPing gives you far more flexibility —
          multiple pricing tiers including a <strong>free $0/mo plan</strong>,
          WhatsApp review requests for reaching customers on their preferred
          channel, and transparent pricing with no per-location fees that
          appear after you sign up. It is a more complete solution for
          businesses that want choices, not limitations.
        </p>

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <span style={styles.cardIcon}>💰</span>
            <h3 style={styles.cardTitle}>Price Flexibility</h3>
            <p style={styles.cardText}>
              TrueReview locks you into $49/mo. ReviewPing starts at ₹599/mo
              with a free trial, so you only pay for what you need.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>💬</span>
            <h3 style={styles.cardTitle}>WhatsApp Reviews</h3>
            <p style={styles.cardText}>
              Reach customers where they actually chat. TrueReview doesn't
              offer WhatsApp review requests — ReviewPing does on Premium+.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🆓</span>
            <h3 style={styles.cardTitle}>Free to Start</h3>
            <p style={styles.cardText}>
              Test the waters with $0 commitment. TrueReview has no free
              tier — you're paying from day one.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>📍</span>
            <h3 style={styles.cardTitle}>No Per-Location Fees</h3>
            <p style={styles.cardText}>
              TrueReview charges $39 extra per location. ReviewPing's
              Agency plan covers up to 5 locations at ₹1,499/mo flat.
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
          TrueReview and ReviewPing share similar DNA as modern review
          management platforms, but the details reveal important differences
          in pricing flexibility, feature depth, and scalability. Here is
          an honest comparison to help you decide which platform fits your
          business better.
        </p>

        <div style={styles.detailGrid}>
          <table style={styles.detailTable}>
            <thead>
              <tr>
                <th style={styles.detailTh}>Feature</th>
                <th style={{...styles.detailTh, ...styles.detailThCenter, ...styles.detailThCompetitor}}>TrueReview</th>
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
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>14-day free trial</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Per-location fees</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontWeight: 600 }}>$39/location extra</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.success, fontWeight: 600 }}>₹1,499/mo unlimited</span></td>
              </tr>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>WhatsApp integration</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Month-to-month contracts</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /> Cancel anytime</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── who should choose ── */}
      <section style={styles.whoSection}>
        <h2 style={styles.whoHeading}>
          Who should choose ReviewPing instead of TrueReview?
        </h2>
        <p style={styles.whoText}>
          ReviewPing is the smarter choice for budget-conscious business
          owners who want to start small and scale on their own terms.
          Our <strong>14-day free trial</strong> lets you test the platform at
          $0/month before committing, whereas TrueReview requires payment
          from day one. Multi-location operators will prefer ReviewPing's
          flat-rate Agency plan over TrueReview's per-location fee model.
          And any business that wants WhatsApp review requests, flexible
          plan options, or the ability to upgrade incrementally will find
          ReviewPing's tiered approach far more accommodating than
          TrueReview's single-plan structure.
        </p>
      </section>

      {/* ── faq ── */}
      <section style={styles.faqSection}>
        <h2 style={styles.faqHeading}>
          Frequently asked questions about TrueReview alternatives
        </h2>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            How does ReviewPing compare to TrueReview on pricing?
          </h3>
          <p style={styles.faqAnswer}>
            ReviewPing is significantly more affordable and flexible.
            TrueReview charges a flat <strong>$49/month</strong> for a
            single plan with no free tier and additional per-location fees.
            ReviewPing starts at <strong>₹599/month</strong> with a
            <strong>14-day free trial</strong>, multiple
            upgrade paths, and a flat-rate Agency plan at ₹1,499/month that
            covers up to 5 locations. Whether you are a solo operator
            or a growing agency, ReviewPing's pricing scales with you
            rather than against you.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Does ReviewPing offer WhatsApp review requests like it claims?
          </h3>
          <p style={styles.faqAnswer}>
            Yes. ReviewPing includes WhatsApp review requests on our
            Premium+ plans and above, giving your customers the convenience
            of leaving a review through the messaging app they already use
            every day. TrueReview does not offer WhatsApp integration at
            any price point. This is a significant advantage for businesses
            whose customers are more responsive to WhatsApp messages than
            traditional email, particularly in markets where WhatsApp
            is the primary communication channel.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Is it easy to migrate from TrueReview to ReviewPing?
          </h3>
          <p style={styles.faqAnswer}>
            Yes. ReviewPing provides free migration support for TrueReview
            users switching to our platform. Our team helps you transfer
            your review request templates, automation rules, and connected
            locations so you can continue collecting reviews without
            interruption. The migration process typically takes just a few
            days, and because ReviewPing is designed for ease of use, your
            team will be comfortable with the new interface almost
            immediately after a brief walkthrough.
          </p>
        </div>
      </section>

      {/* ── cta ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaWrap}>
          <h2 style={styles.ctaTitle}>
            Switch from TrueReview. Start at{" "}
            <span style={{ color: G.gold }}>₹599/mo</span>.
          </h2>
          <p style={styles.ctaSub}>
            No setup fees, a 14-day free trial to get started, and the
            freedom to cancel anytime — no questions asked. You will be up
            and running in 5 minutes with your first review request sent
            within the hour. Already using TrueReview? Our team offers free
            migration support so you can switch without losing any data or
            disrupting your existing review collection workflow.
          </p>
          <button style={styles.ctaBtn} onClick={onSignup}>
            Start Free Trial
          </button>
          <span style={styles.ctaSmall}>
            Using TrueReview? We'll help you migrate — free.
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
