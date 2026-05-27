import { useState, useEffect, useMemo } from "react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
import { G } from "../../data/theme";
import Card from "../ui/Card";
import { supabase } from "../../config/supabase";
import { toast } from "sonner";

const SENTIMENT_COLORS = {
  positive: G.success,
  neutral: G.gold,
  negative: G.accent,
};

const tooltipStyle = {
  background: G.surface,
  border: `1px solid ${G.border}`,
  borderRadius: 8,
  fontSize: 12,
  fontFamily: "'Manrope',sans-serif",
};

const tickStyle = { fontSize: 10, fill: G.muted };

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
          Collect at least 3 reviews to see your analytics.
        </p>
      </Card>
    </div>
  );
}

function formatDateTick(val) {
  const d = new Date(val + "T00:00:00");
  return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Analytics({ userId }) {
  const [reviews, setReviews] = useState([]);
  const [reviewRequests, setReviewRequests] = useState([]);
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

      const [reviewsResult, requestsResult] = await Promise.all([
        supabase
          .from("reviews")
          .select("sentAt, rating")
          .eq("user_id", userId)
          .gte("sentAt", thirtyDaysAgo),
        supabase
          .from("review_requests")
          .select("sent_at")
          .eq("user_id", userId)
          .gte("sent_at", thirtyDaysAgo),
      ]);

      if (reviewsResult.error) throw reviewsResult.error;
      if (requestsResult.error) throw requestsResult.error;

      setReviews(reviewsResult.data || []);
      setReviewRequests(requestsResult.data || []);
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
        reviewRequests.length > 0
          ? Math.round((total / reviewRequests.length) * 100)
          : 0;
      return {
        totalReviews: total,
        avgRating: avg,
        responseRate: rate,
        ratedReviews: rated,
      };
    }, [reviews, reviewRequests]);

  // Chart 1: Reviews per day (last 30 days)
  const reviewsPerDay = useMemo(() => {
    const map = {};
    reviews.forEach((r) => {
      const day = r.sentAt?.slice(0, 10);
      if (day) map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [reviews]);

  // Chart 2: Sentiment breakdown
  const sentimentData = useMemo(() => {
    const counts = { positive: 0, neutral: 0, negative: 0 };
    reviews.forEach((r) => {
      const rating = Number(r.rating);
      if (rating >= 4) counts.positive++;
      else if (rating === 3) counts.neutral++;
      else if (rating >= 1) counts.negative++;
    });
    return Object.entries(counts).map(([name, value]) => ({
      name: name.charAt(0).toUpperCase() + name.slice(1),
      value,
      fill: SENTIMENT_COLORS[name],
    }));
  }, [reviews]);

  // Chart 3: Rating distribution (1–5)
  const ratingDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    ratedReviews.forEach((r) => {
      const rating = Number(r.rating);
      if (rating >= 1 && rating <= 5) dist[rating]++;
    });
    return [5, 4, 3, 2, 1].map((n) => ({
      name: `${n}★`,
      value: dist[n],
      fill: n >= 4 ? G.success : n === 3 ? G.gold : G.accent,
    }));
  }, [ratedReviews]);

  // Chart 4: Requests sent per day (last 30 days)
  const requestsPerDay = useMemo(() => {
    const map = {};
    reviewRequests.forEach((r) => {
      const day = r.sent_at?.slice(0, 10);
      if (day) map[day] = (map[day] || 0) + 1;
    });
    return Object.entries(map)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([date, count]) => ({ date, count }));
  }, [reviewRequests]);

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

  if (reviews.length < 3) return <NotEnoughData />;

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
            <div
              style={{ fontSize: 11, color: G.muted, fontWeight: 600 }}
            >
              {s.l}
            </div>
          </Card>
        ))}
      </div>

      {/* Chart 1 — Reviews per Day (Line) */}
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 4,
          }}
        >
          Reviews per Day
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
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={reviewsPerDay}>
            <XAxis
              dataKey="date"
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatDateTick}
            />
            <YAxis
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              width={22}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={formatDateTick}
            />
            <Line
              type="monotone"
              dataKey="count"
              stroke={G.accent}
              strokeWidth={2.5}
              dot={{ fill: G.accent, r: 4 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      {/* Charts 2 & 3 — side by side */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 14,
          marginBottom: 14,
        }}
      >
        {/* Chart 2 — Sentiment Breakdown (Donut) */}
        <Card>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13.5,
              marginBottom: 14,
            }}
          >
            Sentiment
          </div>
          <div style={{ display: "flex", justifyContent: "center" }}>
            <div style={{ width: 140, height: 140 }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={sentimentData}
                    cx="50%"
                    cy="50%"
                    innerRadius={42}
                    outerRadius={66}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {sentimentData.map((e, i) => (
                      <Cell key={i} fill={e.fill} />
                    ))}
                  </Pie>
                  <Tooltip contentStyle={tooltipStyle} />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </div>
          <div
            style={{
              display: "flex",
              justifyContent: "center",
              gap: 16,
              marginTop: 12,
            }}
          >
            {sentimentData.map((s) => (
              <div
                key={s.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: 5,
                  fontSize: 12,
                  color: G.muted,
                }}
              >
                <div
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: 2,
                    background: s.fill,
                  }}
                />
                {s.name} ({s.value})
              </div>
            ))}
          </div>
        </Card>

        {/* Chart 3 — Rating Distribution (Bar) */}
        <Card>
          <div
            style={{
              fontWeight: 700,
              fontSize: 13.5,
              marginBottom: 14,
            }}
          >
            Rating Distribution
          </div>
          <ResponsiveContainer width="100%" height={160}>
            <BarChart data={ratingDist} barGap={4}>
              <XAxis
                dataKey="name"
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                tick={tickStyle}
                axisLine={false}
                tickLine={false}
                width={22}
                allowDecimals={false}
              />
              <Tooltip contentStyle={tooltipStyle} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]} name="Count">
                {ratingDist.map((e, i) => (
                  <Cell key={i} fill={e.fill} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Chart 4 — Requests Sent per Day (Bar) */}
      <Card>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 4,
          }}
        >
          Requests Sent per Day
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
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={requestsPerDay} barGap={3}>
            <XAxis
              dataKey="date"
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              tickFormatter={formatDateTick}
            />
            <YAxis
              tick={tickStyle}
              axisLine={false}
              tickLine={false}
              width={22}
              allowDecimals={false}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              labelFormatter={formatDateTick}
            />
            <Bar
              dataKey="count"
              fill={G.accent}
              radius={[4, 4, 0, 0]}
              name="Requests"
            />
          </BarChart>
        </ResponsiveContainer>
      </Card>
    </div>
  );
}
