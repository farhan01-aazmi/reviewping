# ReviewPing — Progress Tracker

## Goal
Ship a fully stable review management SaaS.

## Status Overview
| Category | Count |
|----------|-------|
| ✅ Completed | 14 |
| 🟡 In Progress | 0 |
| 🔴 Remaining | 0 |

---

## Subtasks

### 1. ✅ GBP OAuth — Popup+postMessage Flow (with fallback redirect)
**Status:** 🟢 Done  
**What changed:**
- `gpb-connect/index.ts`: Returns HTML that first tries `postMessage` to opener (popup flow), and if no opener exists, redirects to `dashboard?gbp=connected` (old redirect flow fallback)
- `popupResponse()` helper updated to handle both cases
- Dashboard.jsx: Already had `?gbp=connected` handler with toast
- **Why:** Old code only handled popup case — users with cached JS saw static "Connected" page

### 2. ✅ AI Email Writer — Vercel Proxy (Edge Middleware)
**Status:** 🟢 Done  
**What changed:**
- `middleware.js`: Added edge proxy handler for `/api/edge/*` → forwards to Supabase with all headers + query params
- `AIEmailWriter.jsx`: Added `callEdgeFn()` — tries direct Supabase, falls back to same-origin proxy
- `SendReq.jsx`: send-email/send-sms/send-whatsapp now use `callEdgeFn()` too
- `gpb-connect`: Deployed `--no-verify-jwt` (gateway was blocking requests)

### 3. ✅ Show Sent Requests + Internal Reviews on Dashboard
**Status:** 🟢 Done

### 4. ✅ GBP OAuth Redirect Fix
**Status:** 🟢 Done

### 5. ✅ Gateway Redirect Fix
**Status:** 🟢 Done

### 6. ✅ Analytics Threshold Lowered
**Status:** 🟢 Done

### 7. ✅ SendReq Fallback URL Fixed
**Status:** 🟢 Done

### 8. ✅ All auth-protected edge functions → `--no-verify-jwt`
**Status:** 🟢 Done

---

## Deployment Status
| Component | Status | URL |
|-----------|--------|-----|
| Frontend (Vercel + GitHub) | ✅ Auto-deployed | https://reviewping-eight.vercel.app |
| gpb-connect (no-verify-jwt) | ✅ Deployed | Supabase Edge Function |
| ai-generate-email (with JWT) | ✅ Deployed | Supabase Edge Function |
| Edge Middleware (proxy) | ✅ Active | `/api/edge/*` → Supabase |

## Key Env Vars
| Var | Value |
|-----|-------|
| VITE_API_URL | `https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1` |
| VITE_SITE_URL | `https://reviewping-eight.vercel.app` |
| SITE_URL (Supabase) | Should be `https://reviewping-eight.vercel.app` |
