# ReviewPing — Infrastructure Deployment Plan

**Author**: Backend Architect
**Date**: 2026-05-16
**Status**: Final — Ready for DevOps Execution

---

## Table of Contents

1. [Pre-Deployment Code Fixes](#1-pre-deployment-code-fixes)
2. [Supabase Project Setup](#2-supabase-project-setup)
3. [Database Migration & Auth Config](#3-database-migration--auth-configuration)
4. [Edge Function Deployment](#4-edge-function-deployment)
5. [Stripe Webhook Configuration](#5-stripe-webhook-configuration)
6. [Frontend API Routing Fix & Deployment](#6-frontend-api-routing-fix--deployment)
7. [Frontend Hosting (Vercel / Netlify / Cloudflare Pages)](#7-frontend-hosting-options)
8. [Custom Domain Setup](#8-custom-domain-setup)
9. [Environment Variable Reference](#9-environment-variable-reference)
10. [Verification Checklist](#10-verification-checklist)

---

## 1. Pre-Deployment Code Fixes

> **⚠️ IMPORTANT**: The following issues MUST be fixed before deploying. Skipping these will cause runtime failures.

### 1.1 API URL Path Mismatch (Critical Bug)

**Problem**: The frontend API client (`src/api/index.js`) calls paths like `/api/ai-write`, but Supabase Edge Functions are served at `/functions/v1/<name>` — no `/api/` prefix. The result would be a 404 on every API call.

**Fix**: Remove the `/api` prefix from all path strings in `src/api/index.js`:

| File | Line | Current Path | Correct Path |
|------|------|-------------|--------------|
| `src/api/index.js` | 17 | `"/api/ai-write"` | `"/ai-write"` |
| `src/api/index.js` | 24 | `"/api/send-sms"` | `"/send-sms"` |
| `src/api/index.js` | 31 | `"/api/send-email"` | `"/send-email"` |
| `src/api/index.js` | 38 | `"/api/create-subscription"` | `"/stripe-webhook"` |

**Note on `createSubscription`**: The function is named `stripe-webhook` (not `create-subscription`), so both the prefix AND the function name need fixing. The function will be renamed to `create-checkout` (see Section 4.4).

### 1.2 Add Vite Dev Proxy (Development-Only)

For local development, add a proxy to `vite.config.js` so `/ai-write`, `/send-sms`, etc. are forwarded to the local Supabase CLI:

```js
// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ai-write': 'http://127.0.0.1:54321',
      '/send-sms': 'http://127.0.0.1:54321',
      '/send-email': 'http://127.0.0.1:54321',
      '/stripe-webhook': 'http://127.0.0.1:54321',
    },
  },
})
```

### 1.3 Add Profile Auto-Creation Trigger (Recommended)

Currently, the profile row is created manually in `Signup.jsx`. This works for email signup but **will fail silently for Google OAuth signups** because the trigger runs after OAuth callback but the frontend code in `Login.jsx:doGoogle()` doesn't insert a profile row.

**Fix**: Add a database trigger that auto-creates a profile row when a new user signs up via Supabase Auth. Add this as migration `002_auto_profile.sql`:

```sql
-- supabase/migrations/002_auto_profile.sql
-- Auto-create profile row when a new user signs up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    'growth'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Trigger fires after insert on auth.users
CREATE OR REPLACE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

### 1.4 Security: Enable JWT Verification on User-Facing Functions

The `config.toml` has `verify_jwt = false` globally, meaning ALL edge functions are publicly accessible:

| Function | Should require auth? | Current | Recommended |
|----------|---------------------|---------|-------------|
| `ai-write` | ✅ Yes | ❌ No auth | Add JWT verification |
| `send-sms` | ✅ Yes | ❌ No auth | Add JWT verification |
| `send-email` | ✅ Yes | ❌ No auth | Add JWT verification |
| `stripe-webhook` (checkout) | ✅ Yes | ❌ No auth | Add JWT verification |
| `stripe-listener` (webhook) | ❌ No (called by Stripe) | ✅ No auth | Keep as-is |

**Option A (per-function)**: Set `verify_jwt = true` globally in `config.toml` and rely on Stripe's webhook signature for the listener function.

**Option B (cleaner)**: Deploy user-facing functions with JWT verification in-code:

```ts
// Add to ai-write, send-sms, send-email, stripe-webhook/index.ts
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseAnonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

// Verify the user is authenticated
const authHeader = req.headers.get("Authorization") || "";
const token = authHeader.replace("Bearer ", "");
const { data: { user }, error: authError } = await supabase.auth.getUser(token);

if (authError || !user) {
  return new Response(JSON.stringify({ error: "Unauthorized" }), {
    status: 401,
    headers: { "Content-Type": "application/json" },
  });
}
```

---

## 2. Supabase Project Setup

### 2.1 Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.
2. Click **"New project"**.
3. Fill in:
   - **Name**: `reviewping` (or `reviewping-prod`)
   - **Database Password**: Generate a strong password and save it immediately in a password manager.
   - **Region**: Choose the closest region to your user base (e.g., `us-east-1`, `eu-west-1`, `ap-southeast-1`).
   - **Pricing Plan**: Start with Free tier; upgrade to Pro ($25/mo) when you exceed 50k monthly active users or 2GB database.
4. Click **"Create new project"**.
5. Wait ~2 minutes for the database and API to provision.

### 2.2 Retrieve Project Credentials

After creation, go to **Project Settings → General → API**:

| Setting | Location | Purpose |
|---------|----------|---------|
| **Project URL** | `https://<project-ref>.supabase.co` | Used as `VITE_SUPABASE_URL` |
| **Anon / Public Key** | `Settings → API → Project API keys → anon public` | Used as `VITE_SUPABASE_ANON_KEY` |
| **Service Role Key** | `Settings → API → Project API keys → service_role` | ⚠️ Secret — used only in Edge Functions (never in frontend!) |

> **Security**: The `anon key` is safe for frontend use — it's protected by RLS. The `service_role key` bypasses RLS and must NEVER be exposed client-side.

### 2.3 Install Supabase CLI

```bash
# Install Supabase CLI (npm)
npm install -g supabase

# Verify installation
supabase --version
```

### 2.4 Initialize Supabase Locally (Optional, for development)

```bash
# In the project root
cd C:\Users\ThinkPad\reviewping
supabase init
supabase start
```

> This is optional — you can deploy directly to production without a local Supabase instance if you prefer.

---

## 3. Database Migration & Auth Configuration

### 3.1 Run the Migration

**Option A — Via Supabase Dashboard (quickest)**:

1. Go to **SQL Editor** in the Supabase Dashboard.
2. Open a new query.
3. Copy the entire contents of `supabase/migrations/001_schema.sql` and paste it.
4. Click **"Run"**.
5. Also run the `002_auto_profile.sql` fix from Section 1.3.

**Option B — Via Supabase CLI (repeatable, recommended)**:

```bash
# Link your local project to the remote Supabase project
supabase link --project-ref <project-ref>

# Push all migrations
supabase db push
```

### 3.2 Configure Email Auth (Password-based)

1. In Supabase Dashboard, go to **Authentication → Providers**.
2. Ensure **Email** is enabled (it's on by default).
3. Configure:
   - **Confirm emails**: ✅ Enabled (users must confirm their email)
   - **Secure email change**: ✅ Enabled
   - **Site URL**: `https://reviewping.io` (your production domain, or `http://localhost:5173` for dev)
   - **Redirect URLs**: Add `https://reviewping.io/**` and `http://localhost:5173/**`
4. SMTP settings (optional but recommended for deliverability):
   - Go to **Authentication → Settings → SMTP Settings**
   - Enable custom SMTP
   - Use Resend SMTP, SendGrid, or AWS SES for better deliverability than Supabase's built-in.

### 3.3 Configure Google OAuth

1. Go to **Authentication → Providers → Google**.
2. Toggle **Enabled**.
3. You need a Google Cloud Console project:
   - Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials)
   - Create an OAuth 2.0 Client ID (Web application type)
   - Add Authorized redirect URI:
     `https://<project-ref>.supabase.co/auth/v1/callback`
   - Copy the **Client ID** and **Client Secret**.
4. Paste them into the Supabase Google provider config.
5. Set **Client ID** and **Client Secret**.

### 3.4 Verify Auth Configuration

```bash
# Quick test — create a user via the API
curl -X POST https://<project-ref>.supabase.co/auth/v1/signup \
  -H "apikey: <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@reviewping.io","password":"Test1234!"}'
```

---

## 4. Edge Function Deployment

### 4.1 Prerequisites

Before deploying any function, you need:

1. **Supabase CLI installed** (see Section 2.3)
2. **Linked to your project**:
   ```bash
   supabase link --project-ref <project-ref>
   ```
3. **Service tokens for external APIs** (see subsections below)

### 4.2 Common: Set Shared Secrets

These secrets are shared across all edge functions:

```bash
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

> **Note**: `SUPABASE_URL` is also used in `listener.ts` (the Stripe webhook handler). Even functions that don't explicitly read it may need it in future.

### 4.3 Deploy `ai-write` (Gemini AI Message Generation)

**Purpose**: Generates personalized SMS review request messages using Google's Gemini 2.0 Flash model.

**Get an API Key**:
1. Go to [https://aistudio.google.com](https://aistudio.google.com)
2. Click **"Get API Key"** in the left sidebar.
3. Click **"Create API Key"**.
4. Copy the key.
5. **Free tier**: 60 requests per minute, enough for production.

**Set secrets and deploy**:
```bash
supabase secrets set GEMINI_API_KEY=<your-gemini-api-key>
supabase functions deploy ai-write --no-verify-jwt
```

**Verify**:
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/ai-write \
  -H "Content-Type: application/json" \
  -d '{"name":"Sarah","service":"dental cleaning","business":"SmileCare Dental"}'
```

### 4.4 Deploy `send-sms` (Twilio SMS)

**Purpose**: Sends an SMS review request via Twilio.

**Get Twilio credentials**:
1. Sign up at [https://twilio.com](https://twilio.com) (free trial available).
2. Go to **Console Dashboard**.
3. Copy **Account SID** and **Auth Token**.
4. Go to **Phone Numbers → Manage → Buy a Number** (or use a trial number).
5. Copy the phone number (format: `+1234567890`).

**Set secrets and deploy**:
```bash
supabase secrets set TWILIO_ACCOUNT_SID=<your-account-sid>
supabase secrets set TWILIO_AUTH_TOKEN=<your-auth-token>
supabase secrets set TWILIO_PHONE_NUMBER=<your-twilio-number>
supabase functions deploy send-sms --no-verify-jwt
```

**Verify**:
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/send-sms \
  -H "Content-Type: application/json" \
  -d '{"to":"+1234567890","message":"Hi Sarah, how was your visit? Leave a review: [LINK]"}'
```

### 4.5 Deploy `send-email` (Resend Email)

**Purpose**: Sends an email review request via Resend.

**Get Resend credentials**:
1. Sign up at [https://resend.com](https://resend.com) (free tier: 100 emails/day).
2. Go to **API Keys** and create a new key.
3. Verify a domain or use the sandbox domain for testing.
4. Copy the API key and verified "from" email address.

**Set secrets and deploy**:
```bash
supabase secrets set RESEND_API_KEY=<your-resend-api-key>
supabase secrets set FROM_EMAIL=reviews@reviewping.io
supabase functions deploy send-email --no-verify-jwt
```

**Verify**:
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/send-email \
  -H "Content-Type: application/json" \
  -d '{"to":"test@example.com","subject":"How was your visit?","message":"Leave a review: [LINK]"}'
```

### 4.6 Deploy `stripe-webhook` → Rename to `create-checkout`

**Purpose**: Creates a Stripe Checkout Session for subscription payments.

**Important**: The directory `supabase/functions/stripe-webhook/` contains TWO entry points:
- `index.ts` — Creates checkout sessions (called from frontend)
- `listener.ts` — Handles Stripe webhook events (called by Stripe)

Supabase only deploys `index.ts` per function. The listener must be deployed separately.

**Recommended**: Rename the checkout creator to `create-checkout` for clarity:

```bash
# Rename the directory
mv supabase/functions/stripe-webhook supabase/functions/create-checkout

# Or keep the directory and deploy as-is:
# The frontend calls it at /stripe-webhook — update src/api/index.js accordingly
```

**Get Stripe credentials**:
1. Sign up at [https://stripe.com](https://stripe.com).
2. Go to **Developers → API Keys**.
3. Copy **Secret Key** (starts with `sk_live_` for production, `sk_test_` for testing).
4. Go to **Products** and create subscription products/price IDs.

**Set secrets and deploy**:
```bash
supabase secrets set STRIPE_SECRET_KEY=<your-stripe-secret-key>
supabase functions deploy create-checkout --no-verify-jwt
```

### 4.7 Deploy `stripe-listener` (Stripe Webhook Handler)

**Purpose**: Listens for Stripe webhook events (checkout completed, subscription updated/cancelled) and syncs them to the database.

**This is the listener.ts file** — deploy it as a separate function:

```bash
# The file is at supabase/functions/stripe-webhook/listener.ts
# We need to create a new function directory

mkdir -p supabase/functions/stripe-listener
cp supabase/functions/stripe-webhook/listener.ts supabase/functions/stripe-listener/index.ts

# Set secrets (already have STRIPE_SECRET_KEY and SUPABASE_* from above)
supabase secrets set STRIPE_WEBHOOK_SECRET=<stripe-webhook-secret>

# Deploy
supabase functions deploy stripe-listener
```

**Get the webhook secret**:
1. In Stripe Dashboard, go to **Developers → Webhooks**.
2. Click **"Add endpoint"**.
3. Endpoint URL: `https://<project-ref>.supabase.co/functions/v1/stripe-listener`
4. Select events to listen for:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Click **"Add endpoint"**.
6. Copy the **Signing secret** (`whsec_...`).
7. Set: `supabase secrets set STRIPE_WEBHOOK_SECRET=<signing-secret>`

**Verify**:
```bash
# Test via Stripe CLI
stripe trigger checkout.session.completed
# Check the function logs in Supabase Dashboard
```

### 4.8 Plan ID Configuration

In `stripe-listener/index.ts`, update the `PLAN_MAP` object with your actual Stripe price IDs:

```typescript
function getPlanNameFromPriceId(priceId: string | undefined): string {
  const PLAN_MAP: Record<string, string> = {
    "price_growth_monthly": "growth",
    "price_pro_monthly": "pro",
    "price_enterprise_yearly": "enterprise",
    // Add more as needed
  };
  return priceId && PLAN_MAP[priceId] ? PLAN_MAP[priceId] : "growth";
}
```

### 4.9 Edge Function Summary

| Function | Directory | Purpose | Deploy Command | JWT Verify |
|----------|-----------|---------|---------------|------------|
| `ai-write` | `supabase/functions/ai-write/` | Generate AI review SMS | `supabase functions deploy ai-write --no-verify-jwt` | Should add |
| `send-sms` | `supabase/functions/send-sms/` | Send SMS via Twilio | `supabase functions deploy send-sms --no-verify-jwt` | Should add |
| `send-email` | `supabase/functions/send-email/` | Send email via Resend | `supabase functions deploy send-email --no-verify-jwt` | Should add |
| `create-checkout` | `supabase/functions/create-checkout/` | Create Stripe checkout | `supabase functions deploy create-checkout --no-verify-jwt` | Should add |
| `stripe-listener` | `supabase/functions/stripe-listener/` | Stripe webhook handler | `supabase functions deploy stripe-listener` | ❌ No (Stripe calls it) |

---

## 5. Stripe Webhook Configuration

### 5.1 Production Webhook Endpoint

1. Stripe Dashboard → **Developers → Webhooks** → **Add endpoint**.
2. **Endpoint URL**: `https://<project-ref>.supabase.co/functions/v1/stripe-listener`
3. **Events**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **API version**: Use the latest stable version.
5. Click **"Add endpoint"** → copy the **Signing secret**.
6. Set the secret:
   ```bash
   supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
   ```

### 5.2 Test Mode vs. Live Mode

- Use **test mode** (`sk_test_...`) during development and staging.
- Switch to **live mode** (`sk_live_...`) only when ready to accept real payments.
- The `STRIPE_WEBHOOK_SECRET` also differs between test and live.

### 5.3 Price ID Mapping

Update the `PLAN_MAP` in `stripe-listener/index.ts` with your actual Stripe price IDs before going live. Example for a SaaS with three tiers:

```typescript
const PLAN_MAP: Record<string, string> = {
  "price_1ABC123GrowthMonthly": "growth",
  "price_1ABC123ProMonthly": "pro",
  "price_1ABC123EnterpriseYearly": "enterprise",
};
```

---

## 6. Frontend API Routing Fix & Deployment

### 6.1 The Bug Report

When you set `VITE_API_URL=https://<project-ref>.supabase.co/functions/v1`, the API client resolves:

```
VITE_API_URL + "/api/ai-write" = https://<project>.supabase.co/functions/v1/api/ai-write
```

But the actual endpoint is:

```
https://<project>.supabase.co/functions/v1/ai-write
```

**Result**: All API calls return 404.

### 6.2 The Fix

Edit `src/api/index.js` — remove `/api` prefix from all paths:

```javascript
const API_BASE = import.meta.env.VITE_API_URL || "";

async function api(path, options = {}) {
  const url = `${API_BASE}${path}`;
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json", ...options.headers },
    ...options,
  });
  if (!res.ok) {
    const err = await res.text();
    throw new Error(err || `API error: ${res.status}`);
  }
  return res.json();
}

export function aiWriteMessage({ name, service, business }) {
  return api("/ai-write", {            // ← was "/api/ai-write"
    method: "POST",
    body: JSON.stringify({ name, service, business }),
  });
}

export function sendSMS({ to, message }) {
  return api("/send-sms", {            // ← was "/api/send-sms"
    method: "POST",
    body: JSON.stringify({ to, message }),
  });
}

export function sendEmail({ to, subject, message }) {
  return api("/send-email", {          // ← was "/api/send-email"
    method: "POST",
    body: JSON.stringify({ to, subject, message }),
  });
}

export function createSubscription(priceId) {
  return api("/create-checkout", {     // ← was "/api/create-subscription" → now maps to create-checkout function
    method: "POST",
    body: JSON.stringify({ price_id: priceId }),
  });
}
```

### 6.3 Update .env.example

Update the example to reflect the corrected paths:

```env
# Supabase
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...

# Edge Functions Base URL — no trailing slash, no /api prefix
VITE_API_URL=https://<project-ref>.supabase.co/functions/v1
```

### 6.4 Important: Why This Works

The request flow will be:

```
Frontend → fetch("https://<ref>.supabase.co/functions/v1/ai-write", { ... })
        → Supabase Edge Functions Router → ai-write/index.ts (Deno)
        → Returns JSON response
```

---

## 7. Frontend Hosting Options

### 7.1 Option A: Vercel (Recommended)

**Why Vercel**: Best Vite/React integration, automatic HTTPS, instant rollbacks, preview deployments.

**Steps**:

1. Push the repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com](https://vercel.com) → **Add New Project**.
3. Import the `reviewping` repository.
4. Configure:

| Setting | Value |
|---------|-------|
| **Framework Preset** | Vite |
| **Build Command** | `npm run build` |
| **Output Directory** | `dist` |
| **Install Command** | `npm install` |
| **Root Directory** | `./` |

5. Add environment variables:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<anon-key>` |
| `VITE_API_URL` | `https://<project-ref>.supabase.co/functions/v1` |

6. Deploy.

**SPA Fallback**: Vercel automatically handles SPA routing via `vercel.json`. Create one if needed:

```json
{
  "rewrites": [
    { "source": "/(.*)", "destination": "/index.html" }
  ]
}
```

### 7.2 Option B: Netlify

**Steps**:

1. Push repo → Netlify → **Add new site** → Import from Git.
2. Configure:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Publish directory** | `dist` |

3. Add the same environment variables as Vercel (Section 7.1, step 5).
4. Deploy.

**SPA Fallback**: Netlify needs a `public/_redirects` file:

```
/*    /index.html    200
```

Create this file at `public/_redirects` so it gets copied to `dist/_redirects` during build.

### 7.3 Option C: Cloudflare Pages

**Steps**:

1. Push repo → Cloudflare Dashboard → **Pages** → **Create a project** → Connect to Git.
2. Configure:

| Setting | Value |
|---------|-------|
| **Build command** | `npm run build` |
| **Build output** | `dist` |

3. Add the same environment variables.
4. Deploy.

**SPA Fallback**: Cloudflare Pages supports it via a `_routes.json` or `_redirects` file:

```json
{
  "version": 1,
  "include": ["/*"],
  "exclude": []
}
```

### 7.4 Environment Variables Summary (Frontend)

| Var | Where to get | Required | Notes |
|-----|-------------|----------|-------|
| `VITE_SUPABASE_URL` | Supabase Dashboard → Settings → API | ✅ | Starts with `https://` |
| `VITE_SUPABASE_ANON_KEY` | Supabase Dashboard → Settings → API | ✅ | Starts with `eyJ...` |
| `VITE_API_URL` | Construct: `https://<ref>.supabase.co/functions/v1` | ✅ | Ends with `/functions/v1` — no trailing slash |

---

## 8. Custom Domain Setup

### 8.1 Supabase Auth Domain (Optional but Recommended)

For production, configure a custom domain for Supabase Auth to avoid "redirect to supabase.co" issues:

1. Supabase Dashboard → **Authentication → Settings**.
2. Under **Site URL**, set `https://reviewping.io`.
3. Under **Redirect URLs**, add:
   - `https://reviewping.io/**`
   - `https://reviewping.com/**` (if you have alternate domains)

### 8.2 Frontend Domain (Vercel Example)

**Buy or use existing domain**:

1. Buy from Namecheap, Cloudflare, or wherever you manage DNS.
2. In Vercel Dashboard → Project → **Domains**.
3. Add `reviewping.io`.
4. Follow Vercel's DNS instructions:

**DNS Records needed**:

| Type | Name | Value | Notes |
|------|------|-------|-------|
| CNAME | `@` (apex) | `cname.vercel-dns.com` | If using Vercel's apex domain handling |
| CNAME | `www` | `cname.vercel-dns.com` | WWW redirect |
| TXT | `@` | `verification-code` | Only if Vercel requires domain verification |

**Alternative (Cloudflare DNS)**:

| Type | Name | Value |
|------|------|-------|
| A | `@` | `76.76.21.21` (Vercel's IP) |
| A | `@` | `76.76.21.98` (Vercel's IP) |
| CNAME | `www` | `cname.vercel-dns.com` |

### 8.3 Stripe Domain Registration

Register your domain in Stripe to avoid payment authentication issues:

1. Stripe Dashboard → **Settings → Payment methods → Card payments**.
2. Under **"Authorize payments with 3D Secure"**, add `reviewping.io`.
3. Repeat in Stripe test mode and live mode.

### 8.4 Resend Domain Verification

1. Resend Dashboard → **Domains** → **Add Domain**.
2. Add `reviewping.io`.
3. Add the provided DNS TXT/DKIM records:

| Type | Name | Value |
|------|------|-------|
| TXT | `reviewping.io` | `"resend-domain-verification=..."` |
| CNAME | `dkim._domainkey.reviewping.io` | `dkim.resend.com` |

4. Wait for DNS propagation (~10 minutes) then click **Verify**.

---

## 9. Environment Variable Reference

### 9.1 Edge Function Secrets (Set via `supabase secrets set`)

| Secret | Source | Used By | Required |
|--------|--------|---------|----------|
| `SUPABASE_URL` | Supabase Dashboard → Settings → API | All functions | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase Dashboard → Settings → API (service_role) | `stripe-listener` | ✅ |
| `GEMINI_API_KEY` | [aistudio.google.com](https://aistudio.google.com) | `ai-write` | ✅ |
| `TWILIO_ACCOUNT_SID` | [twilio.com/console](https://twilio.com/console) | `send-sms` | ✅ |
| `TWILIO_AUTH_TOKEN` | [twilio.com/console](https://twilio.com/console) | `send-sms` | ✅ |
| `TWILIO_PHONE_NUMBER` | Twilio → Phone Numbers | `send-sms` | ✅ |
| `RESEND_API_KEY` | [resend.com/api-keys](https://resend.com/api-keys) | `send-email` | ✅ |
| `FROM_EMAIL` | Resend → Domains (verified domain) | `send-email` | ✅ |
| `STRIPE_SECRET_KEY` | [stripe.com](https://stripe.com) → Developers → API Keys | `create-checkout`, `stripe-listener` | ✅ |
| `STRIPE_WEBHOOK_SECRET` | Stripe → Webhooks → Signing secret | `stripe-listener` | ✅ |

### 9.2 Frontend Environment Variables (Set in hosting dashboard)

| Variable | Example Value | Set In |
|----------|--------------|--------|
| `VITE_SUPABASE_URL` | `https://abcdefghijk.supabase.co` | Vercel/Netlify/Cloudflare Dashboard |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIs...` | Vercel/Netlify/Cloudflare Dashboard |
| `VITE_API_URL` | `https://abcdefghijk.supabase.co/functions/v1` | Vercel/Netlify/Cloudflare Dashboard |

### 9.3 Cost Summary

| Service | Free Tier | Paid Tier (when you outgrow free) |
|---------|-----------|-----------------------------------|
| **Supabase** | 2 projects, 500MB DB, 50k MAU | Pro: $25/mo — 8GB DB, 100k MAU |
| **Google Gemini** | 60 req/min (free) | Pay-as-you-go after quota |
| **Twilio** | Trial credit ~$15 | ~$0.0079/SMS (~$8/1000 SMS) |
| **Resend** | 100 emails/day | Growth: $15/mo — 50k emails/mo |
| **Stripe** | No monthly fee | 2.9% + $0.30 per transaction |
| **Vercel** | 100GB bandwidth, 6000 build mins | Pro: $20/mo |
| **Domain** | N/A | ~$10-15/year (.io) |

---

## 10. Verification Checklist

### Pre-Deployment
- [ ] Fix API path prefixes in `src/api/index.js` (remove `/api`)
- [ ] Rename `stripe-webhook` call to `create-checkout` in frontend
- [ ] Add Vite dev proxy to `vite.config.js`
- [ ] Add profile auto-creation trigger (`002_auto_profile.sql`)
- [ ] Consider adding JWT verification to user-facing functions
- [ ] Update `PLAN_MAP` in `stripe-listener/index.ts` with real price IDs
- [ ] Create `stripe-listener` directory (copy from `listener.ts`)

### Supabase Setup
- [ ] Supabase project created
- [ ] Migration `001_schema.sql` executed
- [ ] Migration `002_auto_profile.sql` executed
- [ ] Email auth provider configured
- [ ] Google OAuth configured (client ID + secret)
- [ ] Site URL and redirect URLs set
- [ ] Supabase URL, anon key, service_role key saved

### Edge Functions
- [ ] `ai-write` deployed and tested
- [ ] `send-sms` deployed and tested
- [ ] `send-email` deployed and tested
- [ ] `create-checkout` deployed and tested
- [ ] `stripe-listener` deployed and tested
- [ ] All required secrets set (`supabase secrets list` to verify)

### Stripe
- [ ] Stripe account created (test mode first)
- [ ] Products and price IDs created
- [ ] Webhook endpoint configured → `stripe-listener`
- [ ] Webhook signing secret saved to `STRIPE_WEBHOOK_SECRET`
- [ ] Price IDs mapped in `PLAN_MAP`
- [ ] Domain registered in Stripe settings

### Frontend Deployment
- [ ] `VITE_SUPABASE_URL` set
- [ ] `VITE_SUPABASE_ANON_KEY` set
- [ ] `VITE_API_URL` set
- [ ] Build succeeds: `npm run build`
- [ ] SPA fallback configured (`_redirects` or `vercel.json`)
- [ ] Deployed to hosting provider

### Post-Deployment
- [ ] Can create an account (email signup)
- [ ] Can sign in with Google OAuth
- [ ] Profile auto-created after signup
- [ ] AI message generation works (test with a contact)
- [ ] SMS sending works
- [ ] Email sending works
- [ ] Subscription checkout flow works
- [ ] Stripe webhook syncs subscription to database
- [ ] All API calls return 200 (not 404)
- [ ] Custom domain resolves
- [ ] HTTPS is active

---

## Appendix A: Deployment Commands Cheat Sheet

```bash
# === SUPABASE CLI ===
supabase login
supabase link --project-ref <ref>
supabase db push                                          # Run all migrations
supabase functions list                                   # List deployed functions
supabase secrets list                                     # List all secrets

# === DEPLOY ALL FUNCTIONS ===
supabase secrets set SUPABASE_URL=https://<ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<key>

supabase secrets set GEMINI_API_KEY=<key>
supabase functions deploy ai-write --no-verify-jwt

supabase secrets set TWILIO_ACCOUNT_SID=<sid>
supabase secrets set TWILIO_AUTH_TOKEN=<token>
supabase secrets set TWILIO_PHONE_NUMBER=<number>
supabase functions deploy send-sms --no-verify-jwt

supabase secrets set RESEND_API_KEY=<key>
supabase secrets set FROM_EMAIL=<email>
supabase functions deploy send-email --no-verify-jwt

supabase secrets set STRIPE_SECRET_KEY=<key>
supabase functions deploy create-checkout --no-verify-jwt

supabase secrets set STRIPE_WEBHOOK_SECRET=<whsec_...>
supabase functions deploy stripe-listener

# === DEPLOY FRONTEND ===
npm install
npm run build
# Upload dist/ to hosting provider or git push (auto-deploy)

# === LOGS & DEBUGGING ===
supabase functions logs ai-write
curl -X POST https://<ref>.supabase.co/functions/v1/ai-write \
  -H "Content-Type: application/json" \
  -d '{"name":"Test","service":"test"}'
```

---

## Appendix B: Architecture Diagram

```
┌─────────────────────────────────────────────────────────┐
│                    Browser (SPA)                         │
│  ┌──────────────────────────────────────────────────┐   │
│  │  React App                                       │   │
│  │  src/api/index.js  ────  VITE_API_URL + "/..."   │   │
│  │  src/config/supabase.js ─── direct Supabase SDK │   │
│  └──────────────────────────────────────────────────┘   │
└──────────────────────┬──────────────────────────────────┘
                       │
         ┌─────────────┼──────────────────────┐
         │             │                      │
         ▼             ▼                      ▼
┌────────────────┐ ┌──────────────────┐ ┌──────────────────────┐
│ Supabase Auth  │ │ Edge Functions   │ │ Supabase Database    │
│ (email/Google)  │ │ (Deno)           │ │ (PostgreSQL + RLS)  │
│                │ │                  │ │                      │
│ auth.users     │ │ /ai-write        │ │ profiles             │
│ auth.identities│ │ → Gemini API     │ │ reviews              │
│ auth.sessions  │ │                  │ │ contacts             │
│                │ │ /send-sms        │ │ templates            │
│                │ │ → Twilio API     │ │ business_settings    │
│                │ │                  │ │ notifications        │
│                │ │ /send-email      │ │ team_members         │
│                │ │ → Resend API     │ │ subscriptions        │
│                │ │                  │ │                      │
│                │ │ /create-checkout │ │ ← RLS enforced       │
│                │ │ → Stripe API     │ │ ← Indexed for perf   │
│                │ │                  │ │                      │
│                │ │ /stripe-listener │ │                      │
│                │ │ ← Stripe Webhook │ │                      │
└────────────────┘ └──────────────────┘ └──────────────────────┘
                              │
                              ▼
                     ┌──────────────────┐
                     │ External APIs    │
                     │                  │
                     │ Gemini (AI)      │
                     │ Twilio (SMS)     │
                     │ Resend (Email)   │
                     │ Stripe (Payment) │
                     └──────────────────┘
```

---

## Appendix C: Recommended Directory Structure After Fixes

```
reviewping/
├── supabase/
│   ├── migrations/
│   │   ├── 001_schema.sql           ✅ Existing (8 tables + RLS + indexes)
│   │   └── 002_auto_profile.sql     🆕 Add this (trigger for user signup)
│   ├── functions/
│   │   ├── ai-write/index.ts
│   │   ├── send-sms/index.ts
│   │   ├── send-email/index.ts
│   │   ├── create-checkout/index.ts  🆕 (renamed from stripe-webhook)
│   │   └── stripe-listener/index.ts  🆕 (copied from listener.ts)
│   ├── config.toml
│   └── import_map.json
├── src/
│   ├── api/
│   │   └── index.js                  🔧 Fix API paths
│   ├── config/
│   │   └── supabase.js
│   ├── hooks/
│   │   └── useSupabaseArray.js
│   └── App.jsx
├── vite.config.js                    🔧 Add dev proxy
├── .env.example                      🔧 Update to reflect fixes
├── vercel.json                       🆕 (if using Vercel)
│   OR
├── public/_redirects                 🆕 (if using Netlify)
└── package.json
```

---

*End of Deployment Plan. Ready for DevOps execution.*
