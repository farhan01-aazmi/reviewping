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
  thBirdEye: {
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
  birdeyePrice: {
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

export default function VSBirdeyePage({ onSignup, onLogin, onBack }) {
  const rows = [
    {
      feature: "Price",
      birdeye: <span style={styles.priceHighlight}><span style={styles.birdeyePrice}>$299+</span>/mo per location</span>,
          ping: <span style={{ ...styles.priceHighlight, ...styles.reviewPingPrice }}>₹599/mo</span>,
      highlight: true,
    },
    {
      feature: "Review Requests",
      birdeye: <Check />,
      ping: <Check />,
    },
    {
      feature: "AI Reply Generator",
      birdeye: <Check />,
      ping: <Check />,
    },
    {
      feature: "WhatsApp Review Requests",
      birdeye: <Cross />,
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span>
        </>
      ),
    },
    {
      feature: "Analytics Dashboard",
      birdeye: <Check />,
      ping: <Check />,
    },
    {
      feature: "Multi-Location",
      birdeye: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Check /> Expensive add-on
        </span>
      ),
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>₹1,499/mo</span>
        </>
      ),
    },
    {
      feature: "White-Label",
      birdeye: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Check /> Custom quote
        </span>
      ),
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>₹1,499/mo</span>
        </>
      ),
    },
    {
      feature: "14-Day Free Trial",
      birdeye: <Cross />,
      ping: <Check />,
    },
    {
      feature: "Cancel Anytime",
      birdeye: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Cross /> 1-yr contract
        </span>
      ),
      ping: (
        <span style={{ color: G.success, fontWeight: 600 }}>
          <Check /> Cancel anytime
        </span>
      ),
    },
    {
      feature: "Built for small biz",
      birdeye: <Cross />,
      ping: <Check />,
      highlight: true,
    },
  ];

  return (
    <div style={styles.page}>
      <SEO
        title="ReviewPing vs Birdeye: The ₹599/mo Alternative"
        description="Compare ReviewPing (₹599/mo) vs Birdeye ($299+/mo per location). Save 90% on review management with AI-powered features and no long-term contracts."
        path="/vs/birdeye"
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
        <div style={styles.heroBadge}>🏆 #1 Birdeye Alternative</div>
        <h1 style={styles.heroTitle}>
          Birdeye is great.{" "}
          <span style={styles.heroTitleEm}>But not for $299/mo.</span>
        </h1>
        <p style={styles.heroSub}>
          You get the same core review-requesting power — email, WhatsApp,
          automation, and analytics — at <strong>90% less cost</strong>
          than Birdeye. No bloated enterprise contracts, no per-location
          pricing surprises, and no forced annual commitments. ReviewPing
          delivers professional-grade review management that is actually
          affordable for small and mid-sized businesses, not just large
          enterprises with dedicated marketing budgets.
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
                <th style={{ ...styles.th, ...styles.thBirdEye, ...styles.tdCenter }}>
                  Birdeye
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
                      <span style={styles.tableBadge}>Save 90%</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    {row.birdeye}
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
          Built for the businesses Birdeye ignores
        </h2>
        <p style={styles.whySub}>
          Birdeye built its entire go-to-market strategy around large
          enterprises with dedicated marketing departments, six-figure
          budgets, and compliance teams. ReviewPing is purpose-built for
          everyone else — independent restaurants, medical and dental
          clinics, salons and spas, e-commerce stores, and local service
          providers who simply want a reliable way to collect more reviews
          without the enterprise overhead and complex pricing structures
          that come with platforms designed for big corporations.
        </p>

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <span style={styles.cardIcon}>🍽️</span>
            <h3 style={styles.cardTitle}>Restaurants</h3>
            <p style={styles.cardText}>
              Seat more guests by turning every satisfied diner into a
              5-star review — automatically, after every visit.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🏥</span>
            <h3 style={styles.cardTitle}>Clinics & Dentists</h3>
            <p style={styles.cardText}>
              Follow up with patients after appointments. Build local
              reputation without adding admin work.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>✂️</span>
            <h3 style={styles.cardTitle}>Salons & Spas</h3>
            <p style={styles.cardText}>
              Send review requests after every booking. Keep your Google
              rating high and your books full.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🛒</span>
            <h3 style={styles.cardTitle}>E-Commerce</h3>
            <p style={styles.cardText}>
              Capture post-purchase happiness with Email & WhatsApp review
              flows. Turn buyers into brand advocates.
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
          While Birdeye and ReviewPing share some core capabilities, the
          real differences emerge in pricing structure, feature availability,
          and contract flexibility. Here is an honest side-by-side look at
          what each platform delivers for your monthly investment.
        </p>

        <div style={styles.detailGrid}>
          <table style={styles.detailTable}>
            <thead>
              <tr>
                <th style={styles.detailTh}>Feature</th>
                <th style={{...styles.detailTh, ...styles.detailThCenter, ...styles.detailThCompetitor}}>Birdeye</th>
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
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Per-location pricing</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontWeight: 600 }}>$299+/loc/mo</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.success, fontWeight: 600 }}>₹599/mo flat</span></td>
              </tr>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>WhatsApp integration</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Month-to-month contracts</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontWeight: 600 }}><Cross /> 1-yr contract</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.success, fontWeight: 600 }}><Check /> Cancel anytime</span></td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      {/* ── who should choose ── */}
      <section style={styles.whoSection}>
        <h2 style={styles.whoHeading}>
          Who should choose ReviewPing instead of Birdeye?
        </h2>
        <p style={styles.whoText}>
          ReviewPing is the obvious choice for independent business owners
          who need professional review management without Birdeye's
          enterprise price tag. Single-location restaurants, dental
          practices, and retail stores will save over <strong>90%</strong>
          by choosing ReviewPing's <strong>₹599/month</strong> plan over
          Birdeye's $299+/month starting point. Multi-location operators
          benefit from our flat-rate Agency plan that covers up to 5
          locations — no per-location surcharges. And any business that
          values month-to-month flexibility over annual lock-in will find
          ReviewPing's no-contract approach refreshingly straightforward.
        </p>
      </section>

      {/* ── faq ── */}
      <section style={styles.faqSection}>
        <h2 style={styles.faqHeading}>
          Frequently asked questions about Birdeye alternatives
        </h2>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Is ReviewPing a viable alternative to Birdeye?
          </h3>
          <p style={styles.faqAnswer}>
            Absolutely. ReviewPing covers all the essential review management
            features — automated email and WhatsApp requests, AI reply generation,
            analytics dashboards, and multi-location support — at a fraction
            of Birdeye's cost. The main difference is that Birdeye also
            offers additional tools like listings management, social media
            posting, and customer surveys. If you only need review
            collection and management, ReviewPing is the smarter choice.
            If you need the full all-in-one marketing suite, Birdeye may
            still make sense despite the higher price.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            How much can I save by switching from Birdeye to ReviewPing?
          </h3>
          <p style={styles.faqAnswer}>
            Most businesses save <strong>90% or more</strong>. Birdeye
            starts at approximately $299/month per location and often
            requires annual contracts. ReviewPing starts at just
            <strong> ₹599/month</strong> with a 14-day free trial. A
            single-location business switching from Birdeye to ReviewPing
            saves over <strong>$3,200 per year</strong>. Multi-location
            operators save significantly more since ReviewPing's Agency
            plan at ₹1,499/month covers up to 5 locations with no
            per-location surcharges.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Does ReviewPing integrate with Google and Facebook reviews?
          </h3>
          <p style={styles.faqAnswer}>
            Yes. ReviewPing connects directly with your Google Business Profile
            to send review requests, track new reviews, and
            manage your online reputation from a single dashboard. You can
            automate the entire workflow — from post-service follow-up to
            review publishing — without ever leaving the ReviewPing
            platform. Birdeye offers similar integrations, but at a price
            point that is prohibitive for most small and mid-sized
            businesses.
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
            Switch from Birdeye. Start at{" "}
            <span style={{ color: G.gold }}>₹599/mo</span>.
          </h2>
          <p style={styles.ctaSub}>
            No per-location fees, no mandatory onboarding calls, and no
            long-term contracts — just a straightforward review platform
            that works from day one. You will be up and running in 5 minutes
            with your first review request live within the hour. Already
            using Birdeye? Our team provides free migration support so you
            can switch without losing any data or disrupting your workflow.
          </p>
          <button style={styles.ctaBtn} onClick={onSignup}>
            Start Free Trial
          </button>
          <span style={styles.ctaSmall}>
            Already using Birdeye? We'll help you migrate your data — free.
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
