import { G } from "../../data/theme";
import { Btn, Wordmark } from "../ui";
import SEO from "../SEO";

const sections = [
  {
    t: "1. 14-Day Free Trial",
    b: 'ReviewPing offers a 14-day free trial for all new accounts. No payment information is required to start your trial. You will not be charged during the trial period. If you cancel before the trial ends, your account will simply expire and you will never be billed. No refund is needed because no charge is made.',
  },
  {
    t: "2. Monthly Plans",
    b: 'Monthly subscriptions are billed on the same day each month. You may cancel your monthly plan at any time. If you cancel, you will continue to have access to the Service through the end of the current billing period. No refunds are provided for partial months of service. There are no cancellation fees.',
  },
  {
    t: "3. Annual Plans",
    b: 'Annual subscriptions are billed once per year. If you cancel within 30 days of your initial annual purchase, you are eligible for a prorated refund — the refund amount will equal the annual fee minus a monthly rate for the time used. After 30 days, annual subscription fees are non-refundable. To request a refund on an annual plan, contact billing@reviewping.pro.',
  },
  {
    t: "4. How to Cancel",
    b: 'You can cancel your subscription at any time by emailing billing@reviewping.pro or through your account dashboard under Settings > Billing. Once cancelled, your account will remain active until the end of the current billing period and will then be downgraded. We do not require a cancellation notice period — cancel whenever you need to.',
  },
  {
    t: "5. Contact",
    b: 'If you have any questions about billing or refunds, please contact us at billing@reviewping.pro. We aim to respond within 24 hours on business days.',
  },
];

export default function RefundPage({ onSignup, onLogin, onBack }) {
  return (
    <>
      <SEO title="Refund Policy" description="ReviewPing Refund Policy — details on our 14-day free trial, monthly and annual subscription refunds, and how to cancel." path="/refund" />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
      >
        <style>{`
          @keyframes fs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          .ft{animation:fs 0.35s ease}
        `}</style>

        {/* Header */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 22px",
            borderBottom: `1px solid ${G.border}`,
            background: G.bg,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Wordmark size={15} onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} />
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="ghost" size="sm" onClick={onLogin}>
              Sign in
            </Btn>
            <Btn size="sm" onClick={onSignup}>
              Start free trial →
            </Btn>
          </div>
        </header>

        {/* Hero */}
        <section
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 22px 40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,8vw,52px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "0 0 16px",
              fontWeight: 400,
            }}
          >
            Refund Policy
          </h1>
          <p
            style={{
              fontSize: 14,
              color: G.muted,
              margin: 0,
            }}
          >
            Last updated: June 3, 2026
          </p>
        </section>

        {/* Content */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto",
            padding: "0 22px 60px",
          }}
        >
          {sections.map((s, i) => (
            <div key={i} style={{ marginBottom: 28 }}>
              <h2
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 22,
                  fontWeight: 400,
                  margin: "0 0 10px",
                  letterSpacing: "-0.3px",
                }}
              >
                {s.t}
              </h2>
              <p
                style={{
                  fontSize: 14.5,
                  lineHeight: 1.8,
                  color: G.inkSoft,
                  margin: 0,
                }}
              >
                {s.b}
              </p>
            </div>
          ))}
        </section>

        {/* Footer */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "20px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <Wordmark
            size={13}
            onClick={() => window.location.href = "/"}
            style={{ cursor: "pointer" }}
          />
          <div style={{ display: "flex", gap: 16 }}>
            <span
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
              onClick={() => {
                window.history.pushState({}, "", "/privacy");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (window.history.pushState({}, "", "/privacy"),
                window.dispatchEvent(new PopStateEvent("popstate")))
              }
            >
              Privacy Policy
            </span>
            <span
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
              onClick={() => {
                window.history.pushState({}, "", "/terms");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (window.history.pushState({}, "", "/terms"),
                window.dispatchEvent(new PopStateEvent("popstate")))
              }
            >
              Terms of Service
            </span>
            <span
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
              onClick={() => (window.location.href = "mailto:hello@reviewping.io")}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (window.location.href = "mailto:hello@reviewping.io")
              }
            >
              Contact
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
