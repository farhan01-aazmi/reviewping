import { useState, useEffect } from "react";
import { supabase } from "./config/supabase";
import { G } from "./data/theme";
import { Spinner } from "./components/ui";
import Landing from "./components/layout/Landing";
import Signup from "./components/layout/Signup";
import Login from "./components/layout/Login";
import ForgotPassword from "./components/layout/ForgotPassword";
import Onboarding from "./components/layout/Onboarding";
import AppShell from "./components/layout/AppShell";
import PrivacyPolicy from "./components/layout/PrivacyPolicy";
import Terms from "./components/layout/Terms";
import FreeTool from "./components/layout/FreeTool";

export default function App() {
  const [view, setView] = useState("landing");
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                name: data.name,
                email: data.email,
                biz: data.business_name,
                id: data.id,
              });
              setView("app");
            }
            setLoading(false);
          });
      } else {
        setLoading(false);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "SIGNED_OUT") {
        setUser(null);
        setView("landing");
      } else if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single()
          .then(({ data }) => {
            if (data) {
              setUser({
                name: data.name,
                email: data.email,
                biz: data.business_name,
                id: data.id,
              });
              // Transition to app if still on a pre-auth page
              setView((prev) =>
                ["landing", "login", "signup"].includes(prev) ? "app" : prev
              );
            }
          });
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuth = (u) => {
    setUser(u);
    setView("onboarding");
  };

  const handleLoginComplete = (u) => {
    setUser(u);
    setView("app");
  };

  const handleOnboard = (bizData) => {
    setUser((u) => {
      const updated = { ...u, ...bizData };
      if (u?.id) {
        supabase
          .from("business_settings")
          .upsert({
            user_id: u.id,
            business_name: bizData.bizName,
            biz_type: bizData.bizType,
            google_link: bizData.googleLink,
          })
          .catch(console.error);
      }
      return updated;
    });
    setView("app");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setView("landing");
  };

  if (loading) {
    return (
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Spinner size={40} />
      </div>
    );
  }

  return (
    <>
      <style>{`
        @keyframes toastIn{from{opacity:0;transform:translateY(-10px)}to{opacity:1;transform:translateY(0)}}
        @keyframes blink{0%,100%{opacity:1}50%{opacity:0.3}}
        @keyframes fs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
        @keyframes spin{to{transform:rotate(360deg)}}
        .ft{animation:fs 0.35s ease}
        .hrow:hover{background:${G.accentBg}!important}
        *{box-sizing:border-box}
        @media(max-width:480px){.rgrid{grid-template-columns:1fr!important}}
        @media(max-width:360px){.hide-xs{display:none!important}}
      `}</style>
      {view === "landing" && (
        <Landing
          onSignup={() => setView("signup")}
          onLogin={() => setView("login")}
          onPrivacy={() => setView("privacy")}
          onTerms={() => setView("terms")}
          onTool={() => setView("freetool")}
        />
      )}
      {view === "signup" && (
        <Signup onDone={handleAuth} onLogin={() => setView("login")} />
      )}
      {view === "login" && (
        <Login
          onDone={handleAuth}
          onLoginComplete={handleLoginComplete}
          onSignup={() => setView("signup")}
          onBack={() => setView("landing")}
          onForgot={() => setView("forgot")}
        />
      )}
      {view === "forgot" && (
        <ForgotPassword onBack={() => setView("login")} />
      )}
      {view === "onboarding" && (
        <Onboarding user={user || {}} onComplete={handleOnboard} />
      )}
      {view === "app" && <AppShell user={user} onLogout={handleLogout} />}
      {view === "privacy" && (
        <PrivacyPolicy onBack={() => setView("landing")} />
      )}
      {view === "terms" && <Terms onBack={() => setView("landing")} />}
      {view === "freetool" && <FreeTool onSignup={() => setView("signup")} />}
    </>
  );
}
