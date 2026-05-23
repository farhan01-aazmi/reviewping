import { forwardRef } from "react";
import { G } from "../../data/theme";

const variants = {
  primary: {
    background: G.accent,
    color: "#fff",
    border: "none",
  },
  secondary: {
    background: "transparent",
    color: G.ink,
    border: `1.5px solid ${G.borderHi}`,
  },
  ghost: {
    background: "transparent",
    color: G.inkSoft,
    border: "none",
  },
  danger: {
    background: "#DC2626",
    color: "#fff",
    border: "none",
  },
};

const sizeStyles = {
  sm: { padding: "6px 14px", fontSize: 13, borderRadius: 8 },
  md: { padding: "10px 20px", fontSize: 14, borderRadius: 10 },
  lg: { padding: "14px 28px", fontSize: 16, borderRadius: 12 },
};

const Btn = forwardRef(function Btn(
  {
    children,
    variant = "primary",
    size = "md",
    disabled = false,
    loading = false,
    onClick,
    style,
    fullWidth,
    type = "button",
    ariaLabel,
    ...rest
  },
  ref
) {
  const base = {
    ...variants[variant],
    ...sizeStyles[size],
    fontFamily: "Manrope, sans-serif",
    fontWeight: 600,
    cursor: disabled || loading ? "not-allowed" : "pointer",
    opacity: disabled || loading ? 0.5 : 1,
    transition: "all 0.15s ease",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    width: fullWidth ? "100%" : undefined,
    ...style,
  };

  return (
    <button
      ref={ref}
      type={type}
      style={base}
      disabled={disabled || loading}
      onClick={onClick}
      role="button"
      aria-disabled={disabled || loading}
      aria-busy={loading}
      aria-label={ariaLabel}
      {...rest}
    >
      {loading ? (
        <span
          style={{
            width: 16,
            height: 16,
            border: "2px solid currentColor",
            borderTopColor: "transparent",
            borderRadius: "50%",
            animation: "spin 0.6s linear infinite",
            display: "inline-block",
          }}
        />
      ) : null}
      {children}
    </button>
  );
});

export default Btn;
