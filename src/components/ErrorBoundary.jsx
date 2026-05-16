import { Component } from "react";
import { G } from "../data/theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error("ErrorBoundary caught:", error, info);
  }

  render() {
    if (this.state.error) {
      return (
        <div
          style={{
            background: G.bg,
            minHeight: "100vh",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontFamily: "'Manrope',sans-serif",
            color: G.ink,
            padding: 24,
          }}
        >
          <div style={{ textAlign: "center", maxWidth: 420 }}>
            <div
              style={{
                fontSize: 40,
                marginBottom: 12,
                fontFamily: "'Instrument Serif',serif",
              }}
            >
              Something went wrong
            </div>
            <p style={{ color: G.muted, fontSize: 14, marginBottom: 24, lineHeight: 1.7 }}>
              An unexpected error occurred. Please try refreshing the page.
            </p>
            <button
              onClick={() => {
                this.setState({ error: null });
                window.location.href = "/";
              }}
              style={{
                background: G.accent,
                color: "white",
                border: "none",
                borderRadius: 8,
                padding: "12px 24px",
                fontSize: 14,
                fontWeight: 700,
                cursor: "pointer",
                fontFamily: "'Manrope',sans-serif",
              }}
            >
              Reload app
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
