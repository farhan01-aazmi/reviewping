import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Card, Field } from "../ui";
import { toast } from "sonner";

export default function SendReq({ onBack, onSent, biz, userId }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [channel, setChannel] = useState("email");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);
  const [errors, setErrors] = useState({});

  const reviewLink = biz.googleLink || "https://reviewping-seven.vercel.app";

  const validate = () => {
    const e = {};
    if (!name.trim()) e.name = "Customer name is required";
    if (channel === "email" && !email.trim()) e.email = "Email is required";
    if (channel === "sms" && !phone.trim()) e.phone = "Phone is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const send = async () => {
    if (!validate()) return;
    setLoading(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      const token = session?.access_token;

      const { error: reqError } = await supabase.from("review_requests").insert({
        user_id: userId,
        customer_name: name.trim(),
        customer_email: email.trim() || null,
        customer_phone: phone.trim() || null,
        channel,
        status: "pending",
        sent_at: new Date().toISOString(),
      });

      if (reqError) {
        toast.error(reqError.message);
        setLoading(false);
        return;
      }

      // Try edge function
      try {
        const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL ?? '';
        if (channel === "email") {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/send-email`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              to: email.trim(),
              subject: `How was your experience at ${biz.bizName || "My Business"}?`,
              message: `Hi ${name.trim()}! Thank you for choosing ${biz.bizName || "My Business"}. We'd love to hear about your experience.\n\nLeave a review here: ${reviewLink}\n\nTakes less than 60 seconds.`,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || 'Failed to send email');
          }
        } else if (channel === "sms") {
          const res = await fetch(`${SUPABASE_URL}/functions/v1/send-sms`, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${token}`,
            },
            body: JSON.stringify({
              to: phone.trim(),
              message: `Hi ${name.trim()}! Thanks for visiting ${biz.bizName || "us"} today. A quick review would mean the world: ${reviewLink}`,
            }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({ error: res.statusText }));
            throw new Error(err.error || 'Failed to send SMS');
          }
        }
      } catch (e) {
        toast.error("Failed to send: " + (e.message || "Service unavailable"));
        setLoading(false);
        return;
      }

      setDone(true);
      onSent({ name: name.trim(), service: "", channel, sentAt: Date.now() });
    } catch (e) {
      toast.error("Failed to send: " + e.message);
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !loading) send();
  };

  if (done) {
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
          {channel === "email"
            ? `Your email was sent to ${name}.`
            : `Your SMS was sent to ${name}.`}
          <br />
          You'll be notified when they leave a review.
        </p>
        <Btn onClick={onBack} variant="secondary">
          ← Back to dashboard
        </Btn>
      </div>
    );
  }

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
        Send a review request via email or SMS.
      </p>
      <Card sx={{ marginBottom: 14 }} onKeyDown={handleKeyDown}>
        <Field
          label="Customer name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="e.g. James Patterson"
          error={errors.name}
          disabled={loading}
        />
        <div style={{ marginBottom: 16 }}>
          <label
            style={{
              display: "block",
              fontSize: 13,
              fontWeight: 600,
              color: G.inkSoft,
              marginBottom: 6,
            }}
          >
            Channel
          </label>
          <div style={{ display: "flex", gap: 8 }}>
            <button
              onClick={() => setChannel("email")}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: channel === "email" ? G.accent : G.surface,
                color: channel === "email" ? "white" : G.ink,
                border: `1.5px solid ${
                  channel === "email" ? G.accent : G.border
                }`,
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'Manrope',sans-serif",
                transition: "all 0.15s",
              }}
            >
              ✉️ Email
            </button>
            <button
              onClick={() => setChannel("sms")}
              style={{
                flex: 1,
                padding: "10px 14px",
                background: channel === "sms" ? G.accent : G.surface,
                color: channel === "sms" ? "white" : G.ink,
                border: `1.5px solid ${
                  channel === "sms" ? G.accent : G.border
                }`,
                borderRadius: 10,
                cursor: "pointer",
                fontWeight: 700,
                fontSize: 13,
                fontFamily: "'Manrope',sans-serif",
                transition: "all 0.15s",
              }}
            >
              💬 SMS
            </button>
          </div>
        </div>
        {channel === "email" && (
          <Field
            label="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="james@gmail.com"
            type="email"
            error={errors.email}
            disabled={loading}
          />
        )}
        {channel === "sms" && (
          <Field
            label="Phone number"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="+1 (555) 000-0000"
            error={errors.phone}
            disabled={loading}
          />
        )}
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: G.muted,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 4,
          }}
        >
          Review link
        </div>
        <p
          style={{
            fontSize: 14,
            color: G.ink,
            margin: 0,
            wordBreak: "break-all",
          }}
        >
          {reviewLink}
        </p>
        <p style={{ fontSize: 12, color: G.muted, margin: "4px 0 0" }}>
          Customers will be directed to this link to leave their review.
        </p>
      </Card>
      <Btn
        fullWidth
        size="lg"
        onClick={send}
        loading={loading}
        disabled={loading}
        ariaLabel="Send review request"
      >
        {loading ? "Saving…" : `Send ${channel === "email" ? "email" : "SMS"} →`}
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
