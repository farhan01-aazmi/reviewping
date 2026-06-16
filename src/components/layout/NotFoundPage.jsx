import { G } from "../../data/theme";
import { Btn, Wordmark, Card } from "../ui";
import SEO from "../SEO";

export default function NotFoundPage({ onSignup, onLogin, onBack }) {
  const linkStyle = {
    fontSize: 12.5,
    fontWeight: 500,
    color: G.muted,
    cursor: "pointer",
    transition: "color 0.15s",
  };

  return (
    <>
      <SEO
        title="Page not found"
        description="The page you're looking for doesn't exist or has been moved."
        path="/404"
      />
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
        <style>{`
          @keyframes fs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          .ft{animation:fs 0.35s ease}
        `}</style>

        {/* Header (same style as BlogPage) */}
        <header
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            padding: "15px 22px",
            borderBottom: `1px solid ${G.border}`,
            background: G.bg,
            position: "sticky",
            top: 0,
            zIndex: 50,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
            <Wordmark
              size={30}
              onClick={() => {
                window.history.pushState({}, "", "/");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              style={{ cursor: "pointer" }}
            />
            <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span
                style={linkStyle}
                onClick={() => {
                  window.history.pushState({}, "", "/features");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/features"), window.dispatchEvent(new PopStateEvent("popstate")))}
              >
                Features
              </span>
              <span
                style={linkStyle}
                onClick={() => {
                  window.history.pushState({}, "", "/pricing");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/pricing"), window.dispatchEvent(new PopStateEvent("popstate")))}
              >
                Pricing
              </span>
              <span
                style={linkStyle}
                onClick={() => {
                  window.history.pushState({}, "", "/blog");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
                role="link"
                tabIndex={0}
                onKeyDown={(e) => e.key === "Enter" && (window.history.pushState({}, "", "/blog"), window.dispatchEvent(new PopStateEvent("popstate")))}
              >
                Blog
              </span>
            </nav>
          </div>
          <div style={{ display: "flex", gap: 6 }}>
            <Btn variant="ghost" size="sm" onClick={onLogin}>
              Sign in
            </Btn>
            <Btn size="sm" onClick={onSignup}>
              Start free trial →
            </Btn>
          </div>
        </header>

        {/* Main content */}
        <main
          style={{
            flex: 1,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "40px 22px",
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 440 }}>
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 120,
                fontWeight: 400,
                color: G.accent,
                lineHeight: 1,
                marginBottom: 4,
                letterSpacing: "-4px",
              }}
            >
              404
            </div>
            <div
              style={{
                width: 40,
                height: 3,
                background: G.accent,
                margin: "0 auto 20px",
                borderRadius: 2,
                opacity: 0.4,
              }}
            />
            <h1
              style={{
                fontSize: 22,
                fontWeight: 600,
                margin: "0 0 10px",
                color: G.ink,
              }}
            >
              Page not found
            </h1>
            <p
              style={{
                fontSize: 14.5,
                lineHeight: 1.7,
                color: G.muted,
                margin: "0 0 28px",
              }}
            >
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
              <Btn
                onClick={() => {
                  window.history.pushState({}, "", "/");
                  window.dispatchEvent(new PopStateEvent("popstate"));
                }}
              >
                Go to Homepage
              </Btn>
              <Btn variant="secondary" onClick={onSignup}>
                Start free trial →
              </Btn>
            </div>
          </div>
        </main>

        {/* Footer (same style as BlogPage) */}
        <footer
          style={{
            borderTop: `1px solid ${G.border}`,
            padding: "20px 22px",
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: 10,
          }}
        >
          <Wordmark
            size={26}
            onClick={() => {
              window.history.pushState({}, "", "/");
              window.dispatchEvent(new PopStateEvent("popstate"));
            }}
            style={{ cursor: "pointer" }}
          />
          <div style={{ display: "flex", gap: 16 }}>
            <span
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
              onClick={() => {
                window.history.pushState({}, "", "/privacy");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (window.history.pushState({}, "", "/privacy"),
                window.dispatchEvent(new PopStateEvent("popstate")))
              }
            >
              Privacy Policy
            </span>
            <span
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
              onClick={() => {
                window.history.pushState({}, "", "/terms");
                window.dispatchEvent(new PopStateEvent("popstate"));
              }}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (window.history.pushState({}, "", "/terms"),
                window.dispatchEvent(new PopStateEvent("popstate")))
              }
            >
              Terms of Service
            </span>
            <span
              style={{ fontSize: 12, color: G.muted, cursor: "pointer" }}
              onClick={() => (window.location.href = "mailto:hello@reviewping.io")}
              role="link"
              tabIndex={0}
              onKeyDown={(e) =>
                e.key === "Enter" &&
                (window.location.href = "mailto:hello@reviewping.io")
              }
            >
              Contact
            </span>
          </div>
        </footer>
      </div>
    </>
  );
}
