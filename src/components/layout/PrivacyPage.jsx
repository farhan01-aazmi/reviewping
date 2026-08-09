import { G } from "../../data/theme";
import { Btn, Wordmark } from "../ui";
import SEO from "../SEO";

const sections = [
  {
    t: "1. Information We Collect",
    b: 'We collect the following information when you use ReviewPing: account registration details (your name, email address, and business name), billing information (processed securely by our payment processor, Dodo Payments — we do not store full payment card details), customer data you choose to upload (customer names, phone numbers, and email addresses used solely for sending review requests), and usage data (how you interact with the Service, features used, and actions taken, collected via PostHog analytics).',
  },
  {
    t: "2. How We Use Your Information",
    b: 'We use your information to provide, maintain, and improve the ReviewPing service, including sending review requests to your customers via SMS, email, and WhatsApp as you direct, processing payments and managing subscriptions, sending service-related communications (billing notices, product updates, support responses), analyzing usage patterns to improve our platform, and complying with legal obligations under Indian law.',
  },
  {
    t: "3. Data Sharing",
    b: 'We do not sell your personal data or your customer data. We share information only with trusted third-party service providers who help us operate the Service: Supabase (database and authentication), Dodo Payments (payment processing), Resend (email delivery), Twilio (SMS and WhatsApp delivery), and PostHog (product analytics). Each of these providers is contractually obligated to protect your data and may only process it for the purposes we specify. We may also disclose information if required by law or to protect our legal rights.',
  },
  {
    t: "4. Data Retention",
    b: 'We retain your account information and customer data for as long as your account remains active. If you delete your account or request deletion, your data will be permanently removed within 90 days, unless a longer retention period is required under the Digital Personal Data Protection Act, 2023 or other applicable Indian law. You may request deletion at any time by contacting privacy@reviewping.pro.',
  },
  {
    t: "5. Your Rights Under the DPDP Act, 2023",
    b: 'As a Data Principal under India\'s Digital Personal Data Protection Act, 2023, you have the right to access a summary of the personal data we hold about you and the processing activities we carry out, request correction or completion of inaccurate or incomplete data, request erasure of your personal data, withdraw consent at any time (without affecting the lawfulness of processing carried out before withdrawal), and nominate another individual to exercise these rights on your behalf in the event of death or incapacity. If you are located outside India, you may also have equivalent rights under your local data protection law. To exercise any of these rights, contact privacy@reviewping.pro. We will respond within 30 days.',
  },
  {
    t: "6. Cookies and Analytics",
    b: 'ReviewPing uses essential cookies necessary for the Service to function (such as session cookies that keep you logged in and security cookies that help prevent fraud), as well as product analytics cookies via PostHog, which help us understand how the Service is used so we can improve it. Analytics data is tied to your business account, not to your customers, and is never used for advertising or sold to third parties. You can disable non-essential cookies through your browser settings, though this may affect certain Service features.',
  },
  {
    t: "7. Grievance Officer",
    b: 'In accordance with the Information Technology Act, 2000 and rules made thereunder, the Grievance Officer for ReviewPing can be contacted at grievance@reviewping.pro for any complaints regarding the processing of your personal data. We will acknowledge complaints within 24 hours and endeavour to resolve them within 15 days.',
  },
  {
    t: "8. Contact",
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
