import { G } from "../../data/theme";

export default function RefundPolicy({ onBack }) {
  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
        padding: "48px 24px",
      }}
    >
      <div style={{ maxWidth: 720, margin: "0 auto" }}>
        <button
          onClick={onBack}
          style={{
            background: "none",
            border: "none",
            color: G.muted,
            cursor: "pointer",
            fontSize: 13,
            padding: 0,
            marginBottom: 24,
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          ← Back
        </button>

        <h1
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 32,
            fontWeight: 400,
            letterSpacing: "-0.5px",
            margin: "0 0 8px",
          }}
        >
          Refund Policy
        </h1>
        <p style={{ color: G.muted, fontSize: 13, margin: "0 0 32px" }}>
          Last updated: June 3, 2026
        </p>

        <div
          style={{
            fontSize: 14,
            lineHeight: 1.8,
            color: G.ink,
          }}
        >
          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 8px" }}>
            30-Day Money-Back Guarantee
          </h2>
          <p>
            We offer a full refund within 30 days of your initial subscription
            purchase. If you're not satisfied with ReviewPing for any reason,
            contact our support team and we'll process your refund promptly.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 8px" }}>
            Monthly Subscriptions
          </h2>
          <p>
            For monthly plans, refunds are available within 30 days of the
            initial payment. After 30 days, all monthly subscription fees are
            non-refundable but you may cancel at any time. Your access will
            continue until the end of the current billing period.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 8px" }}>
            Annual Subscriptions
          </h2>
          <p>
            For annual plans, refunds are available within 30 days of the
            initial payment, minus any usage costs calculated at the monthly
            rate. After 30 days, annual subscription fees are non-refundable.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 8px" }}>
            How to Request a Refund
          </h2>
          <p>
            To request a refund, email us at{" "}
            <strong>support@reviewping.pro</strong> with the email address
            associated with your account. We'll process your refund within 5–10
            business days.
          </p>

          <h2 style={{ fontSize: 18, fontWeight: 600, margin: "28px 0 8px" }}>
            Exceptions
          </h2>
          <p>
            Refunds do not apply to third-party services, add-ons, or
            professional services purchased through the platform. AI credit
            usage is non-refundable once consumed.
          </p>
        </div>
      </div>
    </div>
  );
}
