import { G } from "../../data/theme";

export default function Stars({ rating, size = 16, style, ...rest }) {
  if (rating === null || rating === undefined) return null;

  return (
    <span
      style={{
        display: "inline-flex",
        gap: 2,
        alignItems: "center",
        ...style,
      }}
      aria-label={`${rating} out of 5 stars`}
      {...rest}
    >
      {[1, 2, 3, 4, 5].map((star) => {
        const fill = star <= rating ? G.gold : G.mutedLo;
        return (
          <svg
            key={star}
            width={size}
            height={size}
            viewBox="0 0 20 20"
            fill={fill}
            aria-hidden="true"
          >
            <path d="M10 1l2.39 4.84 5.34.78-3.87 3.77.91 5.32L10 13.27l-4.77 2.51.91-5.32L2.27 6.62l5.34-.78L10 1z" />
          </svg>
        );
      })}
    </span>
  );
}
