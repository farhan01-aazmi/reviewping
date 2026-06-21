import { useState, useEffect, lazy, Suspense } from "react";
import { supabase } from "./config/supabase";
import { G } from "./data/theme";
import { Spinner } from "./components/ui";
import Landing from "./components/layout/Landing";
import Signup from "./components/layout/Signup";
import Login from "./components/layout/Login";
import ForgotPassword from "./components/layout/ForgotPassword";
import Onboarding from "./components/layout/Onboarding";
import AppShell from "./components/layout/AppShell";

import AuthCallback from "./components/layout/AuthCallback";

// Lazy-loaded pages (not critical path)
const PrivacyPolicy = lazy(() => import("./components/layout/PrivacyPolicy"));
const Terms = lazy(() => import("./components/layout/Terms"));
const FreeTool = lazy(() => import("./components/layout/FreeTool"));
const NotFound = lazy(() => import("./components/layout/NotFoundPage"));
const FeaturesPage = lazy(() => import("./components/layout/FeaturesPage"));
const FAQPage = lazy(() => import("./components/layout/FAQPage"));
const BlogPage = lazy(() => import("./components/layout/BlogPage"));
const BlogArticle = lazy(() => import("./components/layout/BlogArticle"));
const AboutPage = lazy(() => import("./components/layout/AboutPage"));
const ContactPage = lazy(() => import("./components/layout/ContactPage"));
const IndustryPage = lazy(() => import("./components/layout/IndustryPage"));
const VSPodiumPage = lazy(() => import("./components/layout/VSPodiumPage"));
const VSGradeUsPage = lazy(() => import("./components/layout/VSGradeUsPage"));
const VSNicejobPage = lazy(() => import("./components/layout/VSNicejobPage"));
const VSBirdeyePage = lazy(() => import("./components/layout/VSBirdeyePage"));
const VSTruereviewPage = lazy(() => import("./components/layout/VSTruereviewPage"));
const RefundPolicy = lazy(() => import("./components/layout/RefundPolicy"));
const TermsPage = lazy(() => import("./components/layout/TermsPage"));
const PrivacyPage = lazy(() => import("./components/layout/PrivacyPage"));
const RefundPage = lazy(() => import("./components/layout/RefundPage"));
const ReviewGatewayPage = lazy(() => import("./components/layout/ReviewGatewayPage"));

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
    "/refund": "refund",
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
    "/vs/grade-us": "vsgradeus",
    "/vs/nicejob": "vsnicejob",
    "/vs/birdeye": "vsbirdeye",
    "/vs/truereview": "vstruereview",
  };
  if (knownPaths[path]) return knownPaths[path];
  if (/^\/blog\//.test(path)) return "blogarticle";
  if (/^\/industry\//.test(path)) return "industry";
  if (/^\/r\//.test(path)) return "reviewgateway";
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
    refund: "/refund",
    freetool: "/tools/review-link-generator",
    app: "/dashboard",
    onboarding: "/onboarding",
    features: "/features",
    faq: "/faq",
    blog: "/blog",
    about: "/about",
    contact: "/contact",
    vspodium: "/vs/podium",
    vsgradeus: "/vs/grade-us",
    vsnicejob: "/vs/nicejob",
    vsbirdeye: "/vs/birdeye",
    vstruereview: "/vs/truereview",
    reviewgateway: window.location.pathname,
    notfound: window.location.pathname,
  };
  const path = view === "blogarticle" ? `/blog/${param}` : view === "industry" ? `/industry/${param}` : viewToPath[view];
  const url = path || "/";
  if (window.location.pathname !== url) {
    window.history.pushState({ view, param }, "", url);
  }
}

async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single();
    if (error) throw error;
    return data;
  } catch (e) {
    console.error("fetchProfile error:", e);
    throw e;
  }
}

export default function App() {
  const [view, setView] = useState(() => pathToView(window.location.pathname));
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [authError, setAuthError] = useState("");
  const [loadError, setLoadError] = useState("");
  const [diagnosis, setDiagnosis] = useState(null);

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

  // Pre-check connectivity, then auth, then listen for changes
  useEffect(() => {
    let cancelled = false;
    const TIMEOUT_MS = 35000;

    const t = setTimeout(() => {
      if (!cancelled) {
        setLoadError("timeout");
        setLoading(false);
      }
    }, TIMEOUT_MS);

    async function checkSupabaseReachable() {
      try {
        const ctrl = new AbortController();
        const t2 = setTimeout(() => ctrl.abort(), 5000);
        await fetch("https://fvugrcqjrtwabaobuigb.supabase.co/auth/v1/health", {
          method: "GET",
          signal: ctrl.signal,
        });
        clearTimeout(t2);
        return true;
      } catch {
        return false;
      }
    }

    checkSupabaseReachable().then((reachable) => {
      if (cancelled) return;
      if (!reachable) {
        setLoadError("network");
        setLoading(false);
        return;
      }
      clearTimeout(t);

      supabase.auth.getSession()
        .then(({ data: { session }, error }) => {
          if (cancelled) return;
          if (error) {
            setLoadError("auth");
            setLoading(false);
            return;
          }
          if (session?.user) {
            fetchProfile(session.user.id)
              .then((data) => {
                if (cancelled) return;
                if (data) onProfileLoaded(data);
                setLoading(false);
              })
              .catch(() => {
                if (!cancelled) { setLoadError("profile"); setLoading(false); }
              });
          } else {
            setLoading(false);
          }
        })
        .catch(() => {
          if (!cancelled) { setLoadError("connection"); setLoading(false); }
        });
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (cancelled) return;
      if (event === "SIGNED_OUT") {
        setUser(null);
        changeView("landing");
      } else if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        if (window.location.search.includes("code=") || window.location.hash.includes("access_token=")) return;
        fetchProfile(session.user.id)
          .then((data) => { if (data) onProfileLoaded(data); })
          .catch(() => {});
      }
    });

    return () => {
      cancelled = true;
      clearTimeout(t);
      subscription?.unsubscribe();
    };
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

  // ── Public routes (render immediately, no auth needed) ──
  if (view === "reviewgateway") {
    return <ReviewGatewayPage />;
  }

  if (loadError) {
    const errors = {
      network: {
        icon: "🚫",
        title: "Server unreachable",
        msg: "ReviewPing's server is blocked from your browser. This is NOT an internet issue — it's a browser extension or network firewall.",
        steps: [
          { label: "Open in Incognito/Private mode (Ctrl+Shift+N)", detail: "This disables all extensions temporarily" },
          { label: "Disable ad blockers (uBlock Origin, AdBlock, etc.)", detail: "These often block Supabase API domains" },
          { label: "Try a different browser (Edge, Firefox, Chrome)", detail: "Each browser has independent extension sets" },
          { label: "Disable VPN if active", detail: "Some VPNs block unknown API endpoints" },
          { label: "If on office/school WiFi → switch to mobile hotspot", detail: "Corporate networks often block cloud APIs" },
        ],
      },
      timeout: {
        icon: "⏱️",
        title: "Server not responding",
        msg: "ReviewPing's server took too long to respond. This usually means a firewall or extension is blocking the connection.",
        steps: [
          { label: "Disable ad blockers and privacy extensions", detail: "uBlock Origin, Privacy Badger, Ghostery, etc." },
          { label: "Try incognito/private mode", detail: "Disables all extensions" },
          { label: "Restart your browser and try again", detail: "Clears any stuck connections" },
        ],
      },
      auth: { icon: "🔐", title: "Session error", msg: "Could not verify your login session. This usually resolves on reload.", steps: [] },
      profile: { icon: "👤", title: "Profile error", msg: "Could not load your profile. Try reloading.", steps: [] },
      connection: { icon: "🔌", title: "Connection failed", msg: "Could not connect to server.", steps: [
        { label: "Check if supabase.co is accessible", detail: "Some networks or ISPs block Supabase. Try a different network." },
      ] },
    };

    const e = errors[loadError] || errors.connection;

    return (
      <div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Manrope',sans-serif", padding: 24 }}>
        <div style={{ textAlign: "center", maxWidth: 440 }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{e.icon}</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, fontWeight: 400, margin: "0 0 8px", color: G.ink }}>
            {e.title}
          </h2>
          <p style={{ color: G.muted, fontSize: 13.5, margin: "0 0 20px", lineHeight: 1.6 }}>
            {e.msg}
          </p>

          {e.steps.length > 0 && (
            <div style={{ textAlign: "left", background: G.surface, border: `1px solid ${G.border}`, borderRadius: 10, padding: "16px 20px", marginBottom: 20 }}>
              <strong style={{ color: G.ink, fontSize: 13 }}>Try these steps in order:</strong>
              <ol style={{ margin: "8px 0 0 0", paddingLeft: 20, fontSize: 12.5, color: G.muted, lineHeight: 1.9 }}>
                {e.steps.map((s, i) => (
                  <li key={i}>
                    <strong style={{ color: G.ink }}>{s.label}</strong>
                    {s.detail && <span style={{ display: "block", fontSize: 12, color: G.mutedLo }}>{s.detail}</span>}
                  </li>
                ))}
              </ol>
            </div>
          )}

          <button
            onClick={() => { setLoadError(""); window.location.reload(); }}
            style={{ background: G.accent, color: "#fff", border: "none", padding: "12px 28px", borderRadius: 10, fontSize: 14, fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope',sans-serif" }}
          >
            Retry →
          </button>
        </div>
      </div>
    );
  }

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
        @keyframes confetti-fall{0%{transform:translateY(-10px) rotate(0deg);opacity:1}100%{transform:translateY(100vh) rotate(720deg);opacity:0}}
        @keyframes celebrate-in{0%{opacity:0;transform:scale(0.85) translateY(20px)}100%{opacity:1;transform:scale(1) translateY(0)}}
      `}</style>
      <Suspense fallback={<div style={{ background: G.bg, minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center" }}><Spinner size={40} /></div>}>
        {view === "landing" && (
          <Landing
            onSignup={() => changeView("signup")}
            onLogin={() => changeView("login")}
            onPrivacy={() => changeView("privacy")}
            onTerms={() => changeView("terms")}
            onRefund={() => changeView("refund")}
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
        {view === "app" && !user && <Landing onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onPrivacy={() => changeView("privacy")} onTerms={() => changeView("terms")} onRefund={() => changeView("refund")} onTool={() => changeView("freetool")} />}
        {view === "privacy" && (
          <PrivacyPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
        {view === "terms" && (
          <TermsPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
        {view === "refund" && (
          <RefundPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
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
        {view === "vsgradeus" && (
          <VSGradeUsPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
        {view === "vsnicejob" && (
          <VSNicejobPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
        {view === "vsbirdeye" && (
          <VSBirdeyePage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
        {view === "vstruereview" && (
          <VSTruereviewPage onSignup={() => changeView("signup")} onLogin={() => changeView("login")} onBack={() => changeView("landing")} />
        )}
        {view === "freetool" && <FreeTool onSignup={() => changeView("signup")} />}
        {view === "notfound" && (
          <NotFound
            onSignup={() => changeView("signup")}
            onLogin={() => changeView("login")}
            onBack={() => changeView("landing")}
          />
        )}
      </Suspense>
    </>
  );
}
