import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { G } from "../../data/theme";
import { NAV_ITEMS, MAIN_SCREENS } from "../../data/constants";
import { supabase } from "../../config/supabase";
import { Toaster, toast } from "sonner";
import { Spinner } from "../ui";
import Sidebar from "../ui/Sidebar";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const SendReq = lazy(() => import("../pages/SendReq"));
const ReviewsPage = lazy(() => import("../pages/ReviewsPage"));
const Analytics = lazy(() => import("../pages/Analytics"));
const TemplatesPage = lazy(() => import("../pages/TemplatesPage"));
const Automations = lazy(() => import("../pages/Automations"));
const Contacts = lazy(() => import("../pages/Contacts"));
const QRCode = lazy(() => import("../pages/QRCode"));
const WidgetEmbed = lazy(() => import("../pages/WidgetEmbed"));
const Integrations = lazy(() => import("../pages/Integrations"));
const Notifications = lazy(() => import("../pages/Notifications"));
const Billing = lazy(() => import("../pages/Billing"));
const Settings = lazy(() => import("../pages/Settings"));
const Team = lazy(() => import("../pages/Team"));
const Help = lazy(() => import("../pages/Help"));
const More = lazy(() => import("../pages/More"));
const SentLog = lazy(() => import("../pages/SentLog"));
const Referral = lazy(() => import("../pages/Referral"));
const Changelog = lazy(() => import("../pages/Changelog"));
const BulkSend = lazy(() => import("../pages/BulkSend"));
const PricingPage = lazy(() => import("../pages/PricingPage"));
const GatewayPage = lazy(() => import("../pages/GatewayPage"));
const RequestsPage = lazy(() => import("../pages/RequestsPage"));
import AppPrivacyPolicy from "./PrivacyPage";
import AppTerms from "./TermsPage";

import OnboardingWizard from "./OnboardingWizard";

function screenFromPath() {
  const hash = window.location.hash.replace(/^#/, "").replace(/\/+$/, "");
  if (hash === "/dashboard") return "dashboard";
  const match = hash.match(/^\/dashboard\/(.+)/);
  if (match) {
    const sub = match[1];
    if (MAIN_SCREENS.includes(sub)) return sub;
    return "dashboard";
  }
  return "dashboard";
}

function pathFromScreen(screen) {
  if (screen === "dashboard") return "#/dashboard";
  return `#/dashboard/${screen}`;
}

export default function AppShell({ user: initUser, onLogout }) {
  const [screen, setScreen] = useState(() => screenFromPath());
  const [prevScreen, setPrevScreen] = useState(null);
  const [showOnboarding, setShowOnboarding] = useState(false);
  const userId = initUser?.id;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gbp") === "connected") {
      toast.success("Google Business Profile connected! 🎉");
      supabase.from("gbp_connections").select("*").single().then(({ data }) => {
        if (data?.is_connected) {
          sessionStorage.setItem("gbp_connected", "true");
        }
      }).catch(() => {});
      window.history.replaceState({}, "", "/dashboard");
    } else if (params.get("gbp") === "error") {
      const msg = params.get("msg");
      toast.error(msg === "expired" ? "Connection expired. Try again." : "Failed to connect GBP");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const [plan, setPlan] = useState("free");
  const [trialEnd, setTrialEnd] = useState(null);
  const [biz, setBiz] = useState({
    bizName: initUser?.biz || "My Business",
    bizType: "",
    googleLink: "",
    slug: "",
    avg_order_value: 500,
    otherBusinessType: "",
  });
  const [gbpConnected, setGbpConnected] = useState(false);
  const [user, setUser] = useState(initUser);

  useEffect(() => {
    if (!userId) return;
    supabase.from("business_settings").select("*").eq("user_id", userId).single().then(({ data, error }) => {
      if (error) { console.error("Failed to load business settings:", error); return; }
      if (data) {
        setBiz({ bizName: data.business_name || "", bizType: data.biz_type || data.business_category || "", googleLink: data.google_link || data.review_link || "", slug: data.slug || "", avg_order_value: data.avg_order_value ?? 500, otherBusinessType: data.other_business_type || "" });
        if (!data.biz_type && !data.business_category) setShowOnboarding(true);
      } else {
        setShowOnboarding(true);
      }
    }).catch(console.error);
    supabase.from("profiles").select("plan, trial_started_at, trial_end").eq("id", userId).single().then(({ data, error }) => {
      if (error) { console.error("Failed to load plan:", error); return; }
      if (data?.plan) setPlan(data.plan);
      if (data?.trial_end) setTrialEnd(data.trial_end);
    }).catch(console.error);
    supabase.from("gbp_connections").select("is_connected").eq("user_id", userId).single().then(({ data, error }) => {
      if (!error && data?.is_connected) setGbpConnected(true);
    }).catch(() => {});
  }, [userId]);

  useEffect(() => {
    if (!userId) return;
    const loadUnread = async () => {
      const { count } = await supabase.from("notifications").select("*", { count: "exact", head: true }).eq("user_id", userId).eq("read", false);
      if (typeof count === "number") setUnread(count);
    };
    loadUnread();
    const sub = supabase.channel("notif-changes").on("postgres_changes", { event: "INSERT", schema: "public", table: "notifications", filter: `user_id=eq.${userId}` }, () => loadUnread()).subscribe();
    return () => sub.unsubscribe();
  }, [userId]);

  const setBizAndSync = useCallback((updater) => {
    setBiz((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userId && next) {
        supabase.from("business_settings").upsert({
          user_id: userId,
          business_name: next.bizName,
          biz_type: next.bizType,
          google_link: next.googleLink,
          avg_order_value: next.avg_order_value ?? 500,
          updated_at: new Date().toISOString()
        }).then(({ error }) => {
          if (error) console.error("Failed to sync business settings:", error);
        }).catch(console.error);
      }
      return next;
    });
  }, [userId]);

  const setPlanAndSync = useCallback((updater) => {
    setPlan((prev) => typeof updater === "function" ? updater(prev) : updater);
  }, [userId]);

  const setUserAndSync = useCallback((updater) => {
    setUser((prev) => typeof updater === "function" ? updater(prev) : updater);
  }, [userId]);

  const navigate = useCallback(
    (to) => {
      setPrevScreen(screen);
      setScreen(to);
      const p = pathFromScreen(to);
      if (window.location.hash !== p) {
        window.location.hash = p;
      }
    },
    [screen]
  );

  const goBack = () => {
    setScreen(prevScreen || "dashboard");
    setPrevScreen(null);
  };

  useEffect(() => {
    const onPop = () => {
      const s = screenFromPath();
      if (s !== screen) setScreen(s);
    };
    const onHash = () => {
      const s = screenFromPath();
      if (s !== screen) setScreen(s);
    };
    window.addEventListener("popstate", onPop);
    window.addEventListener("hashchange", onHash);
    return () => {
      window.removeEventListener("popstate", onPop);
      window.removeEventListener("hashchange", onHash);
    };
  }, [screen]);

  const handleSent = ({ name, channel }) => {
    toast.success(`Request sent to ${name}`);
    setTimeout(() => navigate("dashboard"), 60);
  };

  const [unread, setUnread] = useState(0);
  const isSidebarScreen = ["dashboard","reviews","requests","qr-gateway","templates","settings","billing"].includes(screen);

  // ── Trial banner logic ──
  const trialDaysLeft = trialEnd
    ? Math.max(0, Math.ceil((new Date(trialEnd).getTime() - Date.now()) / 86400000))
    : 0;
  const showTrialBanner = plan === "starter" && trialDaysLeft > 0 && trialDaysLeft <= 7;

  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
        display: "flex",
      }}
    >
      <Toaster richColors position="top-center" />

      {showTrialBanner && (
        <div
          onClick={() => navigate("billing")}
          style={{
            background: G.goldBg,
            borderBottom: `1px solid ${G.goldBd}`,
            padding: "10px 18px",
            textAlign: "center",
            fontSize: 13,
            fontWeight: 600,
            color: "#8B6914",
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            gap: 8,
          }}
        >
          <span>{"\u26A0\uFE0F"}</span>
          <span>Your {trialDaysLeft}-day free trial ends soon. Choose a plan to keep your features.</span>
          <span style={{ fontSize: 16 }}>{"\u2192"}</span>
        </div>
      )}

      {isSidebarScreen && (
        <Sidebar screen={screen} onNav={navigate} plan={plan} unread={unread} />
      )}

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* TOPBAR */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "12px 18px",
            borderBottom: `1px solid ${G.border}`,
            background: G.surface,
            flexShrink: 0,
          }}
        >
          {!isSidebarScreen ? (
            <button
              onClick={goBack}
              style={{
                background: "none",
                border: "none",
                color: G.muted,
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 13,
                padding: 0,
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              ← Back
            </button>
          ) : (
            <span style={{ fontSize: 16, fontWeight: 700, color: G.ink }}>{NAV_ITEMS.find(n => n.id === screen)?.label || "Dashboard"}</span>
          )}
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <button
              onClick={() => navigate("notifications")}
              aria-label={`Notifications${unread > 0 ? ` (${unread} unread)` : ""}`}
              style={{
                background: "none",
                border: "none",
                cursor: "pointer",
                position: "relative",
                padding: 4,
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <svg
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke={G.muted}
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unread > 0 && (
                <div
                  style={{
                    position: "absolute",
                    top: 0,
                    right: 0,
                    width: 16,
                    height: 16,
                    borderRadius: "50%",
                    background: G.accent,
                    color: "white",
                    fontSize: 9,
                    fontWeight: 800,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  {unread > 9 ? "9+" : unread}
                </div>
              )}
            </button>
          </div>
        </header>

        {/* CONTENT AREA */}
        <main
          style={{
            flex: 1,
            overflowY: "auto",
            padding: isSidebarScreen ? "20px 24px 40px" : "20px 16px 90px",
            maxWidth: isSidebarScreen ? 800 : 600,
            margin: "0 auto",
            width: "100%",
            boxSizing: "border-box",
          }}
        >
          <Suspense
            fallback={
              <div
                style={{
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  minHeight: 200,
                }}
            >
              <Spinner size={36} />
            </div>
          }
        >
          {showOnboarding && (
            <OnboardingWizard
              userId={userId}
              biz={biz}
              setBiz={setBiz}
              onNav={navigate}
              onClose={() => setShowOnboarding(false)}
            />
          )}
          {screen === "dashboard" && (
              <Dashboard
                userId={userId}
                biz={biz}
                plan={plan}
                onSend={() => navigate("send")}
                onNav={navigate}
              />
            )}
            {screen === "send" && (
              <SendReq
                onBack={goBack}
                onSent={handleSent}
                biz={biz}
                userId={userId}
                plan={plan}
              />
            )}
            {screen === "reviews" && (
              <ReviewsPage
                userId={userId}
                plan={plan}
                onSend={() => navigate("send")}
              />
            )}
            {screen === "analytics" && <Analytics userId={userId} plan={plan} />}
            {screen === "templates" && <TemplatesPage userId={userId} biz={biz} plan={plan} />}
            {screen === "automations" && <Automations userId={userId} plan={plan} />}
            {screen === "contacts" && <Contacts userId={userId} plan={plan} />}
            {screen === "qrcode" && <QRCode biz={biz} gbpConnected={gbpConnected} plan={plan} />}
            {screen === "widget" && <WidgetEmbed biz={biz} plan={plan} />}
            {screen === "integrations" && <Integrations plan={plan} />}
            {screen === "notifications" && <Notifications userId={userId} plan={plan} />}
            {screen === "pricing" && (
              <PricingPage plan={plan} onNav={navigate} />
            )}
            {screen === "billing" && (
              <Billing userId={userId} plan={plan} setPlan={setPlanAndSync} trialEnd={trialEnd} trialDaysLeft={trialDaysLeft} />
            )}
            {screen === "settings" && (
              <Settings
                biz={biz}
                setBiz={setBizAndSync}
                user={user}
                setUser={setUserAndSync}
                plan={plan}
                onLogout={onLogout}
                trialDaysLeft={trialDaysLeft}
              />
            )}
            {screen === "team" && <Team plan={plan} userId={userId} />}
            {screen === "help" && <Help />}
            {screen === "privacy" && <AppPrivacyPolicy onBack={goBack} />}
            {screen === "terms" && <AppTerms onBack={goBack} />}
            {screen === "more" && (
              <More onNav={navigate} onLogout={onLogout} unreadCount={unread} plan={plan} />
            )}
            {screen === "sentlog" && <SentLog userId={userId} plan={plan} />}
            {screen === "referral" && <Referral userId={userId} user={user} plan={plan} />}
            {screen === "changelog" && <Changelog />}
            {screen === "bulk" && (
              <BulkSend biz={biz} onSent={handleSent} plan={plan} userId={userId} />
            )}
            {screen === "qr-gateway" && (
              <GatewayPage userId={userId} biz={biz} plan={plan} gbpConnected={gbpConnected} />
            )}
            {screen === "requests" && (
              <RequestsPage userId={userId} biz={biz} plan={plan} onSent={handleSent} />
            )}
          </Suspense>
        </main>
      </div>
    </div>
  );
}