import { G } from "../../data/theme";
import { Btn, Wordmark } from "../ui";
import SEO from "../SEO";

const sections = [
  {
    t: "1. Information We Collect",
    b: 'We collect the following information when you use ReviewPing: account registration details (your name, email address, and business name), billing information (processed securely by Stripe — we do not store full payment card details), customer data you choose to upload (customer names, phone numbers, and email addresses used solely for sending review requests), and usage data (how you interact with the Service, features used, and page views).',
  },
  {
    t: "2. How We Use Your Information",
    b: 'We use your information to provide, maintain, and improve the ReviewPing service, including sending review requests to your customers via SMS and email as you direct, processing payments and managing subscriptions, sending service-related communications (billing notices, product updates, support responses), analyzing usage patterns to improve our platform, and complying with legal obligations.',
  },
  {
    t: "3. Data Sharing",
    b: 'We do not sell your personal data or your customer data. We share information only with trusted third-party service providers who help us operate the Service: Supabase (database and authentication), Stripe (payment processing), Resend (email delivery), and Twilio (SMS delivery). Each of these providers is contractually obligated to protect your data and may only process it for the purposes we specify. We may also disclose information if required by law or to protect our legal rights.',
  },
  {
    t: "4. Data Retention",
    b: 'We retain your account information and customer data for as long as your account remains active. If you delete your account or request deletion, your data will be permanently removed within 90 days. You may request deletion at any time by contacting privacy@reviewping.pro.',
  },
  {
    t: "5. Your Rights",
    b: 'Depending on your jurisdiction, you may have the right to access the personal data we hold about you, request correction of inaccurate data, request deletion of your data ("right to be forgotten"), request a copy of your data in a portable format, and withdraw consent where processing is based on consent. To exercise any of these rights, contact privacy@reviewping.pro. We will respond within 30 days.',
  },
  {
    t: "6. Cookies",
    b: 'ReviewPing uses only essential cookies that are necessary for the Service to function properly. These include session cookies that keep you logged in and security cookies that help prevent fraud. We do not use tracking cookies, advertising cookies, or third-party analytics cookies that collect personal information for marketing purposes. You can disable cookies through your browser settings, though this may affect the functionality of the Service.',
  },
  {
    t: "7. Contact",
    b: 'If you have any questions or concerns about this Privacy Policy or how we handle your data, please contact us at privacy@reviewping.pro.',
  },
];

export default function PrivacyPage({ onSignup, onLogin, onBack }) {
  return (
    <>
      <SEO title="Privacy Policy" description="ReviewPing Privacy Policy — how we collect, use, and protect your data and your customers' data." path="/privacy" />
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
            Privacy Policy
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
