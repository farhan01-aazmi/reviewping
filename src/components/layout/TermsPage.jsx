import { G } from "../../data/theme";
import { Btn, Wordmark } from "../ui";
import SEO from "../SEO";

const sections = [
  {
    t: "1. Acceptance of Terms",
    b: 'By accessing or using ReviewPing ("the Service"), operated by ReviewPing (a business based in Bareilly, Uttar Pradesh, India), you agree to be bound by these Terms of Service, which are governed by the laws of India. If you do not agree with any part of these terms, you may not use the Service. These terms apply to all users, including business owners, employees, and anyone accessing the platform.',
  },
  {
    t: "2. Description of Service",
    b: 'ReviewPing is an automated review request platform that enables small businesses to send review requests to their customers via SMS, email, and WhatsApp. The Service helps businesses manage their online reputation by automating the process of asking for reviews. ReviewPing does not write, publish, or modify reviews on behalf of users, nor does it guarantee any specific review outcome.',
  },
  {
    t: "3. Payment and Refunds",
    b: 'ReviewPing operates on a subscription basis, with plans priced in Indian Rupees (₹). All subscriptions are billed on a monthly or annual cycle via our payment processor. No refunds are provided for partial months or years of service already rendered, except as required under the Consumer Protection Act, 2019 and applicable e-commerce rules. If you cancel, you will retain access to your account through the end of the current billing period. We reserve the right to change pricing with 30 days\' prior notice, communicated via email or in-app notification.',
  },
  {
    t: "4. User Responsibilities and Messaging Compliance",
    b: 'You are responsible for providing accurate and complete information when creating your account and using the Service. You must maintain the confidentiality of your login credentials and are liable for all activity under your account. If you send SMS messages through the Service to recipients in India, you are solely responsible for ensuring your own sender registration, template approval, and consent records comply with the Telecom Regulatory Authority of India (TRAI) Distributed Ledger Technology (DLT) regulations and the National Customer Preference Register (NCPR/DND) framework. You represent that all customer contact information you upload has been obtained lawfully, with appropriate consent, and in compliance with the Digital Personal Data Protection Act, 2023 ("DPDP Act") and other applicable Indian laws, as well as any relevant international regulations where your customers are located.',
  },
  {
    t: "5. Prohibited Uses",
    b: 'You may not use ReviewPing to generate fake reviews, incentivize positive reviews in exchange for rewards, harass or solicit customers who have opted out, send messages to individuals who have not done business with you, engage in any illegal or fraudulent activity, or use the Service in any way that violates the terms of Google, Meta/WhatsApp, or any other platform. Violation of these prohibitions may result in immediate account termination without notice.',
  },
  {
    t: "6. Intellectual Property",
    b: 'The ReviewPing name, logo, website, and all related content, features, and functionality are owned by ReviewPing and are protected under the Copyright Act, 1957, the Trade Marks Act, 1999, and other applicable Indian intellectual property laws. You may not reproduce, distribute, modify, or create derivative works without our express written permission. You retain all ownership of the customer data and business information you upload to the Service.',
  },
  {
    t: "7. Limitation of Liability",
    b: 'ReviewPing is provided "as is" and "as available" without warranties of any kind, either express or implied. We do not guarantee that the Service will be uninterrupted, secure, or error-free. To the maximum extent permitted under Indian law, ReviewPing shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising out of or relating to your use of the Service. Our total liability is limited to the amount you have paid us in the 12 months preceding the claim.',
  },
  {
    t: "8. Termination",
    b: 'You may cancel your account at any time by emailing billing@reviewping.pro or through your account dashboard. We reserve the right to suspend or terminate access to the Service for any violation of these terms, without prior notice. Upon termination, your access to the Service will cease, and your data will be deleted within 90 days unless retention is required under the DPDP Act, the Income Tax Act, or other applicable Indian law.',
  },
  {
    t: "9. Governing Law and Jurisdiction",
    b: 'These Terms are governed by and construed in accordance with the laws of India, including the Information Technology Act, 2000 and rules made thereunder. Subject to the grievance redressal process below, courts in Bareilly, Uttar Pradesh shall have exclusive jurisdiction over any disputes arising from these Terms or your use of the Service.',
  },
  {
    t: "10. Grievance Officer",
    b: 'In accordance with the Information Technology Act, 2000 and the Information Technology (Intermediary Guidelines and Digital Media Ethics Code) Rules, 2021, the Grievance Officer for ReviewPing can be contacted at grievance@reviewping.pro. We will acknowledge complaints within 24 hours and resolve them within 15 days, as required by law.',
  },
  {
    t: "11. Contact",
    b: 'If you have any questions about these Terms of Service, please contact us at legal@reviewping.pro.',
  },
];

export default function TermsPage({ onSignup, onLogin, onBack }) {
  return (
    <>
      <SEO title="Terms of Service" description="ReviewPing Terms of Service — the legal agreement governing your use of the ReviewPing review request platform." path="/terms" />
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
            Terms of Service
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
