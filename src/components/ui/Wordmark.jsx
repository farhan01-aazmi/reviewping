export default function Wordmark({ size = 28, showTagline = false, style, ...rest }) {
  const aspectRatio = 300 / 77; // natural w/h of logo.png
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        ...style,
      }}
      {...rest}
    >
      <img
        src="/logo.png"
        alt="ReviewPing"
        style={{
          height: size,
          width: "auto",
          objectFit: "contain",
          display: "block",
        }}
      />
      {showTagline && (
        <span
          style={{
            fontFamily: "Manrope, sans-serif",
            fontSize: size * 0.32,
            color: "var(--muted, #666)",
            fontWeight: 500,
            letterSpacing: "0.02em",
          }}
        >
          Review requests, simplified.
        </span>
      )}
    </div>
  );
}
