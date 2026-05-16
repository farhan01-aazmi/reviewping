# Supabase Setup Guide

This guide walks through setting up the full Supabase backend for ReviewPing — from creating a project to deploying edge functions and configuring auth.

---

## Table of Contents

1. [Prerequisites](#1-prerequisites)
2. [Create a Supabase Project](#2-create-a-supabase-project)
3. [Retrieve Project Credentials](#3-retrieve-project-credentials)
4. [Install the Supabase CLI](#4-install-the-supabase-cli)
5. [Run Database Migrations](#5-run-database-migrations)
6. [Configure Authentication](#6-configure-authentication)
7. [Deploy Edge Functions](#7-deploy-edge-functions)
8. [Configure Stripe Webhooks](#8-configure-stripe-webhooks)
9. [Update Plan ID Mapping](#9-update-plan-id-mapping)
10. [Verification Checklist](#10-verification-checklist)
11. [Troubleshooting](#11-troubleshooting)
12. [Cheat Sheet](#12-cheat-sheet)

---

## 1. Prerequisites

Before you begin, make sure you have:

- [ ] A [Supabase account](https://supabase.com) (free tier works for development)
- [ ] [Node.js](https://nodejs.org) 18+ installed
- [ ] [npm](https://npmjs.com) 9+ installed
- [ ] [Git](https://git-scm.com) installed
- [ ] The ReviewPing repository cloned locally

You'll also need accounts for the external services (optional — you can deploy functions later):

| Service | Required For | Free Tier |
|---------|-------------|-----------|
| [Google AI Studio](https://aistudio.google.com) | `ai-write` function (Gemini AI) | 60 req/min |
| [Twilio](https://twilio.com) | `send-sms` function (SMS) | ~$15 trial credit |
| [Resend](https://resend.com) | `send-email` function (Email) | 100 emails/day |
| [Stripe](https://stripe.com) | `create-checkout` + `stripe-listener` (Payments) | No monthly fee |

---

## 2. Create a Supabase Project

1. Go to [https://supabase.com/dashboard](https://supabase.com/dashboard) and sign in.

2. Click **New project**.

3. Fill in the project details:

   | Field | Value |
   |-------|-------|
   | **Name** | `reviewping` (or `reviewping-prod`) |
   | **Database Password** | Generate a strong password and save it in a password manager immediately |
   | **Region** | Choose the region closest to your user base (e.g., `us-east-1`, `eu-west-1`, `ap-southeast-1`) |
   | **Pricing Plan** | Free tier to start; upgrade to Pro ($25/mo) when you exceed 50k MAU or 2GB database |

4. Click **Create new project**.

5. Wait approximately 2 minutes for the database and API to provision.

> **⚠️ Important**: Save the database password. You'll need it later to link the project with the Supabase CLI.

---

## 3. Retrieve Project Credentials

After the project is created, go to **Project Settings → General → API**.

You need three credentials:

| Credential | Location | Purpose | Security |
|------------|----------|---------|----------|
| **Project URL** | `Settings → API → Project URL` | Used as `VITE_SUPABASE_URL` in the frontend | Public |
| **Anon / Public Key** | `Settings → API → Project API keys → anon public` | Used as `VITE_SUPABASE_ANON_KEY` in the frontend | Public (protected by RLS) |
| **Service Role Key** | `Settings → API → Project API keys → service_role` | Used in `stripe-listener` edge function | 🔴 SECRET — never expose to the client |

### Set Up Local Environment Variables

Copy these into your `.env` file:

```env
VITE_SUPABASE_URL=https://<project-ref>.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
VITE_API_URL=https://<project-ref>.supabase.co/functions/v1
```

> The `VITE_API_URL` is constructed as `{Project URL}/functions/v1`. No trailing slash.

---

## 4. Install the Supabase CLI

The Supabase CLI is required for running database migrations, deploying edge functions, and managing secrets.

```bash
# Install globally via npm
npm install -g supabase

# Verify the installation
supabase --version
```

Expected output: `v2.x.x` or similar.

### (Optional) Local Supabase Development

For local development that doesn't hit your production database:

```bash
# Initialize Supabase configuration (already done if supabase/ exists)
supabase init

# Start the local Supabase stack (requires Docker)
supabase start

# Stop when done
supabase stop
```

Local Supabase gives you a full Postgres database, auth server, and edge function runtime running on your machine at `http://127.0.0.1:54321`.

---

## 5. Run Database Migrations

ReviewPing uses SQL migrations to manage the database schema. Two migration files exist in `supabase/migrations/`:

| File | Description |
|------|-------------|
| `001_schema.sql` | Creates 8 tables (`profiles`, `reviews`, `contacts`, `templates`, `business_settings`, `notifications`, `team_members`, `subscriptions`) with RLS policies and indexes |
| `002_fixes.sql` | Adds security fixes (prevents client-side plan changes), profile auto-creation trigger for OAuth, and additional indexes |

### Database Schema Overview

```
profiles (extends auth.users)
├── id            UUID (PK, FK → auth.users)
├── email         TEXT
├── name          TEXT
├── business_name TEXT
├── plan          TEXT (default: 'growth')
└── created_at    TIMESTAMPTZ

reviews
├── id            BIGINT (PK)
├── user_id       UUID (FK → profiles)
├── name          TEXT
├── service       TEXT
├── rating        INT (1-5)
├── text          TEXT
├── status        TEXT (default: 'pending')
├── channel       TEXT
├── sentAt        TIMESTAMPTZ
└── reply         TEXT

contacts
├── id            BIGINT (PK)
├── user_id       UUID (FK → profiles)
├── name          TEXT
├── phone         TEXT
├── email         TEXT
├── service       TEXT
├── visits        INT (default: 1)
├── optedOut      BOOLEAN (default: false)
└── lastSent      TIMESTAMPTZ

templates
├── id            BIGINT (PK)
├── user_id       UUID (FK → profiles)
├── name          TEXT
├── text          TEXT
└── service       TEXT (default: 'All')

business_settings
├── user_id       UUID (PK, FK → profiles)
├── business_name TEXT
├── biz_type      TEXT
├── google_link   TEXT
└── updated_at    TIMESTAMPTZ

notifications
├── id            BIGINT (PK)
├── user_id       UUID (FK → profiles)
├── type          TEXT
├── title         TEXT
├── body          TEXT
├── time          TIMESTAMPTZ
├── read          BOOLEAN (default: false)
└── icon          TEXT

team_members
├── id            BIGINT (PK)
├── user_id       UUID (FK → profiles)
├── name          TEXT
├── email         TEXT
├── role          TEXT (default: 'Staff')
├── status        TEXT (default: 'active')
└── joinedAt      TIMESTAMPTZ

subscriptions
├── id                     BIGINT (PK)
├── user_id                UUID (FK → profiles)
├── stripe_customer_id     TEXT
├── stripe_subscription_id TEXT
├── plan_id                TEXT
├── status                 TEXT (default: 'active')
├── current_period_start   TIMESTAMPTZ
├── current_period_end     TIMESTAMPTZ
└── created_at             TIMESTAMPTZ
```

Each table has Row-Level Security (RLS) enabled with policies that restrict access to rows owned by the authenticated user. The `subscriptions` table also grants server-side access for the Stripe webhook handler.

### Run Migrations

#### Option A: Via Supabase Dashboard (Quickest)

1. Go to **SQL Editor** in the Supabase Dashboard.
2. Open a new query.
3. Copy the entire contents of `supabase/migrations/001_schema.sql` and paste it.
4. Click **Run**.
5. Repeat for `supabase/migrations/002_fixes.sql`.

#### Option B: Via Supabase CLI (Repeatable, Recommended for CI/CD)

First, link your local project to the remote Supabase project:

```bash
supabase link --project-ref <your-project-ref>
```

You'll be prompted for the database password you set when creating the project.

Then push all migrations:

```bash
supabase db push
```

This runs all migration files in `supabase/migrations/` in filename order. The CLI tracks which migrations have already been applied, so it's safe to run multiple times.

---

## 6. Configure Authentication

### 6.1 Email / Password Auth (Default)

1. In Supabase Dashboard, go to **Authentication → Providers**.
2. Ensure **Email** is enabled (it's on by default).
3. Configure these settings:

   | Setting | Value |
   |---------|-------|
   | **Confirm emails** | ✅ Enabled |
   | **Secure email change** | ✅ Enabled |
   | **Site URL** | `https://reviewping.io` (production) or `http://localhost:5173` (dev) |
   | **Redirect URLs** | Add `https://reviewping.io/**` and `http://localhost:5173/**` |

4. **(Recommended) Custom SMTP** — Go to **Authentication → Settings → SMTP Settings** and enable custom SMTP. Use Resend SMTP, SendGrid, or AWS SES for better email deliverability than Supabase's built-in sender.

### 6.2 Google OAuth

1. In Supabase Dashboard, go to **Authentication → Providers → Google**.
2. Toggle **Enabled**.

3. Set up a Google Cloud Console project:

   a. Go to [https://console.cloud.google.com/apis/credentials](https://console.cloud.google.com/apis/credentials).
   b. Create a project (or select an existing one).
   c. Click **Create Credentials → OAuth Client ID**.
   d. Application type: **Web application**.
   e. Name: `ReviewPing`.
   f. **Authorized JavaScript origins**:
      - For dev: `http://localhost:5173`
      - For prod: `https://reviewping.io`
   g. **Authorized redirect URI**: `https://<project-ref>.supabase.co/auth/v1/callback`
   h. Click **Create**.
   i. Copy the **Client ID** and **Client Secret**.

4. Paste the **Client ID** and **Client Secret** into the Supabase Google provider config.
5. Click **Save**.

### 6.3 Profile Auto-Creation

When a user signs up (email or Google OAuth), a profile row must exist in the `profiles` table for the app to work. Migration `002_fixes.sql` adds a database trigger that auto-creates a profile row on user signup:

```sql
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, business_name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    '',
    'growth'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = '';

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

This trigger fires after every user creation in `auth.users`, whether via email signup or Google OAuth. The `ON CONFLICT (id) DO NOTHING` clause ensures it's safe to run multiple times.

### 6.4 Verify Auth Configuration

Test that authentication works:

```bash
# Test email signup
curl -X POST https://<project-ref>.supabase.co/auth/v1/signup \
  -H "apikey: <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@reviewping.io","password":"Test1234!"}'
```

Check that the profile was auto-created:

```bash
# Get the user's access token (after confirming email)
# Then check profile existence
curl -X POST https://<project-ref>.supabase.co/auth/v1/token?grant_type=password \
  -H "apikey: <anon-key>" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@reviewping.io","password":"Test1234!"}'

# Use the returned access_token to fetch the profile
curl https://<project-ref>.supabase.co/rest/v1/profiles \
  -H "apikey: <anon-key>" \
  -H "Authorization: Bearer <access_token>"
```

---

## 7. Deploy Edge Functions

ReviewPing uses five Supabase Edge Functions. Each function is a Deno TypeScript file in `supabase/functions/<name>/index.ts`.

### 7.1 Set Shared Secrets First

These secrets are shared across multiple functions:

```bash
supabase secrets set SUPABASE_URL=https://<project-ref>.supabase.co
supabase secrets set SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
```

### 7.2 Deploy `ai-write` (Gemini AI Message Generation)

**Purpose**: Generates personalised SMS review request messages using Google's Gemini 2.0 Flash model.

**Request body**:
```json
{ "name": "Sarah", "service": "dental cleaning", "business": "SmileCare Dental" }
```

**Response**:
```json
{ "message": "Hi Sarah, thanks for visiting SmileCare Dental! We'd love your feedback: [LINK]" }
```

**Setup**:

1. Go to [https://aistudio.google.com](https://aistudio.google.com).
2. Click **Get API Key** in the left sidebar.
3. Click **Create API Key**.
4. Copy the key.

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

### 7.3 Deploy `send-sms` (Twilio SMS)

**Purpose**: Sends an SMS review request via Twilio.

**Request body**:
```json
{ "to": "+1234567890", "message": "Hi Sarah, leave a review: [LINK]" }
```

**Response**:
```json
{ "success": true, "sid": "SM..." }
```

**Setup**:

1. Sign up at [https://twilio.com](https://twilio.com) (free trial available).
2. Go to Console Dashboard and copy **Account SID** and **Auth Token**.
3. Go to **Phone Numbers → Manage → Buy a Number** (or use a trial number).
4. Copy the phone number in E.164 format (e.g., `+1234567890`).

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

### 7.4 Deploy `send-email` (Resend Email)

**Purpose**: Sends an email review request via Resend.

**Request body**:
```json
{
  "to": "sarah@example.com",
  "subject": "How was your visit?",
  "message": "Hi Sarah, we'd love your feedback: [LINK]"
}
```

**Response**:
```json
{ "success": true, "id": "..." }
```

**Setup**:

1. Sign up at [https://resend.com](https://resend.com) (free tier: 100 emails/day).
2. Go to **API Keys** and create a new key.
3. Verify a domain (or use the sandbox domain for testing).
4. Copy the API key and verified "from" email address.

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

### 7.5 Deploy `create-checkout` (Stripe Checkout)

**Purpose**: Creates a Stripe Checkout Session for subscription payments.

**Request body**:
```json
{
  "price_id": "price_growth_monthly",
  "return_url": "https://reviewping.io/dashboard"
}
```

**Response**:
```json
{ "url": "https://checkout.stripe.com/c/pay/..." }
```

**Setup**:

1. Sign up at [https://stripe.com](https://stripe.com).
2. Go to **Developers → API Keys**.
3. Copy the **Secret Key** (`sk_test_...` for testing, `sk_live_...` for production).
4. Go to **Products** → **Add Product** and create subscription products with price IDs for your plans.

```bash
supabase secrets set STRIPE_SECRET_KEY=<your-stripe-secret-key>
supabase functions deploy create-checkout --no-verify-jwt
```

**Verify**:
```bash
curl -X POST https://<project-ref>.supabase.co/functions/v1/create-checkout \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <valid-jwt>" \
  -d '{"price_id":"price_growth_monthly","return_url":"https://reviewping.io/dashboard"}'
```

### 7.6 Deploy `stripe-listener` (Stripe Webhook)

**Purpose**: Listens for Stripe webhook events (`checkout.session.completed`, `invoice.payment_succeeded`, `customer.subscription.updated`, `customer.subscription.deleted`) and syncs subscription data to the database.

This function does **not** require JWT verification because it's called directly by Stripe. Instead, it verifies the webhook signature.

```bash
# The function directory already exists at supabase/functions/stripe-listener/
supabase secrets set STRIPE_WEBHOOK_SECRET=<stripe-webhook-signing-secret>
supabase functions deploy stripe-listener
```

**Note**: Unlike the other functions, `stripe-listener` is deployed without `--no-verify-jwt` because `verify_jwt = false` is already set in `supabase/config.toml`.

---

## 8. Configure Stripe Webhooks

After deploying `stripe-listener`, configure Stripe to send events to it.

### 8.1 Create the Webhook Endpoint

1. In Stripe Dashboard, go to **Developers → Webhooks → Add endpoint**.
2. **Endpoint URL**: `https://<project-ref>.supabase.co/functions/v1/stripe-listener`
3. **Events to listen for**:
   - `checkout.session.completed`
   - `invoice.payment_succeeded`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
4. **API version**: Use the latest stable version.
5. Click **Add endpoint**.

### 8.2 Save the Signing Secret

After creating the endpoint, Stripe shows a **Signing secret** (`whsec_...`). Copy it and save as a Supabase secret:

```bash
supabase secrets set STRIPE_WEBHOOK_SECRET=whsec_...
```

### 8.3 Test the Webhook

Use the Stripe CLI to test locally:

```bash
# Install Stripe CLI: https://stripe.com/docs/stripe-cli

# Forward events to your local Supabase
stripe listen --forward-to http://127.0.0.1:54321/functions/v1/stripe-listener

# In another terminal, trigger test events
stripe trigger checkout.session.completed
stripe trigger customer.subscription.updated
stripe trigger customer.subscription.deleted
```

Check the function logs in Supabase Dashboard to verify events are processed.

### 8.4 Test Mode vs. Live Mode

- Use **test mode** (`sk_test_...`) during development and staging.
- Switch to **live mode** (`sk_live_...`) only when ready to accept real payments.
- The `STRIPE_WEBHOOK_SECRET` also differs between test and live environments.
- Stripe webhook endpoints are separate for test and live.

---

## 9. Update Plan ID Mapping

In `supabase/functions/stripe-listener/index.ts`, update the `PLAN_MAP` with your actual Stripe price IDs:

```typescript
function getPlanNameFromPriceId(priceId: string | undefined): string {
  const PLAN_MAP: Record<string, string> = {
    "price_1ABC123StarterMonthly": "starter",
    "price_1ABC123GrowthMonthly": "growth",
    "price_1ABC123AgencyMonthly": "agency",
  };
  const plan = priceId && PLAN_MAP[priceId];
  if (plan) return plan;
  console.warn(`Unknown price ID: ${priceId}, defaulting to "growth"`);
  return "growth";
}
```

Also update the frontend price IDs in `src/data/constants.js`:

```javascript
export const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: 19,
    price_id: "price_1ABC123StarterMonthly", // ← Replace with your Stripe Price ID
    // ...
  },
  // ...
];
```

Get your actual price IDs from: **Stripe Dashboard → Products → [Product] → API ID**.

---

## 10. Verification Checklist

### Database & Auth
- [ ] Supabase project created
- [ ] Migration `001_schema.sql` executed
- [ ] Migration `002_fixes.sql` executed
- [ ] Email auth provider configured
- [ ] Google OAuth configured (client ID + secret)
- [ ] Site URL set: `https://reviewping.io` (or `http://localhost:5173`)
- [ ] Redirect URLs configured
- [ ] Profile auto-creation trigger working (test signup)

### Edge Functions
- [ ] `ai-write` deployed and tested via curl
- [ ] `send-sms` deployed and tested via curl
- [ ] `send-email` deployed and tested via curl
- [ ] `create-checkout` deployed and tested via curl
- [ ] `stripe-listener` deployed and tested with Stripe CLI
- [ ] All required secrets set (`supabase secrets list` to verify)
- [ ] `verify_jwt` configured correctly per function in `config.toml`

### Stripe
- [ ] Stripe account created (test mode first)
- [ ] Subscription products and price IDs created
- [ ] Webhook endpoint configured → `stripe-listener`
- [ ] Webhook signing secret saved as `STRIPE_WEBHOOK_SECRET`
- [ ] Price IDs mapped in `PLAN_MAP` in `stripe-listener/index.ts`
- [ ] Price IDs mapped in `src/data/constants.js`
- [ ] Domain registered in Stripe settings (for production)

### Frontend
- [ ] `VITE_SUPABASE_URL` set in `.env`
- [ ] `VITE_SUPABASE_ANON_KEY` set in `.env`
- [ ] `VITE_API_URL` set in `.env`
- [ ] Build succeeds: `npm run build`

---

## 11. Troubleshooting

### Edge Function Returns 404

If API calls return 404, the URL path is likely wrong. Edge Functions are served at:

```
https://<project-ref>.supabase.co/functions/v1/<function-name>
```

The frontend API client (`src/api/index.js`) constructs URLs as `VITE_API_URL + path`. Ensure:
- `VITE_API_URL` ends with `/functions/v1` (no trailing slash)
- Paths in the API client start with `/` (e.g., `/ai-write`, not `/api/ai-write`)

For local development, add a Vite dev proxy in `vite.config.js`:

```javascript
export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/ai-write': 'http://127.0.0.1:54321',
      '/send-sms': 'http://127.0.0.1:54321',
      '/send-email': 'http://127.0.0.1:54321',
      '/create-checkout': 'http://127.0.0.1:54321',
    },
  },
});
```

### Edge Function Returns 401

JWT verification is failing. Check:
- The `Authorization` header is being sent with a valid `Bearer <token>`.
- The user is authenticated (session exists).
- For `stripe-listener`, `verify_jwt = false` is set in `config.toml`.

### Profile Not Found After Signup

If the app shows an error after Google OAuth signup, the profile auto-creation trigger may not be running. Check:
- Migration `002_fixes.sql` has been executed.
- The trigger `on_auth_user_created` exists on `auth.users`:

  ```sql
  SELECT * FROM information_schema.triggers
  WHERE event_object_table = 'users'
  AND event_object_schema = 'auth';
  ```

- If the trigger exists but profiles aren't being created, manually create one from the SQL Editor:

  ```sql
  INSERT INTO public.profiles (id, email, name, plan)
  SELECT id, email, COALESCE(raw_user_meta_data ->> 'full_name', email), 'growth'
  FROM auth.users
  WHERE id NOT IN (SELECT id FROM public.profiles);
  ```

### Database Migration Fails

Common causes:
- Running a migration that was already applied (use `IF NOT EXISTS` / `IF EXISTS`).
- Referencing a table or column that doesn't exist yet (run migrations in order).
- Permission errors (ensure the role used has sufficient privileges).

To check migration status:

```bash
supabase migration list
```

To repair (re-run) a specific migration:

```bash
supabase db push --repair 001_schema.sql
```

### Stripe Webhook Returns 401

The webhook signature verification failed. Check:
- The `STRIPE_WEBHOOK_SECRET` is set correctly (matches the signing secret from Stripe).
- The secret corresponds to the correct environment (test vs. live).
- The Stripe webhook endpoint is configured to use the correct API version.

### Function Logs Show "Secret Not Configured"

Run `supabase secrets list` to verify all required secrets are set. If any are missing:

```bash
supabase secrets set SECRET_NAME=<value>
```

---

## 12. Cheat Sheet

```bash
# === SUPABASE CLI ===
supabase login                          # Authenticate CLI
supabase link --project-ref <ref>       # Link local project to remote
supabase db push                        # Run all pending migrations
supabase migration list                 # Show migration status
supabase functions list                 # List deployed functions
supabase functions logs <name>          # View function logs
supabase secrets list                   # List all environment secrets
supabase secrets set KEY=VALUE          # Set a secret

# === DEPLOY A FUNCTION ===
supabase functions deploy <name>        # Deploy with default config
supabase functions deploy <name> --no-verify-jwt  # Deploy without JWT check

# === DEPLOY ALL (Quick Start) ===
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

# === TEST A FUNCTION ===
curl -X POST https://<ref>.supabase.co/functions/v1/<name> \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <jwt>" \
  -d '{"key":"value"}'

# === VIEW LOGS ===
supabase functions logs ai-write
supabase functions logs send-sms

# === LOCAL DEVELOPMENT ===
supabase start                          # Start local Supabase stack
supabase stop                           # Stop local stack
supabase functions serve <name>         # Serve a function locally
```

---

*End of Supabase Setup Guide. For deployment instructions, see [README.md](./README.md#deployment).*
