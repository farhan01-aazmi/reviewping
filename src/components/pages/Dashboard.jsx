import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Card, Pill, Stars, Spinner, EmptyState } from "../ui";
import { fmtDate } from "../../utils/formatters";

const THIRTY_DAYS = 30 * 86400000;

function Skeleton({ lines = 1, h = 14 }) {
  return (
    <div style={{ animation: "pulse 1.5s ease-in-out infinite" }}>
      {Array.from({ length: lines }).map((_, i) => (
        <div
          key={i}
          style={{
            height: h,
            background: G.border,
            borderRadius: 6,
            marginBottom: i < lines - 1 ? 8 : 0,
            width: `${70 + Math.random() * 30}%`,
          }}
        />
      ))}
    </div>
  );
}

function startOfMonth(offset = 0) {
  const d = new Date();
  d.setDate(1);
  if (offset) d.setMonth(d.getMonth() + offset);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
}

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

export default function Dashboard({ userId, biz, onSend, onNav }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);

  useEffect(() => {
    if (!userId) return;

    let cancelled = false;

    async function fetchDashboard() {
      setLoading(true);
      setError(null);

      try {
        const now = Date.now();
        const sMonth = startOfMonth(0);
        const sLastMonth = startOfMonth(-1);
        const thirtyDaysAgo = new Date(now - THIRTY_DAYS).toISOString();

        const [
          totalRes,
          ratingsRes,
          thisMonthRes,
          lastMonthRes,
          replyRes,
          recentRes,
          pendingRes,
          dailyRes,
        ] = await Promise.all([
          supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("reviews")
            .select("rating")
            .eq("user_id", userId)
            .neq("rating", null),
          supabase
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", sMonth),
          supabase
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("created_at", sLastMonth)
            .lt("created_at", sMonth),
          supabase
            .from("reviews")
            .select("id, replied")
            .eq("user_id", userId),
          supabase
            .from("reviews")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "reviewed")
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("reviews")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "pending")
            .order("created_at", { ascending: false })
            .limit(10),
          supabase
            .from("reviews")
            .select("created_at")
            .eq("user_id", userId)
            .gte("created_at", thirtyDaysAgo),
        ]);

        if (cancelled) return;

        const anyError =
          totalRes.error ||
          ratingsRes.error ||
          thisMonthRes.error ||
          lastMonthRes.error ||
          replyRes.error ||
          recentRes.error ||
          pendingRes.error ||
          dailyRes.error;

        if (anyError) {
          throw new Error(anyError.message || "Failed to load dashboard data");
        }

        const totalReviews = totalRes.count ?? 0;
        const ratings = (ratingsRes.data || []).map((r) => r.rating);
        const avgRating =
          ratings.length > 0
            ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
            : "—";
        const thisMonth = thisMonthRes.count ?? 0;
        const lastMonth = lastMonthRes.count ?? 0;
        const replyData = replyRes.data || [];
        const repliedCount = replyData.filter((r) => r.replied === true).length;
        const responseRate =
          replyData.length > 0
            ? Math.round((repliedCount / replyData.length) * 100)
            : 0;

        // Sentiment breakdown from rated reviews
        const positive = ratings.filter((r) => r >= 4).length;
        const neutral = ratings.filter((r) => r === 3).length;
        const negative = ratings.filter((r) => r <= 2).length;

        // Rating distribution 1-5
        const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
        ratings.forEach((r) => {
          const star = Math.round(r);
          if (star >= 1 && star <= 5) distribution[star]++;
        });

        // Recent reviewed reviews
        const recentReviews = recentRes.data || [];

        // Pending reviews
        const pendingReviews = pendingRes.data || [];

        // Reviews per day for last 30 days
        const dayCounts = {};
        (dailyRes.data || []).forEach((r) => {
          const day = new Date(r.created_at).toISOString().slice(0, 10);
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        setStats({
          totalReviews,
          avgRating,
          thisMonth,
          lastMonth,
          responseRate,
          sentiments: { positive, neutral, negative },
          distribution,
          recentReviews,
          pendingReviews,
          dayCounts,
        });
      } catch (err) {
        if (cancelled) return;
        const msg = err?.message || "Something went wrong";
        setError(msg);
        toast.error(msg);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchDashboard();

    return () => {
      cancelled = true;
    };
  }, [userId]);

  const handleCopyLink = () => {
    const link = biz.googleLink || "reviewping.io/r/mybiz";
    navigator.clipboard.writeText(link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
      toast.success("Link copied");
    });
  };

  // ── Error state ──
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
          Failed to load data
        </h3>
        <p style={{ color: G.muted, fontSize: 13, margin: "0 0 16px" }}>
          {error}
        </p>
        <Btn size="sm" onClick={() => window.location.reload()}>
          Retry
        </Btn>
      </Card>
    );
  }

  const hasReviews = stats && stats.totalReviews > 0;

  return (
    <div>
      {/* ── Header ── */}
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
          {biz.bizName} ·{" "}
          {new Date().toLocaleDateString("en-GB", {
            weekday: "long",
            day: "numeric",
            month: "long",
          })}
        </p>
      </div>

      {/* ── Setup / empty banner ── */}
      {!hasReviews && !loading && (
        <Card
          sx={{
            padding: "14px 16px",
            marginBottom: 16,
            background: G.infoBg,
            border: `1.5px solid ${G.infoBd}`,
          }}
        >
          <div style={{ fontWeight: 700, fontSize: 13, marginBottom: 4 }}>
            🚀 Setup 0% complete
          </div>
          <p
            style={{
              margin: 0,
              fontSize: 12.5,
              color: G.muted,
              lineHeight: 1.6,
            }}
          >
            Send your first review request to start collecting reviews.
          </p>
        </Card>
      )}

      {/* ── Stats row ── */}
      <div
        className="rgrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr",
          gap: 10,
          marginBottom: 16,
        }}
      >
        {loading
          ? [1, 2, 3, 4].map((i) => (
              <Card key={i} sx={{ padding: "16px 18px" }}>
                <Skeleton lines={1} h={12} />
                <div style={{ marginTop: 10 }}>
                  <Skeleton lines={1} h={28} />
                </div>
              </Card>
            ))
          : [
              {
                l: "Total Reviews",
                v: stats.totalReviews,
                s: "All time",
                c: G.accent,
              },
              {
                l: "Avg Rating",
                v: `${stats.avgRating}★`,
                s: "Google score",
                c: G.gold,
              },
              {
                l: "This Month",
                v: stats.thisMonth,
                s: `last month ${stats.lastMonth}`,
                c: G.success,
              },
              {
                l: "Response Rate",
                v: `${stats.responseRate}%`,
                s: "replied to reviews",
                c: G.purple,
              },
            ].map((s) => (
              <Card
                key={s.l}
                sx={{
                  padding: "16px 18px",
                  cursor: "default",
                  transition: "transform 0.15s, box-shadow 0.15s",
                }}
                className="stat-card"
              >
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

      {/* ── Quick actions ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18 }}>
        <button
          onClick={onSend}
          style={{
            flex: 1,
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
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          className="action-btn"
        >
          ⚡ Send Review Request
        </button>
        <button
          onClick={handleCopyLink}
          style={{
            padding: "14px 16px",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: G.inkSoft,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            transition: "transform 0.15s",
          }}
          className="action-btn"
          title="Copy review link"
        >
          {copied ? "✓ Copied" : "🔗 Copy Link"}
        </button>
      </div>

      {/* ── Sentiment breakdown ── */}
      {hasReviews && !loading && (
        <Card sx={{ padding: "14px 16px", marginBottom: 14 }}>
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
            Sentiment
          </div>
          <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
            <Pill
              variant="success"
            >{`Positive ${stats.sentiments.positive}`}</Pill>
            <Pill
              variant="warning"
            >{`Neutral ${stats.sentiments.neutral}`}</Pill>
            <Pill
              variant="error"
            >{`Negative ${stats.sentiments.negative}`}</Pill>
          </div>
        </Card>
      )}

      {/* ── Rating distribution ── */}
      {hasReviews && !loading && (
        <Card sx={{ padding: "14px 16px", marginBottom: 14 }}>
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
            Rating distribution
          </div>
          {[5, 4, 3, 2, 1].map((star) => {
            const count = stats.distribution[star];
            const maxCount = Math.max(
              ...Object.values(stats.distribution),
              1
            );
            const pct = (count / maxCount) * 100;
            return (
              <div
                key={star}
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
                    width: 20,
                    textAlign: "right",
                  }}
                >
                  {star}
                </span>
                <Stars rating={star} size={10} />
                <div
                  style={{
                    flex: 1,
                    height: 10,
                    background: G.border,
                    borderRadius: 5,
                    overflow: "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${pct}%`,
                      height: "100%",
                      background: G.gold,
                      borderRadius: 5,
                      transition: "width 0.4s ease",
                    }}
                  />
                </div>
                <span style={{ fontSize: 11, color: G.muted, width: 24 }}>
                  {count}
                </span>
              </div>
            );
          })}
        </Card>
      )}

      {/* ── Reviews per day (last 30 days) ── */}
      {hasReviews && !loading && (
        <Card sx={{ padding: "14px 16px", marginBottom: 14 }}>
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
            Reviews per day (last 30 days)
          </div>
          <div style={{ display: "flex", alignItems: "flex-end", gap: 2, height: 50 }}>
            {buildDayLabels().map((day) => {
              const count = stats.dayCounts[day] || 0;
              const maxCount = Math.max(
                ...Object.values(stats.dayCounts),
                1
              );
              const pct = (count / maxCount) * 100;
              return (
                <div
                  key={day}
                  title={`${day}: ${count}`}
                  style={{
                    flex: 1,
                    height: `${Math.max(pct, 2)}%`,
                    background: G.accent,
                    borderRadius: "3px 3px 0 0",
                    opacity: count > 0 ? 1 : 0.15,
                    minHeight: 2,
                    transition: "height 0.3s ease",
                  }}
                />
              );
            })}
          </div>
        </Card>
      )}

      {/* ── Awaiting response ── */}
      {!loading && stats && stats.pendingReviews.length > 0 && (
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
            Awaiting response ({stats.pendingReviews.length})
          </div>
          {stats.pendingReviews.slice(0, 3).map((r) => (
            <Card
              key={r.id}
              sx={{ marginBottom: 8, padding: "12px 14px" }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
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
                  {r.name?.[0] || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {r.name}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted }}>
                    {r.service} · {fmtDate(r.sentAt || r.created_at)} ·{" "}
                    {r.channel}
                  </div>
                </div>
                <Pill variant="warning">Pending</Pill>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* ── Recent reviews ── */}
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
      {loading ? (
        [1, 2, 3].map((i) => (
          <Card key={i} sx={{ marginBottom: 8, padding: "13px 15px" }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background: G.border,
                  flexShrink: 0,
                }}
              />
              <div style={{ flex: 1 }}>
                <Skeleton lines={2} h={12} />
              </div>
            </div>
          </Card>
        ))
      ) : !hasReviews ? (
        <EmptyState
          icon="⭐"
          title="No reviews yet"
          description="Send your first review request to get started."
          action={
            <Btn size="sm" onClick={onSend}>
              + Send Request
            </Btn>
          }
        />
      ) : stats.recentReviews.length === 0 ? (
        <Card sx={{ padding: "14px 16px", textAlign: "center" }}>
          <p style={{ margin: 0, fontSize: 13, color: G.muted }}>
            No completed reviews yet.
          </p>
        </Card>
      ) : (
        stats.recentReviews.map((r) => (
          <Card key={r.id} sx={{ marginBottom: 8, padding: "13px 15px" }}>
            <div
              style={{ display: "flex", gap: 12, alignItems: "flex-start" }}
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
                {r.name?.[0] || "?"}
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
                <div style={{ fontSize: 11, color: G.mutedLo, marginTop: 4 }}>
                  {r.service} · {fmtDate(r.sentAt || r.created_at)}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}
    </div>
  );
}
