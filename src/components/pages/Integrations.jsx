import { useState, useEffect, useCallback } from "react";
import { supabase } from "../../config/supabase";
import { getGbpAuthUrl, disconnectGbp, syncGbpReviews } from "../../api";
import { G } from "../../data/theme";
import Btn from "../ui/Btn";
import Card from "../ui/Card";
import Pill from "../ui/Pill";
import { toast } from "sonner";

export default function Integrations({ plan }) {
  const [gbp, setGbp] = useState(null);
  const [gbpLoading, setGbpLoading] = useState(false);
  const [syncing, setSyncing] = useState(false);

  // Listen for postMessage from GBP OAuth popup
  useEffect(() => {
    const handler = (e) => {
      // Accept from any origin (popup is on supabase.co)
      if (e.data?.type === "gbp_success") {
        toast.success("Google Business Profile connected! 🎉");
        // Re-fetch the GBP connection status
        supabase.from("gbp_connections").select("*").single().then(({ data, error }) => {
          if (error) { console.error("Failed to load GBP connection:", error); return; }
          if (data?.is_connected) setGbp(data);
        }).catch(console.error);
      } else if (e.data?.type === "gbp_error") {
        toast.error(e.data?.error === "expired" ? "Connection expired. Try again." : "Failed to connect GBP");
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, []);

  useEffect(() => {
    loadGbpStatus();
  }, []);

  const loadGbpStatus = useCallback(() => {
    supabase.from("gbp_connections").select("*").single().then(({ data, error }) => {
      if (error) { console.error("Failed to load GBP connection:", error); return; }
      if (data?.is_connected) setGbp(data);
    }).catch(console.error);
  }, []);

  const doGbpConnect = async () => {
    if (plan === "starter") {
      toast.error("Upgrade to Growth to connect integrations");
      return;
    }
    setGbpLoading(true);

    // Open popup synchronously (avoids popup blockers)
    const popup = window.open("", "gbp-connect", "width=600,height=720,scrollbars=yes");

    try {
      const { url } = await getGbpAuthUrl();
      if (popup && !popup.closed) {
        popup.location.href = url;
      } else {
        // Popup blocked — fallback to full-page redirect
        window.location.href = url;
      }
    } catch (err) {
      if (popup && !popup.closed) popup.close();
      toast.error(err.message || "Failed to start connection");
      setGbpLoading(false);
    }
  };

  const doGbpDisconnect = async () => {
    try {
      await disconnectGbp();
      setGbp(null);
      toast("GBP disconnected");
    } catch (err) {
      toast.error(err.message);
    }
  };

  const doGbpSync = async () => {
    setSyncing(true);
    try {
      const result = await syncGbpReviews();
      toast(`${result.stored} new reviews synced from GBP`);
    } catch (err) {
      toast.error(err.message || "Sync failed");
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
