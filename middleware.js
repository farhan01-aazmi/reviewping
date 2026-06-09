/**
 * Vercel Edge Middleware
 *
 * Returns proper 404 HTTP status for unknown SPA routes.
 * Known routes pass through to the SPA catch-all rewrite.
 * This ensures crawlers get correct status codes.
 */
const KNOWN_ROUTES = new Set([
  "/",
  "/auth/callback",
  "/login",
  "/signup",
  "/forgot-password",
  "/privacy",
  "/terms",
  "/pricing",
  "/tools/review-link-generator",
  "/tools/review-response-generator",
  "/dashboard",
  "/onboarding",
  "/verify",
  "/settings",
  "/billing",
  "/api",
  "/404",
  "/invite",
  "/changelog",
  "/help",
  "/referral",
]);

const STATIC_PREFIXES = ["/assets/", "/favicon", "/og-image", "/sitemap", "/robots"];

const STATIC_EXTENSIONS = [
  ".svg", ".png", ".jpg", ".jpeg", ".gif", ".webp", ".ico",
  ".css", ".js", ".json", ".xml", ".txt", ".woff2", ".woff", ".eot", ".ttf", ".otf",
];

export default function middleware(request) {
  const url = new URL(request.url);
  let pathname = url.pathname;
  const hasTrailingSlash = pathname.length > 1 && pathname.endsWith("/");
  const normalized = hasTrailingSlash ? pathname.slice(0, -1) : pathname;

  // Redirect trailing-slash URLs to non-trailing-slash (301 permanent)
  // Prevents duplicate content / SEO dilution
  if (hasTrailingSlash) {
    url.pathname = normalized;
    return Response.redirect(url.toString(), 301);
  }

  // Pass through static file requests
  if (STATIC_EXTENSIONS.some((ext) => normalized.endsWith(ext))) {
    return;
  }

  // Pass through known prefixes (asset paths, API routes)
  for (const prefix of STATIC_PREFIXES) {
    if (normalized.startsWith(prefix)) return;
  }

  // Pass through known SPA routes
  if (KNOWN_ROUTES.has(normalized)) return;

  // Unknown route — return proper 404 status
  const title = "Page Not Found — ReviewPing";
  const description = "The page you are looking for does not exist. ReviewPing helps small businesses automate Google review requests.";
  const homeUrl = "https://reviewping.pro";

  return new Response(
    `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <title>${title}</title>
  <meta name="description" content="${description}" />
  <meta property="og:title" content="${title}" />
  <meta property="og:description" content="${description}" />
  <meta property="og:url" content="${url.origin}${pathname}" />
  <meta name="robots" content="noindex" />
  <style>
    body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;padding:20px;background:#faf9f6;color:#1a1a2e;text-align:center}
    .c{max-width:420px}
    h1{font-size:64px;margin:0 0 8px;font-weight:200;color:#c73b3b;line-height:1}
    .sep{width:40px;height:3px;background:#c73b3b;margin:0 auto 20px;border-radius:2px;opacity:.3}
    p{font-size:15px;line-height:1.6;color:#666;margin:0 0 24px}
    a{color:#c73b3b;text-decoration:none;font-weight:600}
    a:hover{text-decoration:underline}
  </style>
</head>
<body>
  <div class="c">
    <h1>404</h1>
    <div class="sep"></div>
    <p>The page you are looking for does not exist or has been moved.</p>
    <p><a href="${homeUrl}">← Back to ReviewPing</a></p>
  </div>
</body>
</html>`,
    {
      status: 404,
      statusText: "Not Found",
      headers: {
        "Content-Type": "text/html; charset=utf-8",
        "Cache-Control": "no-cache, no-store, must-revalidate",
      },
    },
  );
}
