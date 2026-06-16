export default function LogoMark({ size = 48, style, ...rest }) {
  return (
    <img
      src="/logo.png"
      height={size}
      alt="ReviewPing"
      aria-hidden="true"
      style={{
        width: "auto",
        objectFit: "contain",
        borderRadius: 6,
        filter: "var(--logo-filter, none)",
        ...style,
      }}
      {...rest}
    />
  );
}
