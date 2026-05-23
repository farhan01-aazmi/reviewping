import { G } from "../../data/theme";
import { Btn, Wordmark } from "../ui";
import SEO from "../SEO";

export default function NotFound({ onBack }) {
  return (
    <>
      <SEO title="Page not found" description="The page you're looking for doesn't exist." />
      <div
        style={{
          background: G.bg,
          minHeight: "100vh",
          fontFamily: "'Manrope',sans-serif",
          color: G.ink,
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          padding: "0 22px",
        }}
      >
        <div style={{ textAlign: "center", maxWidth: 420 }}>
          <div
            style={{
              fontSize: 72,
              fontFamily: "'Instrument Serif',serif",
              color: G.accent,
              lineHeight: 1,
              marginBottom: 8,
              fontWeight: 400,
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
            The page you are looking for does not exist or has been moved.
          </p>
          <Btn onClick={onBack}>← Back to home</Btn>
        </div>
      </div>
    </>
  );
}
