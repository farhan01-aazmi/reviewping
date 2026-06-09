import { useState, useEffect, useMemo } from "react";
import { G } from "../../data/theme";
import Card from "../ui/Card";
import { supabase } from "../../config/supabase";
import { toast } from "sonner";

function Skeleton() {
  return (
    <div>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[1, 2, 3].map((i) => (
          <Card key={i} sx={{ padding: 14 }}>
            <div
              style={{
                height: 30,
                width: "60%",
                background: G.border,
                borderRadius: 6,
                margin: "0 auto 8px",
              }}
            />
            <div
              style={{
                height: 12,
                width: "40%",
                background: G.border,
                borderRadius: 4,
                margin: "0 auto",
              }}
            />
          </Card>
        ))}
      </div>
      {[1, 2, 3, 4].map((i) => (
        <Card key={i} sx={{ marginBottom: 14 }}>
          <div
            style={{
              height: 14,
              width: "40%",
              background: G.border,
              borderRadius: 4,
              marginBottom: 4,
            }}
          />
          <div
            style={{
              height: 14,
              width: "25%",
              background: G.border,
              borderRadius: 4,
              marginBottom: 14,
            }}
          />
          <div
            style={{
              height: 160,
              background: G.border,
              borderRadius: 8,
            }}
          />
        </Card>
      ))}
    </div>
  );
}

function NotEnoughData() {
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
        Analytics
      </h2>
      <p style={{ margin: "0 0 20px", color: G.muted, fontSize: 13.5 }}>
        Performance insights for your business.
      </p>
      <Card sx={{ padding: "40px 24px", textAlign: "center" }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>📊</div>
        <h3
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 20,
            fontWeight: 400,
            margin: "0 0 6px",
          }}
        >
          Not enough data yet
        </h3>
        <p
          style={{
            color: G.muted,
            fontSize: 13,
            margin: 0,
            maxWidth: 320,
            marginLeft: "auto",
            marginRight: "auto",
          }}
        >
          Collect at least one review or send your first review request to see analytics.
        </p>
      </Card>
    </div>
  );
}

/** Generate last 30 day labels as YYYY-MM-DD strings */
function buildDayLabels() {
  const days = [];
  for (let i = 29; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    d.setHours(0, 0, 0, 0);
    days.push(d.toISOString().slice(0, 10));
  }
  return days;
}

function formatDateShort(iso) {
  const d = new Date(iso + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Analytics({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
  const [reviewSubmissions, setReviewSubmissions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [userId]);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(null);
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000,
      ).toISOString();

      const [reviewsResult, requestsResult, submissionsResult] =
        await Promise.all([
          supabase
            .from("reviews")
            .select("sentAt, rating")
            .eq("user_id", userId)
            .gte("sentAt", thirtyDaysAgo),
          supabase
            .from("review_requests")
            .select("status")
            .eq("user_id", userId),
          supabase
            .from("review_submissions")
            .select("source")
            .eq("user_id", userId)
            .gte("created_at", thirtyDaysAgo),
        ]);

      if (reviewsResult.error) throw reviewsResult.error;
      if (requestsResult.error) throw requestsResult.error;
      if (submissionsResult.error) throw submissionsResult.error;

      setReviews(reviewsResult.data || []);
      setReviewRequests(requestsResult.data || []);
      setReviewSubmissions(submissionsResult.data || []);
    } catch (err) {
      setError(err.message);
      toast.error("Failed to load analytics: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  const { totalReviews, avgRating, responseRate, ratedReviews } =
    useMemo(() => {
      const rated = reviews.filter((r) => r.rating != null);
      const total = reviews.length;
      const avg =
        rated.length > 0
          ? (rated.reduce((s, r) => s + r.rating, 0) / rated.length).toFixed(1)
          : "0.0";
      const rate =
        total > 0
          ? Math.round((total / Math.max(total, 1)) * 100)
          : 0;
      return {
        totalReviews: total,
        avgRating: avg,
        responseRate: rate,
        ratedReviews: rated,
      };
    }, [reviews]);

  // Chart 1: Reviews per day (last 30 days)
  const reviewsPerDay = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      const day = r.sentAt?.slice(0, 10);
      if (day) map[day] = (map[day] || 0) + 1;
    });
    return buildDayLabels().map((day) => ({
      date: day,
      count: map[day] || 0,
    }));
  }, [reviews]);

  const maxDailyCount = useMemo(
    () => Math.max(...reviewsPerDay.map((d) => d.count), 1),
    [reviewsPerDay],
  );

  // Chart 2: Rating Distribution (1-5)
  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedReviews.forEach((r) => {
      const rating = Number(r.rating);
      if (rating >= 1 && rating <= 5) dist[rating]++;
    });
    const maxVal = Math.max(...Object.values(dist), 1);
    return [5, 4, 3, 2, 1].map((n) => ({
      star: n,
      count: dist[n],
      pct: Math.round((dist[n] / maxVal) * 100),
      fill: n >= 4 ? G.success : n === 3 ? G.gold : G.accent,
    }));
  }, [ratedReviews]);

  // Chart 3: Request Funnel — sent, clicked, reviewed
  const funnel = useMemo(() => {
    const requests = reviewRequests.length;
    const clicked = reviewRequests.filter(
      (r) => r.status === "clicked" || r.status === "reviewed",
    ).length;
    const reviewed = reviewRequests.filter(
      (r) => r.status === "reviewed",
    ).length;
    return { sent: requests, clicked, reviewed };
  }, [reviewRequests]);

  const maxFunnel = useMemo(
    () => Math.max(funnel.sent, funnel.clicked, funnel.reviewed, 1),
    [funnel],
  );

  // Chart 4: Source Breakdown
  const sourceBreakdown = useMemo(() => {
    const counts = {};
    reviewSubmissions.forEach((s) => {
      const src = s.source || "unknown";
      counts[src] = (counts[src] || 0) + 1;
    });
    const total = reviewSubmissions.length || 1;
    return Object.entries(counts).map(([name, count]) => ({
      name: name === "reviewping_form" ? "ReviewPing" : name === "google" ? "Google" : name,
      count,
      pct: Math.round((count / total) * 100),
    }));
  }, [reviewSubmissions]);

  if (!userId) {
    return (
      <Card sx={{ padding: "24px", textAlign: "center" }}>
        <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>
          Sign in to view analytics.
        </p>
      </Card>
    );
  }

  if (error) {
    return (
      <Card sx={{ padding: "24px", textAlign: "center" }}>
        <div style={{ fontSize: 32, marginBottom: 12 }}>⚠️</div>
        <h3
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 20,
            fontWeight: 400,
            margin: "0 0 6px",
          }}
        >
          Failed to load analytics
        </h3>
        <p style={{ color: G.muted, fontSize: 13, margin: 0 }}>{error}</p>
      </Card>
    );
  }

  if (loading) return <Skeleton />;

  // Show at least some data if there are review requests or reviews
  if (reviews.length === 0 && reviewRequests.length === 0) return <NotEnoughData />;

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
        Analytics
      </h2>
      <p style={{ margin: "0 0 20px", color: G.muted, fontSize: 13.5 }}>
        Performance insights for your business.
      </p>

      {/* Summary Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[
          { l: "Total Reviews", v: totalReviews, c: G.accent },
          { l: "Avg Rating", v: `${avgRating}★`, c: G.gold },
          { l: "Response Rate", v: `${responseRate}%`, c: G.success },
        ].map((s) => (
          <Card key={s.l} sx={{ padding: 14, textAlign: "center" }}>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 26,
                color: s.c,
                lineHeight: 1,
                marginBottom: 3,
              }}
            >
              {s.v}
            </div>
            <div style={{ fontSize: 11, color: G.muted, fontWeight: 600 }}>
              {s.l}
            </div>
          </Card>
        ))}
      </div>

      {/* ── Chart 1: Reviews Over Time ── */}
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 4,
          }}
        >
          Reviews Over Time
        </div>
        <div
          style={{
            fontSize: 12,
            color: G.muted,
            marginBottom: 14,
          }}
        >
          Last 30 days
        </div>
        <div
          style={{
            display: "flex",
            alignItems: "flex-end",
            gap: 2,
            height: 100,
          }}
        >
          {reviewsPerDay.map((d) => (
            <div
              key={d.date}
              title={`${formatDateShort(d.date)}: ${d.count}`}
              style={{
                flex: 1,
                height: `${Math.max((d.count / maxDailyCount) * 100, d.count > 0 ? 4 : 1)}%`,
                background: d.count > 0 ? G.accent : G.border,
                borderRadius: "3px 3px 0 0",
                opacity: d.count > 0 ? 1 : 0.2,
                minHeight: d.count > 0 ? 4 : 1,
                transition: "height 0.3s ease",
              }}
            />
          ))}
        </div>
      </Card>

      {/* ── Chart 2: Rating Distribution ── */}
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 4,
          }}
        >
          Rating Distribution
        </div>
        <div
          style={{
            fontSize: 12,
            color: G.muted,
            marginBottom: 14,
          }}
        >
          How customers rate you
        </div>
        {ratingDist.map((r) => (
          <div
            key={r.star}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              marginBottom: 6,
            }}
          >
            <span
              style={{
                fontSize: 12,
                fontWeight: 700,
                color: G.inkSoft,
                width: 16,
                textAlign: "right",
              }}
            >
              {r.star}
            </span>
            <span style={{ fontSize: 10, color: G.muted }}>★</span>
            <div
              style={{
                flex: 1,
                height: 12,
                background: G.border,
                borderRadius: 6,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  width: `${r.pct}%`,
                  height: "100%",
                  background: r.fill,
                  borderRadius: 6,
                  transition: "width 0.4s ease",
                }}
              />
            </div>
            <span style={{ fontSize: 11, color: G.muted, width: 24, textAlign: "right" }}>
              {r.count}
            </span>
          </div>
        ))}
      </Card>

      {/* ── Chart 3: Request Funnel ── */}
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 4,
          }}
        >
          Request Funnel
        </div>
        <div
          style={{
            fontSize: 12,
            color: G.muted,
            marginBottom: 14,
          }}
        >
          Sent → Clicked → Reviewed
        </div>
        <div style={{ display: "flex", gap: 10 }}>
          {[
            { label: "Sent", count: funnel.sent, color: G.accent },
            { label: "Clicked", count: funnel.clicked, color: G.gold },
            { label: "Reviewed", count: funnel.reviewed, color: G.success },
          ].map((f) => (
            <div key={f.label} style={{ flex: 1, textAlign: "center" }}>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 28,
                  color: f.color,
                  lineHeight: 1,
                  marginBottom: 2,
                }}
              >
                {f.count}
              </div>
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
                {f.label}
              </div>
              <div
                style={{
                  height: 8,
                  background: G.border,
                  borderRadius: 4,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${(f.count / maxFunnel) * 100}%`,
                    height: "100%",
                    background: f.color,
                    borderRadius: 4,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* ── Chart 4: Source Breakdown ── */}
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 4,
          }}
        >
          Source Breakdown
        </div>
        <div
          style={{
            fontSize: 12,
            color: G.muted,
            marginBottom: 14,
          }}
        >
          Where reviews come from
        </div>
        {sourceBreakdown.length === 0 ? (
          <p style={{ fontSize: 12, color: G.muted, margin: 0 }}>
            No submission data yet.
          </p>
        ) : (
          sourceBreakdown.map((s) => (
            <div
              key={s.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 8,
                marginBottom: 6,
              }}
            >
              <span
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: G.inkSoft,
                  width: 80,
                  textAlign: "left",
                }}
              >
                {s.name}
              </span>
              <div
                style={{
                  flex: 1,
                  height: 12,
                  background: G.border,
                  borderRadius: 6,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    width: `${s.pct}%`,
                    height: "100%",
                    background: G.purple,
                    borderRadius: 6,
                    transition: "width 0.4s ease",
                  }}
                />
              </div>
              <span
                style={{
                  fontSize: 11,
                  color: G.muted,
                  width: 40,
                  textAlign: "right",
                }}
              >
                {s.count} ({s.pct}%)
              </span>
            </div>
          ))
        )}
      </Card>
    </div>
  );
}
