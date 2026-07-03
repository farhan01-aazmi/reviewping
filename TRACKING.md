# ReviewPing — Master Project Tracker

---

## Phase 1: Plan System, Feature Gating & Pricing Page
**Status:** 🟢 Deployed

### 🟢 Plan System
- Free/Starter/Pro/Agency plans defined in `PLANS` array
- Default plan = "free" on signup via SQL trigger + upsert
- `hasFeature()`, `planForFeature()`, `getDailyLimit()` utilities

### 🟢 Feature Gating
- PremiumFeature.jsx with upgrade CTA (no blur)
- Gated: CompetitorRadar, ReputationScore, WhatsApp channel, Automations, BulkSend, AI Reply, Integrations, Team
- Daily limit: free = 1/day (was 5/day), starter = 100/day

### 🟢 Pricing
- Standalone `/pricing` page (PricingPage.jsx)
- PricingModal.jsx overlay (opens on limit hit or feature click)
- Pro plan has "Most Popular" badge

### 🟢 Upgrade Flow
- ConfirmModal → create-checkout edge function → Dodo Payments (live mode)
- All 6 product IDs configured in environment variables

### 🟢 Edge Functions
- `send-sms`, `send-email`, `send-whatsapp`, `send-review-request` — daily limit enforcement
- `create-checkout` — subscription creation

---

## Phase 2: SEO & Content
**Status:** 🟢 Content Complete, 🟡 Waiting for Google Index

### 🟢 Routing Fix (Deployed)
- SPA routing 404 bug fixed — all paths return 200
- `.vercel/output/config.json` catch-all deployed via `vercel deploy --prebuilt --prod`
- Vercel token: configured

### 🟢 Blog Posts (16 total)
| # | Slug | Category | Date |
|---|------|----------|------|
| 1 | reviewping-vs-birdeye-comparison | Comparisons | Jun 18 |
| 2 | whatsapp-review-requests-guide | Tutorials | Jun 16 |
| 3 | best-review-request-automation-software-2026 | Comparisons | Jun 14 |
| 4 | review-request-automation-statistics-2026 | Data & Research | Jun 12 |
| 5 | what-is-review-request-automation | Guides | Jun 10 |
| 6 | why-google-reviews-matter-for-small-business | Review Strategy | May 20 |
| 7 | sms-vs-email-review-requests-which-works-better | Review Tactics | May 12 |
| 8 | how-to-respond-to-negative-google-reviews | Reputation Mgmt | May 5 |
| 9 | review-management-for-restaurants | Industry Guides | Apr 28 |
| 10 | google-business-profile-optimization-checklist | SEO & Visibility | Apr 20 |
| 11 | reviewping-vs-podium-comparison | Comparisons | Jun 3 |
| 12 | how-to-automate-google-review-requests | Tutorials | Jun 2 |
| 13 | podium-pricing-2026 | Comparisons | Jun 22 |
| 14 | google-review-request-templates | Templates | Jun 21 |
| 15 | how-to-get-5-star-google-reviews | Review Strategy | Jun 20 |
| 16 | how-to-reply-to-google-reviews-professionally | Reputation Mgmt | Jun 19 |

### 🟢 Podium Alternative Pillar Page
- `/podium-alternative` — standalone page with comparison table, hidden fees breakdown, WhatsApp advantage, migration guide, feature-gap honesty, 8 FAQ items
- Data-driven (PODIUM_ALTERNATIVE_DATA in seoPages.js)
- Wireframe: header → hero → content sections → footer
- Deployed and returning 200

### 🟢 Keyword Cluster Plan
- 5 clusters identified: Review Request Automation, Google Review Management, Podium Alternatives, Industry Review Software, Get More Google Reviews
- Priority writing order established
- Saved to `cluster-plan.md`

### 🟢 Free Plan Pricing Fix
- Free plan: 5/day (150/mo) → 25/mo (daily limit: 1/day)
- Updated: constants.js, Billing.jsx, all blog post references in seoPages.js
- No more confusion where free plan exceeded Starter limits

---

## Phase 3: Backlinks & Authority Building
**Status:** 🟡 In Progress

### Backlink Assets Ready (`backlink-assets/`)
| # | Asset | File | Status |
|---|-------|------|--------|
| 1 | G2 / Capterra / Crunchbase listing descriptions | `01-g2-capterra-listing.md` | 🔴 Not Submitted |
| 2 | Reddit founder story posts | `02-reddit-founder-story.md` | 🔴 Not Posted |
| 3 | Quora answers (5 answers) | `03-quora-5-answers.md` | 🔴 Not Posted |
| 4 | Guest post pitches (SEJ, WordStream, Small Biz Trends) | `04-guest-post-pitches.md` | 🔴 Not Pitched |
| 5 | Medium article (founder story) | `05-medium-article.md` | 🔴 Not Published |
| 6 | Product Hunt launch listing | `06-producthunt-launch.md` | 🔴 Not Launched |
| 7 | HARO/Connectively response templates | `07-haro-templates.md` | 🔴 Not Sent |
| 8 | 175 Bookmarking Sites List (NOT RECOMMENDED) | `175-bookmarking-sites-list.md` | 🟢 Analyzed — Skip |

### Backlink Submission Log
| Date | Platform | URL/Link | Status | Notes |
|------|----------|----------|--------|-------|
| — | G2 | — | 🔴 | Not submitted yet |
| — | Capterra | — | 🔴 | Not submitted yet |
| — | Crunchbase | — | 🔴 | Not submitted yet |
| Jun 27 | Product Hunt | TBD | 🟢 | Launched! Need URL |
| — | Medium | — | 🔴 | Not published yet |
| — | Reddit | — | 🔴 | Not posted yet |
| — | Quora | — | 🔴 | Not answered yet |
| — | HARO | — | 🔴 | Not sent yet |
| — | Guest Posts | — | 🔴 | Not pitched yet — 4 free + 6 premium targets identified |

### Guest Post Assets Ready
| File | Content | Status |
|------|---------|--------|
| `04-guest-post-pitches.md` | 3 pitch emails (SEJ, WordStream, Small Biz Trends) | ✅ Ready to send |
| `08-guest-post-article-full.md` | Full 2,100-word article: "How to Get More Google Reviews in 2026" | ✅ Ready to publish |
| `09-guest-post-target-sites-master-list.md` | 10 target sites + pitch templates + submission log | ✅ Ready to pitch |

### Guest Post Pipeline
| Priority | Site | DA | Type | Status | How to Submit |
|----------|------|----|------|--------|-------|
| 1 | BusinessFirms | ~42 | Free | 🔴 Ready to send | Email businessfirms.co@gmail.com |
| 2 | IdeasPlusBusiness | ~45 | Free | 🔴 Ready to send | Via write-for-us page |
| 3 | InvoiceBerry | ~44 | Free | 🔴 Ready to send | Via contact page |
| 4 | BlogArena360 | ~35 | Free | 🔴 Ready to submit | Register + submit article |
| 5 | Search Engine Journal | 87 | Premium | 🔴 Not pitched | Via write-for-us |
| 6 | WordStream | 86 | Premium | 🔴 Not pitched | Via guest post page |
| 7 | Small Business Trends | 82 | Premium | 🔴 Not pitched | Contact form |
| 8 | G2 Blog | 85 | Premium | 🔴 Not pitched | Contributor network |
| 9 | Capterra Blog | 84 | Premium | 🔴 Not pitched | Contributed content |
| 10 | HackerNoon | 85 | Premium | 🔴 Not pitched | Write for us page |

**File ready:** `backlink-assets/10-guest-post-send-now.md` — copy-paste ready emails, sirf send karna hai

---

## Phase 4: Growth & Acquisition
**Status:** 🔴 Not Started

### Growth Plan Ready
- Complete GTM plan saved at `reviewping-gtm-plan.md`
- Channel priorities: Reddit > SEO > Facebook Groups
- Bootstrap budget: $0 first 30 days
- Product Hunt launch recommended at Day 21-30

---

## Key URLs
- **Live:** `https://www.reviewping.pro`
- **Pricing:** `https://www.reviewping.pro/pricing`
- **Podium Alternative:** `https://www.reviewping.pro/podium-alternative`
- **Blog:** `https://www.reviewping.pro/blog`
- **Supabase:** `fvugrcqjrtwabaobuigb` (West US)
- **GitHub:** `master` branch at commit `f66605f`

## Known Issues
- Google hasn't re-crawled/indexed pages since routing fix — needs a few days
- Blog meta descriptions: already correct in code (`post.desc` passed to SEO component), was masked by 404 routing
- No blog index page (`/blog` returns SPA but has no blog listing — BlogPage.jsx handles this client-side)

## 🟢 Sitemap & Indexing Fixes (Jul 1)
### What was fixed
- **Sitemap URL scheme**: Changed from `reviewping.pro` → `www.reviewping.pro` (was causing canonical mismatch with Vercel redirect)
- **Missing blog posts**: Added 4 missing posts (podium-pricing-2026, google-review-request-templates, how-to-get-5-star-google-reviews, how-to-reply-to-google-reviews-professionally)
- **Missing pages**: Added podium-alternative page
- **lastmod dates**: Added proper `<lastmod>` fields for freshness signals
- **Removed auth pages**: /login and /signup removed from sitemap (shouldn't be indexed)
- **Auto-generation**: New `scripts/generate-sitemap.cjs` reads blog data and regenerates sitemap on every build
- **Build pipeline**: `scripts/build-vercel.cjs` now auto-generates sitemap before vite build

### 🟡 User action needed
- Go to [Google Search Console](https://search.google.com/search-console) → Sitemaps → Submit `https://www.reviewping.pro/sitemap.xml`
- Use URL Inspection tool to request indexing for key pages (/, /pricing, /features, blog posts)
- Monitor impressions/clicks over next 3-7 days for improvement

---

## Social Media Content (Jun 30)
Full 2-week content plans created for all 5 platforms:
- **LinkedIn**: 6 posts (founder story, data, industry, comparison, engagement) + 2 carousel ideas + posting calendar — ready to post
- **Twitter/X**: 10 tweets + 2 threads + 5 accounts to engage + comment mining strategy
- **Instagram**: 5 carousels, 3 reels, 5 single posts, 5 story series + visual style guide + hashtag strategy
- **TikTok**: 10 video concepts with full scripts + 5 sound recommendations + 14-day schedule + engagement tactics
- **Reddit**: 5 value posts + 10 comment opportunities + AMA strategy + 30-day karma warmup plan

**File:** `social-content/SOCIAL-MEDIA-MASTER-PLAN.md` — weekly calendar, brand messaging guide

## Audit Issues (Jun 30 Audit)
### ✅ Fixed
- **Title**: Changed from "ReviewPing - Automate Your Google Reviews" → "ReviewPing — Get 30+ Google Reviews/Month Automatically | $29/mo" (index.html, SEO.jsx, Landing.jsx)
- **Meta description**: Changed from competitor-focused to outcome-first (all files)
- **JSON-LD descriptions**: Removed "alternative to Podium" references, replaced with outcome-focused

### 🟢 Actually Working (audit false positives)
- **/pricing routing**: Renders PricingPage correctly (h2="Choose your plan"), was probably cached version
- **Blog page**: Shows all 16 blog posts, was probably loaded before SPA hydration
- **About/Contact pages**: Both have substantial content (820/669 lines each)
- **WhatsApp feature**: `send-whatsapp` edge function deployed and reachable (returns 401 without auth = expected)

### 🟡 Needs User Action
- ~~**Submit sitemap to Google Search Console**: Go to Sitemaps → submit `https://www.reviewping.pro/sitemap.xml`~~ ⬇️ See below

### 🔴 Must Do (Jul 1)
- **Submit sitemap to Google Search Console**: Go to [Google Search Console](https://search.google.com/search-console) → select your property → **Sitemaps** section → enter `https://www.reviewping.pro/sitemap.xml` → Submit
- **Request indexing for key pages**: Use URL Inspection tool for `/`, `/pricing`, `/features`, `/blog`, `/blog/podium-pricing-2026`, etc.
- **Monitor for 3-7 days**: Impressions should climb from 41 after Google recrawls with the fixed sitemap

## 🔗 Backlink Machine (Jul 1) — 🟢 Deployed
### What was built
- **`scripts/backlink-machine/`** — 7 files: seed.cjs, scraper.cjs (auto scrapes sites for contact info), generate-emails.cjs (personalized outreach emails), send.cjs (sends via Resend), dashboard.cjs, quick-wins.cjs (directory auto-submitter), db.cjs (JSON database)
- **`public/badge.js`** — Embeddable "Powered by ReviewPing" widget for natural backlinks
- **`.github/workflows/backlink-machine.yml`** — GitHub Action runs daily at 10 AM IST: scrape → generate → commit
- **`.github/workflows/backlink-send.yml`** — Manual trigger from GitHub UI to send outreach emails (with dry-run option)
- **100 targets seeded** from Podium gap analysis
- **5 emails ready** to send (more as scraper runs)
- **Resend API key** configured (domain needs verification on Resend dashboard)

### 🟡 Needed
- **Resend domain verify**: Go to https://resend.com/domains → Add `reviewping.pro` → Add DNS TXT record → Wait for verification
- **GitHub Secret**: Add `RESEND_API_KEY` in repo Settings → Secrets and variables → Actions
- ~~**Pricing name sync**: Dodo products named "Pro Monthly" ($29) and "Growth Monthly" ($79) while site calls them "Starter" and "Pro". Fix: Rename Dodo products to match site naming — "Starter Monthly" ($29), "Pro Monthly" ($79), "Agency Monthly" ($149)~~ ✅ Done — Dodo products renamed
- ~~**Agency $149/mo in Dodo**: Need to verify DODO_PRODUCT_AGENCY_MONTHLY and DODO_PRODUCT_AGENCY_ANNUAL env vars exist in Supabase Edge Functions. If not, create Agency product in Dodo dashboard and set env vars~~ ✅ User confirmed it exists
