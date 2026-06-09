# ReviewPing — Progress Tracker

## Goal
Ship a fully stable review management SaaS.

## Status Overview
| Category | Count |
|----------|-------|
| ✅ Completed | 11 |
| 🟡 In Progress | 0 |
| 🔴 Remaining | 0 |

---

## Subtasks

### 1. ✅ GBP OAuth — Popup+postMessage Flow
**Status:** 🟢 Done  
**What changed:**
- `Integrations.jsx`: Changed from full-page redirect (`window.location.href`) to popup+postMessage flow (`window.open` + `message` event listener). Opens popup synchronously (bypasses popup blockers), Google approves, popup sends postMessage back, closes.
- `gpb-connect/index.ts`: After successful OAuth, returns HTML with `postMessage({ type: "gbp_success" })` and `window.close()` instead of `Response.redirect()`.
- **Why:** Full-page redirect to Google and back was causing SPA to lose the Supabase auth session (redirect chain across different origins was corrupting localStorage session), logging user out.

### 2. ✅ AI Email Writer — Vercel Proxy Fallback
**Status:** 🟢 Done  
**What changed:**
- `vercel.json`: Added rewrite `"/api/edge/(.*)" → "https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/$1"` to proxy edge function requests through the same origin.
- `SendReq.jsx`: Added `callEdgeFn()` helper that tries direct Supabase URL first, and if fetch fails with network error (ad blocker / firewall), falls back to same-origin Vercel proxy path.
- **Why:** Ad blockers and network firewalls were blocking requests to `supabase.co` domain. The same-origin proxy bypasses this.

### 3. ✅ Show Sent Requests + Internal Reviews on Dashboard
**Status:** 🟢 Done  
**Notes:** Dashboard queries `review_requests` and `review_submissions` tables.

### 4. ✅ GBP OAuth Redirect 404 Fix
**Status:** 🟢 Done (superseded by popup flow)

### 5. ✅ Gateway Redirect Fix
**Status:** 🟢 Done  
**Notes:** "Post on Google" button hidden when no GBP link.

### 6. ✅ Analytics Threshold Lowered
**Status:** 🟢 Done

### 7. ✅ SendReq Fallback URL Fixed
**Status:** 🟢 Done

### 8. ✅ All auth-protected edge functions → `--no-verify-jwt`
**Status:** 🟢 Done  
**Notes:** 11 functions redeployed to fix browser preflight OPTIONS blocking.

---

## Deployment Status
| Component | Status | URL |
|-----------|--------|-----|
| Frontend | ✅ Deployed | https://reviewping-eight.vercel.app |
| gpb-connect | ✅ Deployed | Supabase Edge Function |
| Vercel proxy rewrite | ✅ Active | /api/edge/* → Supabase Functions |

## Key Env Vars
| Var | Value |
|-----|-------|
| VITE_API_URL | `https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1` |
| VITE_SUPABASE_URL | `https://fvugrcqjrtwabaobuigb.supabase.co` |
| VITE_SITE_URL | `https://reviewping-eight.vercel.app` |
| SITE_URL (Supabase secret) | Should be `https://reviewping-eight.vercel.app` |

## Remaining / Future
- Purchase `reviewping.pro` domain
- Verify sending domain in Resend dashboard
- Set up Dodo Payments API keys
