import { G } from "../../data/theme";
import { Btn, Wordmark } from "../ui";
import SEO from "../SEO";

const sections = [
  {
    t: "1. 14-Day Free Trial",
    b: 'ReviewPing offers a 14-day free trial for all new accounts. No payment information is required to start your trial. You will not be charged during the trial period. If you cancel before the trial ends, your account will simply expire and you will never be billed. No refund is needed because no charge is made. If you sign up mid-cycle, your trial still runs the full 14 days from signup — no prorating. You can send up to 50 review requests during this period at no cost.',
  },
  {
    t: "2. Monthly Plans",
    b: 'Monthly subscriptions are billed on the same day each month. You may cancel your monthly plan at any time. If you cancel, you will continue to have access to the Service through the end of the current billing period. No refunds are provided for partial months of service. There are no cancellation fees. For example, if you cancel on the 15th and your billing date is the 1st, you keep access until the 1st of the following month. This gives you time to export any data or review history you need before your account is downgraded.',
  },
  {
    t: "3. Annual Plans",
    b: 'Annual subscriptions are billed once per year. If you cancel within 30 days of your initial annual purchase, you are eligible for a prorated refund — the refund amount will equal the annual fee minus a monthly rate for the time used. After 30 days, annual subscription fees are non-refundable. To request a refund on an annual plan, contact billing@reviewping.pro. Prorated refunds are processed within 5–7 business days. The monthly rate used for calculation is equivalent to the standard monthly plan price at the time of your purchase.',
  },
  {
    t: "4. How to Cancel",
    b: 'You can cancel your subscription at any time by emailing billing@reviewping.pro or through your account dashboard under Settings > Billing. Once cancelled, your account will remain active until the end of the current billing period and will then be downgraded. We do not require a cancellation notice period — cancel whenever you need to. Downgraded accounts lose access to premium features like WhatsApp review requests and advanced analytics, but your basic data remains viewable for 30 days after cancellation.',
  },
  {
    t: "5. Contact",
    b: 'If you have any questions about billing or refunds, please contact us at billing@reviewping.pro. We aim to respond within 24 hours on business days. If you email outside of business hours (Monday–Friday, 9am–6pm), we will respond the next business day. For urgent billing issues, include "URGENT" in the subject line and we will prioritise your request.',
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
            <Wordmark size={56} onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} />
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

        {/* Refund Philosophy */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto",
            padding: "0 22px 40px",
          }}
        >
          <div
            style={{
              background: G.surface,
              border: `1.5px solid ${G.border}`,
              borderRadius: 14,
              padding: "28px 24px",
            }}
          >
            <p
              style={{
                fontSize: 11,
                fontWeight: 700,
                color: G.accent,
                letterSpacing: "1.5px",
                textTransform: "uppercase",
                margin: "0 0 8px",
              }}
            >
              Our Refund Philosophy
            </p>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.8,
                color: G.inkSoft,
                margin: 0,
              }}
            >
              We believe in transparent pricing that respects your business. 
              Unlike many review platforms that lock you into long-term contracts 
              and surprise you with hidden fees, ReviewPing lets you cancel 
              anytime with no penalties. Our refund policy reflects this 
              philosophy: a full 14-day free trial with no payment required, 
              pro-rated refunds for early annual cancellations, and zero 
              cancellation fees. No hidden fees, no long-term contracts — just 
              honest pricing you can count on. If our service isn't right for 
              you, the exit should be as simple as the signup.
            </p>
          </div>
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

        {/* FAQ */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto",
            padding: "0 22px 40px",
          }}
        >
          <h2
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: 28,
              fontWeight: 400,
              margin: "0 0 24px",
              letterSpacing: "-0.6px",
            }}
          >
            Frequently asked questions about billing
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                background: G.surface,
                border: `1.5px solid ${G.border}`,
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 18,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  color: G.ink,
                }}
              >
                Can I switch between monthly and annual billing?
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: G.inkSoft,
                  margin: 0,
                }}
              >
                Yes. You can upgrade from monthly to annual at any time — the 
                system will prorate your remaining monthly balance toward the 
                annual plan. Downgrading from annual to monthly is available at 
                renewal time. Contact support if you need to switch mid-cycle.
              </p>
            </div>
            <div
              style={{
                background: G.surface,
                border: `1.5px solid ${G.border}`,
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 18,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  color: G.ink,
                }}
              >
                What happens after my 14-day free trial?
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: G.inkSoft,
                  margin: 0,
                }}
              >
                On day 15, if you haven't cancelled, your account will 
                automatically convert to a monthly plan using the pricing tier 
                shown during signup. We send you an email reminder 48 hours 
                before the trial ends so there are no surprises. You can cancel 
                at any point during the trial with no charge.
              </p>
            </div>
            <div
              style={{
                background: G.surface,
                border: `1.5px solid ${G.border}`,
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 18,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  color: G.ink,
                }}
              >
                Do you offer refunds for unused portion of an annual plan?
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: G.inkSoft,
                  margin: 0,
                }}
              >
                Yes — if you cancel within the first 30 days of your annual 
                subscription, you'll receive a prorated refund for the unused 
                months. After 30 days, annual subscriptions are non-refundable, 
                but your account remains active until the end of the paid term.
              </p>
            </div>
            <div
              style={{
                background: G.surface,
                border: `1.5px solid ${G.border}`,
                borderRadius: 12,
                padding: "18px 20px",
              }}
            >
              <h3
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 18,
                  fontWeight: 400,
                  margin: "0 0 6px",
                  color: G.ink,
                }}
              >
                How do I update my payment method?
              </h3>
              <p
                style={{
                  fontSize: 14,
                  lineHeight: 1.7,
                  color: G.inkSoft,
                  margin: 0,
                }}
              >
                You can update your payment method at any time from your account 
                dashboard under Settings &gt; Billing. We accept all major credit 
                and debit cards. If your payment fails, we'll retry up to 3 times 
                over 5 days before your account is suspended.
              </p>
            </div>
          </div>
        </section>

        {/* Need help deciding? */}
        <section
          style={{
            maxWidth: 660,
            margin: "0 auto 40px",
            padding: "0 22px",
          }}
        >
          <div
            style={{
              background: G.accentBg,
              border: `1.5px solid ${G.accentBd}`,
              borderRadius: 14,
              padding: "32px 28px",
              textAlign: "center",
            }}
          >
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 8px",
                color: G.ink,
              }}
            >
              Need help deciding?
            </h3>
            <p
              style={{
                fontSize: 14,
                lineHeight: 1.7,
                color: G.inkSoft,
                margin: "0 0 18px",
              }}
            >
              Not sure which plan is right for you? Start with our 14-day free 
              trial — no credit card required, no commitment. You'll get full 
              access to all features including email and WhatsApp review requests, 
              AI-personalised templates, and real-time analytics. Our support 
              team is also happy to help you choose the right plan. There's zero 
              risk to try.
            </p>
            <Btn size="sm" onClick={onSignup}>
              Start free trial →
            </Btn>
          </div>
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
            size={34}
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
