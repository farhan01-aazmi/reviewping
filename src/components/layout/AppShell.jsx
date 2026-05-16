import { useState, useEffect, useCallback } from "react";

// Data imports
import { G } from "../../data/theme";
import { NAV_ITEMS, MAIN_SCREENS, SERVICES } from "../../data/constants";
import {
  SEED_REVIEWS,
  SEED_TEMPLATES,
  SEED_TEAM,
  SEED_CONTACTS,
  SEED_NOTIFS,
} from "../../data/seedData";

// Config
import { supabase } from "../../config/supabase";

// Hooks
import { useSupabaseArray } from "../../hooks/useSupabaseArray";
import { useToast } from "../../hooks/useToast";

// UI
import { ToastContainer, Wordmark, Pill, Btn, Card } from "../ui";

// Pages — created separately under ../pages/
import Dashboard from "../pages/Dashboard";
import SendReq from "../pages/SendReq";
import ReviewsPage from "../pages/ReviewsPage";
import Analytics from "../pages/Analytics";
import Templates from "../pages/Templates";
import Automations from "../pages/Automations";
import Contacts from "../pages/Contacts";
import QRCode from "../pages/QRCode";
import WidgetEmbed from "../pages/WidgetEmbed";
import Integrations from "../pages/Integrations";
import Notifications from "../pages/Notifications";
import Billing from "../pages/Billing";
import Settings from "../pages/Settings";
import Team from "../pages/Team";
import Help from "../pages/Help";
import More from "../pages/More";
import SentLog from "../pages/SentLog";
import Referral from "../pages/Referral";
import Changelog from "../pages/Changelog";
import BulkSend from "../pages/BulkSend";
import AppPrivacyPolicy from "./PrivacyPolicy";
import AppTerms from "./Terms";

export default function AppShell({ user: initUser, onLogout }) {
  const [screen, setScreen] = useState("dashboard");
  const [prevScreen, setPrevScreen] = useState(null);
  const userId = initUser?.id;

  // Data state synced with Supabase
  const [reviews, setReviews] = useSupabaseArray("reviews", userId, SEED_REVIEWS);
  const [templates, setTemplates] = useSupabaseArray(
    "templates",
    userId,
    SEED_TEMPLATES
  );
  const [team, setTeam] = useSupabaseArray("team_members", userId, SEED_TEAM);
  const [contacts, setContacts] = useSupabaseArray("contacts", userId, SEED_CONTACTS);
  const [notifs, setNotifs] = useSupabaseArray(
    "notifications",
    userId,
    SEED_NOTIFS
  );

  // Local state for plan, biz, user
  const [plan, setPlan] = useState("growth");
  const [biz, setBiz] = useState({
    bizName: initUser?.biz || "My Business",
    bizType: "Dental Appointment",
    googleLink: "",
  });
  const [user, setUser] = useState(initUser);

  // Toast system
  const { toasts, toast } = useToast();

  // Load business settings & plan from Supabase
  useEffect(() => {
    if (!userId) return;
    supabase
      .from("business_settings")
      .select("*")
      .eq("user_id", userId)
      .single()
      .then(({ data }) => {
        if (data)
          setBiz({
            bizName: data.business_name,
            bizType: data.biz_type,
            googleLink: data.google_link,
          });
      });
    supabase
      .from("profiles")
      .select("plan")
      .eq("id", userId)
      .single()
      .then(({ data }) => {
        if (data?.plan) setPlan(data.plan);
      });
  }, [userId]);

  // Sync biz changes to Supabase
  const setBizAndSync = useCallback(
    (updater) => {
      setBiz((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (userId)
          supabase.from("business_settings").upsert({
            user_id: userId,
            business_name: next.bizName,
            biz_type: next.bizType,
            google_link: next.googleLink,
            updated_at: new Date().toISOString(),
          });
        return next;
      });
    },
    [userId]
  );

  // Sync plan changes to Supabase
  const setPlanAndSync = useCallback(
    (updater) => {
      setPlan((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (userId)
          supabase.from("profiles").update({ plan: next }).eq("id", userId);
        return next;
      });
    },
    [userId]
  );

  // Sync user profile changes to Supabase
  const setUserAndSync = useCallback(
    (updater) => {
      setUser((prev) => {
        const next = typeof updater === "function" ? updater(prev) : updater;
        if (userId)
          supabase
            .from("profiles")
            .update({ name: next.name, email: next.email })
            .eq("id", userId);
        return next;
      });
    },
    [userId]
  );

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
  const handleSent = ({ name, service, channel, sentAt }) => {
    const newReview = {
      id: Date.now(),
      name,
      service,
      rating: null,
      text: null,
      sentAt: sentAt || Date.now(),
      status: "pending",
      ch: channel,
      reply: null,
    };
    setReviews((p) => [newReview, ...p]);
    setNotifs((p) => [
      {
        id: Date.now(),
        type: "pending",
        title: "Request sent",
        body: `${name} received your review request via ${channel}.`,
        time: Date.now(),
        read: false,
        icon: "📤",
      },
      ...p,
    ]);
    toast(`Request sent to ${name}`);
    setTimeout(() => setScreen("dashboard"), 60);
  };

  const unread = notifs.filter((n) => !n.read).length;
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
      <ToastContainer toasts={toasts} />

      {/* TOPBAR */}
      <div
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
      </div>

      {/* CONTENT AREA */}
      <div
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
        {screen === "dashboard" && (
          <Dashboard
            reviews={reviews}
            biz={biz}
            onSend={() => navigate("send")}
            onNav={navigate}
          />
        )}
        {screen === "send" && (
          <SendReq
            onBack={goBack}
            onSent={handleSent}
            templates={templates}
            biz={biz}
            toast={toast}
          />
        )}
        {screen === "reviews" && (
          <ReviewsPage
            reviews={reviews}
            setReviews={setReviews}
            onSend={() => navigate("send")}
            toast={toast}
          />
        )}
        {screen === "analytics" && <Analytics reviews={reviews} />}
        {screen === "templates" && (
          <Templates
            templates={templates}
            setTemplates={setTemplates}
            toast={toast}
          />
        )}
        {screen === "automations" && <Automations toast={toast} />}
        {screen === "contacts" && (
          <Contacts
            contacts={contacts}
            setContacts={setContacts}
            onSend={(c) => {
              navigate("send");
            }}
            toast={toast}
          />
        )}
        {screen === "qrcode" && <QRCode biz={biz} toast={toast} />}
        {screen === "widget" && <WidgetEmbed biz={biz} />}
        {screen === "integrations" && <Integrations plan={plan} toast={toast} />}
        {screen === "notifications" && (
          <Notifications notifs={notifs} setNotifs={setNotifs} onBack={goBack} />
        )}
        {screen === "billing" && (
          <Billing plan={plan} setPlan={setPlanAndSync} toast={toast} />
        )}
        {screen === "settings" && (
          <Settings
            biz={biz}
            setBiz={setBizAndSync}
            user={user}
            setUser={setUserAndSync}
            toast={toast}
          />
        )}
        {screen === "team" && (
          <Team
            plan={plan}
            team={team}
            setTeam={setTeam}
            toast={toast}
          />
        )}
        {screen === "help" && <Help />}
        {screen === "privacy" && (
          <AppPrivacyPolicy onBack={goBack} />
        )}
        {screen === "terms" && (
          <AppTerms onBack={goBack} />
        )}
        {screen === "more" && (
          <More onNav={navigate} onLogout={onLogout} unreadCount={unread} />
        )}
        {screen === "sentlog" && <SentLog reviews={reviews} />}
        {screen === "referral" && <Referral user={user} toast={toast} />}
        {screen === "changelog" && <Changelog />}
        {screen === "bulk" && (
          <BulkSend
            biz={biz}
            templates={templates}
            toast={toast}
            onSent={handleSent}
          />
        )}
      </div>

      {/* BOTTOM NAV */}
      <div
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
      </div>
    </div>
  );
}


