import { useState, useEffect } from "react";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Btn, Card, Pill, Stars, Spinner, EmptyState } from "../ui";
import PremiumFeature from "../ui/PremiumFeature";
import { fmtDate } from "../../utils/formatters";
import CompetitorRadar from "../layout/CompetitorRadar";
import ReputationScore from "../ui/ReputationScore";
import VelocityInsight from "../ui/VelocityInsight";
import { listCompetitors, syncCompetitors, sendTestDigest } from "../../api";

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

export default function Dashboard({ userId, biz, plan, onSend, onNav }) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [copied, setCopied] = useState(false);
  const [stats, setStats] = useState(null);
  const [negCount, setNegCount] = useState(0);
  const [competitors, setCompetitors] = useState([]);
  const [competitorsLoading, setCompetitorsLoading] = useState(true);
  const [sendingDigest, setSendingDigest] = useState(false);

  // ── Handle GBP OAuth callback ──
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gbp") === "connected") {
      toast.success("Google Business Profile connected! 🎉");
      window.history.replaceState({}, "", window.location.pathname);
    } else if (params.get("gbp") === "error") {
      toast.error(params.get("msg") === "expired" ? "Connection expired. Try again." : "Failed to connect GBP");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  // ── Milestone celebration ──
  const [milestone, setMilestone] = useState(null); // { emoji, message }
  const [dismissedMilestones, setDismissedMilestones] = useState(new Set());

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
          negRes,
          gatewayClicksRes,
          gatewayConvertedRes,
          reviewReqsRes,
          reviewSubsRes,
          competitorsRes,
        ] = await Promise.all([
          supabase
            .from("reviews")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId),
          supabase
            .from("reviews")
            .select("rating")
            .eq("user_id", userId)
            .not("rating", "is", null),
          supabase
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("sentAt", sMonth),
          supabase
            .from("reviews")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("sentAt", sLastMonth)
            .lt("sentAt", sMonth),
          supabase
            .from("reviews")
            .select("id, reply")
            .eq("user_id", userId),
          supabase
            .from("reviews")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "reviewed")
            .order("sentAt", { ascending: false })
            .limit(5),
          supabase
            .from("reviews")
            .select("*")
            .eq("user_id", userId)
            .eq("status", "pending")
            .order("sentAt", { ascending: false })
            .limit(10),
          supabase
            .from("reviews")
            .select("sentAt")
            .eq("user_id", userId)
            .gte("sentAt", thirtyDaysAgo),
          supabase
            .from("review_submissions")
            .select("*", { count: "exact", head: true })
            .eq("user_id", userId)
            .lte("rating", 2)
            .eq("moderation_status", "approved"),
          supabase
            .from("review_gateway_clicks")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .gte("clicked_at", sMonth),
          supabase
            .from("review_gateway_clicks")
            .select("id", { count: "exact", head: true })
            .eq("user_id", userId)
            .eq("converted", true)
            .gte("clicked_at", sMonth),
          supabase
            .from("review_requests")
            .select("id, customer_name, customer_email, channel, status, sent_at, reviewed_at, gateway_rating")
            .eq("user_id", userId)
            .order("sent_at", { ascending: false })
            .limit(20),
          supabase
            .from("review_submissions")
            .select("id, rating, review_text, author_name, source, created_at")
            .eq("user_id", userId)
            .not("rating", "is", null)
            .order("created_at", { ascending: false })
            .limit(5),
          supabase
            .from("competitors")
            .select("*")
            .eq("user_id", userId)
            .order("created_at", { ascending: true }),
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
          dailyRes.error ||
          negRes.error ||
          gatewayClicksRes.error ||
          gatewayConvertedRes.error ||
          reviewReqsRes.error ||
          reviewSubsRes.error;

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
        const repliedCount = replyData.filter((r) => !!r.reply).length;
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

        // Negative review count
        setNegCount(negRes.count ?? 0);

        // Gateway analytics
        const gatewayClicks = gatewayClicksRes.count ?? 0;
        const gatewayConverted = gatewayConvertedRes.count ?? 0;
        const gatewayConversionRate =
          gatewayClicks > 0
            ? Math.round((gatewayConverted / gatewayClicks) * 100)
            : 0;

        // Recent reviewed reviews
        const recentReviews = recentRes.data || [];

        // Pending reviews
        const pendingReviews = pendingRes.data || [];

        // Reviews per day for last 30 days
        const dayCounts = {};
        (dailyRes.data || []).forEach((r) => {
          const day = new Date(r.sentAt).toISOString().slice(0, 10);
          dayCounts[day] = (dayCounts[day] || 0) + 1;
        });

        const reviewRequests = reviewReqsRes.data || [];
        const recentSubmissions = reviewSubsRes.data || [];

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
          gatewayClicks,
          gatewayConverted,
          gatewayConversionRate,
          reviewRequests,
          recentSubmissions,
        });
        setCompetitors(competitorsRes.data || []);
        setCompetitorsLoading(false);
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

  // ── Milestone checking effect ──
  useEffect(() => {
    if (!stats || !userId) return;
    if (typeof stats.totalReviews !== "number") return;

    let cancelled = false;

    async function checkMilestones() {
      try {
        // Fetch already-reached milestones
        const { data: existingRows } = await supabase
          .from("milestones_reached")
          .select("milestone_key")
          .eq("user_id", userId);

        if (cancelled) return;

        const existing = new Set(
          (existingRows || []).map((r) => r.milestone_key),
        );

        const avgRating = parseFloat(stats.avgRating);
        const hasFiveStar = (stats.distribution?.[5] || 0) > 0;

        const candidates = [];
        const total = stats.totalReviews;

        // Review count milestones
        if (total >= 1 && !existing.has("first_review"))
          candidates.push({ key: "first_review", emoji: "🎉", message: "First review received!" });
        if (total >= 10 && !existing.has("reviews_10"))
          candidates.push({ key: "reviews_10", emoji: "🎉", message: "10 reviews! You're building momentum." });
        if (total >= 25 && !existing.has("reviews_25"))
          candidates.push({ key: "reviews_25", emoji: "🎉", message: "25 reviews! Halfway to 50." });
        if (total >= 50 && !existing.has("reviews_50"))
          candidates.push({ key: "reviews_50", emoji: "🎉", message: "50 reviews! Your reputation is growing." });
        if (total >= 100 && !existing.has("reviews_100"))
          candidates.push({ key: "reviews_100", emoji: "🏆", message: "100 reviews! Centurion status 🏆" });

        // 5-star milestone
        if (hasFiveStar && !existing.has("first_five_star"))
          candidates.push({ key: "first_five_star", emoji: "⭐", message: "First 5-star review!" });

        // Rating milestones
        if (avgRating >= 4.0 && !existing.has("rating_4_0"))
          candidates.push({ key: "rating_4_0", emoji: "🌟", message: "Average rating hit 4.0!" });
        if (avgRating >= 4.5 && !existing.has("rating_4_5"))
          candidates.push({ key: "rating_4_5", emoji: "💫", message: "4.5 stars! Outstanding!" });

        if (candidates.length === 0) return;

        // Insert first candidate milestone
        const m = candidates[0];
        const { error: insertErr } = await supabase
          .from("milestones_reached")
          .insert({ user_id: userId, milestone_key: m.key });

        if (insertErr) {
          if (insertErr.code === "23505") return; // already inserted
          console.error("Milestone insert error:", insertErr);
          return;
        }

        if (!cancelled) {
          setMilestone(m);
        }
      } catch (err) {
        console.error("Milestone check error:", err);
      }
    }

    checkMilestones();

    return () => {
      cancelled = true;
    };
  }, [stats, userId]);

  const handleSendDigest = async (frequency) => {
    setSendingDigest(true);
    try {
      const res = await sendTestDigest(frequency);
      toast.success(`${frequency === "weekly" ? "Weekly" : "Daily"} digest sent! Check your email.`);
    } catch (err) {
      toast.error(err.message || "Failed to send digest");
    } finally {
      setSendingDigest(false);
    }
  };

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

      {/* ── Negative review alert banner ── */}
      {negCount > 0 && (
        <div
          onClick={() => onNav && onNav('reviews')}
          style={{
            padding: "14px 18px",
            marginBottom: 16,
            background: "#fef2f2",
            border: "1.5px solid #fca5a5",
            borderRadius: 12,
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            gap: 10,
            transition: "transform 0.15s, box-shadow 0.15s",
          }}
          className="action-btn"
        >
          <span style={{ fontSize: 22 }}>🚨</span>
          <div>
            <div style={{ fontWeight: 800, fontSize: 14, color: "#b91c1c" }}>
              {negCount} negative review{negCount > 1 ? 's' : ''} need{negCount > 1 ? '' : 's'} your attention
            </div>
            <div style={{ fontSize: 12, color: "#991b1b", marginTop: 1 }}>
              Click to view and respond
            </div>
          </div>
        </div>
      )}

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
              {
                l: "Revenue Impact",
                v: `$${(stats.thisMonth * 50 * 0.35).toLocaleString()}`,
                s: `est. from ${stats.thisMonth} new reviews`,
                c: G.success,
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

      {/* ── ROI card ── */}
      {!loading && hasReviews && (
        <Card sx={{ padding: "16px 18px", marginBottom: 14 }}>
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
            Your ReviewPing ROI This Month
          </div>
          {stats.thisMonth < 3 ? (
            <p style={{ margin: 0, fontSize: 13, color: G.muted }}>
              Not enough data yet — get at least 3 reviews this month to see your ROI.
            </p>
          ) : (() => {
            const newReviews = stats.thisMonth;
            const estCustomers = Math.round(newReviews * 0.35);
            const avgValue = biz.avg_order_value || 500;
            const estRevenue = estCustomers * avgValue;
            const cost = 19;
            const roi = Math.round(estRevenue / Math.max(cost, 1));

            return (
              <div>
                <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: G.muted }}>New reviews</span>
                    <span style={{ fontWeight: 700, color: G.inkSoft }}>+{newReviews}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: G.muted }}>Est. new customers</span>
                    <span style={{ fontWeight: 700, color: G.inkSoft }}>+{estCustomers}/mo</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: G.muted }}>Est. extra revenue</span>
                    <span style={{ fontWeight: 700, color: G.success }}>${estRevenue.toLocaleString()}</span>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13 }}>
                    <span style={{ color: G.muted }}>ReviewPing cost</span>
                    <span style={{ fontWeight: 700, color: G.inkSoft }}>${cost}</span>
                  </div>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      fontSize: 15,
                      borderTop: `1px solid ${G.border}`,
                      paddingTop: 8,
                      marginTop: 4,
                    }}
                  >
                    <span style={{ fontWeight: 700, color: G.inkSoft }}>ROI</span>
                    <span style={{ fontWeight: 800, color: G.gold }}>
                      {roi}x 🔥
                    </span>
                  </div>
                </div>
                <div
                  onClick={() => onNav('settings')}
                  style={{
                    fontSize: 12,
                    color: G.accent,
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 4,
                    fontWeight: 600,
                  }}
                >
                  Set avg order value ✏️
                </div>
              </div>
            );
          })()}
        </Card>
      )}

      {/* ── Competitor Radar (Growth+) ── */}
      {!loading && stats && (
        <PremiumFeature feature="competitorRadar" plan={plan}>
          <CompetitorRadar
            userRating={stats.avgRating !== "—" ? parseFloat(stats.avgRating) : 0}
            userReviewCount={stats.totalReviews || 0}
            businessName={biz?.bizName || biz?.biz || "Your Business"}
            userId={userId}
          />
        </PremiumFeature>
      )}

      {/* ── Reputation Score (Growth+) ── */}
      {!loading && stats && (
        <PremiumFeature feature="reputationScore" plan={plan}>
          <ReputationScore
            avgRating={stats.avgRating}
            reviewCount={stats.totalReviews}
            responseRate={stats.responseRate}
            positiveRatio={
              stats.sentiments.positive + stats.sentiments.neutral + stats.sentiments.negative > 0
                ? stats.sentiments.positive / (stats.sentiments.positive + stats.sentiments.neutral + stats.sentiments.negative)
                : 0
            }
          />
        </PremiumFeature>
      )}

      {/* ── Review Velocity (Growth+) ── */}
      {!loading && stats && stats.totalReviews > 0 && (
        <PremiumFeature feature="competitorRadar" plan={plan}>
          <VelocityInsight />
        </PremiumFeature>
      )}

      {/* ── Quick actions ── */}
      <div style={{ display: "flex", gap: 8, marginBottom: 18, flexWrap: "wrap" }}>
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
        <button
          onClick={() => handleSendDigest("daily")}
          disabled={sendingDigest}
          style={{
            padding: "14px 16px",
            background: G.infoBg,
            border: `1.5px solid ${G.infoBd}`,
            borderRadius: 10,
            cursor: "pointer",
            fontFamily: "'Manrope',sans-serif",
            fontWeight: 700,
            fontSize: 13,
            color: G.accent,
            display: "flex",
            alignItems: "center",
            gap: 6,
            flexShrink: 0,
            transition: "transform 0.15s",
            opacity: sendingDigest ? 0.6 : 1,
          }}
          className="action-btn"
          title="Send test daily digest email"
        >
          {sendingDigest ? "⏳" : "☀️ Test Daily Digest"}
        </button>
      </div>

      {/* ── Review Gateway Analytics ── */}
      {!loading && stats && (
        <Card sx={{ padding: "14px 16px", marginBottom: 14 }}>
          <div
            style={{
              fontSize: 10.5,
              fontWeight: 700,
              color: G.muted,
              letterSpacing: "1px",
              textTransform: "uppercase",
              marginBottom: 12,
            }}
          >
            Review Gateway
          </div>
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1fr 1fr",
              gap: 12,
            }}
          >
            <div>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 28,
                  color: G.accent,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {stats.gatewayClicks}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                Clicks this month
              </div>
            </div>
            <div>
              <div
                style={{
                  fontFamily: "'Instrument Serif',serif",
                  fontSize: 28,
                  color: G.success,
                  lineHeight: 1,
                  marginBottom: 4,
                }}
              >
                {stats.gatewayConversionRate}%
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                Conversion rate
              </div>
            </div>
          </div>
          {stats.gatewayClicks > 0 && (
            <div
              style={{
                fontSize: 11,
                color: G.mutedLo,
                marginTop: 8,
                paddingTop: 8,
                borderTop: `1px solid ${G.border}`,
              }}
            >
              {stats.gatewayConverted} converted ·{" "}
              {stats.gatewayClicks - stats.gatewayConverted} pending
            </div>
          )}
        </Card>
      )}

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
                    {r.service} · {fmtDate(r.sentAt)} ·{" "}
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
                  {r.service} · {fmtDate(r.sentAt)}
                </div>
              </div>
            </div>
          </Card>
        ))
      )}

      {/* ── Sent Requests ── */}
      {!loading && stats && stats.reviewRequests.length > 0 && (
        <>
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
            Sent requests ({stats.reviewRequests.length})
          </div>
          {stats.reviewRequests.slice(0, 5).map((r) => (
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
                  {r.customer_name?.[0] || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 14 }}>
                    {r.customer_name}
                  </div>
                  <div style={{ fontSize: 12, color: G.muted }}>
                    {r.customer_email || ""}
                    {r.customer_email && r.channel ? " · " : ""}
                    {r.channel}
                    {r.sent_at ? ` · ${fmtDate(r.sent_at)}` : ""}
                  </div>
                </div>
                <Pill
                  variant={
                    r.status === "reviewed"
                      ? "success"
                      : r.status === "clicked"
                      ? "warning"
                      : "default"
                  }
                >
                  {r.status === "reviewed"
                    ? `Reviewed ${r.gateway_rating ? `(${r.gateway_rating}★)` : ""}`
                    : r.status === "clicked"
                    ? "Clicked"
                    : "Sent"}
                </Pill>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* ── Internal Reviews (from gateway) ── */}
      {!loading && stats && stats.recentSubmissions.length > 0 && (
        <>
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
            Customer reviews ({stats.recentSubmissions.length})
          </div>
          {stats.recentSubmissions.map((r) => (
            <Card
              key={r.id}
              sx={{ marginBottom: 8, padding: "12px 14px" }}
            >
              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
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
                  {r.author_name?.[0] || "?"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 3 }}>
                    <span style={{ fontWeight: 700, fontSize: 13.5 }}>
                      {r.author_name}
                    </span>
                    <Stars rating={r.rating} size={12} />
                  </div>
                  {r.review_text && (
                    <div style={{ fontSize: 12.5, color: G.muted, fontStyle: "italic", fontFamily: "'Instrument Serif',serif" }}>
                      "{r.review_text}"
                    </div>
                  )}
                  <div style={{ fontSize: 11, color: G.mutedLo, marginTop: 4 }}>
                    {r.source === "reviewping_form" ? "ReviewPing" : r.source} · {fmtDate(r.created_at)}
                  </div>
                </div>
              </div>
            </Card>
          ))}
        </>
      )}

      {/* ── Milestone Celebration Modal ── */}
      {milestone && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
            fontFamily: "'Manrope',sans-serif",
          }}
          onClick={() => setMilestone(null)}
        >
          {/* Confetti particles */}
          <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, pointerEvents: "none", overflow: "hidden" }}>
            {Array.from({ length: 30 }).map((_, i) => (
              <div
                key={i}
                className="confetti-particle"
                style={{
                  position: "absolute",
                  top: -10,
                  left: `${Math.random() * 100}%`,
                  width: `${6 + Math.random() * 6}px`,
                  height: `${6 + Math.random() * 6}px`,
                  background: [G.accent, G.gold, G.success, G.purple, "#ff6b6b", "#ffd93d"][
                    Math.floor(Math.random() * 6)
                  ],
                  borderRadius: Math.random() > 0.5 ? "50%" : "2px",
                  animation: `confetti-fall ${1.5 + Math.random() * 2}s ease-out ${Math.random() * 0.5}s forwards`,
                  opacity: 0,
                }}
              />
            ))}
          </div>

          <div
            style={{
              background: G.surface,
              borderRadius: 20,
              padding: "40px 32px 28px",
              maxWidth: 340,
              width: "90%",
              textAlign: "center",
              position: "relative",
              animation: "celebrate-in 0.35s ease",
              boxShadow: "0 20px 60px rgba(0,0,0,0.15)",
            }}
            onClick={(e) => e.stopPropagation()}
          >
            <div style={{ fontSize: 52, marginBottom: 12 }}>
              {milestone.emoji}
            </div>
            <h3
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 4px",
                letterSpacing: "-0.3px",
                color: G.ink,
              }}
            >
              Milestone reached!
            </h3>
            <p
              style={{
                fontSize: 14,
                color: G.muted,
                margin: "0 0 20px",
                lineHeight: 1.6,
              }}
            >
              {milestone.message}
            </p>
            <div
              style={{
                display: "flex",
                gap: 8,
                justifyContent: "center",
                marginBottom: 16,
              }}
            >
              <span
                onClick={() => {
                  const text = encodeURIComponent(
                    `I just reached a milestone on ReviewPing: ${milestone.message}`,
                  );
                  window.open(
                    `https://twitter.com/intent/tweet?text=${text}`,
                    "_blank",
                  );
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#1DA1F2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                }}
                title="Share on X (Twitter)"
              >
                𝕏
              </span>
              <span
                onClick={() => {
                  const text = encodeURIComponent(
                    `I just reached a milestone on ReviewPing: ${milestone.message}`,
                  );
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent("https://reviewping.pro")}&text=${text}`,
                    "_blank",
                  );
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#0A66C2",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                }}
                title="Share on LinkedIn"
              >
                in
              </span>
              <span
                onClick={() => {
                  const text = encodeURIComponent(
                    `I just reached a milestone on ReviewPing: ${milestone.message}`,
                  );
                  window.open(
                    `https://api.whatsapp.com/send?text=${text}`,
                    "_blank",
                  );
                }}
                style={{
                  width: 40,
                  height: 40,
                  borderRadius: "50%",
                  background: "#25D366",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  cursor: "pointer",
                  color: "white",
                  fontSize: 16,
                  fontWeight: 700,
                }}
                title="Share on WhatsApp"
              >
                WA
              </span>
            </div>
            <button
              onClick={() => setMilestone(null)}
              style={{
                width: "100%",
                padding: "12px",
                background: G.accent,
                color: "white",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              Continue
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
