import { useState } from "react";
import { G } from "../../data/theme";
import { D } from "../../data/constants";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import Stars from "../ui/Stars";
import EmptyState from "../ui/EmptyState";
import { fmtDate, computeStats } from "../../utils/formatters";

export default function Dashboard({ reviews, biz, onSend, onNav }) {
  const { done, pending, avg, week, rate } = computeStats(reviews);

  return (
    <div>
      <div style={{ marginBottom: 22 }}>
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 26,
            fontWeight: 400,
            margin: "0 0 4px",
            letterSpacing: "-0.5px",
          }}
        >
          Dashboard
        </h2>
        <p style={{ margin: 0, color: G.muted, fontSize: 13.5 }}>
          {biz.bizName} · Today is{" "}
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>
      <div
        className="rgrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {[
          { l: "Total Reviews", v: done.length, s: "All time", c: G.accent },
          { l: "Avg Rating", v: `${avg}★`, s: "Google score", c: G.gold },
          {
            l: "This Week",
            v: week,
            s: "reviews received",
            c: G.success,
          },
          {
            l: "Response Rate",
            v: `${rate}%`,
            s: "industry avg 32%",
            c: G.purple,
          },
        ].map((s) => (
          <Card key={s.l} sx={{ padding: "16px 18px" }}>
            <div
              style={{
                fontSize: 10.5,
                fontWeight: 700,
                color: G.muted,
                letterSpacing: "0.5px",
                textTransform: "uppercase",
                marginBottom: 8,
              }}
            >
              {s.l}
            </div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 30,
                color: s.c,
                lineHeight: 1,
                marginBottom: 4,
              }}
            >
              {s.v}
            </div>
            <div style={{ fontSize: 11.5, color: G.muted }}>{s.s}</div>
          </Card>
        ))}
      </div>
      <button
        onClick={onSend}
        style={{
          width: "100%",
          marginBottom: 18,
          padding: 14,
          background: G.accent,
          border: "none",
          borderRadius: 10,
          cursor: "pointer",
          fontFamily: "'Manrope',sans-serif",
          fontWeight: 800,
          fontSize: 14.5,
          color: "white",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          gap: 8,
          boxShadow: `0 4px 16px ${G.accent}40`,
        }}
      >
        ⚡ Send Review Request
      </button>
      {pending.length > 0 && (
        <>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: G.muted,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 10,
            }}
          >
            Awaiting response ({pending.length})
          </div>
          {pending.slice(0, 3).map((r) => (
            <Card key={r.id} sx={{ marginBottom: 8, padding: "12px 14px" }}>
              <div
                style={{ display: "flex", gap: 12, alignItems: "center" }}
              >
                <div
                  style={{
                    width: 34,
                    height: 34,
                    borderRadius: "50%",
                    background: G.goldBg,
                    border: `1.5px solid ${G.goldBd}`,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 800,
                    fontSize: 13,
                    color: G.gold,
                    flexShrink: 0,
                  }}
                >
                  {r.name[0]}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted }}>
                    {r.service} · {fmtDate(r.sentAt)} · {r.channel}
                  </div>
                </div>
                <Pill color={G.gold}>Pending</Pill>
              </div>
            </Card>
          ))}
        </>
      )}
      <div
        style={{
          fontSize: 10.5,
          fontWeight: 700,
          color: G.muted,
          letterSpacing: "1px",
          textTransform: "uppercase",
          margin: "18px 0 10px",
        }}
      >
        Recent reviews
      </div>
      {done.length === 0 ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          subtitle="Send your first review request to get started."
          action={
            <Btn size="sm" onClick={onSend}>
              + Send Request
            </Btn>
          }
        />
      ) : (
        done.slice(0, 5).map((r) => (
          <Card key={r.id} sx={{ marginBottom: 8, padding: "13px 15px" }}>
            <div
              style={{
                display: "flex",
                gap: 12,
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: G.accentBg,
                  border: `1.5px solid ${G.accentBd}`,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  fontWeight: 800,
                  fontSize: 13,
                  color: G.accent,
                  flexShrink: 0,
                }}
              >
                {r.name[0]}
              </div>
              <div style={{ flex: 1 }}>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    marginBottom: 3,
                  }}
                >
                  <span style={{ fontWeight: 700, fontSize: 13.5 }}>
                    {r.name}
                  </span>
                  <Stars rating={r.rating} size={12} />
                </div>
                <div
                  style={{
                    fontSize: 12.5,
                    color: G.muted,
                    fontStyle: "italic",
                    fontFamily: "'Instrument Serif',serif",
                  }}
                >
                  "{r.text}"
                </div>
                <div
                  style={{
                    fontSize: 11,
                    color: G.mutedLo,
                    marginTop: 4,
                  }}
                >
                  {r.service} · {fmtDate(r.sentAt)}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
