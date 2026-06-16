import { G } from "../../data/theme";
import { Btn, Wordmark, Card } from "../ui";
import SEO from "../SEO";
import { BLOG_POSTS } from "../../data/seoPages";

export default function BlogPage({ onSignup, onLogin, onBack }) {
  const blogLink = {
    fontSize: 12.5,
    fontWeight: 500,
    color: G.muted,
    cursor: "pointer",
    transition: "color 0.15s",
  };

  const blogLinkActive = {
    ...blogLink,
    color: G.accent,
    fontWeight: 700,
  };

  return (
    <>
      <SEO
        title="ReviewPing Blog"
        description="Tips, guides, and strategies for getting more Google reviews, managing your online reputation, and growing your small business."
        path="/blog"
      />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
        }}
      >
        <style>{`
          @keyframes fs{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:translateY(0)}}
          .ft{animation:fs 0.35s ease}
          @media(max-width:500px){.blog-grid{grid-template-columns:1fr!important}}
        `}</style>

        {/* Header */}
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
            <Wordmark size={15} onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} />
            <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span
                style={blogLinkActive}
                onClick={() => {}}
              >
                Blog
              </span>
              <span
                style={blogLink}
                onClick={() => window.location.href = "/tools/review-link-generator"}
              >
                Free Tools
              </span>
              <span
                style={blogLink}
                onClick={() => window.location.href = "/pricing"}
              >
                Pricing
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

        {/* Hero */}
        <section
          style={{
            maxWidth: 700,
            margin: "0 auto",
            padding: "60px 22px 40px",
            textAlign: "center",
          }}
        >
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(36px,8vw,52px)",
              lineHeight: 1.08,
              letterSpacing: "-1.5px",
              margin: "0 0 16px",
              fontWeight: 400,
            }}
          >
            ReviewPing Blog
          </h1>
          <p
            style={{
              fontSize: 16,
              lineHeight: 1.8,
              color: G.muted,
              maxWidth: 520,
              margin: "0 auto",
            }}
          >
            Tips, guides, and strategies for getting more Google reviews,
            managing your online reputation, and growing your small business.
          </p>
        </section>

        {/* Blog posts grid */}
        <section
          style={{
            maxWidth: 760,
            margin: "0 auto",
            padding: "0 22px 60px",
          }}
        >
          <div
            className="blog-grid"
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(2, 1fr)",
              gap: 18,
            }}
          >
            {BLOG_POSTS.map((post) => (
              <Card
                key={post.slug}
                style={{
                  padding: 0,
                  overflow: "hidden",
                  display: "flex",
                  flexDirection: "column",
                  transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  cursor: "default",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.transform = "translateY(-3px)";
                  e.currentTarget.style.boxShadow = "0 8px 30px rgba(0,0,0,0.08)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.transform = "translateY(0)";
                  e.currentTarget.style.boxShadow = "none";
                }}
              >
                {/* Featured image */}
                <div
                  style={{
                    width: "100%",
                    height: 180,
                    overflow: "hidden",
                    background: G.border,
                  }}
                >
                  <img
                    src={post.image}
                    alt={post.title}
                    style={{
                      width: "100%",
                      height: "100%",
                      objectFit: "cover",
                      transition: "transform 0.4s ease",
                    }}
                    onMouseEnter={(e) => {
                      e.target.style.transform = "scale(1.05)";
                    }}
                    onMouseLeave={(e) => {
                      e.target.style.transform = "scale(1)";
                    }}
                    loading="lazy"
                  />
                </div>

                {/* Card body */}
                <div
                  style={{
                    padding: "20px 22px",
                    display: "flex",
                    flexDirection: "column",
                    flex: 1,
                  }}
                >
                  {/* Date + read time */}
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 10,
                      marginBottom: 10,
                    }}
                  >
                    <span
                      style={{
                        fontSize: 11.5,
                        color: G.muted,
                        fontWeight: 500,
                      }}
                    >
                      {post.date}
                    </span>
                    <span style={{ fontSize: 10, color: G.borderHi }}>·</span>
                    <span
                      style={{
                        fontSize: 11.5,
                        color: G.accent,
                        fontWeight: 600,
                      }}
                    >
                      {post.readTime}
                    </span>
                  </div>

                  {/* Title */}
                  <h2
                    style={{
                      fontFamily: "'Instrument Serif',serif",
                      fontSize: 20,
                      fontWeight: 400,
                      lineHeight: 1.3,
                      margin: "0 0 8px",
                      letterSpacing: "-0.3px",
                      color: G.ink,
                    }}
                  >
                    {post.title}
                  </h2>

                  {/* Description */}
                  <p
                    style={{
                      fontSize: 13.5,
                      lineHeight: 1.65,
                      color: G.muted,
                      margin: "0 0 16px",
                      flex: 1,
                    }}
                  >
                    {post.desc}
                  </p>

                  {/* Read More */}
                  <div style={{ marginTop: "auto" }}>
                    <Btn
                      size="sm"
                      variant="secondary"
                      onClick={() => {
                        window.location.href = "/blog/" + post.slug;
                      }}
                    >
                      Read more →
                    </Btn>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </section>

        {/* CTA */}
        <section
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "0 22px 60px",
          }}
        >
          <Card
            style={{
              background: G.accentBg,
              border: `1.5px solid ${G.accentBd}`,
              textAlign: "center",
              padding: "32px 28px",
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 26,
                marginBottom: 8,
              }}
            >
              Ready to get more reviews?
            </div>
            <p
              style={{
                color: G.muted,
                fontSize: 14,
                lineHeight: 1.7,
                margin: "0 0 22px",
                maxWidth: 420,
                marginLeft: "auto",
                marginRight: "auto",
              }}
            >
              Join 2,400+ small businesses using ReviewPing to automate review
              requests and grow their reputation — starting at $29/month.
            </p>
            <Btn size="lg" onClick={onSignup}>
              Start free — no card needed →
            </Btn>
            <p
              style={{
                color: G.muted,
                fontSize: 12,
                marginTop: 10,
                marginBottom: 0,
              }}
            >
              14-day free trial · Setup in 2 minutes · Cancel anytime
            </p>
          </Card>
        </section>

        {/* Footer */}
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
            size={13}
            onClick={() => window.location.href = "/"}
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
