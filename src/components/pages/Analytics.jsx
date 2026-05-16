import { useMemo } from "react";
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
import { D } from "../../data/constants";
import Card from "../ui/Card";
import { computeStats } from "../../utils/formatters";

export default function Analytics({ reviews }) {
  const { done, avg, rate } = computeStats(reviews);

  const NOW = Date.now();

  const daily = useMemo(
    () =>
      [...Array(7)].map((_, i) => {
        const s = NOW - (6 - i) * D;
        const e2 = s + D;
        const d = new Date(s);
        return {
          day: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"][
            d.getDay()
          ],
          requests: reviews.filter(
            (r) => r.sentAt >= s && r.sentAt < e2
          ).length,
          reviews: done.filter((r) => r.sentAt >= s && r.sentAt < e2)
            .length,
        };
      }),
    [reviews, done]
  );

  const weekly = useMemo(
    () =>
      [...Array(8)].map((_, i) => {
        const s = NOW - (7 - i) * 7 * D;
        const e2 = s + 7 * D;
        const rev = done.filter(
          (r) => r.sentAt >= s && r.sentAt < e2
        ).length;
        return { week: `W${i + 1}`, reviews: rev };
      }),
    [done]
  );

  const rDist = useMemo(() => {
    const dist = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
    done.forEach((r) => {
      if (r.rating) dist[r.rating]++;
    });
    return [5, 4, 3, 2, 1].map((n) => ({
      name: `${n}★`,
      value: dist[n],
      fill: n >= 4 ? G.success : n === 3 ? G.gold : G.accent,
    }));
  }, [done]);

  const svcDist = useMemo(() => {
    const m = {};
    reviews.forEach((r) => {
      m[r.service] = (m[r.service] || 0) + 1;
    });
    return Object.entries(m)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, count]) => ({
        name: name.split(" ")[0],
        count,
      }));
  }, [reviews]);

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
      <div
        className="rgrid"
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 8,
          marginBottom: 16,
        }}
      >
        {[
          { l: "Reviews", v: done.length, c: G.accent },
          { l: "Avg Rating", v: `${avg}★`, c: G.gold },
          { l: "Conv Rate", v: `${rate}%`, c: G.success },
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
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
          8-Week Review Trend
        </div>
        <div style={{ fontSize: 12, color: G.muted, marginBottom: 14 }}>
          Reviews received each week
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <LineChart data={weekly}>
            <XAxis
              dataKey="week"
              tick={{ fontSize: 10, fill: G.muted }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: G.muted }}
              axisLine={false}
              tickLine={false}
              width={22}
            />
            <Tooltip
              contentStyle={{
                background: G.surface,
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "'Manrope',sans-serif",
              }}
            />
            <Line
              type="monotone"
              dataKey="reviews"
              stroke={G.accent}
              strokeWidth={2.5}
              dot={{ fill: G.accent, r: 4 }}
              activeDot={{ r: 5 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 13.5, marginBottom: 4 }}>
          Daily — Last 7 Days
        </div>
        <div style={{ fontSize: 12, color: G.muted, marginBottom: 14 }}>
          Requests sent vs reviews received
        </div>
        <ResponsiveContainer width="100%" height={160}>
          <BarChart data={daily} barGap={3}>
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: G.muted }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 10, fill: G.muted }}
              axisLine={false}
              tickLine={false}
              width={22}
            />
            <Tooltip
              contentStyle={{
                background: G.surface,
                border: `1px solid ${G.border}`,
                borderRadius: 8,
                fontSize: 12,
                fontFamily: "'Manrope',sans-serif",
              }}
            />
            <Bar
              dataKey="requests"
              fill={G.border}
              radius={[4, 4, 0, 0]}
              name="Requests"
            />
            <Bar
              dataKey="reviews"
              fill={G.accent}
              radius={[4, 4, 0, 0]}
              name="Reviews"
            />
          </BarChart>
        </ResponsiveContainer>
        <div
          style={{
            display: "flex",
            gap: 16,
            marginTop: 10,
            justifyContent: "center",
          }}
        >
          {[
            { c: G.border, l: "Requests" },
            { c: G.accent, l: "Reviews" },
          ].map((i) => (
            <div
              key={i.l}
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
                  background: i.c,
                }}
              />
              {i.l}
            </div>
          ))}
        </div>
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 16,
          }}
        >
          Rating distribution
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
          <div style={{ width: 130, height: 130, flexShrink: 0 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={rDist}
                  cx="50%"
                  cy="50%"
                  innerRadius={38}
                  outerRadius={62}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {rDist.map((e, i) => (
                    <Cell key={i} fill={e.fill} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    background: G.surface,
                    border: `1px solid ${G.border}`,
                    borderRadius: 8,
                    fontSize: 12,
                  }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div style={{ flex: 1 }}>
            {rDist.map((r) => {
              const totalRatings = done.length;
              const pct =
                totalRatings > 0 ? (r.value / totalRatings) * 100 : 0;
              return (
                <div
                  key={r.name}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                    marginBottom: 8,
                  }}
                >
                  <span
                    style={{
                      fontSize: 12,
                      fontWeight: 700,
                      color: G.inkSoft,
                      minWidth: 24,
                    }}
                  >
                    {r.name}
                  </span>
                  <div
                    style={{
                      flex: 1,
                      height: 8,
                      background: G.border,
                      borderRadius: 4,
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        height: "100%",
                        background: r.fill,
                        borderRadius: 4,
                        width: `${pct}%`,
                        transition: "width 0.6s",
                      }}
                    />
                  </div>
                  <span
                    style={{
                      fontSize: 11.5,
                      color: G.muted,
                      minWidth: 16,
                    }}
                  >
                    {r.value}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      </Card>
      <Card sx={{ marginBottom: 14 }}>
        <div
          style={{
            fontWeight: 700,
            fontSize: 13.5,
            marginBottom: 14,
          }}
        >
          Top services by volume
        </div>
        {svcDist.map((s, i) => (
          <div
            key={s.name}
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 10,
            }}
          >
            <span
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 16,
                color: G.mutedLo,
                minWidth: 20,
              }}
            >
              {i + 1}
            </span>
            <span
              style={{
                flex: 1,
                fontSize: 13.5,
                color: G.inkSoft,
                fontWeight: 500,
              }}
            >
              {s.name}
            </span>
            <div
              style={{
                width: 80,
                height: 6,
                background: G.border,
                borderRadius: 3,
                overflow: "hidden",
              }}
            >
              <div
                style={{
                  height: "100%",
                  background: G.accent,
                  borderRadius: 3,
                  width: `${
                    (s.count / Math.max(...svcDist.map((x) => x.count))) *
                    100
                  }%`,
                }}
              />
            </div>
            <span
              style={{
                fontSize: 12,
                color: G.muted,
                minWidth: 20,
                textAlign: "right",
              }}
            >
              {s.count}
            </span>
          </div>
        ))}
      </Card>
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
        }}
      >
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 6 }}>
          💡 Insight
        </div>
        <p
          style={{
            margin: 0,
            fontSize: 13.5,
            color: G.inkSoft,
            lineHeight: 1.7,
          }}
        >
          Your response rate of <strong>{rate}%</strong> is{" "}
          {rate > 32 ? "above" : "below"} the industry average of 32%.{" "}
          {rate > 32
            ? "Keep sending requests promptly after each service."
            : "Try sending within 1 hour of service completion."}
        </p>
      </Card>
    </div>
  );
}
