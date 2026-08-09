import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../config/supabase";
import { G } from "../../data/theme";
import { Card, Btn, Spinner } from "../ui";
import { getGbpAuthUrl } from "../../api";
import { toast } from "sonner";
import QRCode from "./QRCode";

function fmt(n) {
  if (typeof n !== "number") return "0";
  return n.toLocaleString();
}

export default function GatewayPage({ userId, biz, plan, gbpConnected }) {
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(false);
  const [gatewayStats, setGatewayStats] = useState({ clicks: 0, converted: 0, rate: 0, qrScans: 0, blocked: 0, qrScansThisMonth: 0 });
  const [localGbpConnected, setLocalGbpConnected] = useState(gbpConnected);

  useEffect(() => {
    setLocalGbpConnected(gbpConnected);
  }, [gbpConnected]);

  useEffect(() => {
    if (!userId || !localGbpConnected) return;
    let cancelled = false;

    async function fetchStats() {
      setLoading(true);
      try {
        const [clicksRes, convertedRes, qrRes, blockedRes, bizRes] = await Promise.all([
          supabase.from("review_events").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("event_type", "link_click"),
          supabase.from("review_events").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("event_type", "review_submitted"),
          supabase.from("review_events").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("event_type", "qr_scan"),
          supabase.from("profiles").select("blocked_scans").eq("id", userId).single(),
          supabase.from("business_settings").select("qr_scans_this_month").eq("user_id", userId).single(),
        ]);

        const clicks = clicksRes.count || 0;
        const converted = convertedRes.count || 0;
        const qrScans = qrRes.count || 0;
        const blocked = blockedRes.data?.blocked_scans || 0;
        const qrScansThisMonth = bizRes.data?.qr_scans_this_month || 0;
        const rate = clicks > 0 ? Math.round((converted / clicks) * 100) : 0;

        if (!cancelled) setGatewayStats({ clicks, converted, rate, qrScans, blocked, qrScansThisMonth });
      } catch (e) {
        console.error("GatewayPage fetch error:", e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }

    fetchStats();
    return () => { cancelled = true; };
  }, [userId, localGbpConnected]);

  // Listen for GBP OAuth popup response
  useEffect(() => {
    const handler = (e) => {
      if (e.data?.type === "gbp_success") {
        supabase.from("gbp_connections").select("is_connected").eq("user_id", userId).single().then(({ data }) => {
          if (data?.is_connected) {
            setLocalGbpConnected(true);
            toast.success("Google Business Profile connected!");
          }
        }).catch(() => {});
      } else if (e.data?.type === "gbp_error") {
        toast.error(e.data?.error === "expired" ? "Connection expired. Try again." : "Failed to connect GBP");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [userId]);

  const doGbpConnect = async () => {
    setConnecting(true);
    try {
      const popup = window.open("", "gbp-connect", "width=600,height=720,scrollbars=yes");
      if (!popup) {
        toast.error("Popup blocked. Please allow popups for this site.");
        setConnecting(false);
        return;
      }
      const { url } = await getGbpAuthUrl();
      popup.location = url;
      const checkClosed = setInterval(() => {
        if (popup.closed) {
          clearInterval(checkClosed);
          setConnecting(false);
        }
      }, 1000);
    } catch (err) {
      toast.error(err.message || "Failed to start GBP connection");
      setConnecting(false);
    }
  };

  // Locked state when GBP not connected
  if (!localGbpConnected) {
    return (
      <div style={{ display: "flex", flexDirection: "column", gap: 16, alignItems: "center", textAlign: "center", paddingTop: 40 }}>
        <div style={{ width: 72, height: 72, borderRadius: 20, background: `${G.accent}12`, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke={G.accent} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
            <path d="M7 11V7a5 5 0 0 1 10 0v4" />
          </svg>
        </div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: 0, letterSpacing: "-0.5px" }}>
          QR Gateway
        </h2>
        <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.6, maxWidth: 380, margin: "0 auto" }}>
          Connect your Google Business Profile to unlock QR Gateway. Generate QR codes, track scans, and manage your review collection gateway.
        </p>
        <Btn onClick={doGbpConnect} loading={connecting} disabled={connecting} style={{ marginTop: 8 }}>
          {connecting ? "Connecting..." : "Connect Google Business Profile"}
        </Btn>
      </div>
    );
  }

  if (loading) {
    return <div style={{ display: "flex", justifyContent: "center", padding: 60 }}><Spinner size={36} /></div>;
  }

  const cards = [
    { l: "Link Clicks", v: fmt(gatewayStats.clicks), c: G.accent },
    { l: "Conversion Rate", v: `${gatewayStats.rate}%`, c: G.success },
    { l: "QR Scans (total)", v: fmt(gatewayStats.qrScans), c: G.purple },
    { l: "QR Scans (month)", v: fmt(gatewayStats.qrScansThisMonth), c: "#F59E0B" },
  ];

  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
      <div>
        <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: 0, letterSpacing: "-0.5px" }}>
          QR Gateway
        </h2>
        <p style={{ color: G.muted, fontSize: 13.5, margin: "4px 0 0" }}>
          Generate QR codes and track gateway performance
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 12 }}>
        {cards.map((c) => (
          <Card key={c.l} sx={{ padding: "16px 18px" }}>
            <div style={{ fontSize: 12, color: G.muted, fontWeight: 600, letterSpacing: "0.5px", textTransform: "uppercase", marginBottom: 6 }}>{c.l}</div>
            <div style={{ fontSize: 28, fontWeight: 800, color: c.c }}>{c.v}</div>
          </Card>
        ))}
      </div>

      <QRCode biz={biz} gbpConnected={true} plan={plan} />
    </div>
  );
}