import { useState, useEffect } from "react";
import { supabase } from "../../config/supabase";
import { getGbpAuthUrl, disconnectGbp, syncGbpReviews } from "../../api";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";

export default function Integrations({ plan, toast }) {
  const [gbp, setGbp] = useState(null);
  const [gbpLoading, setGbpLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gbp") === "connected") {
      toast("Google Business Profile connected!");
      window.history.replaceState({}, "", "/integrations");
    } else if (params.get("gbp") === "error") {
      toast(params.get("msg") === "expired" ? "Connection expired. Try again." : "Failed to connect", "error");
      window.history.replaceState({}, "", "/integrations");
    }
  }, []);

  useEffect(() => {
    supabase.from("gbp_connections").select("*").single().then(({ data }) => {
      if (data?.is_connected) setGbp(data);
    });
  }, []);

  const doGbpConnect = async () => {
    if (plan === "starter") {
      toast("Upgrade to Growth to connect integrations", "error");
      return;
    }
    setGbpLoading(true);
    try {
      const { url } = await getGbpAuthUrl();
      // Full-page redirect instead of popup (avoids popup blockers)
      window.location.href = url;
    } catch (err) {
      toast(err.message || "Failed to start connection", "error");
      setGbpLoading(false);
    }
  };

  const doGbpDisconnect = async () => {
    try {
      await disconnectGbp();
      setGbp(null);
      toast("GBP disconnected");
    } catch (err) {
      toast(err.message, "error");
    }
  };

  const doGbpSync = async () => {
    setSyncing(true);
    try {
      const result = await syncGbpReviews();
      toast(`${result.stored} new reviews synced from GBP`);
    } catch (err) {
      toast(err.message || "Sync failed", "error");
    }
    setSyncing(false);
  };

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
        Integrations
      </h2>
      <p style={{ margin: "0 0 20px", color: G.muted, fontSize: 13.5 }}>
        Connect your existing tools to trigger review requests automatically.
      </p>

      {/* Google Business Profile */}
      <Card sx={{ marginBottom: 14, padding: "16px 18px", border: `1.5px solid ${gbp ? G.successBd : G.border}`, background: gbp ? G.successBg : G.surface }}>
        <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
          <div style={{ width: 40, height: 40, borderRadius: 10, background: gbp ? G.successBg : G.bg, border: `1.5px solid ${gbp ? G.successBd : G.border}`, display: "flex", alignItems: "center", justifyContent: "center", fontSize: 20, flexShrink: 0 }}>
            🏪
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 3 }}>
              <span style={{ fontWeight: 700, fontSize: 14 }}>Google Business Profile</span>
              <Pill color={G.purple}>Google</Pill>
              {gbp && <Pill color={G.success}>Connected</Pill>}
            </div>
            <div style={{ fontSize: 12.5, color: G.muted, lineHeight: 1.55, marginBottom: gbp ? 10 : 0 }}>
              {gbp
                ? `${gbp.gbp_location_name || "Business"} — ${gbp.gbp_location_address || ""}`
                : "Connect your Google Business Profile to fetch reviews, reply from ReviewPing, and track your GBP stats."}
            </div>
            {gbp && (
              <div style={{ fontSize: 11.5, color: G.mutedLo }}>
                Last synced: {gbp.last_sync_at ? new Date(gbp.last_sync_at).toLocaleString() : "never"}
              </div>
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, flexShrink: 0 }}>
            {!gbp ? (
              <Btn size="sm" variant="secondary" onClick={doGbpConnect} loading={gbpLoading} disabled={gbpLoading}>
                {gbpLoading ? "Connecting…" : "Connect"}
              </Btn>
            ) : (
              <>
                <Btn size="sm" onClick={doGbpSync} loading={syncing} disabled={syncing}>
                  {syncing ? "Syncing…" : "Sync reviews"}
                </Btn>
                <Btn size="sm" variant="danger" onClick={doGbpDisconnect}>
                  Disconnect
                </Btn>
              </>
            )}
          </div>
        </div>
      </Card>

    </div>
  );
}
