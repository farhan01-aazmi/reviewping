import { G } from "../../data/theme";
import { Wordmark, Btn, Pill } from "../ui";
import SEO from "../SEO";

const sections = [
  {
    t: "Acceptance of terms",
    b: 'By creating a ReviewPing account, you agree to these Terms of Service. If you do not agree, do not use the service. These terms apply to all users, including businesses and their team members.',
  },
  {
    t: "Description of service",
    b: 'ReviewPing provides a platform for small businesses to send automated review request messages to their customers via SMS and email. We are a communication tool — we do not write or publish reviews on your behalf.',
  },
  {
    t: "Account responsibilities",
    b: 'You are responsible for maintaining the security of your account credentials, all activity that occurs under your account, ensuring the customer contact information you upload is accurate and legally obtained, and complying with applicable opt-out and consent laws in your jurisdiction.',
  },
  {
    t: "Acceptable use",
    b: 'You may not use ReviewPing to send unsolicited messages to individuals who have not done business with you, send messages that are false, misleading, or deceptive, attempt to manipulate or fake reviews on Google or any other platform, or violate any applicable laws including GDPR, CCPA, CAN-SPAM, or TCPA.',
  },
  {
    t: "Payment & billing",
    b: 'ReviewPing is a subscription service billed monthly or annually. Your subscription renews automatically unless cancelled. Refunds are not provided for partial months. We reserve the right to change pricing with 30 days\' notice.',
  },
  {
    t: "Termination",
    b: 'You may cancel your account at any time from the Billing page. We may suspend or terminate accounts that violate these terms. Upon termination, your data will be deleted within 90 days.',
  },
  {
    t: "Limitation of liability",
    b: "ReviewPing is provided 'as is'. We are not liable for indirect, incidental, or consequential damages. Our total liability is limited to the amount you paid us in the 12 months prior to the claim.",
  },
  {
    t: "Governing law",
    b: 'These terms are governed by the laws of England and Wales. Any disputes shall be resolved in the courts of London, United Kingdom.',
  },
];

export default function Terms({ onBack }) {
  return (
    <>
      <SEO title="Terms of Service" description="ReviewPing Terms of Service — the legal agreement between you and ReviewPing." path="/terms" />
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
        <Wordmark size={40}/>
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
          Terms of Service
        </h1>
        <p style={{ color: G.muted, margin: "0 0 36px", fontSize: 14 }}>
          Last updated: 1 May 2026 · Effective: 1 May 2026
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
    </>
  );
}
