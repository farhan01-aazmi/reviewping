# ReviewPing — Production Launch Pipeline 🚀

**Goal:** SaaS-launch ready by this week. Production-grade deployment with Supabase, edge functions, and frontend.

---

## Overall Progress

| Phase | Status | Key Result |
|-------|--------|------------|
| **Phase 1: Project Audit** | 🟢 Done | 56 source files, build passes, gaps identified |
| **Phase 2: Security Fixes** | 🟢 Done | 3 CRITICAL, 5 HIGH, 4 MEDIUM issues fixed |
| **Phase 3: Infrastructure** | 🟢 Done | .env, deploy scripts, stripe split, vercel/netlify config |
| **Phase 4: Build Optimization** | 🟢 Done | 859KB→76KB app shell (↓91%), 31 chunks, 0 warnings |
| **Phase 5: Testing & QA** | 🟡 In Progress | API test + screenshot collection underway |
| **Phase 6: Deployment** | 🔴 Not Started | Run deploy script → Vercel/Netlify |
| **Phase 7: Documentation** | 🟡 In Progress | README rewrite underway |
| **Phase 8: Production Sign-off** | 🔴 Not Started | Reality Checker audit pending |

---

## Completed Tasks

### Phase 1: Project Audit 🟢
- [x] File structure analyzed (56 source files, modular)
- [x] Build verified (passes, 5.85s, 860 KB)
- [x] Gaps identified: no .env, no git, no tests, no deployment, chunk size issue

### Phase 2: Security Fixes 🟢
- [x] **Git initialized** — commit `2597f1c`, 75 files
- [x] **CRIT-1: JWT verification** — per-function `verify_jwt = true` (ai-write, send-sms, send-email, create-checkout), stripe-listener stays false
- [x] **CRIT-2: Billing bypass** — plan upgrades now route through Stripe Checkout, not client-side DB write
- [x] **CRIT-3: Auth token** — `src/api/index.js` now sends `Authorization: Bearer` token
- [x] **HIGH-1: User ID injection** — stripe-checkout extracts `user_id` from JWT, not request body
- [x] **HIGH-2: Error leakage** — all 5 edge functions sanitize error messages
- [x] **HIGH-3: Email confirmation** — signup flow handles null user gracefully
- [x] **MED-1: DELETE policy** — added for notifications
- [x] **MED-2: PLAN_MAP** — logging for unknown price IDs
- [x] **MED-3: API paths** — fixed `/api/` prefix mismatch
- [x] **Migration 002** — RLS fix for plan changes + auto-profile trigger for Google OAuth

### Phase 3: Infrastructure Setup 🟢
- [x] `.env` created with placeholder values
- [x] `.env.local` for local development (localhost:54321)
- [x] `scripts/deploy.sh` + `scripts/deploy.ps1` — 6-step automated pipeline
- [x] `vercel.json` — SPA fallback config for Vercel
- [x] `public/_redirects` — SPA fallback for Netlify
- [x] Stripe split: `create-checkout` (JWT auth) + `stripe-listener` (HMAC auth)
- [x] `supabase/config.toml` — updated with all 5 functions and auth settings

### Phase 4: Build Optimization 🟢
- [x] React.lazy + Suspense for all 20 page components
- [x] Rolldown code splitting: vendor-react, vendor-supabase, vendor-recharts, vendor-other
- [x] Performance: font preconnect + non-blocking from `<head>`
- [x] Build config: `reportCompressedSize`, `sourcemap: false`, `chunkSizeWarningLimit: 250`
- [x] **Result: 31 chunks, 0 warnings, 2.38s build time**
- [x] **App shell: 76 KB (↓91%), recharts (234 KB) only on Analytics view**

---

## Chunk Summary (Production Build)

| Chunk | Size | Gzip | Loaded |
|-------|------|------|--------|
| **index.html** | 1.81 kB | 0.71 kB | 🟢 Every page |
| **App shell** | 75.85 kB | 21.12 kB | 🟢 Every page |
| **vendor-react** | 132.53 kB | 43.09 kB | 🟢 Every page |
| **vendor-supabase** | 190.36 kB | 48.60 kB | 🟢 Auth pages |
| **vendor-other** | 149.74 kB | 49.15 kB | 🟢 Across pages |
| **vendor-recharts** | 234.93 kB | 60.61 kB | 🟡 Analytics only |
| **20 page chunks** | 1.8-7.0 kB each | — | 🟢 On demand |

---

## Environment Variables Needed

### Frontend (.env)
```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_API_URL=https://your-project.supabase.co/functions/v1
```

### Edge Function Secrets
| Secret | Source | Cost |
|--------|--------|------|
| GEMINI_API_KEY | aistudio.google.com | Free tier |
| TWILIO_ACCOUNT_SID | twilio.com | Pay per SMS |
| TWILIO_AUTH_TOKEN | twilio.com | — |
| TWILIO_PHONE_NUMBER | twilio.com | — |
| RESEND_API_KEY | resend.com | Free tier (100/day) |
| FROM_EMAIL | your domain | — |
| STRIPE_SECRET_KEY | stripe.com | Pay per transaction |
| STRIPE_WEBHOOK_SECRET | Stripe webhooks | — |
| SUPABASE_URL | Supabase dashboard | — |
| SUPABASE_SERVICE_ROLE_KEY | Supabase dashboard | — |

---

## Deployment Steps

```bash
# 1. Create Supabase project & get keys
# 2. Run migrations
cd supabase && supabase db push

# 3. Deploy edge functions
cd .. && npm run deploy:all

# 4. Set secrets
npx supabase secrets set GEMINI_API_KEY=...

# 5. Build frontend
npm run build

# 6. Deploy to Vercel/Netlify
#    Vercel: npx vercel --prod
#    Netlify: npx netlify deploy --prod
```

---

## Stats
- **Source files:** ~70
- **Edge Functions:** 5 (ai-write, send-sms, send-email, create-checkout, stripe-listener)
- **Database tables:** 8 + auth.users
- **Build chunks:** 31
- **Build time:** 2.38s
- **Git commits:** 3
