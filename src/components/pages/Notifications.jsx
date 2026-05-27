import { useState } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import EmptyState from "../ui/EmptyState";
import { fmtDate } from "../../utils/formatters";

export default function Notifications() {
  const [notifs, setNotifs] = useState([]);
  const markAll = () => {
    setNotifs((p) => p.map((n) => ({ ...n, read: true })));
  };

  const markOne = (id) =>
    setNotifs((p) => p.map((n) => (n.id === id ? { ...n, read: true } : n)));

  return (
    <div>
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          marginBottom: 20,
        }}
      >
        <h2
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 26,
            fontWeight: 400,
            margin: 0,
            letterSpacing: "-0.5px",
          }}
        >
          Notifications
        </h2>
        <Btn variant="ghost" size="sm" onClick={markAll}>
          Mark all read
        </Btn>
      </div>
      {notifs.length === 0 ? (
        <EmptyState
          icon="🔔"
          title="No notifications yet"
          subtitle="You'll see updates here when customers leave reviews."
        />
      ) : (
        notifs.map((n) => (
          <div
            key={n.id}
            onClick={() => markOne(n.id)}
            style={{
              display: "flex",
              gap: 12,
              padding: "14px 16px",
              background: n.read ? G.surface : G.accentBg,
              border: `1.5px solid ${
                n.read ? G.border : G.accentBd
              }`,
              borderRadius: 12,
              marginBottom: 8,
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            <div
              style={{
                width: 38,
                height: 38,
                borderRadius: "50%",
                background: n.read ? G.bg : G.accentBg,
                border: `1.5px solid ${G.border}`,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: 17,
                flexShrink: 0,
              }}
            >
              {n.icon}
            </div>
            <div style={{ flex: 1 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "flex-start",
                }}
              >
                <span
                  style={{
                    fontWeight: n.read ? 500 : 700,
                    fontSize: 14,
                    color: G.ink,
                  }}
                >
                  {n.title}
                </span>
                <span
                  style={{
                    fontSize: 11,
                    color: G.muted,
                    flexShrink: 0,
                    marginLeft: 8,
                  }}
                >
                  {fmtDate(n.time)}
                </span>
              </div>
              <div
                style={{
                  fontSize: 12.5,
                  color: G.muted,
                  marginTop: 3,
                  lineHeight: 1.55,
                }}
              >
                {n.body}
              </div>
            </div>
            {!n.read && (
              <div
                style={{
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: G.accent,
                  flexShrink: 0,
                  marginTop: 4,
                }}
              />
            )}
          </div>
        ))
      )}
    </div>
  );
}
