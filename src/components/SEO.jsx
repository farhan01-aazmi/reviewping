import { Helmet } from "react-helmet-async";

const BASE_URL = "https://www.reviewping.pro";

export default function SEO({
  title,
  description,
  path = "",
  ogImage = "/og-image.png",
}) {
  const fullTitle = title
    ? `${title} · ReviewPing`
    : "ReviewPing — Get 30+ Google Reviews/Month Automatically";
  const fullDesc =
    description ||
    "Get 30+ new Google reviews every month automatically with AI-personalised email and WhatsApp review requests. No contracts. Set up in 2 minutes.";
  const url = `${BASE_URL}${path}`;
  const image = ogImage.startsWith("http") ? ogImage : `${BASE_URL}${ogImage}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={fullDesc} />
      <link rel="canonical" href={url} />

      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={fullDesc} />
      <meta property="og:url" content={url} />
      <meta property="og:image" content={image} />
      <meta property="og:site_name" content="ReviewPing" />

      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={fullDesc} />
      <meta name="twitter:image" content={image} />

      {/* Keep Google tags in head (not removed by Helmet) */}
      <meta name="google-adsense-account" content="ca-pub-3228204713225337" />
    </Helmet>
  );
}
