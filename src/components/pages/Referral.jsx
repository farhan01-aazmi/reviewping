import { useState, useEffect } from "react";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import { fmtDate } from "../../utils/formatters";
import { toast } from "sonner";
import { supabase } from "../../config/supabase";

export default function Referral({ userId }) {
  const [refs, setRefs] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (!userId) return;
    const load = async () => {
      setLoading(true);
      try {
        // 1. Fetch or generate referral_code from profiles
        const { data: prof, error: profErr } = await supabase
          .from("profiles")
          .select("referral_code")
          .eq("id", userId)
          .single();

        if (profErr && profErr.code !== "PGRST116") throw profErr;

        let referralCode = prof?.referral_code;
        if (!referralCode) {
          referralCode =
            "RP" + crypto.randomUUID().slice(0, 8).toUpperCase();
          const { error: upsertErr } = await supabase
            .from("profiles")
            .upsert({ id: userId, referral_code: referralCode });
          if (upsertErr) throw upsertErr;
        }
        setProfile({ referral_code: referralCode });

        // 2. Fetch referrals from DB
        const { data: refData, error: refErr } = await supabase
          .from("referrals")
          .select("*")
          .eq("referrer_id", userId);
        if (refErr) throw refErr;
        setRefs(refData || []);
      } catch (err) {
        toast.error(err.message || "Failed to load referral data");
      }
      setLoading(false);
    };
    load();
  }, [userId]);

  const link = profile
    ? `https://reviewping.io/?ref=${profile.referral_code}`
    : "";

  const total = refs.filter((r) => r.status === "converted").length * 39;
  const activeCount = refs.filter((r) => r.status === "active").length;

  const copy = () => {
    navigator.clipboard?.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    toast.success("Link copied to clipboard!");
  };

  if (loading)
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
          Referral program
        </h2>
        <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
          Earn $39 account credit for every business you refer.
        </p>
        <div
          style={{
            padding: 40,
            textAlign: "center",
            color: G.muted,
            fontSize: 13.5,
          }}
        >
          Loading…
        </div>
      </div>
    );

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
        Referral program
      </h2>
      <p style={{ margin: "0 0 22px", color: G.muted, fontSize: 13.5 }}>
        Earn $39 account credit for every business you refer.
      </p>
      <Card
        sx={{
          background: G.accentBg,
          border: `1.5px solid ${G.accentBd}`,
          marginBottom: 14,
          textAlign: "center",
          padding: "28px 24px",
        }}
      >
        <div
          style={{
            fontFamily: "'Instrument Serif',serif",
            fontSize: 44,
            color: G.accent,
            lineHeight: 1,
            marginBottom: 4,
          }}
        >
          ${total}
        </div>
        <div
          style={{
            fontSize: 13.5,
            color: G.muted,
            marginBottom: 20,
          }}
        >
          Total earned · {activeCount} active referrals
        </div>
        <div
          style={{
            padding: "12px 16px",
            background: G.surface,
            border: `1.5px solid ${G.border}`,
            borderRadius: 8,
            fontFamily: "monospace",
            fontSize: 12.5,
            color: G.inkSoft,
            marginBottom: 14,
            wordBreak: "break-all",
            textAlign: "left",
          }}
        >
          {link}
        </div>
        <div
          style={{
            display: "flex",
            gap: 8,
            justifyContent: "center",
          }}
        >
          <Btn onClick={copy}>{copied ? "✓ Copied!" : "Copy link"}</Btn>
          <Btn
            variant="secondary"
            onClick={() => {
              if (navigator.share) {
                navigator.share({
                  title: "ReviewPing",
                  text: "Get more Google reviews automatically",
                  url: link,
                });
              } else {
                toast.info("Share not supported in this browser");
              }
            }}
          >
            Share →
          </Btn>
        </div>
      </Card>
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr",
          gap: 10,
          marginBottom: 20,
        }}
      >
        {[
          { i: "🔗", t: "Share your link" },
          { i: "✅", t: "They sign up" },
          { i: "💰", t: "You earn $39" },
        ].map((s) => (
          <Card key={s.t} sx={{ padding: 16, textAlign: "center" }}>
            <div style={{ fontSize: 24, marginBottom: 6 }}>{s.i}</div>
            <div
              style={{ fontWeight: 700, fontSize: 12.5, color: G.inkSoft }}
            >
              {s.t}
            </div>
          </Card>
        ))}
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
        Your referrals
      </div>
      {refs.length === 0 && (
        <Card
          sx={{
            marginBottom: 8,
            padding: "24px 14px",
            textAlign: "center",
            color: G.muted,
            fontSize: 13,
          }}
        >
          No referrals yet. Share your link to get started.
        </Card>
      )}
      {refs.map((r) => (
        <Card
          key={r.id || r.name}
          sx={{ marginBottom: 8, padding: "12px 14px" }}
        >
          <div
            style={{ display: "flex", alignItems: "center", gap: 12 }}
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
              <div style={{ fontWeight: 600, fontSize: 13.5 }}>
                {r.name}
              </div>
              <div style={{ fontSize: 12, color: G.muted }}>
                Joined {fmtDate(r.joined || r.created_at)}
              </div>
            </div>
            <div style={{ textAlign: "right" }}>
              <Pill
                color={r.status === "active" ? G.success : G.gold}
              >
                {r.status === "active" ? "Active" : "Trial"}
              </Pill>
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 700,
                  color: r.status === "active" ? G.success : G.muted,
                  marginTop: 4,
                }}
              >
                {r.earned}
              </div>
            </div>
          </div>
        </Card>
      ))}
      <Card
        sx={{
          marginTop: 10,
          background: G.bg,
          border: `1.5px solid ${G.border}`,
        }}
      >
        <p
          style={{
            margin: 0,
            fontSize: 12.5,
            color: G.muted,
            lineHeight: 1.7,
          }}
        >
          Credits apply when the referred user makes their first payment. No
          limit on referrals. Credits applied to your next invoice
          automatically.
        </p>
      </Card>
    </div>
  );
}
