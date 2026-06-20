# ReviewPing — Plan System, Feature Gating & Pricing Page

## Goal
Fix plan system, upgrade flow, premium feature gating, and add standalone pricing page

## Overall Status: 🟢 Ready to Deploy

---

## Completed

### 🟢 Plan System
- Free plan added to PLANS array (id "free", $0, 5 requests/day, 12 feature flags)
- Default plan changed from "growth" to "free" in Signup, AppShell, SQL trigger
- **SQL trigger updated** — `handle_new_user()` sets `plan = 'free'`
- Signup.jsx: `insert` → `upsert` to overwrite trigger's value
- AuthCallback.jsx: `fetchProfile` now creates profile with `plan = 'free'` if none exists

### 🟢 Feature Gating
- `PremiumFeature.jsx` — rewritten: **no blur**, shows upgrade CTA card → opens PricingModal
- `hasFeature()`, `planForFeature()`, `getDailyLimit()` utilities in constants.js
- **Dashboard** — CompetitorRadar, ReputationScore, VelocityInsight gated
- **SendReq** — WhatsApp channel gated (dimmed for free/starter)
- **Automations** — entire page gated
- **BulkSend** — entire page gated
- **ReviewsPage** — AI Reply button gated
- **Integrations** — blocks free + starter
- **Team** — blocks free + starter
- **Daily limit check** in SendReq, BulkSend + edge functions

### 🟢 Pricing Page & Modal
- **`PricingPage.jsx`** — standalone pricing page at `/pricing` with all 4 plans, monthly/annual toggle, "Most Popular" badge on Pro
- **`PricingModal.jsx`** — full-screen overlay modal showing Starter/Pro/Agency plans
- **`PremiumFeature`** opens PricingModal on click
- **Daily limit hit** in SendReq/BulkSend opens PricingModal (not just toast)
- AppShell: `/pricing` route added
- More menu: "Pricing" link added (navigates to pricing page)

### 🟢 Upgrade Flow
- ConfirmModal rendering fixed in Billing.jsx
- DODO_MODE set to "live"
- Agency product IDs set
- create-checkout improved (customer email sent, HTTP status in errors)

### 🟢 Daily Limit Enforcement (Edge Functions)
- `checkDailyLimit()` in `_shared/auth.ts`
- `send-sms`, `send-email`, `send-whatsapp`, `send-review-request` — all enforce limit

## Deployment Instructions
```bash
git add .
git commit -m "feat: standalone pricing page, pricing modal, premium gating, daily limit UX"
git push origin master
npx supabase functions deploy send-sms
npx supabase functions deploy send-email
npx supabase functions deploy send-whatsapp
npx supabase functions deploy send-review-request
npx supabase functions deploy create-checkout
```

## Key URLs
- Live: `https://reviewping.pro`
- Pricing: `https://reviewping.pro/pricing`
- Supabase: `fvugrcqjrtwabaobuigb` (West US)
