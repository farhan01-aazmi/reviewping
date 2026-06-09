import { Component } from "react";
import { G } from "../data/theme";

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: "100vh", display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center", padding: "2rem",
          textAlign: "center", background: G.bg, color: G.ink,
          fontFamily: "'Manrope',sans-serif",
        }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>⚠️</div>
          <h2 style={{ fontFamily: "'Instrument Serif',serif", fontSize: 24, fontWeight: 400, margin: "0 0 8px" }}>
            Something went wrong
          </h2>
          <p style={{ color: G.muted, fontSize: 14, marginBottom: 24 }}>{this.state.error?.message}</p>
          <button onClick={() => window.location.href = "/"} style={{
            background: G.accent, color: "white", border: "none",
            padding: "12px 24px", borderRadius: 10, fontSize: 14,
            fontWeight: 700, cursor: "pointer", fontFamily: "'Manrope',sans-serif",
          }}>
            Go to Home
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}
