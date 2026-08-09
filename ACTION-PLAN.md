# ReviewPing — SEO Action Plan

Priority-ordered. P0 = do now, P1 = this week, P2 = next sprint.

---

## P0 — Deploy the routing fix (blocking everything else)

**Status**: Code fixed, NOT deployed. Production still returns 404 on 38/39 URLs.

```bash
cd C:\Users\ThinkPad\reviewping
vercel --prod
```

**Verify after deploy** (all must be 200, not 404):
```bash
curl -s -o /dev/null -w "%{http_code} " https://www.reviewping.pro/pricing
curl -s -o /dev/null -w "%{http_code} " https://www.reviewping.pro/blog
curl -s -o /dev/null -w "%{http_code} " https://www.reviewping.pro/vs/podium
curl -s -o /dev/null -w "%{http_code} " https://www.reviewping.pro/industry/restaurants
curl -s -o /dev/null -w "%{http_code} " https://www.reviewping.pro/tools/review-link-generator
```

Checklist:
- [ ] `vercel --prod` deployed
- [ ] All 39 sitemap URLs return 200
- [ ] Unknown route (e.g. `/xyz`) still returns branded 404 (noindex)
- [ ] Update Search Console sitemap & request re-index
- [ ] E2E: `pricing`, `blog`, `vs`, `tools`, `industry` routes render in browser

---

## P0 — Decide ONE pricing story (₹ vs $)

The app charges **₹599/₹999/₹1,499** (Starter/Premium/Agency). The landing page, title tag and llms.txt claim **$29/$79/$149** (Starter/Pro/Agency). This is trust-damaging and inconsistent across 20+ pages.

**Decision needed** (I recommend option A):

- **A. Make INR the sole currency** — edit `index.html` title, `Landing.jsx`, llms.txt, homepage FAQ schema, sitemap-listed titles to ₹599/₹999/₹1,499 + Starter/Premium/Agency. Least code churn; matches real checkout.
- **B. Make USD the sole currency** — change `constants.js` PLANS to 29/79/149 + update meta description in PricingPage. Bigger change (checkout values, Dodo products), risk of breaking payments.
- **C. Currency toggle / geo-detect** — most work, do later if expanding globally.

Files to touch for A: `index.html`, `src/components/layout/Landing.jsx`, `src/components/SEO.jsx` (if it embeds pricing), `public/llms.txt`, `src/components/layout/BlogArticle.jsx` FAQ schema, blog markdown data (17 files), `src/data/seoPages.js`, `src/components/pages/PricingPage.jsx` line 64.

---

## P1 — On-page improvements

1. **Convert homepage nav/CTA buttons to `<a>` links** (styled as buttons). Fixes: zero internal anchor links, link equity flow, crawlable navigation.
   - Files: `src/components/layout/Nav.jsx` / header + CTA sections in `Landing.jsx`
2. **Pricing page title** — replace generic "Pricing" with `ReviewPing Pricing: Plans from ₹599/mo (Podium Alternative)` (55 chars max).
3. **Add real `<a href>` on blog cards, footer links** — footer likely also JS nav.

## P1 — Schema additions

| Page | Schema to add |
|------|---------------|
| 5 VS pages (`/vs/*`) | `Product` (name: "ReviewPing vs Podium") + `FAQPage` |
| 4 Industry pages | `Service` + `FAQPage` |
| 2 Tool pages | `SoftwareApplication` / `WebApplication` + `FAQPage` |
| Pricing page | `OfferCatalog` with `PriceSpecification` (use final currency) |
| Homepage | `WebSite` + `SearchAction`; add `sameAs` social links |

Also: fix blog Article `Product` blocks to use www URLs in `@id`; consolidate to one `Product` per article.

## P2 — Performance (CWV)

1. Vite `manualChunks`: split `react`, `@supabase/supabase-js` (each ~50 KB gz)
2. `React.lazy()` dashboard routes (Settings, Analytics, Billing, DashboardHome)
3. `vite-plugin-prerender` for the 39 static marketing pages (or Vercel ISR) → pre-rendered HTML for crawlers + faster LCP
4. `rel="preload"` entry chunk
5. Target: initial JS < 300 KB gz

## P2 — Content / E-E-A-T

1. Add author bios (name, title, linkedin) to blog `author` in Article schema — currently "Organization ReviewPing"
2. Add case study / proof link for "7,400+ businesses" claim
3. Delete or merge duplicate components: `PrivacyPolicy.jsx` vs `PrivacyPage.jsx`, `Terms.jsx` vs `TermsPage.jsx`, `ReviewGateway.jsx` vs `ReviewGatewayPage.jsx`
4. Geo consistency: `og:image` absolute URLs fine; check VS page OG images after deploy

## Ongoing

- Submit updated sitemap in Search Console after deploy; monitor Index Coverage for 404s→200s recovery
- After deploy, re-run site audit; expect Technical 68→90+, overall ~62→~68
- Monthly drift check (baseline saved in this report: 39 URLs, 1 H1 homepage, 0 anchors)
