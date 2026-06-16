export default function LogoMark({ size = 32, style, ...rest }) {
  return (
    <img
      src="/logo.png"
      width={size}
      height={size}
      alt="ReviewPing"
      aria-hidden="true"
      style={{
        objectFit: "contain",
        borderRadius: 6,
        ...style,
      }}
      {...rest}
    />
  );
}
