import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import Stars from "../ui/Stars";
import { fmtDate } from "../../utils/formatters";

export default function SentLog({ reviews }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");

  let list = [...reviews].sort((a, b) => b.sentAt - a.sentAt);
  if (filter === "Reviewed")
    list = list.filter((r) => r.status === "reviewed");
  if (filter === "Pending")
    list = list.filter((r) => r.status === "pending");
  if (search)
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.service.toLowerCase().includes(search.toLowerCase())
    );

  return (
    <div>
      <h2
        style={{
          fontFamily: "'Instrument Serif',serif",
          fontSize: 26,
          fontWeight: 400,
          margin: "0 0 4px",
          letterSpacing: "-0.5px",
        }}
      >
        Message history
      </h2>
      <p style={{ margin: "0 0 20px", color: G.muted, fontSize: 13.5 }}>
        Complete log of every review request sent from your account.
      </p>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <span
          style={{
            position: "absolute",
            left: 12,
            top: "50%",
            transform: "translateY(-50%)",
            color: G.muted,
            fontSize: 14,
          }}
        >
          🔍
        </span>
        <input
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Search name or service…"
          aria-label="Search message history"
          style={{
            width: "100%",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            padding: "10px 14px 10px 36px",
            fontSize: 13.5,
            color: G.ink,
            outline: "none",
            boxSizing: "border-box",
            fontFamily: "'Manrope',sans-serif",
          }}
        />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16 }}>
        {["All", "Reviewed", "Pending"].map((f) => (
          <Btn
            key={f}
            variant={filter === f ? "primary" : "secondary"}
            size="sm"
            onClick={() => setFilter(f)}
          >
            {f}
          </Btn>
        ))}
      </div>
      <div
        style={{
          fontSize: 12,
          color: G.muted,
          fontWeight: 600,
          marginBottom: 10,
        }}
      >
        {list.length} messages
      </div>
      {list.length === 0 ? (
        <div style={{ textAlign: "center", padding: 40, color: G.muted }}>
          No messages found.
        </div>
      ) : (
        list.map((r) => (
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
              {r.channel === "SMS"
                ? "📱"
                : r.channel === "Email"
                ? "✉️"
                : "📤"}
            </span>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div
                style={{
                  fontWeight: 600,
                  fontSize: 13.5,
                  overflow: "hidden",
                  textOverflow: "ellipsis",
                  whiteSpace: "nowrap",
                }}
              >
                {r.name}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                {r.service} · {fmtDate(r.sentAt)}
              </div>
            </div>
            <div style={{ textAlign: "right", flexShrink: 0 }}>
              {r.status === "reviewed" ? (
                <>
                  <Pill color={G.success}>Reviewed</Pill>
                  {r.rating && (
                    <div style={{ marginTop: 3 }}>
                      <Stars rating={r.rating} size={11} />
                    </div>
                  )}
                </>
              ) : (
                <Pill color={G.gold}>Pending</Pill>
              )}
            </div>
          </div>
        ))
      )}
    </div>
  );
}
