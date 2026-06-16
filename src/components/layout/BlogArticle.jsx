import { G } from "../../data/theme";
import { Btn, Wordmark, Card } from "../ui";
import SEO from "../SEO";
import { BLOG_POSTS } from "../../data/seoPages";

/* ─── Rich content renderer ─── */
function renderSection(section, i) {
  switch (section.type) {
    case "h2":
      return (
        <h2 key={i} style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "36px 0 14px", letterSpacing: "-0.5px", lineHeight: 1.25 }}>
          {section.text}
        </h2>
      );
    case "h3":
      return (
        <h3 key={i} style={{ fontFamily: "'Instrument Serif',serif", fontSize: 20, fontWeight: 400, margin: "28px 0 10px", letterSpacing: "-0.3px", lineHeight: 1.3 }}>
          {section.text}
        </h3>
      );
    case "p":
      return <p key={i} style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 1.85, color: G.inkSoft }}>{section.text}</p>;
    case "bold":
      return <p key={i} style={{ margin: "0 0 18px", fontSize: 16, fontWeight: 700, lineHeight: 1.85, color: G.ink }}>{section.text}</p>;
    case "ul":
      return (
        <ul key={i} style={{ margin: "0 0 18px", paddingLeft: 22, fontSize: 16, lineHeight: 1.85, color: G.inkSoft }}>
          {section.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
        </ul>
      );
    case "ol":
      return (
        <ol key={i} style={{ margin: "0 0 18px", paddingLeft: 22, fontSize: 16, lineHeight: 1.85, color: G.inkSoft }}>
          {section.items.map((item, j) => <li key={j} style={{ marginBottom: 6 }}>{item}</li>)}
        </ol>
      );
    case "blockquote":
      return (
        <blockquote key={i} style={{ margin: "0 0 24px", padding: "16px 22px", borderLeft: `4px solid ${G.accent}`, background: G.accentBg, borderRadius: "0 10px 10px 0", fontFamily: "'Instrument Serif',serif", fontSize: 17, lineHeight: 1.7, color: G.inkSoft, fontStyle: "italic" }}>
          {section.text}
        </blockquote>
      );
    case "tip":
      return (
        <div key={i} style={{ margin: "0 0 20px", padding: "16px 20px", background: G.infoBg, border: `1.5px solid ${G.infoBd}`, borderRadius: 10, fontSize: 14, lineHeight: 1.7, color: G.inkSoft }}>
          <strong style={{ color: G.info }}>💡 Pro tip:</strong> {section.text}
        </div>
      );
    case "table":
      return (
        <div key={i} style={{ overflowX: "auto", margin: "0 0 24px", borderRadius: 10, border: `1.5px solid ${G.border}` }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
            {section.headers && (
              <thead>
                <tr style={{ background: G.surface }}>
                  {section.headers.map((h, j) => (
                    <th key={j} style={{ padding: "10px 14px", textAlign: "left", fontWeight: 700, fontSize: 12.5, color: G.muted, borderBottom: `1.5px solid ${G.border}` }}>{h}</th>
                  ))}
                </tr>
              </thead>
            )}
            <tbody>
              {section.rows.map((row, j) => (
                <tr key={j} style={{ background: j % 2 === 0 ? G.bg : G.surface }}>
                  {row.map((cell, k) => (
                    <td key={k} style={{ padding: "10px 14px", borderBottom: `1px solid ${G.border}`, color: G.inkSoft }}>{cell}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      );
    case "cta":
      return (
        <div key={i} style={{ margin: "32px 0", padding: "28px 24px", background: G.accentBg, border: `1.5px solid ${G.accentBd}`, borderRadius: 12, textAlign: "center" }}>
          <div style={{ fontFamily: "'Instrument Serif',serif", fontSize: 22, marginBottom: 8, color: G.ink }}>{section.heading || "Start getting more reviews today"}</div>
          <p style={{ color: G.muted, fontSize: 14, lineHeight: 1.7, margin: "0 0 18px", maxWidth: 400, marginLeft: "auto", marginRight: "auto" }}>
            {section.text}
          </p>
          <Btn size="lg" onClick={() => window.location.href = "/signup"}>
            {section.btn || "Start free — no card needed →"}
          </Btn>
        </div>
      );
    case "faq":
      return (
        <div key={i} style={{ margin: "32px 0" }}>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 26, fontWeight: 400, margin: "0 0 18px" }}>Frequently Asked Questions</h2>
          {section.items.map((item, j) => (
            <div key={j} style={{ marginBottom: 10, padding: "16px 20px", background: G.surface, border: `1.5px solid ${G.border}`, borderRadius: 10 }}>
              <div style={{ fontWeight: 700, fontSize: 15, marginBottom: 8, color: G.ink }}>{item.q}</div>
              <div style={{ fontSize: 14, lineHeight: 1.7, color: G.inkSoft }}>{item.a}</div>
            </div>
          ))}
        </div>
      );
    default:
      return <p key={i} style={{ margin: "0 0 18px", fontSize: 16, lineHeight: 1.85, color: G.inkSoft }}>{section.text || ""}</p>;
  }
}

export default function BlogArticle({ slug, onBack, onSignup, onLogin }) {
  const post = BLOG_POSTS.find((p) => p.slug === slug);

  const relatedPosts = post
    ? BLOG_POSTS.filter((p) => p.slug !== slug).slice(0, 3)
    : [];

  const blogLink = {
    fontSize: 12.5,
    fontWeight: 500,
    color: G.muted,
    cursor: "pointer",
    transition: "color 0.15s",
  };

  if (!post) {
    return (
      <>
        <SEO title="Post Not Found" description="The blog post you're looking for doesn't exist." path={`/blog/${slug}`} />
        <div
          style={{
            background: G.bg,
            minHeight: "100vh",
            fontFamily: "'Manrope',sans-serif",
            color: G.ink,
          }}
        >
          <header
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              padding: "15px 22px",
              borderBottom: `1px solid ${G.border}`,
              background: G.bg,
            }}
          >
            <Wordmark size={30} onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} />
            <Btn size="sm" onClick={onSignup}>
              Start free trial →
            </Btn>
          </header>
          <div
            style={{
              maxWidth: 560,
              margin: "0 auto",
              padding: "80px 22px",
              textAlign: "center",
            }}
          >
            <div
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 48,
                color: G.mutedLo,
                marginBottom: 12,
                lineHeight: 1,
              }}
            >
              404
            </div>
            <h1
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 28,
                fontWeight: 400,
                margin: "0 0 12px",
              }}
            >
              Post not found
            </h1>
            <p
              style={{
                fontSize: 14,
                color: G.muted,
                lineHeight: 1.7,
                margin: "0 0 24px",
              }}
            >
              The blog post you're looking for doesn't exist or may have been
              moved. Browse our latest articles below.
            </p>
            <Btn onClick={() => (window.location.href = "/blog")}>
              ← Back to blog
            </Btn>
          </div>

          {/* Related fallback */}
          <section
            style={{
              maxWidth: 640,
              margin: "0 auto",
              padding: "0 22px 60px",
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 22,
                fontWeight: 400,
                margin: "0 0 18px",
              }}
            >
              Latest articles
            </h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              {BLOG_POSTS.map((p) => (
                <Card
                  key={p.slug}
                  style={{ cursor: "pointer" }}
                  onClick={() => (window.location.href = "/blog/" + p.slug)}
                >
                  <div
                    style={{
                      fontFamily: "'Instrument Serif',serif",
                      fontSize: 17,
                      fontWeight: 400,
                      marginBottom: 4,
                    }}
                  >
                    {p.title}
                  </div>
                  <div style={{ fontSize: 12.5, color: G.muted }}>
                    {p.date} · {p.readTime}
                  </div>
                </Card>
              ))}
            </div>
          </section>

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
            <Wordmark size={26} onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} />
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
            </div>
          </footer>
        </div>
      </>
    );
  }

  return (
    <>
      <SEO title={post.title} description={post.desc} path={`/blog/${post.slug}`} />
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
          @media(max-width:500px){.related-grid{grid-template-columns:1fr!important}}
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
            <Wordmark size={30} onClick={() => window.location.href = "/"} style={{ cursor: "pointer" }} />
            <nav style={{ display: "flex", gap: 14, alignItems: "center" }}>
              <span
                style={blogLink}
                onClick={() => (window.location.href = "/blog")}
              >
                Blog
              </span>
              <span
                style={blogLink}
                onClick={() => (window.location.href = "/tools/review-link-generator")}
              >
                Free Tools
              </span>
              <span
                style={blogLink}
                onClick={() => (window.location.href = "/pricing")}
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

        {/* Article */}
        <article
          style={{
            maxWidth: 680,
            margin: "0 auto",
            padding: "36px 22px 48px",
          }}
        >
          {/* Back link */}
          <div style={{ marginBottom: 24 }}>
            <span
              onClick={() => (window.location.href = "/blog")}
              style={{
                fontSize: 13,
                color: G.muted,
                cursor: "pointer",
                display: "inline-flex",
                alignItems: "center",
                gap: 4,
                transition: "color 0.15s",
              }}
              onMouseEnter={(e) => (e.target.style.color = G.accent)}
              onMouseLeave={(e) => (e.target.style.color = G.muted)}
            >
              ← Back to blog
            </span>
          </div>

          {/* Meta */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 10,
              marginBottom: 14,
              flexWrap: "wrap",
            }}
          >
            {post.category && (
              <span
                style={{
                  fontSize: 11,
                  fontWeight: 700,
                  color: G.accent,
                  background: G.accentBg,
                  padding: "3px 10px",
                  borderRadius: 20,
                  letterSpacing: "0.3px",
                  textTransform: "uppercase",
                }}
              >
                {post.category}
              </span>
            )}
            <span style={{ fontSize: 12.5, color: G.muted, fontWeight: 500 }}>
              {post.date}
            </span>
            <span style={{ fontSize: 10, color: G.borderHi }}>·</span>
            <span
              style={{
                fontSize: 12.5,
                color: G.accent,
                fontWeight: 600,
              }}
            >
              {post.readTime}
            </span>
          </div>

          {/* Title */}
          <h1
            style={{
              fontFamily: "'Instrument Serif',serif",
              fontSize: "clamp(28px,5vw,38px)",
              fontWeight: 400,
              lineHeight: 1.15,
              letterSpacing: "-0.8px",
              margin: "0 0 28px",
            }}
          >
            {post.title}
          </h1>

          {/* Featured image */}
          <div
            style={{
              width: "100%",
              borderRadius: 12,
              overflow: "hidden",
              marginBottom: 32,
              background: G.border,
            }}
          >
            <img
              src={post.image}
              alt={post.title}
              style={{
                width: "100%",
                height: "auto",
                display: "block",
              }}
            />
          </div>

          {/* Content paragraphs */}
          <div
            style={{
              fontSize: 16,
              lineHeight: 1.85,
              color: G.inkSoft,
            }}
          >
            {post.content.map((paragraph, i) => (
              <p
                key={i}
                className="ft"
                style={{
                  margin: i === post.content.length - 1 ? "0 0 32px" : "0 0 20px",
                }}
              >
                {paragraph}
              </p>
            ))}
          </div>

          {/* Keywords */}
          {post.keywords && post.keywords.length > 0 && (
            <div
              style={{
                padding: "20px 0 0",
                borderTop: `1px solid ${G.border}`,
                marginBottom: 32,
              }}
            >
              <div
                style={{
                  fontSize: 12,
                  fontWeight: 600,
                  color: G.muted,
                  marginBottom: 10,
                  textTransform: "uppercase",
                  letterSpacing: "0.5px",
                }}
              >
                Topics
              </div>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                {post.keywords.map((kw, i) => (
                  <span
                    key={i}
                    style={{
                      fontSize: 12,
                      color: G.muted,
                      background: G.surface,
                      padding: "4px 12px",
                      borderRadius: 16,
                      border: `1px solid ${G.border}`,
                    }}
                  >
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          )}
        </article>

        {/* CTA */}
        <section
          style={{
            maxWidth: 640,
            margin: "0 auto",
            padding: "0 22px 48px",
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
                fontSize: 24,
                marginBottom: 8,
              }}
            >
              Start getting more reviews today
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
              Join 2,400+ businesses using ReviewPing to automate review
              requests via SMS and email. Set it up in 2 minutes.
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
              14-day free trial · Cancel anytime
            </p>
          </Card>
        </section>

        {/* Related posts */}
        {relatedPosts.length > 0 && (
          <section
            style={{
              maxWidth: 760,
              margin: "0 auto",
              padding: "0 22px 48px",
              borderTop: `1px solid ${G.border}`,
              paddingTop: 40,
            }}
          >
            <h2
              style={{
                fontFamily: "'Instrument Serif',serif",
                fontSize: 24,
                fontWeight: 400,
                margin: "0 0 18px",
              }}
            >
              Related articles
            </h2>
            <div
              className="related-grid"
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(3, 1fr)",
                gap: 14,
              }}
            >
              {relatedPosts.map((rp) => (
                <Card
                  key={rp.slug}
                  style={{
                    padding: "18px 20px",
                    cursor: "pointer",
                    transition: "transform 0.2s ease, box-shadow 0.2s ease",
                  }}
                  onClick={() => (window.location.href = "/blog/" + rp.slug)}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = "translateY(-2px)";
                    e.currentTarget.style.boxShadow = "0 6px 24px rgba(0,0,0,0.06)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = "translateY(0)";
                    e.currentTarget.style.boxShadow = "none";
                  }}
                >
                  <div
                    style={{
                      fontSize: 11.5,
                      color: G.accent,
                      fontWeight: 600,
                      marginBottom: 6,
                    }}
                  >
                    {rp.readTime}
                  </div>
                  <div
                    style={{
                      fontFamily: "'Instrument Serif',serif",
                      fontSize: 16,
                      fontWeight: 400,
                      lineHeight: 1.3,
                      marginBottom: 6,
                    }}
                  >
                    {rp.title}
                  </div>
                  <div
                    style={{
                      fontSize: 12.5,
                      color: G.muted,
                      lineHeight: 1.5,
                      display: "-webkit-box",
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: "vertical",
                      overflow: "hidden",
                    }}
                  >
                    {rp.desc}
                  </div>
                </Card>
              ))}
            </div>
          </section>
        )}

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
            size={26}
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
