import { useState, useEffect, useCallback, lazy, Suspense } from "react";
import { G } from "../../data/theme";
import { NAV_ITEMS, MAIN_SCREENS } from "../../data/constants";
import { supabase } from "../../config/supabase";
import { Toaster, toast } from "sonner";
import { Wordmark, Pill } from "../ui";

const Dashboard = lazy(() => import("../pages/Dashboard"));
const SendReq = lazy(() => import("../pages/SendReq"));
const ReviewsPage = lazy(() => import("../pages/ReviewsPage"));
const Analytics = lazy(() => import("../pages/Analytics"));
const Templates = lazy(() => import("../pages/Templates"));
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
import AppPrivacyPolicy from "./PrivacyPolicy";
import AppTerms from "./Terms";

import { Spinner } from "../ui";

export default function AppShell({ user: initUser, onLogout }) {
  const [screen, setScreen] = useState("dashboard");
  const [prevScreen, setPrevScreen] = useState(null);
  const userId = initUser?.id;

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    if (params.get("gbp") === "connected") {
      toast("Google Business Profile connected!");
      window.history.replaceState({}, "", "/dashboard");
    } else if (params.get("gbp") === "error") {
      const msg = params.get("msg");
      toast(msg === "expired" ? "Connection expired. Try again." : "Failed to connect GBP", "error");
      window.history.replaceState({}, "", "/dashboard");
    }
  }, []);

  const [reviews, setReviews] = useState([]);
  const [templates, setTemplates] = useState([]);
  const [team, setTeam] = useState([]);
  const [notifs, setNotifs] = useState([]);

  const [plan, setPlan] = useState("growth");
  const [biz, setBiz] = useState({
    bizName: initUser?.biz || "My Business",
    bizType: "",
    googleLink: "",
  });
  const [user, setUser] = useState(initUser);

  useEffect(() => {
    if (!userId) return;
    supabase.from("business_settings").select("*").eq("user_id", userId).single().then(({ data }) => {
      if (data) setBiz({ bizName: data.business_name || "", bizType: data.biz_type || data.business_category || "", googleLink: data.google_link || data.review_link || "" });
    });
    supabase.from("profiles").select("plan").eq("id", userId).single().then(({ data }) => {
      if (data?.plan) setPlan(data.plan);
    });
  }, [userId]);

  const setBizAndSync = useCallback((updater) => {
    setBiz((prev) => {
      const next = typeof updater === "function" ? updater(prev) : updater;
      if (userId) supabase.from("business_settings").upsert({ user_id: userId, business_name: next.bizName, biz_type: next.bizType, google_link: next.googleLink, updated_at: new Date().toISOString() });
      return next;
    });
  }, [userId]);

  const setPlanAndSync = useCallback((updater) => {
    setPlan((prev) => typeof updater === "function" ? updater(prev) : updater);
  }, [userId]);

  const setUserAndSync = useCallback((updater) => {
    setUser((prev) => typeof updater === "function" ? updater(prev) : updater);
  }, [userId]);

  // Navigation helpers
  const navigate = useCallback(
    (to) => {
      setPrevScreen(screen);
      setScreen(to);
    },
    [screen]
  );

  const goBack = () => {
    setScreen(prevScreen || "dashboard");
    setPrevScreen(null);
  };

  // Handle a sent review request
  const handleSent = ({ name, channel }) => {
    toast.success(`Request sent to ${name}`);
    setTimeout(() => setScreen("dashboard"), 60);
  };

  const unread = (notifs || []).filter((n) => !n.read).length;
  const isSecondary = !MAIN_SCREENS.includes(screen);

  // Bottom navigation items with inline SVGs
  const navItems = [
    {
      id: "dashboard",
      label: "Home",
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7" rx="1.5"/><rect x="14" y="3" width="7" height="7" rx="1.5"/><rect x="3" y="14" width="7" height="7" rx="1.5"/><rect x="14" y="14" width="7" height="7" rx="1.5"/></svg>
      ),
    },
    {
      id: "reviews",
      label: "Reviews",
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
      ),
    },
    {
      id: "analytics",
      label: "Analytics",
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
      ),
    },
    {
      id: "templates",
      label: "Templates",
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>
      ),
    },
    {
      id: "more",
      label: "More",
      icon: (
        <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/><circle cx="5" cy="12" r="1"/></svg>
      ),
    },
  ];

  return (
    <div
      style={{
        background: G.bg,
        minHeight: "100vh",
        fontFamily: "'Manrope',sans-serif",
        color: G.ink,
        display: "flex",
        flexDirection: "column",
      }}
    >
      <Toaster richColors position="top-center" />

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
        {isSecondary ? (
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
          <Wordmark size={14} />
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
          <Pill
            label={
              plan === "starter"
                ? "Starter"
                : plan === "agency"
                ? "Agency"
                : "Growth"
            }
            variant={plan === "growth" ? "success" : "info"}
          />
        </div>
      </header>

      {/* CONTENT AREA */}
      <main
        style={{
          flex: 1,
          overflowY: "auto",
          padding: "20px 16px 90px",
          maxWidth: 600,
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
          {screen === "dashboard" && (
            <Dashboard
              userId={userId}
              biz={biz}
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
            />
          )}
          {screen === "reviews" && (
            <ReviewsPage
              userId={userId}
              onSend={() => navigate("send")}
            />
          )}
          {screen === "analytics" && <Analytics userId={userId} />}
          {screen === "templates" && <Templates userId={userId} />}
          {screen === "automations" && <Automations />}
          {screen === "contacts" && <Contacts userId={userId} />}
          {screen === "qrcode" && <QRCode biz={biz} />}
          {screen === "widget" && <WidgetEmbed biz={biz} />}
          {screen === "integrations" && <Integrations plan={plan} />}
          {screen === "notifications" && <Notifications userId={userId} />}
          {screen === "billing" && (
            <Billing plan={plan} setPlan={setPlanAndSync} />
          )}
          {screen === "settings" && (
            <Settings
              biz={biz}
              setBiz={setBizAndSync}
              user={user}
              setUser={setUserAndSync}
            />
          )}
          {screen === "team" && <Team plan={plan} userId={userId} />}
          {screen === "help" && <Help />}
          {screen === "privacy" && <AppPrivacyPolicy onBack={goBack} />}
          {screen === "terms" && <AppTerms onBack={goBack} />}
          {screen === "more" && (
            <More onNav={navigate} onLogout={onLogout} unreadCount={unread} />
          )}
          {screen === "sentlog" && <SentLog userId={userId} />}
          {screen === "referral" && <Referral user={user} />}
          {screen === "changelog" && <Changelog />}
          {screen === "bulk" && (
            <BulkSend biz={biz} onSent={handleSent} />
          )}
        </Suspense>
      </main>

      {/* BOTTOM NAV */}
      <nav
        style={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          display: "flex",
          justifyContent: "space-around",
          background: G.surface,
          borderTop: `1px solid ${G.border}`,
          padding: "10px 0 16px",
          zIndex: 40,
        }}
      >
        {navItems.map((n) => (
          <button
            key={n.id}
            onClick={() => {
              setScreen(n.id);
              setPrevScreen(null);
            }}
            style={{
              background: "none",
              border: "none",
              cursor: "pointer",
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              gap: 4,
              padding: "4px 12px",
              color: screen === n.id ? G.accent : G.muted,
              transition: "color 0.15s",
              position: "relative",
            }}
          >
            {n.icon}
            {n.id === "more" && unread > 0 && (
              <div
                style={{
                  position: "absolute",
                  top: 0,
                  right: 8,
                  width: 8,
                  height: 8,
                  borderRadius: "50%",
                  background: G.accent,
                }}
              />
            )}
            <span
              style={{
                fontSize: 9.5,
                fontFamily: "'Manrope',sans-serif",
                fontWeight: screen === n.id ? 700 : 500,
                letterSpacing: "0.3px",
              }}
            >
              {n.label}
            </span>
          </button>
        ))}
      </nav>
    </div>
  );
}


