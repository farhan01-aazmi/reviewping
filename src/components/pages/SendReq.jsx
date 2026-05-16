import { useState } from "react";
import { G } from "../../data/theme";
import { SERVICES } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Field from "../ui/Field";
import Sel from "../ui/Sel";
import { aiWriteMessage, sendSMS, sendEmail } from "../../api/index";

export default function SendReq({ onBack, onSent, templates, biz, toast }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [service, setService] = useState(SERVICES[0]);
  const [method, setMethod] = useState("SMS");
  const [msg, setMsg] = useState("");
  const [aiLoad, setAiLoad] = useState(false);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const matched =
    templates.find((t) => t.service === service) ||
    templates.find((t) => t.service === "All");

  const applyTpl = () => {
    if (!matched) {
      toast("No matching template found", "error");
      return;
    }
    setMsg(
      matched.text
        .replace(/\{name\}/gi, name || "[Name]")
        .replace(
          /\{link\}/gi,
          biz.googleLink || "reviewping.io/r/mybiz"
        )
        .replace(/\{service\}/gi, service)
    );
  };

  const runAi = async () => {
    if (!name) {
      toast("Enter customer name first", "error");
      return;
    }
    setAiLoad(true);
    setMsg("");
    try {
      const result = await aiWriteMessage({
        name,
        service,
        business: biz.bizName || "our business",
      });
      const text = result?.message || result?.text || "";
      setMsg(
        text.replace("[LINK]", biz.googleLink || "reviewping.io/r/mybiz")
      );
    } catch (e) {
      console.error("AI error:", e);
      setMsg(
        `Hi ${name}, thanks for your ${service} at ${
          biz.bizName || "ours"
        } today. A quick review would mean a lot: ${
          biz.googleLink || "reviewping.io/r/mybiz"
        }`
      );
    }
    setAiLoad(false);
  };

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Customer name is required";
    if (!contact.trim())
      e.contact =
        method === "Email"
          ? "Email address is required"
          : "Phone number is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const send = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const message =
        msg ||
        `Hi ${name}! Thanks for visiting ${
          biz.bizName || "us"
        } today. A quick Google review would mean the world — 30 seconds: ${
          biz.googleLink || "reviewping.io/r/mybiz"
        }`;

      if (method === "SMS" || method === "Both") {
        await sendSMS({ to: contact, message });
      }
      if (method === "Email" || method === "Both") {
        await sendEmail({
          to: contact,
          subject: `How was your ${service}?`,
          message,
        });
      }
      setDone(true);
      onSent({ name, service, channel: method, sentAt: Date.now() });
    } catch (e) {
      console.error("Send error:", e);
      toast("Failed to send: " + e.message, "error");
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading && !aiLoad) send();
  };

  if (done)
    return (
      <div style={{ textAlign: "center", padding: "52px 0" }}>
        <div
          style={{
            width: 64,
            height: 64,
            borderRadius: "50%",
            background: G.successBg,
            border: `2px solid ${G.successBd}`,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 26,
            margin: "0 auto 20px",
          }}
        >
          ✓
        </div>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 28,
            fontWeight: 400,
            margin: "0 0 8px",
            letterSpacing: "-0.5px",
          }}
        >
          Request sent.
        </h2>
        <p
          style={{
            color: G.muted,
            marginBottom: 28,
            fontSize: 14,
            lineHeight: 1.7,
          }}
        >
          Your {method} was delivered to{" "}
          <strong style={{ color: G.ink }}>{name}</strong>.
          <br />
          You'll be notified when they leave a review.
        </p>
        <Btn onClick={onBack} variant="secondary">
          ← Back to dashboard
        </Btn>
      </div>
    );

  return (
    <div>
      <button
        onClick={onBack}
        style={{
          background: "none",
          border: "none",
          color: G.muted,
          cursor: "pointer",
          marginBottom: 20,
          display: "flex",
          alignItems: "center",
          gap: 6,
          fontSize: 13,
          padding: 0,
          fontFamily: "'Manrope',sans-serif",
        }}
      >
        ← Back
      </button>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "0 0 4px",
          letterSpacing: "-0.5px",
        }}
      >
        Send review request
      </h2>
      <p
        style={{
          color: G.muted,
          fontSize: 13.5,
          marginBottom: 22,
        }}
      >
        Fill details, AI writes the message, customer receives it in seconds.
      </p>
      <Card
        sx={{ marginBottom: 14 }}
        onKeyDown={handleKeyDown}
        aria-busy={aiLoad || undefined}
      >
        <Field
          label="Customer name"
          value={name}
          onChange={setName}
          placeholder="e.g. James Patterson"
          error={errors.name}
          disabled={aiLoad || loading}
        />
        <Sel
          label="Service provided"
          value={service}
          onChange={setService}
          options={SERVICES}
        />
        <Sel
          label="Send via"
          value={method}
          onChange={setMethod}
          options={["SMS", "Email", "Both"]}
        />
        <Field
          label={method === "Email" ? "Email address" : "Phone number"}
          value={contact}
          onChange={setContact}
          placeholder={
            method === "Email"
              ? "james@gmail.com"
              : "+1 (555) 000-0000"
          }
          error={errors.contact}
          disabled={aiLoad || loading}
        />
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: 10,
          }}
        >
          <label
            style={{
              fontSize: 12,
              fontWeight: 700,
              color: G.inkSoft,
            }}
          >
            Message
          </label>
          <div style={{ display: "flex", gap: 6 }}>
            {matched && (
              <Btn
                variant="secondary"
                size="sm"
                onClick={applyTpl}
                sx={{ fontSize: 11 }}
                ariaLabel="Apply template"
                disabled={aiLoad || loading}
              >
                📄 Template
              </Btn>
            )}
            <Btn
              variant="secondary"
              size="sm"
              onClick={runAi}
              loading={aiLoad}
              disabled={aiLoad || loading}
              sx={{ fontSize: 11 }}
              ariaLabel="AI write message"
            >
              ✦ AI Write
            </Btn>
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <textarea
            value={
              msg ||
              (name
                ? `Hi ${name}! Thanks for visiting ${
                    biz.bizName || "us"
                  } today. A quick Google review would mean the world — 30 seconds: ${
                    biz.googleLink || "reviewping.io/r/mybiz"
                  }`
                : "Your personalised message will appear here…")
            }
            onChange={(e) => setMsg(e.target.value)}
            style={{
              width: "100%",
              background: aiLoad ? G.accentBg : G.bg,
              border: `1.5px solid ${
                aiLoad ? G.accentBd : G.border
              }`,
              borderRadius: 8,
              padding: "12px 14px",
              color: aiLoad ? G.muted : G.ink,
              fontSize: 13.5,
              outline: "none",
              boxSizing: "border-box",
              fontFamily: "'Manrope',sans-serif",
              minHeight: 96,
              resize: "vertical",
              lineHeight: 1.65,
              opacity: aiLoad ? 0.7 : 1,
              cursor: aiLoad ? "wait" : "text",
            }}
            aria-label="Message content"
            disabled={aiLoad || undefined}
          />
          {aiLoad && (
            <div
              style={{
                position: "absolute",
                bottom: 14,
                left: 14,
                display: "flex",
                alignItems: "center",
                gap: 6,
              }}
            >
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                style={{ animation: "spin 0.7s linear infinite" }}
              >
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke={G.accent}
                  strokeWidth="3"
                  strokeDasharray="31.4 31.4"
                  strokeLinecap="round"
                  opacity={0.3}
                />
                <circle
                  cx="12"
                  cy="12"
                  r="10"
                  stroke={G.accent}
                  strokeWidth="3"
                  strokeDasharray="31.4 31.4"
                  strokeLinecap="round"
                  strokeDashoffset="10"
                />
              </svg>
              <span
                style={{
                  fontSize: 12,
                  color: G.accent,
                  fontWeight: 600,
                }}
              >
                AI is writing…
              </span>
            </div>
          )}
        </div>
        <p
          style={{
            margin: "6px 0 0",
            fontSize: 11.5,
            color: G.muted,
          }}
        >
          {aiLoad ? "—" : `${msg.length} characters`}
        </p>
      </Card>
      <Btn
        full
        size="lg"
        onClick={send}
        loading={loading}
        disabled={loading || aiLoad}
        ariaLabel="Send review request"
      >
        {loading
          ? "Sending…"
          : aiLoad
          ? "Generating message…"
          : `Send via ${method} →`}
      </Btn>
      <p
        style={{
          textAlign: "center",
          fontSize: 12,
          color: G.muted,
          marginTop: 8,
        }}
      >
        GDPR compliant · Encrypted · Opt-out included
      </p>
    </div>
  );
}
