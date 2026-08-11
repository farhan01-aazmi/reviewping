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
  thCompetitor: {
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
  competitorPrice: {
    color: G.accent,
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

export default function VSGradeUsPage({ onSignup, onLogin, onBack }) {
  const rows = [
    {
      feature: "Price",
      competitor: (
        <span style={styles.priceHighlight}>
          <span style={styles.competitorPrice}>$40–$110</span>
          /seat/mo
        </span>
      ),
      ping: (
        <span style={{ ...styles.priceHighlight, ...styles.reviewPingPrice }}>
          ₹599/mo flat
        </span>
      ),
      highlight: true,
    },
    {
      feature: "Review Requests (Email & WhatsApp)",
      competitor: <Check />,
      ping: <Check />,
    },
    {
      feature: "AI Reply Generator",
      competitor: <span style={{ color: G.accent, fontSize: 13 }}>Limited</span>,
      ping: <Check />,
    },
    {
      feature: "WhatsApp Review Requests",
      competitor: <Cross />,
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>Premium+</span>
        </>
      ),
    },
    {
      feature: "Analytics Dashboard",
      competitor: <Check />,
      ping: <Check />,
    },
    {
      feature: "Custom Templates",
      competitor: <Check />,
      ping: <Check />,
    },
    {
      feature: "Unlimited Users",
      competitor: (
        <span style={{ color: G.accent, fontWeight: 600 }}>
          <Cross /> Per-seat pricing
        </span>
      ),
      ping: <Check />,
    },
    {
      feature: "White-Label",
      competitor: <Check />,
      ping: (
        <>
          <Check /> <span style={{ fontSize: 13, color: G.mutedLo }}>₹1,499/mo</span>
        </>
      ),
    },
    {
      feature: "14-Day Free Trial",
      competitor: <Cross />,
      ping: <Check />,
      highlight: true,
    },
    {
      feature: "Cancel Anytime",
      competitor: <Check />,
      ping: <Check />,
    },
  ];

  return (
    <div style={styles.page}>
      <SEO
        title="ReviewPing vs Grade.us: Which Review Platform Wins?"
        description="Compare ReviewPing (₹599/mo) vs Grade.us ($40-$110/seat/mo). See why ReviewPing offers better value with AI features and unlimited users."
        path="/vs/grade-us"
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
        <div style={styles.heroBadge}>🏆 Better Value Than Grade.us</div>
        <h1 style={styles.heroTitle}>
          Grade.us charges per seat.{"; "}
          <span style={styles.heroTitleEm}>We charge flat.</span>
        </h1>
        <p style={styles.heroSub}>
          Grade.us prices start at <strong>$40/seat/mo</strong> — meaning a
          team of just 3 people already costs you <strong>$120–$330/mo</strong>
          before you even send a single review request. ReviewPing gives you
          unlimited users, AI-powered reply generation, WhatsApp review
          requests, and a comprehensive analytics dashboard — all starting at
          just <strong>₹599/mo flat</strong> with no per-seat fees whatsoever.
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
                <th style={{ ...styles.th, ...styles.thCompetitor, ...styles.tdCenter }}>
                  Grade.us
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
                      <span style={styles.tableBadge}>Best Value</span>
                    )}
                  </td>
                  <td style={{ ...styles.td, ...styles.tdCenter }}>
                    {row.competitor}
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
          Why teams are switching from Grade.us
        </h2>
        <p style={styles.whySub}>
          Grade.us works reasonably well for agencies with small, fixed teams,
          but its per-seat pricing model actively punishes growing businesses.
          Every new team member you add costs another <strong>$40–$110/month</strong>,
          turning what looks like an affordable platform into an expensive
          line item. ReviewPing gives your entire team access to the full
          platform for one flat monthly price — no seat counts, no upgrade
          anxiety, no awkward "do we really need this person?" conversations.
        </p>

        <div style={styles.cardsGrid}>
          <div style={styles.card}>
            <span style={styles.cardIcon}>👥</span>
            <h3 style={styles.cardTitle}>Unlimited Team Members</h3>
            <p style={styles.cardText}>
              Add your whole team at no extra cost. No per-seat invoices. No
              "which users do we really need?" conversations.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🤖</span>
            <h3 style={styles.cardTitle}>AI-Powered Replies</h3>
            <p style={styles.cardText}>
              ReviewPing's built-in AI reply generator drafts responses to
              every review automatically. Grade.us has limited to no AI
              capabilities.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>💬</span>
            <h3 style={styles.cardTitle}>WhatsApp Review Requests</h3>
            <p style={styles.cardText}>
              Reach customers where they actually chat. ReviewPing sends review
              requests over WhatsApp (Premium+). Grade.us doesn't offer this.
            </p>
          </div>

          <div style={styles.card}>
            <span style={styles.cardIcon}>🆓</span>
            <h3 style={styles.cardTitle}>Free to Start</h3>
            <p style={styles.cardText}>
              Start with a 14-day free trial — no credit card required. Get real review
              requests without committing a dime. Grade.us offers no free tier.
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
          Here is how Grade.us and ReviewPing really compare across the
          features that determine your team's daily workflow and monthly
          budget. The biggest difference? Grade.us charges per person
          while ReviewPing charges a flat rate for the whole team.
        </p>

        <div style={styles.detailGrid}>
          <table style={styles.detailTable}>
            <thead>
              <tr>
                <th style={styles.detailTh}>Feature</th>
                <th style={{...styles.detailTh, ...styles.detailThCenter, ...styles.detailThCompetitor}}>Grade.us</th>
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
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontSize: 13 }}>Limited</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>14-day free trial</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Cross /></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><Check /></td>
              </tr>
              <tr style={styles.detailRowAlt}>
                <td style={{...styles.detailTd, ...styles.detailTdFeature}}>Per-seat pricing</td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.accent, fontWeight: 600 }}>$40–$110/seat/mo</span></td>
                <td style={{...styles.detailTd, ...styles.detailTdCenter}}><span style={{ color: G.success, fontWeight: 600 }}>₹599/mo unlimited users</span></td>
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
          Who should choose ReviewPing instead of Grade.us?
        </h2>
        <p style={styles.whoText}>
          ReviewPing is the ideal choice for growing teams that need to add
          staff without watching their software bill climb. Marketing agencies
          managing multiple client locations save significantly on our Agency
          plan at <strong>₹1,499/month</strong> with white-label branding
          included. Small business owners who want a free trial to test the
          waters before committing will appreciate our <strong>$0/mo</strong>
          tier. And any team that relies on AI-generated review replies or
          WhatsApp-based customer outreach will find those features baked
          into ReviewPing at no extra cost — whereas Grade.us charges a
          premium or omits them entirely.
        </p>
      </section>

      {/* ── faq ── */}
      <section style={styles.faqSection}>
        <h2 style={styles.faqHeading}>
          Frequently asked questions about Grade.us alternatives
        </h2>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            How does ReviewPing compare to Grade.us for agencies?
          </h3>
          <p style={styles.faqAnswer}>
            Grade.us is popular among agencies, but its per-seat pricing
            becomes expensive as soon as you scale your team or client base.
            ReviewPing's Agency plan at <strong>₹1,499/month</strong> includes
            unlimited users, white-label branding, and multi-location support
            — everything an agency needs to manage reviews across multiple
            clients without per-person surcharges. You can add account
            managers, strategists, and support staff without ever seeing
            a price increase.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Does ReviewPing have all the same features as Grade.us?
          </h3>
          <p style={styles.faqAnswer}>
            ReviewPing covers the essential features — email and WhatsApp review
            requests, analytics dashboards, custom templates, and
            multi-location support — and adds several that Grade.us lacks,
            including AI-powered reply generation, WhatsApp review requests,
            and a free trial. The main difference is that ReviewPing is
            simpler to set up and more affordable, while Grade.us offers
            deeper enterprise integrations that most small businesses
            never actually use.
          </p>
        </div>

        <div style={styles.faqItem}>
          <h3 style={styles.faqQuestion}>
            Can I migrate from Grade.us to ReviewPing easily?
          </h3>
          <p style={styles.faqAnswer}>
            Absolutely. ReviewPing offers free migration support for
            Grade.us users. Our team will help you transfer your review
            request templates, automation workflows, and connected
            locations so you can switch without downtime. Most migrations
            are completed within a few days, and because ReviewPing is
            designed for simplicity, your team will be comfortable with
            the new interface after just one training session.
          </p>
        </div>
      </section>

      {/* ── cta ── */}
      <section style={styles.ctaSection}>
        <div style={styles.ctaWrap}>
          <h2 style={styles.ctaTitle}>
            Ditch per-seat pricing. Start at{" "}
            <span style={{ color: G.gold }}>₹599/mo</span>.
          </h2>
          <p style={styles.ctaSub}>
            No seat limits, no hidden per-user fees, and no long-term
            contracts — just one flat price for your entire team. Set up
            your account in 5 minutes, invite everyone, and start sending
            review requests immediately. Already using Grade.us? We offer
            free migration assistance so you can switch without the headache.
          </p>
          <button style={styles.ctaBtn} onClick={onSignup}>
            Start Free Trial
          </button>
          <span style={styles.ctaSmall}>
            Already using Grade.us? We'll help you migrate — free.
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
