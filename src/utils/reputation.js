/**
 * Calculate a reputation score (0–100) based on:
 * - avgRating: average star rating (1–5)
 * - reviewCount: total number of reviews
 * - responseRate: percentage of reviews with a reply (0–100)
 * - positiveRatio: fraction of reviews that are 4–5 stars (0–1)
 *
 * Weights:
 *   Rating:         40%
 *   Volume:         20%
 *   Response rate:  20%
 *   Sentiment:      20%
 */
export function calculateReputationScore({
  avgRating,
  reviewCount,
  responseRate,
  positiveRatio,
}) {
  // Rating score: map 1–5 stars → 0–100
  const ratingScore = avgRating != null && avgRating !== "—"
    ? Math.round(((parseFloat(avgRating) - 1) / 4) * 100)
    : 0;

  // Volume score: logarithmic curve, caps at 200+ reviews
  // 0 reviews → 0, 10 → 50, 50 → 78, 200+ → 100
  const volumeScore = reviewCount > 0
    ? Math.min(100, Math.round(Math.log10(reviewCount + 1) * 45))
    : 0;

  // Response rate score: direct percentage
  const responseScore = responseRate != null ? Math.min(100, Math.round(responseRate)) : 0;

  // Sentiment score: positive ratio → 0–100
  const sentimentScore = positiveRatio != null
    ? Math.round(positiveRatio * 100)
    : 0;

  // Weighted composite
  const total = Math.round(
    ratingScore * 0.40 +
    volumeScore * 0.20 +
    responseScore * 0.20 +
    sentimentScore * 0.20
  );

  return Math.min(100, Math.max(0, total));
}

/**
 * Return a label and color for a given score.
 */
export function getReputationGrade(score) {
  if (score >= 90) return { label: "Excellent", color: "#16a34a", bg: "#f0fdf4" };
  if (score >= 75) return { label: "Great", color: "#2563eb", bg: "#eff6ff" };
  if (score >= 60) return { label: "Good", color: "#ca8a04", bg: "#fefce8" };
  if (score >= 40) return { label: "Fair", color: "#ea580c", bg: "#fff7ed" };
  return { label: "Needs Work", color: "#dc2626", bg: "#fef2f2" };
}
