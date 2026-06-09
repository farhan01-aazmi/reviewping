import { Helmet } from "react-helmet-async";

const BASE_URL = "https://reviewping.pro";

export default function SEO({
  title,
  description,
  path = "",
  ogImage = "/og-image.png",
}) {
  const fullTitle = title
    ? `${title} · ReviewPing`
    : "ReviewPing — Automate Your Google Reviews";
  const fullDesc =
    description ||
    "Send AI-personalised review requests via SMS or email. No chasing. No copy-pasting. Built for small businesses.";
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
    </Helmet>
  );
}
