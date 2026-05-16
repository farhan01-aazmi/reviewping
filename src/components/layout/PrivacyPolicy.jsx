import { G } from "../../data/theme";
import { Wordmark, Btn, Pill } from "../ui";

const sections = [
  {
    t: "Information we collect",
    b: "We collect information you provide when creating an account (name, email, business name), information about your customers you choose to enter (name, phone number, email address), usage data about how you interact with our service, and payment information processed securely by Stripe.",
  },
  {
    t: "How we use your information",
    b: "We use your information to provide and improve ReviewPing, send review requests on your behalf to your customers, process payments, send you product updates and billing information, and comply with legal obligations.",
  },
  {
    t: "Customer data",
    b: "The customer contact information you enter (names, phone numbers, emails) is used solely to send review requests as directed by you. We never use this data for our own marketing, never sell it, and never share it with third parties except as necessary to deliver messages (e.g., SMS carriers).",
  },
  {
    t: "Data retention",
    b: "We retain your account data for as long as your account is active. Customer data is retained for 2 years from last contact. You may request deletion of your data at any time by emailing privacy@reviewping.io.",
  },
  {
    t: "Your rights (GDPR)",
    b: "If you are in the EU or UK, you have the right to access, correct, or delete your personal data; the right to data portability; the right to object to processing; and the right to withdraw consent. Contact privacy@reviewping.io to exercise these rights.",
  },
  {
    t: "Cookies",
    b: "We use essential cookies to keep you logged in and prevent fraud. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, though this may affect functionality.",
  },
  {
    t: "Security",
    b: "We use industry-standard encryption (TLS) for all data in transit and AES-256 encryption for data at rest. We conduct regular security audits and are SOC 2 Type II compliant.",
  },
  {
    t: "Contact us",
    b: "For any privacy questions or requests, email privacy@reviewping.io or write to ReviewPing Ltd, 20 Farringdon Road, London EC1M 3HE, United Kingdom. We will respond within 30 days.",
  },
];

export default function PrivacyPolicy({ onBack }) {
  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
      }}
    >
      <header
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          padding: "15px 22px",
          borderBottom: `1px solid ${G.border}`,
          background: G.surface,
        }}
      >
        <Wordmark size={15} />
        <Btn variant="ghost" size="sm" onClick={onBack}>
          ← Back
        </Btn>
      </header>

      <div style={{ maxWidth: 660, margin: "0 auto", padding: "48px 22px 64px" }}>
        <div style={{ marginBottom: 8 }}>
          <Pill label="Legal" variant="info" />
        </div>
        <h1
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 40,
            fontWeight: 400,
            margin: "12px 0 8px",
            letterSpacing: "-1px",
          }}
        >
          Privacy Policy
        </h1>
        <p style={{ color: G.muted, margin: "0 0 36px", fontSize: 14 }}>
          Last updated: 1 May 2026 · Effective: 1 May 2026
        </p>
        <p
          style={{
            fontSize: 15,
            lineHeight: 1.8,
            color: G.inkSoft,
            marginBottom: 32,
          }}
        >
          ReviewPing ("we", "us", "our") is committed to protecting your personal
          data and the personal data of your customers. This policy explains what
          information we collect, how we use it, and your rights.
        </p>

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
      </div>
    </div>
  );
}
