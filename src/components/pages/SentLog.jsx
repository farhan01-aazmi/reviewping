import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import Stars from "../ui/Stars";
import { fmtDate } from "../../utils/formatters";

const ICONS = { email: "✉️", whatsapp: "📱" };
const CHANNEL_NAMES = { email: "Email", whatsapp: "WhatsApp" };

function DeliveryBadge({ delivery_status }) {
  const map = {
    sent: { label: "Sent", color: G.info },
    delivered: { label: "Delivered", color: G.success },
    opened: { label: "Opened", color: G.success },
    clicked: { label: "Clicked", color: G.success },
    reviewed: { label: "Reviewed", color: G.purple },
    failed: { label: "Failed", color: G.accent },
    pending: { label: "Pending", color: G.gold },
  };
  const m = map[delivery_status] || map.pending;
  return <Pill color={m.color}>{m.label}</Pill>;
}

export default function SentLog({ userId }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    let cancelled = false;
    supabase
      .from("review_requests")
      .select("id, customer_name, customer_email, customer_phone, channel, status, delivery_status, failed_reason, sent_at, review_link")
      .eq("user_id", userId)
      .order("sent_at", { ascending: false })
      .limit(100)
      .then(({ data, error }) => {
        if (cancelled) return;
        if (error) console.error(error);
        setRequests(data || []);
        setLoading(false);
      });
    return () => { cancelled = true; };
  }, [userId]);

  if (loading) {
    return <div style={{ textAlign: "center", padding: 40, color: G.muted }}>Loading messages...</div>;
  }

  return (
    <div>
      <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "0 0 4px", letterSpacing: "-0.5px" }}>
        Sent Log
      </h2>
      <p style={{ margin: "0 0 20px", color: G.muted, fontSize: 13.5 }}>
        Delivery status for every review request sent.
      </p>
      <div style={{ fontSize: 12, color: G.muted, fontWeight: 600, marginBottom: 10 }}>
        {requests.length} {requests.length === 1 ? "message" : "messages"}
      </div>
      {requests.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: G.muted }}>No messages sent yet.</div>
      ) : (
        requests.map((r) => (
          <div
            key={r.id}
            style={{
              display: "flex",
              gap: 12,
              alignItems: "center",
              padding: "11px 14px",
              background: G.surface,
              border: `1px solid ${G.border}`,
              borderRadius: 10,
              marginBottom: 7,
            }}
          >
            <span style={{ fontSize: 16, flexShrink: 0 }}>
              {ICONS[r.channel] || "📤"}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontWeight: 600, fontSize: 13.5, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                {r.customer_name || r.customer_email || r.customer_phone || "Unknown"}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                {CHANNEL_NAMES[r.channel] || r.channel} · {fmtDate(r.sent_at)}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              <DeliveryBadge delivery_status={r.delivery_status || r.status} />
              {r.failed_reason && (
                <div style={{ fontSize: 10, color: G.accent, marginTop: 2, maxWidth: 120, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {r.failed_reason}
                </div>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}