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
import NotFound from "./components/layout/NotFound";
import AuthCallback from "./components/layout/AuthCallback";
import FeaturesPage from "./components/layout/FeaturesPage";
import FAQPage from "./components/layout/FAQPage";
import BlogPage from "./components/layout/BlogPage";
import BlogArticle from "./components/layout/BlogArticle";
import AboutPage from "./components/layout/AboutPage";
import ContactPage from "./components/layout/ContactPage";
import IndustryPage from "./components/layout/IndustryPage";
import VSPodiumPage from "./components/layout/VSPodiumPage";

function pathToView(pathname) {
  if (
    window.location.search.includes("code=") ||
    window.location.hash.includes("access_token=")
  ) {
    return "authcallback";
  }
  const path = pathname.replace(/\/+$/, "") || "/";
  const knownPaths = {
    "/": "landing",
    "/login": "login",
    "/signup": "signup",
    "/forgot-password": "forgot",
    "/privacy": "privacy",
    "/terms": "terms",
    "/auth/callback": "authcallback",
    "/tools/review-link-generator": "freetool",
    "/tools/review-response-generator": "freetool",
    "/pricing": "landing",
    "/dashboard": "app",
    "/onboarding": "onboarding",
    "/features": "features",
    "/faq": "faq",
    "/blog": "blog",
    "/about": "about",
    "/contact": "contact",
    "/vs/podium": "vspodium",
  };
  if (knownPaths[path]) return knownPaths[path];
  if (/^\/blog\//.test(path)) return "blogarticle";
  if (/^\/industry\//.test(path)) return "industry";
  return "notfound";
}

function navigate(view, param) {
  const viewToPath = {
    landing: "/",
    login: "/login",
    signup: "/signup",
    forgot: "/forgot-password",
    privacy: "/privacy",
    terms: "/terms",
    freetool: "/tools/review-link-generator",
    app: "/dashboard",
    onboarding: "/onboarding",
    features: "/features",
    faq: "/faq",
    blog: "/blog",
    about: "/about",
    contact: "/contact",
    vspodium: "/vs/podium",
    notfound: window.location.pathname,
  };
  const path = view === "blogarticle" ? `/blog/${param}` : view === "industry" ? `/industry/${param}` : viewToPath[view];
  const url = path || "/";
  if (window.location.pathname !== url) {
    window.history.pushState({ view, param }, "", url);
  }
}

async function fetchProfile(userId) {
  const { data } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", userId)
    .single();
  return data;
}

export default function App() {
  const [view, setView] = useState(() => pathToView(window.location.pathname));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    const onPop = () => setView(pathToView(window.location.pathname));
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const changeView = (newView) => {
    navigate(newView);
    setView(newView);
  };

  async function onProfileLoaded(data) {
    const profileUser = {
      id: data.id,
      name: data.full_name || data.name,
      email: data.email,
      biz: data.business_name,
      onboarding_completed: data.onboarding_completed === true,
    };
    setUser(profileUser);
    if (profileUser.onboarding_completed) {
      changeView("app");
    } else {
      changeView("onboarding");
    }
  }

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        fetchProfile(session.user.id).then((data) => {
          if (data) {
            onProfileLoaded(data);
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
        changeView("landing");
      } else if (
        session?.user &&
        (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")
      ) {
        if (
          window.location.search.includes("code=") ||
          window.location.hash.includes("access_token=")
        ) return;

        fetchProfile(session.user.id).then((data) => {
          if (data) {
            onProfileLoaded(data);
          }
        });
      }
    });

    return () => subscription?.unsubscribe();
  }, []);

  const handleAuth = (u) => {
    setUser({ ...u, onboarding_completed: false });
    changeView("onboarding");
  };

  const handleLoginComplete = (u) => {
    setUser(u);
    if (u?.onboarding_completed) {
      changeView("app");
    } else {
      changeView("onboarding");
    }
  };

  function getSlug() {
    const parts = window.location.pathname.replace(/\/+$/, "").split("/");
    return parts[parts.length - 1];
  }

  const handleOnboard = (bizData) => {
    setUser((u) => {
      const updated = { ...u, ...bizData, onboarding_completed: true };
      if (u?.id) {
          supabase
            .from("business_settings")
            .upsert({
              user_id: u.id,
              business_name: bizData.bizName,
              biz_type: bizData.bizType,
              google_link: bizData.googleLink,
            })
            .then(() => {}).catch(console.error);
      }
      return updated;
    });
    changeView("app");
  };

  const handleAuthCallback = (u) => {
    if (u?.onboarding_completed) {
      setUser(u);
      changeView("app");
    } else {
      setUser(u);
      changeView("onboarding");
    }
  };

  const handleAuthError = (msg) => {
    setAuthError(msg);
    changeView("login");
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    changeView("landing");
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
          onSignup={() => changeView("signup")}
          onLogin={() => changeView("login")}
          onPrivacy={() => changeView("privacy")}
          onTerms={() => changeView("terms")}
          onTool={() => changeView("freetool")}
        />
      )}
      {view === "authcallback" && (
        <AuthCallback onDone={handleAuthCallback} onError={handleAuthError} />
      )}
      {view === "signup" && (
        <Signup onDone={handleAuth} onLogin={() => changeView("login")} />
      )}
      {view === "login" && (
        <Login
          authError={authError}
          onAuthErrorClear={() => setAuthError("")}
          onDone={handleAuth}
          onLoginComplete={handleLoginComplete}
          onSignup={() => changeView("signup")}
          onBack={() => changeView("landing")}
          onForgot={() => changeView("forgot")}
        />
      )}
      {view === "forgot" && (
        <ForgotPassword onBack={() => changeView("login")} />
      )}
      {view === "onboarding" && (
        <Onboarding user={user || {}} onComplete={handleOnboard} />
      )}
      {view === "app" && user && <AppShell user={user} onLogout={handleLogout} />}
      {view === "app" && !user && <Landing onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onPrivacy={() => changeView("privacy")} onTerms={() => changeView("terms")} onTool={() => changeView("freetool")} />}
      {view === "privacy" && (
        <PrivacyPolicy onBack={() => changeView("landing")} />
      )}
      {view === "terms" && <Terms onBack={() => changeView("landing")} />}
      {view === "features" && (
        <FeaturesPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "faq" && (
        <FAQPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "blog" && (
        <BlogPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "blogarticle" && (
        <BlogArticle slug={getSlug()} onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("blog")} />
      )}
      {view === "about" && (
        <AboutPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "contact" && (
        <ContactPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "industry" && (
        <IndustryPage type={getSlug()} onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "vspodium" && (
        <VSPodiumPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
      )}
      {view === "freetool" && <FreeTool onSignup={() => changeView("signup")} />}
      {view === "notfound" && <NotFound onBack={() => changeView("landing")} />}
    </>
  );
}
