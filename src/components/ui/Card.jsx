import { G } from "../../data/theme";

export default function Card({
  children,
  padding = 20,
  style,
  sx,
  hover = false,
  hoverable = false,
  ...rest
}) {
  const isHoverable = hover || hoverable;
  const mergedStyle = { ...sx, ...style };
  return (
    <div
      style={{
        background: G.surface,
        borderRadius: 16,
        border: `1px solid ${G.border}`,
        padding,
        transition: isHoverable ? "box-shadow 0.15s ease, transform 0.15s ease" : undefined,
        cursor: isHoverable ? "pointer" : undefined,
      }}
      onMouseEnter={
        isHoverable
          ? (e) => {
              e.currentTarget.style.boxShadow = "0 4px 20px rgba(0,0,0,0.06)";
              e.currentTarget.style.transform = "translateY(-1px)";
            }
          : undefined
      }
      onMouseLeave={
        hover
          ? (e) => {
              e.currentTarget.style.boxShadow = "none";
              e.currentTarget.style.transform = "translateY(0)";
            }
          : undefined
      }
      {...rest}
    >
      {children}
    </div>
  );
}
