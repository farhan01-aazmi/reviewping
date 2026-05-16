import { useState } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import Stars from "../ui/Stars";
import EmptyState from "../ui/EmptyState";
import { exportCSV, fmtDate, getRating } from "../../utils/formatters";

export default function ReviewsPage({ reviews, setReviews, onSend, toast }) {
  const [filter, setFilter] = useState("All");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState("Newest");
  const [replyId, setReplyId] = useState(null);
  const [replyText, setReplyText] = useState("");

  let list =
    filter === "All"
      ? reviews
      : reviews.filter((r) =>
          filter === "Reviewed"
            ? r.status === "reviewed"
            : r.status === "pending"
        );
  if (search)
    list = list.filter(
      (r) =>
        r.name.toLowerCase().includes(search.toLowerCase()) ||
        r.service.toLowerCase().includes(search.toLowerCase())
    );
  if (sort === "Newest")
    list = [...list].sort((a, b) => b.sentAt - a.sentAt);
  else if (sort === "Oldest")
    list = [...list].sort((a, b) => a.sentAt - b.sentAt);
  else if (sort === "Rating ↓")
    list = [...list].sort((a, b) => getRating(b) - getRating(a));

  const saveReply = (id) => {
    setReviews((p) =>
      p.map((r) => (r.id === id ? { ...r, reply: replyText } : r))
    );
    setReplyId(null);
    setReplyText("");
    toast("Reply saved successfully");
  };

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          marginBottom: 20,
        }}
      >
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
            All requests
          </h2>
          <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
            {reviews.length} total ·{" "}
            {reviews.filter((r) => r.status === "reviewed").length} reviewed
          </p>
        </div>
        <div style={{ display: "flex", gap: 6 }}>
          <Btn size="sm" variant="secondary" onClick={() => exportCSV(reviews)}>
            ↓ CSV
          </Btn>
          <Btn size="sm" onClick={onSend}>
            + New
          </Btn>
        </div>
      </div>
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
          placeholder="Search by name or service…"
          aria-label="Search reviews"
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
      <div
        style={{
          display: "flex",
          gap: 6,
          marginBottom: 16,
          flexWrap: "wrap",
          alignItems: "center",
        }}
      >
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
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value)}
          style={{
            marginLeft: "auto",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 7,
            padding: "7px 12px",
            fontSize: 12,
            color: G.inkSoft,
            outline: "none",
            fontFamily: "'Manrope',sans-serif",
          }}
        >
          {["Newest", "Oldest", "Rating ↓"].map((o) => (
            <option key={o}>{o}</option>
          ))}
        </select>
      </div>
      {list.length === 0 ? (
        <EmptyState
          icon="🔍"
          title="No results found"
          subtitle="Try adjusting your filters or search terms."
        />
      ) : (
        list.map((r) => (
          <Card key={r.id} sx={{ marginBottom: 10, padding: "13px 15px" }}>
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                gap: 12,
                marginBottom:
                  r.text || r.reply || replyId === r.id ? 10 : 0,
              }}
            >
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background:
                      r.status === "reviewed" ? G.accentBg : G.goldBg,
                    border: `1.5px solid ${
                      r.status === "reviewed" ? G.accentBd : G.goldBd
                    }`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    color: r.status === "reviewed" ? G.accent : G.gold,
                    flexShrink: 0,
                  }}
                >
                  {r.name[0]}
                </div>
                <div>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted }}>
                    {r.service} · {r.channel} · {fmtDate(r.sentAt)}
                  </div>
                </div>
              </div>
              <div style={{ textAlign: "right", flexShrink: 0 }}>
                {r.status === "reviewed" ? (
                  <Stars rating={r.rating} size={13} />
                ) : (
                  <Pill color={G.gold}>Pending</Pill>
                )}
              </div>
            </div>
            {r.text && (
              <div
                style={{
                  padding: "9px 12px",
                  background: G.bg,
                  borderRadius: 8,
                  fontSize: 13,
                  color: G.muted,
                  fontStyle: "italic",
                  fontFamily: "'Instrument Serif',serif",
                  lineHeight: 1.6,
                  marginBottom: r.reply ? 8 : 0,
                }}
              >
                "{r.text}"
              </div>
            )}
            {r.reply && (
              <div
                style={{
                  padding: "9px 12px",
                  background: G.successBg,
                  border: `1px solid ${G.successBd}`,
                  borderRadius: 8,
                  fontSize: 12.5,
                  color: G.success,
                  lineHeight: 1.6,
                  marginBottom: 0,
                }}
              >
                <span style={{ fontWeight: 700 }}>Your reply: </span>
                {r.reply}
              </div>
            )}
            {r.status === "reviewed" && !r.reply && replyId !== r.id && (
              <button
                onClick={() => {
                  setReplyId(r.id);
                  setReplyText("");
                }}
                style={{
                  background: "none",
                  border: "none",
                  cursor: "pointer",
                  fontSize: 12,
                  color: G.accent,
                  padding: "4px 0",
                  fontFamily: "'Manrope',sans-serif",
                  fontWeight: 600,
                  marginTop: 4,
                }}
              >
                + Add reply
              </button>
            )}
            {replyId === r.id && (
              <div style={{ marginTop: 8 }}>
                <textarea
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  placeholder="Write your reply to this customer…"
                  style={{
                    width: "100%",
                    background: G.surface,
                    border: `1.5px solid ${G.border}`,
                    borderRadius: 8,
                    padding: "10px 12px",
                    fontSize: 13,
                    color: G.ink,
                    outline: "none",
                    boxSizing: "border-box",
                    fontFamily: "'Manrope',sans-serif",
                    minHeight: 70,
                    resize: "none",
                  }}
                />
                <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                  <Btn size="sm" variant="secondary" onClick={() => setReplyId(null)}>
                    Cancel
                  </Btn>
                  <Btn size="sm" onClick={() => saveReply(r.id)}>
                    Save reply
                  </Btn>
                </div>
              </div>
            )}
          </Card>
        ))
      )}
    </div>
  );
}
