import { G } from "../../data/theme";
import { calculateReputationScore, getReputationGrade } from "../../utils/reputation";
import Card from "./Card";

export default function ReputationScore({ avgRating, reviewCount, responseRate, positiveRatio }) {
  const score = calculateReputationScore({ avgRating, reviewCount, responseRate, positiveRatio });
  const grade = getReputationGrade(score);

  // Arc-based circular gauge
  const radius = 50;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;

  return (
    <Card sx={{ padding: "16px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
        {/* Gauge */}
        <div style={{ position: "relative", width: 100, height: 100, flexShrink: 0 }}>
          <svg width="100" height="100" viewBox="0 0 120 120">
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={G.border}
              strokeWidth="10"
            />
            <circle
              cx="60" cy="60" r={radius}
              fill="none"
              stroke={grade.color}
              strokeWidth="10"
              strokeDasharray={circumference}
              strokeDashoffset={offset}
              strokeLinecap="round"
              transform="rotate(-90 60 60)"
              style={{ transition: "stroke-dashoffset 0.6s ease" }}
            />
          </svg>
          <div style={{
            position: "absolute", top: "50%", left: "50%",
            transform: "translate(-50%, -50%)",
            textAlign: "center",
          }}>
            <div style={{ fontSize: 26, fontWeight: 800, color: grade.color, lineHeight: 1 }}>
              {score}
            </div>
            <div style={{ fontSize: 10, color: G.muted, letterSpacing: "0.5px", marginTop: 1 }}>
              /100
            </div>
          </div>
        </div>

        {/* Details */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div>
              <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, fontWeight: 400, lineHeight: 1.2 }}>
                Reputation Score
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>Composite of rating, volume, response rate & sentiment</div>
            </div>
            <span style={{
              fontSize: 11, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
              background: grade.bg, color: grade.color,
            }}>
              {grade.label}
            </span>
          </div>

          {/* Sub-metrics */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "6px 16px", fontSize: 12 }}>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.muted }}>Avg Rating</span>
              <span style={{ fontWeight: 700 }}>{avgRating != null && avgRating !== "—" ? `${avgRating}★` : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.muted }}>Volume</span>
              <span style={{ fontWeight: 700 }}>{reviewCount ?? 0}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.muted }}>Response Rate</span>
              <span style={{ fontWeight: 700 }}>{responseRate != null ? `${responseRate}%` : "—"}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: G.muted }}>Positivity</span>
              <span style={{ fontWeight: 700 }}>{positiveRatio != null ? `${Math.round(positiveRatio * 100)}%` : "—"}</span>
            </div>
          </div>
        </div>
      </div>
    </Card>
  );
}
