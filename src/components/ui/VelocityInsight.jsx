import { useState, useEffect } from "react";
import { G } from "../../data/theme";
import { analyzePatterns } from "../../api";
import Card from "./Card";
import Spinner from "./Spinner";

function Arrow({ direction }) {
  if (direction === "up") return <span style={{ color: G.success }}>↑</span>;
  if (direction === "down") return <span style={{ color: G.danger }}>↓</span>;
  return <span style={{ color: G.muted }}>→</span>;
}

const DAY_LABELS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function VelocityInsight() {
  const [patterns, setPatterns] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        const data = await analyzePatterns();
        if (!cancelled) setPatterns(data.patterns);
      } catch (err) {
        if (!cancelled) setError(err.message);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <Card sx={{ padding: "16px 18px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Spinner size="sm" />
          <span style={{ color: G.muted, fontSize: 13 }}>Analyzing review velocity...</span>
        </div>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ padding: "14px 16px", marginBottom: 14 }}>
        <p style={{ margin: 0, fontSize: 13, color: G.danger }}>Failed to analyze patterns: {error}</p>
      </Card>
    );
  }

  if (!patterns) return null;

  const { velocity, ratings, responseRate, positiveRatio, bestDay, dayDistribution } = patterns;

  return (
    <Card sx={{ padding: "16px 18px", marginBottom: 14 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
        <div>
          <h3 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 18, fontWeight: 400, margin: 0 }}>
            Review Velocity
          </h3>
          <p style={{ color: G.muted, fontSize: 12, margin: "2px 0 0" }}>
            Last 30 days vs previous 30 days
          </p>
        </div>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 4,
          fontSize: 12, fontWeight: 700, padding: "3px 10px", borderRadius: 8,
          background: velocity.direction === "up" ? "#f0fdf4" : velocity.direction === "down" ? "#fef2f2" : "#f5f5f0",
          color: velocity.direction === "up" ? G.success : velocity.direction === "down" ? G.danger : G.muted,
        }}>
          <Arrow direction={velocity.direction} />
          {velocity.change > 0 ? "+" : ""}{velocity.change}%
        </span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 14 }}>
        {/* Velocity */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Review Count
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>{velocity.current}</span>
            <span style={{ fontSize: 12, color: G.muted }}>vs {velocity.previous} prev</span>
          </div>
        </div>

        {/* Avg Rating */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Avg Rating
          </div>
          <div style={{ display: "flex", gap: 12, alignItems: "baseline" }}>
            <span style={{ fontSize: 24, fontWeight: 700 }}>{ratings.current}★</span>
            <span style={{ fontSize: 12, color: G.muted }}>
              {ratings.change > 0 ? "+" : ""}{ratings.change} vs prev
            </span>
          </div>
        </div>

        {/* Response Rate */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Response Rate
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{responseRate}%</div>
        </div>

        {/* Positivity */}
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 6 }}>
            Positive Reviews
          </div>
          <div style={{ fontSize: 20, fontWeight: 700 }}>{positiveRatio}%</div>
        </div>
      </div>

      {/* Day-of-week bar chart */}
      {bestDay && (
        <div>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: G.muted, textTransform: "uppercase", letterSpacing: "0.5px", marginBottom: 8 }}>
            Best Day: {bestDay.day} ({bestDay.count} reviews)
          </div>
          <div style={{ display: "flex", gap: 3, alignItems: "flex-end", height: 36 }}>
            {DAY_LABELS.map((day) => {
              const count = dayDistribution[day] || 0;
              const maxCount = Math.max(...Object.values(dayDistribution), 1);
              const pct = (count / maxCount) * 100;
              return (
                <div
                  key={day}
                  title={`${day}: ${count}`}
                  style={{
                    flex: 1,
                    height: `${Math.max(pct, 3)}%`,
                    background: day === bestDay.day ? G.accent : G.border,
                    borderRadius: "3px 3px 0 0",
                    opacity: count > 0 ? 1 : 0.2,
                    minHeight: 3,
                    transition: "height 0.3s ease",
                  }}
                />
              );
            })}
          </div>
          <div style={{ display: "flex", gap: 3, marginTop: 4 }}>
            {DAY_LABELS.map((day) => (
              <div key={day} style={{ flex: 1, fontSize: 8, color: G.muted, textAlign: "center" }}>
                {day}
              </div>
            ))}
          </div>
        </div>
      )}
    </Card>
  );
}
