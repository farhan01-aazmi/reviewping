import { useState, useEffect } from "react";
import { G } from "../../data/theme";
import { PLANS, getLimit } from "../../data/constants";
import { createSubscription } from "../../api";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import ConfirmModal from "../ui/ConfirmModal";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";
import { trackCheckoutStarted } from "../../tracking";

export default function Billing({ userId, plan, setPlan, trialEnd, trialDaysLeft }) {
  const cur = PLANS.find((p) => p.id === plan) || PLANS[0];
  const [annual, setAnnual] = useState(false);
  const [confirm, setConfirm] = useState(null);
  const [loading, setLoading] = useState(false);
  const [usage, setUsage] = useState({ requests: 0, email: 0, aiGens: 0, qrScans: 0 });
  const [usageLoading, setUsageLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;
    const fetchUsage = async () => {
      setUsageLoading(true);
      try {
        const startOfMonth = new Date(
          new Date().getFullYear(),
          new Date().getMonth(),
          1
        ).toISOString();

        const { count: totalRequests, error: err1 } = await supabase
          .from("review_requests")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .gte("sent_at", startOfMonth);
        if (err1) throw err1;

        const { count: emailCount, error: err2 } = await supabase
          .from("review_requests")
          .select("*", { count: "exact", head: true })
          .eq("user_id", userId)
          .eq("channel", "email")
          .gte("sent_at", startOfMonth);
        if (err2) throw err2;

        const { data: bizData } = await supabase
          .from("business_settings")
          .select("qr_scans_this_month, ai_generations_this_month")
          .eq("user_id", userId)
          .single();

        setUsage({
          requests: totalRequests ?? 0,
          email: emailCount ?? 0,
          aiGens: bizData?.ai_generations_this_month ?? 0,
          qrScans: bizData?.qr_scans_this_month ?? 0,
        });
      } catch (err) {
        toast.error(err.message || "Failed to load usage");
      }
      setUsageLoading(false);
    };
    fetchUsage();
  }, [userId]);

  const doSwitch = async (p) => {
    setLoading(true);
    try {
      const billing = annual ? "annual" : "monthly";
      trackCheckoutStarted({ target_plan: p.id, billing_cycle: billing });
      const result = await createSubscription({
        plan: p.id,
        billing,
        return_url: window.location.href,
      });
      if (result?.url) {
        window.location.href = result.url;
        return;
      }
      toast.error("Checkout URL not returned");
    } catch (err) {
      toast.error(err.message || "Failed to start checkout");
    }
    setLoading(false);
    setConfirm(null);
  };

  const usageItems = [
    { l: "Review requests", v: usage.requests, max: getLimit(plan, "reviewRequests") > 999 ? null : getLimit(plan, "reviewRequests") },
    { l: "Email messages", v: usage.email, max: null },
    { l: "AI generations", v: usage.aiGens, max: getLimit(plan, "aiGenerations") },
    { l: "QR scans", v: usage.qrScans, max: null },
  ];

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
        Billing & Plan
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Manage your subscription and payments.
      </p>
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
          marginBottom: 14,
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 700,
            color: G.muted,
            letterSpacing: "0.8px",
            textTransform: "uppercase",
            marginBottom: 8,
          }}
        >
          Current plan
        </div>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <div>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 24,
                color: G.accent,
              }}
            >
              {cur.name}
            </div>
            <div style={{ fontSize: 13, color: G.muted, marginTop: 2 }}>
              {cur.f.slice(0, 2).join(" \u00b7 ")}
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 30,
                color: G.ink,
              }}
            >
              ₹{annual ? Math.round(cur.annual / 12) : cur.price}
            </div>
            <div style={{ fontSize: 12, color: G.muted }}>/month</div>
          </div>
        </div>
      </Card>

      {trialDaysLeft > 0 && (
        <Card
          sx={{
            marginBottom: 14,
            background: G.goldBg,
            border: `1.5px solid ${G.goldBd}`,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <span style={{ fontSize: 32 }}>{"\uD83C\uDF89"}</span>
            <div>
              <div style={{ fontWeight: 700, fontSize: 15, color: "#8B6914" }}>
                {trialDaysLeft}-day free trial
              </div>
              <div style={{ fontSize: 12.5, color: "#8B6914", opacity: 0.8, marginTop: 2 }}>
                Trial ends {trialEnd ? new Date(trialEnd).toLocaleDateString() : "soon"}. Choose a plan to continue.
              </div>
            </div>
          </div>
        </Card>
      )}

      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 14 }}>
          This month's usage
        </div>
        {usageLoading ? (
          <div
            style={{
              padding: "12px 0",
              textAlign: "center",
              color: G.muted,
              fontSize: 13,
            }}
          >
            Loading usage\u2026
          </div>
        ) : (
          usageItems.map((u) => (
            <div key={u.l} style={{ marginBottom: 14 }}>
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  marginBottom: 5,
                }}
              >
                <span style={{ fontSize: 13.5, color: G.inkSoft }}>
                  {u.l}
                </span>
                <span
                  style={{ fontSize: 13, color: G.muted, fontWeight: 600 }}
                >
                  {u.v}
                  {u.max ? ` / ${u.max}` : " sent"}
                </span>
              </div>
              <div
                style={{
                  height: 6,
                  background: G.border,
                  borderRadius: 3,
                  overflow: "hidden",
                }}
              >
                <div
                  style={{
                    height: "100%",
                    background:
                      u.max && u.v / u.max > 0.8 ? G.gold : G.accent,
                    borderRadius: 3,
                    width: `${
                      u.max ? Math.min((u.v / u.max) * 100, 100) : 30
                    }%`,
                  }}
                />
              </div>
            </div>
          ))
        )}
      </Card>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 10,
          marginBottom: 14,
        }}
      >
        <span
          style={{
            fontSize: 13.5,
            color: annual ? G.muted : G.ink,
            fontWeight: annual ? 400 : 700,
            cursor: "pointer",
          }}
          onClick={() => setAnnual(false)}
        >
          Monthly
        </span>
        <div
          onClick={() => setAnnual((a) => !a)}
          style={{
            width: 44,
            height: 24,
            borderRadius: 12,
            background: annual ? G.accent : G.border,
            position: "relative",
            cursor: "pointer",
            transition: "background 0.2s",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: 3,
              left: annual ? "unset" : "3px",
              right: annual ? "3px" : "unset",
              width: 18,
              height: 18,
              borderRadius: "50%",
              background: "white",
              transition: "all 0.2s",
            }}
          />
        </div>
        <span
          style={{
            fontSize: 13.5,
            color: annual ? G.ink : G.muted,
            fontWeight: annual ? 700 : 400,
            cursor: "pointer",
          }}
          onClick={() => setAnnual(true)}
        >
          Annual{" "}
          <span
            style={{
              color: G.success,
              fontWeight: 700,
              fontSize: 11,
            }}
          >
            Save ~17%
          </span>
        </span>
      </div>
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
        Available plans
      </div>
      {PLANS.map((p) => {
        const isPremium = p.id === "premium";
        return (
          <Card
            key={p.id}
            sx={{
              marginBottom: 10,
              border: `1.5px solid ${p.id === plan ? G.accent : G.border}`,
              position: "relative",
              overflow: "hidden",
            }}
          >
            {isPremium && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 0,
                  background: G.accent,
                  color: "#fff",
                  fontSize: 9.5,
                  fontWeight: 700,
                  letterSpacing: "0.6px",
                  textTransform: "uppercase",
                  padding: "3px 12px",
                  borderBottomLeftRadius: 8,
                }}
              >
                Most Popular
              </div>
            )}
            <div
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "flex-start",
                marginBottom: 10,
              }}
            >
              <div>
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 20,
                    marginBottom: 2,
                  }}
                >
                  {p.name}
                </div>
                <div style={{ fontSize: 12, color: G.muted }}>
                  {p.sub}
                </div>
              </div>
              <div style={{ textAlign: "right" }}>
                <div
                  style={{
                    fontFamily: "'Instrument Serif',serif",
                    fontSize: 24,
                    color: G.ink,
                  }}
                >
                  ₹{annual ? Math.round(p.annual / 12) : p.price}
                </div>
                <div style={{ fontSize: 11, color: G.muted }}>/month</div>
              </div>
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "4px 16px",
                marginBottom: 12,
                fontSize: 12.5,
                color: G.muted,
              }}
            >
              {[
                { label: "Review requests", val: p.limits.reviewRequests > 999 ? "Unlimited" : `${p.limits.reviewRequests}/mo` },
                { label: "Templates per rating", val: p.limits.templatesPerRating > 100 ? "Unlimited" : p.limits.templatesPerRating },
                { label: "AI generations", val: `${p.limits.aiGenerations}/mo` },
                { label: "Business locations", val: p.limits.locations > 1 ? `Up to ${p.limits.locations}` : "1" },
                { label: "Team members", val: p.limits.teamMembers > 1 ? `Up to ${p.limits.teamMembers}` : "1" },
              ].map((item) => (
                <div key={item.label} style={{ display: "flex", gap: 6, alignItems: "center" }}>
                  <span style={{ color: G.success, fontSize: 11 }}>{"\u2713"}</span>
                  <span>
                    <strong>{item.label}:</strong> {item.val}
                  </span>
                </div>
              ))}
            </div>

            <div
              style={{
                display: "flex",
                flexWrap: "wrap",
                gap: 4,
                marginBottom: 10,
              }}
            >
              {(p.f || []).map((feat, i) => (
                <span
                  key={i}
                  style={{
                    fontSize: 11,
                    color: G.mutedLo,
                    background: G.bg,
                    padding: "2px 8px",
                    borderRadius: 4,
                  }}
                >
                  {feat}
                </span>
              ))}
            </div>

            {p.id === plan ? (
              <Pill color={G.success} style={{ alignSelf: "flex-start" }}>Current</Pill>
            ) : (
              <Btn
                size="sm"
                variant={isPremium ? "primary" : "secondary"}
                onClick={() => setConfirm(p)}
                loading={loading}
                disabled={loading}
                fullWidth
              >
                {p.price > cur.price ? "Upgrade \u2192" : "Downgrade"}
              </Btn>
            )}
          </Card>
        );
      })}
      <Card sx={{ marginBottom: 14 }}>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          Payment method
        </div>
        <div
          style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            gap: 10,
            padding: "20px 14px",
            background: G.bg,
            border: `1.5px dashed ${G.border}`,
            borderRadius: 8,
            textAlign: "center",
          }}
        >
          <span style={{ fontSize: 28, opacity: 0.4 }}>{"\uD83D\uDCB3"}</span>
          <div style={{ fontSize: 13, color: G.muted }}>
            No payment method saved yet.
          </div>
          <Btn variant="secondary" size="sm">
            Add payment method
          </Btn>
        </div>
      </Card>
      <Card>
        <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 12 }}>
          Billing history
        </div>
        <div
          style={{
            padding: "20px 14px",
            textAlign: "center",
            fontSize: 13,
            color: G.muted,
          }}
        >
          No billing history yet.
        </div>
      </Card>

      <ConfirmModal
        open={!!confirm}
        title={confirm ? `Upgrade to ${confirm.name}` : ""}
        message={confirm ? `Switch to the ${confirm.name} plan at ₹${annual ? Math.round(confirm.annual / 12) : confirm.price}/mo?` : ""}
        confirmLabel={loading ? "Processing\u2026" : "Confirm upgrade"}
        onConfirm={() => doSwitch(confirm)}
        onCancel={() => setConfirm(null)}
        loading={loading}
      />
    </div>
  );
}