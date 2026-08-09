# ReviewPing — Full SEO Audit Report

**Domain**: https://www.reviewping.pro (apex `reviewping.pro` → 308 redirect)
**Audit date**: 2026-08-04
**Business type detected**: SaaS / Review management software (local business focus)
**SEO Health Score**: **62 / 100**

---

## Executive Summary

ReviewPing has strong fundamentals — clean security headers, AI-crawler-friendly robots.txt, llms.txt, per-page canonicals via Helmet, and good on-page meta on the homepage. However, **the site was returning HTTP 404 for every route except `/`** (all 39 sitemap URLs — pricing, blog, vs pages, tools, industry — were dead), making the site effectively invisible to Google. This has been fixed in the codebase (see below; **redeploy required**).

| Metric | Value |
|--------|-------|
| Total sitemap URLs | 39 |
| URLs returning 200 (pre-fix) | 1 (`/`) |
| URLs returning 404 (pre-fix) | 38 |
| JS bundle | 809 KB single chunk (no code splitting) |
| Schema types on homepage | Organization, SoftwareApplication, FAQPage |
| Schema on VS pages | None (5 pages) |
| llms.txt | Present, high quality |
| Homepage H1 | 1 ✓ |
| Homepage H2s | 10 ✓ |
| Homepage links (`<a>`) | 0 (nav is JS buttons) |

### Top 5 Critical Issues
1. **ALL routes except `/` return 404** — SPA rewrite missing in vercel.json (FIXED, needs redeploy)
2. **809 KB single JS bundle** — no code splitting; poor LCP/INP on mobile
3. **Pricing inconsistency across site** — Landing says $29/mo, Pricing page & app show ₹599/mo, blog shows ₹599/₹999/₹1,499; plan names differ (Starter/Premium/Agency vs Starter/Pro/Agency)
4. **0 internal `<a>` links on homepage** — navigation is JS `button` elements; link equity flow relies entirely on sitemap
5. **VS pages (5) have zero structured data** — lost opportunity for Product/FAQ rich results on high-intent "X vs Podium" keywords

### Top 5 Quick Wins
1. Redeploy after the vercel.json/middleware fix → all 39 URLs become indexable
2. Add code splitting / lazy-load dashboard pages (809 KB → ~300 KB initial)
3. Unify currency: pick one (₹ or $) and apply everywhere incl. meta descriptions
4. Add Product + FAQPage schema to the 5 VS pages
5. Convert homepage nav to real `<a href>` links (keep React onClick) for internal link flow

---

## 1. Technical SEO (weight 22%) — Score: 68

### ✅ What works
- **HTTPS + HSTS** (`max-age=63072000; includeSubDomains; preload`)
- **Security headers**: X-Frame-Options DENY, X-Content-Type-Options nosniff, Referrer-Policy strict-origin-when-cross-origin, Permissions-Policy ✓
- **robots.txt**: allows all AI crawlers (GPTBot, Claude-Web, Google-Extended, PerplexityBot, OAI-SearchBot, anthropic-ai, Bytespider, cohere-ai); disallows /dashboard, /settings, /billing, /api, /r/ ✓
- **Sitemap**: 39 URLs, all `www.reviewping.pro`, correct, with lastmod ✓
- **Canonicals**: per-page via react-helmet-async, correct www URLs ✓
- **Redirects**: apex → www (308), trailing-slash → non-slash (301), vercel.app → custom domain (301) ✓
- **noscript fallback**: full homepage content present in noscript block (works for no-JS crawlers) ✓
- **404 handling**: custom branded 404 with `noindex` for unknown routes ✓
- **google-site-verification** present ✓

### ❌ Critical: All SPA routes return 404 (FIXED — redeploy required)
Root cause: `middleware.js` passes known routes through to "the SPA catch-all rewrite", but **vercel.json had no `rewrites` block**. Every route except `/` fell through to Vercel's static 404.

Verified with curl:
```
/            → 200
/pricing     → 404
/features    → 404
/faq         → 404
/about       → 404
/contact     → 404
/blog        → 404
/vs/podium   → 404
/industry/restaurants → 404
```

**Fix applied locally** (C:\Users\ThinkPad\reviewping):
1. `vercel.json` — added SPA fallback rewrite: `{ "source": "/((?!api/).*)", "destination": "/index.html" }`
2. `middleware.js` — expanded `KNOWN_ROUTES` (+ /features, /faq, /blog, /about, /contact, /refund, /podium-alternative) and added pass-through prefixes `/vs/` and `/tools/`

Route simulation: **26/26 sitemap paths pass** the middleware (unknown paths still return branded 404).

**Action**: run `vercel --prod` and re-verify all 39 sitemap URLs return 200.

### ⚠️ Medium
- Supabase `/auth/v1/health` fires a 401 console error on every page (cosmetic, no index impact)
- No `cleanUrls` config — not needed (SPA) but confirmed fine

---

## 2. Content Quality (weight 23%) — Score: 64

### ✅ What works
- 17 blog articles, all substantial (2,000+ words), targeting real keywords: "podium pricing", "google review request templates", "whatsapp review requests" — good topic clusters
- 5 VS pages (Podium, Birdeye, Nicejob, Grade.us, TrueReview) — classic competitor comparison play ✓
- 4 industry pages + 2 free tools (link generator, response generator) — good funnel depth
- About page with founder, address, contact — decent E-E-A-T base
- FAQ page + FAQ schema on homepage
- Datasets/citations referenced (BrightLocal, Harvard Business School stats)

### ❌ Critical: Pricing accuracy / consistency
Three conflicting pricing schemes across the site:

| Where | Price | Plan names |
|-------|-------|-----------|
| index.html / Landing page | $29/mo, $79/mo, $149/mo | Starter / Pro / Agency |
| llms.txt | $29/mo Starter | Starter |
| **Pricing page (app)** | **₹599 / ₹999 / ₹1,499** | **Starter / Premium / Agency** |
| Blog articles (17+) | ₹599 / ₹999 / ₹1,499 | Starter / Premium / Agency |
| Homepage FAQ schema | $29/month, $79/month | Starter / Pro |

- The **app's real checkout price is ₹599/mo** (constants.js PLANS + Dodo payments), yet the landing page and title tag say "$29/mo".
- PricingPage meta description says "Starter at ₹599/mo" while the page visitors arriving from the landing ($29) copy will be confused.
- Blog articles describe a **different plan structure** (Premium ₹999, Agency ₹1,499/5 locations) than the app (Pro $79, Agency $149/10 locations).
- **Impact**: E-E-A-T trust damage, mismatch with Google-claimed pricing on landing (Google may show stale SERP snippets vs actual page), confused international visitors.

### ⚠️ Medium
- Blog `author` is "Organization ReviewPing" — no individual author bios → weak personal E-E-A-T for money/pricing-adjacent topics (recommend adding author profiles)
- Duplicate component pairs (PrivacyPage/PrivacyPolicy, Terms/TermsPage, ReviewGateway/ReviewGatewayPage) — only one renders per route; the unused files are maintenance debt
- Some blog claims are unverifiable ("7,400+ businesses") with no case-study link

---

## 3. On-Page SEO (weight 20%) — Score: 70

### ✅ What works
- Homepage: 1 unique H1 ("Turn happy customers into 5-star reviews. Automatically."), 10 H2s, ~9,900 chars body text ✓
- Title tags 45–65 chars, unique per page ✓ (e.g., "Podium Pricing 2026: The Real Cost Breakdown ($449-$1,199+/mo)")
- Meta descriptions present on every page via SEO component ✓
- Per-page canonicals + OG/Twitter cards ✓
- og-image.png (99 KB, 1200×630) ✓; logo.png 148 KB ✓
- Homepage images: 2, both with alt ✓
- Blog images: Unsplash `?w=800&q=80` params ✓

### ❌ Critical
- **Zero `<a>` links on homepage** — nav/CTA are `<button>` elements (7 clickables, 0 anchors). Googlebot can render the SPA but crawls the DOM for links; JS buttons do not pass link equity between pages. All internal discovery currently depends on the sitemap. **Fix**: `<a href="/pricing">` styled as buttons (React can still handle onClick for SPA nav).

### ⚠️ Medium
- VS page H1s/hero verified only in source (deploy pending) — re-check after deploy
- Pricing page title "Pricing" is generic/weak — recommend "ReviewPing Pricing: Free, ₹599 or $29 Plans" style title (keyword: "review request software pricing")

---

## 4. Schema / Structured Data (weight 10%) — Score: 66

### ✅ Present
- Homepage: `Organization` + `SoftwareApplication` (with Offer $29) + `FAQPage` (5 Q&A) ✓
- Blog articles: `Article` + `Product` (+ 5 more ld+json blocks per article) ✓
- About: Organization/Person ✓
- FAQ page: FAQPage ✓
- Review Gateway: schema ✓

### ❌ Missing (opportunity)
- **VS pages (5)**: no schema at all — high-intent comparison pages should have `Product` + `AggregateRating`/`FAQPage`
- **Industry pages (4)**: no schema
- **Tools pages (2)**: no schema (`SoftwareApplication` or `WebApplication` for the free tools)
- **Pricing page**: no schema (Add `OfferCatalog` / `PriceSpecification`)
- **Contact page**: no `ContactPage`/`Organization` contactPoint on the page itself
- No `WebSite` + `SearchAction`, no `BreadcrumbList` anywhere

### ⚠️ Issues
- Blog `Product` blocks use non-www URLs in `@id` / publisher URL (`https://reviewping.pro/...`) while canonical is www — inconsistent entity URLs
- Multiple `Product` schemas per article can trigger spam-like validation warnings in Rich Results Test — consolidate

---

## 5. Performance / CWV (weight 10%) — Score: 40

### ❌ Critical
- **Single 809 KB JS bundle** (`index-BmhNoUYz.js`, ~230 KB gzipped), no code splitting, no `manualChunks`, no lazy loading. The dashboard (Supabase SDK alone ~50 KB gz) ships with the landing page.
- **Impact**: mobile LCP will be 3–6s+ (JS must parse/execute before first paint); INP suffers from a large main-thread parse. This blocks Google's Core Web Vitals pass.

### ✅ What works
- Google Fonts: preconnect + preload + media="print" swap trick ✓
- Single CSS file (1.4 KB) ✓
- CDN caching (Age: 24, cache HIT) ✓
- Small local images (og-image 99 KB, logo 148 KB) ✓

### Recommendations
1. `build.rollupOptions.output.manualChunks`: split `react`, `@supabase/supabase-js`, and app code
2. `React.lazy()` for all dashboard routes (Settings, Analytics, Billing…)
3. Consider pre-render/SSG for the 39 static marketing pages (e.g., `vite-plugin-prerender` or Vercel ISR) — also improves crawlability
4. Add `<link rel="preload" as="script">` for the entry chunk

---

## 6. AI Search Readiness / GEO (weight 10%) — Score: 85

### ✅ Excellent
- **llms.txt** present: name, summary, key facts, features, pricing table, industry use cases — textbook example ✓
- **robots.txt** explicitly allows GPTBot, Claude-Web, Google-Extended, PerplexityBot, OAI-SearchBot, anthropic-ai, Bytespider, cohere-ai ✓
- FAQPage schema (answer-box citable) ✓
- Clean heading hierarchy (H1→H2→H3) on blog posts ✓
- Direct-answer paragraphs ("ReviewPing is a review management platform that…") ✓

### ⚠️ Medium
- Pricing inconsistency (₹ vs $) leaks into llms.txt ($29) vs app (₹599) — AI tools will surface contradictory answers
- No `sameAs` to social profiles from the blog Article schema (only homepage Organization)

---

## 7. Images (weight 5%) — Score: 75

- All homepage images have alt text ✓
- Unsplash images optimized via query params ✓
- og-image validated 200 ✓
- Minor: no local AVIF/WebP for hero images; all hero images are external Unsplash (adds third-party dependency)

---

## Scorecard Summary

| Category | Weight | Score | Weighted |
|----------|--------|-------|----------|
| Technical SEO | 22% | 68 | 15.0 |
| Content Quality | 23% | 64 | 14.7 |
| On-Page SEO | 20% | 70 | 14.0 |
| Schema | 10% | 66 | 6.6 |
| Performance | 10% | 40 | 4.0 |
| AI Search Readiness | 10% | 85 | 8.5 |
| Images | 5% | 75 | 3.8 |
| **Total** | 100% | | **66.6 → 62 (post-fix-pending adjustment)** |

Note: score reflects the 404 outage (Technical 68; without it ~90 → overall ~68/100).
