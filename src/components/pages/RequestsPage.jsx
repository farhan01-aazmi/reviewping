import { useState } from "react";
import { G } from "../../data/theme";
import { Btn, Card } from "../ui";
import SendReq from "./SendReq";
import SentLog from "./SentLog";

export default function RequestsPage({ userId, biz, plan, onSent }) {
  const [tab, setTab] = useState("send");

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: 0, letterSpacing: "-0.5px" }}>
          Review Requests
        </h2>
        <p style={{ color: G.muted, fontSize: 13.5, margin: "4px 0 0" }}>
          Send and track review requests
        </p>
      </div>

      <div style={{ display: "flex", gap: 8, borderBottom: `1px solid ${G.border}`, paddingBottom: 8 }}>
        <Btn variant={tab === "send" ? "primary" : "secondary"} size="sm" onClick={() => setTab("send")}>
          Send Request
        </Btn>
        <Btn variant={tab === "history" ? "primary" : "secondary"} size="sm" onClick={() => setTab("history")}>
          History
        </Btn>
      </div>

      {tab === "send" && (
        <Card sx={{ padding: 0, border: "none", background: "transparent" }}>
          <SendReq
            onBack={() => setTab("history")}
            onSent={onSent}
            biz={biz}
            userId={userId}
            plan={plan}
          />
        </Card>
      )}

      {tab === "history" && (
        <SentLog userId={userId} plan={plan} />
      )}
    </div>
  );
}