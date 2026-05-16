import { G } from "../../data/theme";

export default function EmptyState({
  icon = "📭",
  title = "Nothing here yet",
  description,
  action,
  style,
  ...rest
}) {
  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "60px 20px",
        textAlign: "center",
        ...style,
      }}
      {...rest}
    >
      <span style={{ fontSize: 48, marginBottom: 16, lineHeight: 1 }}>
        {icon}
      </span>
      <h3
        style={{
          fontFamily: "Instrument Serif, serif",
          fontSize: 20,
          fontWeight: 600,
          color: G.ink,
          margin: "0 0 8px 0",
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            fontSize: 14,
            color: G.muted,
            margin: "0 0 20px 0",
            maxWidth: 360,
            lineHeight: 1.5,
          }}
        >
          {description}
        </p>
      )}
      {action}
    </div>
  );
}
