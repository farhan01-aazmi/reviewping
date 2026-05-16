# ReviewPing

> AI-personalised review request SaaS for small businesses — automatically send SMS and email review requests, powered by Gemini AI.

[![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)](https://reactjs.org)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite)](https://vite.dev)
[![Supabase](https://img.shields.io/badge/Supabase-3FCF8E?logo=supabase&logoColor=white)](https://supabase.com)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

---

## Why This Exists

Small business owners know that online reviews drive new customers, but asking for them is awkward, time-consuming, and easy to forget. You finish a job, mean to send a review request, and then get buried in the next task. Days pass. The moment is lost.

ReviewPing automates that follow-up. You enter a customer's name and what service they received, and ReviewPing generates a warm, personalised SMS or email review request — written by AI, sent automatically, linked straight to your Google Business Profile.

---

## Features

- **AI-Powered Message Generation** — Google Gemini 2.0 Flash writes human-sounding review requests personalised to each customer and service.
- **SMS & Email Delivery** — Send review requests via Twilio (SMS) or Resend (email) — or both.
- **Contact Management** — Import and manage customers with service history, visit tracking, and opt-out support.
- **Review Dashboard** — See all sent requests, ratings, replies, and trends at a glance.
- **Analytics** — Track response rates, ratings over time, channel performance, and review volume.
- **Custom Templates** — Create and save reusable message templates for different services.
- **Automations** — Set up rules to automatically send review requests after a configurable delay from each visit.
- **Bulk Send** — Send review requests to multiple contacts at once.
- **Subscription Billing** — Stripe-powered plans (Starter, Growth, Agency) with automatic plan syncing.
- **Team Access** — Add team members to collaborate on review management.
- **QR Code Generator** — Generate QR codes that link directly to your Google review page.
- **Google OAuth & Email Auth** — Sign up with email/password or Google.
- **Free Tool** — Quick one-off review request generator for non-registered users.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 18, Vite 8 |
| **Styling** | Inline styles with design tokens (`src/data/theme.js`) |
| **Charts** | Recharts (analytics dashboard) |
| **Backend** | Supabase Edge Functions (Deno runtime) |
| **Database** | Supabase PostgreSQL with Row-Level Security |
| **Auth** | Supabase Auth (email/password + Google OAuth) |
| **AI** | Google Gemini 2.0 Flash (`ai-write` function) |
| **SMS** | Twilio API (`send-sms` function) |
| **Email** | Resend API (`send-email` function) |
| **Payments** | Stripe (`create-checkout` + `stripe-listener`) |
| **Hosting** | Vercel (recommended), Netlify, or Cloudflare Pages |

---

## Architecture

```
┌──────────────────────────────────────────────────────────┐
│                   Browser (React SPA)                     │
│  ┌──────────────────────────────────────────────────┐    │
│  │  App.jsx — view router (landing, auth, app shell) │    │
│  │  src/api/index.js  →  VITE_API_URL + "/..."       │    │
│  │  src/config/supabase.js  →  direct Supabase SDK   │    │
│  └──────────────────────────────────────────────────┘    │
└─────────────────────┬─────────────────────────────────────┘
                      │
         ┌────────────┼────────────────────┐
         │            │                    │
         ▼            ▼                    ▼
┌────────────────┐ ┌─────────────────┐ ┌─────────────────────┐
│ Supabase Auth  │ │ Edge Functions  │ │ Supabase Database   │
│ (email/Google)  │ │ (Deno)         │ │ (PostgreSQL + RLS)  │
│                │ │                 │ │                     │
│ auth.users     │ │ /ai-write       │ │ profiles            │
│ auth.identities│ │  → Gemini API   │ │ reviews             │
│ auth.sessions  │ │                 │ │ contacts            │
│                │ │ /send-sms       │ │ templates           │
│                │ │  → Twilio API   │ │ business_settings   │
│                │ │                 │ │ notifications       │
│                │ │ /send-email     │ │ team_members        │
│                │ │  → Resend API   │ │ subscriptions       │
│                │ │                 │ │                    │
│                │ │ /create-checkout│ │ ← RLS enforced     │
│                │ │  → Stripe API   │ │ ← Indexed for perf │
│                │ │                 │ │                    │
│                │ │ /stripe-listener│ │                    │
│                │ │  ← Stripe WH    │ │                    │
└────────────────┘ └─────────────────┘ └─────────────────────┘
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

The frontend is a single-page React application. Auth state drives which view is shown (landing → signup/login → onboarding → app shell). Within the app shell, navigation switches between feature pages (Dashboard, Reviews, Analytics, Contacts, etc.). All API calls go through a thin client in `src/api/index.js` that prefixes requests with the `VITE_API_URL` and attaches the user's JWT for authenticated access to Supabase Edge Functions.

---

## Prerequisites

- **Node.js** 18+ (20+ recommended)
- **npm** 9+ (or yarn, pnpm)
- **Supabase account** — [free tier](https://supabase.com) (2 projects, 500MB DB, 50k MAU)
- **Supabase CLI** (for local development and function deployment): `npm install -g supabase`
- Accounts for any edge function services you plan to use:
  - [Google AI Studio](https://aistudio.google.com) (Gemini API key — free, 60 req/min)
  - [Twilio](https://twilio.com) (SMS — trial credit ~$15)
  - [Resend](https://resend.com) (Email — free tier: 100 emails/day)
  - [Stripe](https://stripe.com) (Payments — test mode available)

---

## Quick Start

```bash
# 1. Clone the repository
git clone https://github.com/your-org/reviewping.git
cd reviewping

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env

# 4. Configure environment variables in .env
#    (See Environment Variables section below)

# 5. Start the development server
npm run dev
```

Open [http://localhost:5173](http://localhost:5173) in your browser. The app will run with the Supabase client configured to your project.

> **Note**: Without a Supabase project and deployed edge functions, the app will render the UI but API calls (AI message generation, SMS, email, payments) will fail. See [Supabase Setup](./SUPABASE_SETUP.md) for full setup instructions.

---

## Environment Variables

### Frontend (set in `.env` or hosting dashboard)

| Variable | Description | Required | Example |
|----------|-------------|----------|---------|
| `VITE_SUPABASE_URL` | Supabase project URL | ✅ | `https://abcdefghijk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | Supabase anonymous/public key | ✅ | `eyJhbGciOiJIUzI1NiIs...` |
| `VITE_API_URL` | Edge Functions base URL (no trailing slash) | ✅ | `https://abcdefghijk.supabase.co/functions/v1` |

### Edge Function Secrets (set via `supabase secrets set`)

| Secret | Used By | Source | Required |
|--------|---------|--------|----------|
| `SUPABASE_URL` | All functions | Supabase Dashboard → Settings → API | ✅ |
| `SUPABASE_SERVICE_ROLE_KEY` | `stripe-listener` | Supabase Dashboard → Settings → API (service_role) | ✅ |
| `GEMINI_API_KEY` | `ai-write` | [aistudio.google.com](https://aistudio.google.com) | ✅ |
| `TWILIO_ACCOUNT_SID` | `send-sms` | [twilio.com/console](https://twilio.com/console) | ✅ |
| `TWILIO_AUTH_TOKEN` | `send-sms` | Twilio Console | ✅ |
| `TWILIO_PHONE_NUMBER` | `send-sms` | Twilio → Phone Numbers | ✅ |
| `RESEND_API_KEY` | `send-email` | [resend.com/api-keys](https://resend.com/api-keys) | ✅ |
| `FROM_EMAIL` | `send-email` | Resend → Domains (verified) | ✅ |
| `STRIPE_SECRET_KEY` | `create-checkout`, `stripe-listener` | Stripe Dashboard → Developers → API Keys | ✅ |
| `STRIPE_WEBHOOK_SECRET` | `stripe-listener` | Stripe → Webhooks → Signing secret | ✅ |

---

## Project Structure

```
reviewping/
├── public/                          # Static assets
│   └── _redirects                   # Netlify SPA fallback
├── scripts/
│   ├── deploy.sh                    # Full deployment script (bash)
│   └── deploy.ps1                   # Full deployment script (PowerShell)
├── src/
│   ├── api/
│   │   └── index.js                 # API client — calls all edge functions
│   ├── components/
│   │   ├── layout/                  # Top-level views (Landing, Login, AppShell, etc.)
│   │   │   ├── AppShell.jsx         # Authenticated app wrapper + navigation
│   │   │   ├── Landing.jsx          # Marketing landing page
│   │   │   ├── Login.jsx            # Login with email/password + Google OAuth
│   │   │   ├── Signup.jsx           # Registration form
│   │   │   ├── Onboarding.jsx       # Post-signup business setup wizard
│   │   │   ├── ForgotPassword.jsx   # Password reset flow
│   │   │   ├── FreeTool.jsx         # One-off review request generator
│   │   │   ├── PrivacyPolicy.jsx    # Privacy policy page
│   │   │   ├── Terms.jsx            # Terms of service page
│   │   │   └── CookieBanner.jsx     # Cookie consent banner
│   │   ├── pages/                   # Feature pages within AppShell
│   │   │   ├── Dashboard.jsx        # Main overview with recent activity
│   │   │   ├── Analytics.jsx        # Review metrics and charts
│   │   │   ├── ReviewsPage.jsx      # Review management and replies
│   │   │   ├── Contacts.jsx         # Customer contact list
│   │   │   ├── Templates.jsx        # Message template editor
│   │   │   ├── SendReq.jsx          # Send a review request
│   │   │   ├── BulkSend.jsx         # Bulk send to multiple contacts
│   │   │   ├── Automations.jsx      # Auto-send rules configuration
│   │   │   ├── Billing.jsx          # Subscription plans and payment
│   │   │   ├── Settings.jsx         # Business settings
│   │   │   ├── Team.jsx             # Team member management
│   │   │   ├── SentLog.jsx          # Sent request history
│   │   │   ├── Notifications.jsx    # Notification history
│   │   │   ├── Integrations.jsx     # Third-party integrations
│   │   │   ├── Referral.jsx         # Referral program
│   │   │   ├── QRCode.jsx           # QR code generator
│   │   │   ├── WidgetEmbed.jsx      # Embeddable widget code
│   │   │   ├── Help.jsx             # Help/FAQ
│   │   │   └── Changelog.jsx        # Product changelog
│   │   └── ui/                      # Reusable UI primitives
│   │       ├── Btn.jsx              # Button component
│   │       ├── Card.jsx             # Card container
│   │       ├── Field.jsx            # Form input field
│   │       ├── Sel.jsx              # Select dropdown
│   │       ├── Stars.jsx            # Star rating display
│   │       ├── Pill.jsx             # Status/tag pill
│   │       ├── Spinner.jsx          # Loading spinner
│   │       ├── LogoMark.jsx         # Logo icon
│   │       ├── Wordmark.jsx         # Logo wordmark
│   │       ├── EmptyState.jsx       # Empty state placeholder
│   │       ├── ConfirmModal.jsx     # Confirmation dialog
│   │       ├── EditProfileModal.jsx # Profile edit modal
│   │       ├── ToastContainer.jsx   # Toast notifications
│   │       └── index.js             # UI component barrel export
│   ├── config/
│   │   └── supabase.js              # Supabase client initialisation
│   ├── data/
│   │   ├── constants.js             # App constants (nav items, services, plans)
│   │   ├── theme.js                 # Design tokens (colours, spacing, fonts)
│   │   └── seedData.js              # Demo/seed data
│   ├── hooks/
│   │   ├── useSupabaseArray.js      # Generic CRUD hook for Supabase tables
│   │   └── useToast.js              # Toast notification state hook
│   ├── utils/
│   │   ├── formatters.js            # Date, currency, and number formatters
│   │   └── validators.js            # Form validation helpers
│   ├── App.jsx                      # Root component — auth-based view routing
│   ├── main.jsx                     # React entry point
│   └── index.css                    # Global styles
├── supabase/
│   ├── config.toml                  # Supabase local config
│   ├── import_map.json              # Deno import map
│   ├── migrations/
│   │   ├── 001_schema.sql           # 8 tables + RLS policies + indexes
│   │   └── 002_fixes.sql            # Security fixes + auto-profile trigger
│   └── functions/
│       ├── ai-write/index.ts        # Gemini AI message generation
│       ├── send-sms/index.ts        # Twilio SMS delivery
│       ├── send-email/index.ts      # Resend email delivery
│       ├── create-checkout/index.ts # Stripe Checkout session creator
│       └── stripe-listener/index.ts # Stripe webhook handler
├── .env.example                     # Environment variable template
├── vercel.json                      # Vercel deployment config
├── vite.config.js                   # Vite build configuration
├── eslint.config.js                 # ESLint flat config
└── package.json
```

---

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Vite dev server with HMR at `localhost:5173` |
| `npm run build` | Production build to `dist/` with code-splitting |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint across the project |

### Code Splitting

The Vite config (`vite.config.js`) is set up with manual chunking for optimal loading:

| Chunk | Contents | Loaded On |
|-------|----------|-----------|
| `vendor-react` | React, ReactDOM | Every page |
| `vendor-recharts` | Recharts + D3 | Analytics page only |
| `vendor-supabase` | Supabase client | Most pages (auth required) |
| `vendor-other` | Everything else | As needed |

---

## Supabase Setup

A full Supabase setup guide is available in [`SUPABASE_SETUP.md`](./SUPABASE_SETUP.md). It covers:

1. Creating a Supabase project and retrieving credentials
2. Running database migrations (8 tables with RLS)
3. Deploying all 5 edge functions with secrets
4. Configuring email auth and Google OAuth
5. Setting up Stripe webhooks
6. Verification checklist

**Quick overview:**

```bash
# Link your project
supabase link --project-ref <your-project-ref>

# Run migrations
supabase db push

# Deploy an edge function with its secrets
supabase secrets set GEMINI_API_KEY=<your-key>
supabase functions deploy ai-write --no-verify-jwt
```

---

## Edge Functions

All edge functions run on Deno via Supabase Edge Functions and are located in `supabase/functions/`.

| Function | Endpoint | Purpose | Auth Required | External API |
|----------|----------|---------|---------------|--------------|
| `ai-write` | `POST /functions/v1/ai-write` | Generates a personalised SMS review request using Gemini AI | ✅ JWT | Google Gemini 2.0 Flash |
| `send-sms` | `POST /functions/v1/send-sms` | Sends an SMS review request via Twilio | ✅ JWT | Twilio API |
| `send-email` | `POST /functions/v1/send-email` | Sends an email review request via Resend | ✅ JWT | Resend API |
| `create-checkout` | `POST /functions/v1/create-checkout` | Creates a Stripe Checkout Session for subscriptions | ✅ JWT | Stripe API |
| `stripe-listener` | `POST /functions/v1/stripe-listener` | Handles Stripe webhook events (checkout completed, subscription updated/cancelled) | ❌ (Stripe signature) | Stripe Webhooks |

### API Client Usage

The frontend calls these functions via the API client in `src/api/index.js`:

```javascript
import { aiWriteMessage, sendSMS, sendEmail, createSubscription } from "./api";

// Generate an AI review message
const { message } = await aiWriteMessage({
  name: "Sarah",
  service: "dental cleaning",
  business: "SmileCare Dental",
});

// Send it via SMS
await sendSMS({ to: "+1234567890", message });

// Send it via email
await sendEmail({
  to: "sarah@example.com",
  subject: "How was your visit?",
  message,
});

// Create a Stripe checkout for a subscription plan
const { url } = await createSubscription({
  price_id: "price_growth_monthly",
  return_url: "https://reviewping.io/dashboard",
});
// → Redirect user to url (Stripe Checkout)
```

---

## Deployment

### Frontend Hosting

Three options supported. Environment variables must be set in the hosting dashboard:

| Variable | Value |
|----------|-------|
| `VITE_SUPABASE_URL` | `https://<project-ref>.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `<your-anon-key>` |
| `VITE_API_URL` | `https://<project-ref>.supabase.co/functions/v1` |

#### Option A: Vercel (Recommended)

1. Push repo to GitHub/GitLab/Bitbucket.
2. Go to [vercel.com](https://vercel.com) → **Add New Project** → import repo.
3. Vercel auto-detects Vite — settings are in `vercel.json`:
   - Build: `npm run build`
   - Output: `dist`
   - SPA fallback: handled by `vercel.json` rewrites.
4. Add environment variables (see table above).
5. Deploy.

#### Option B: Netlify

1. Push repo → Netlify → **Add new site** → Import from Git.
2. Build command: `npm run build`
3. Publish directory: `dist`
4. SPA fallback handled by `public/_redirects`:

   ```
   /*    /index.html    200
   ```

5. Add environment variables → Deploy.

#### Option C: Cloudflare Pages

1. Push repo → Cloudflare Dashboard → **Pages** → **Create a project**.
2. Build command: `npm run build`
3. Build output: `dist`
4. Add `_redirects` file or configure SPA fallback in dashboard.
5. Add environment variables → Deploy.

### Automated Deployment Script

A full deployment script is available at `scripts/deploy.sh` (or `scripts/deploy.ps1` for Windows). It:

1. Links your Supabase project.
2. Runs database migrations.
3. Deploys all 5 edge functions with interactive secret prompts.
4. Builds the frontend.
5. Prints hosting instructions.

```bash
# Make executable and run
chmod +x scripts/deploy.sh
./scripts/deploy.sh
```

### Post-Deployment Checklist

- [ ] Google OAuth configured in Supabase Auth providers.
- [ ] Site URL and redirect URLs set in Supabase Auth settings.
- [ ] Stripe webhook endpoint created pointing to `/functions/v1/stripe-listener`.
- [ ] `PLAN_MAP` updated in `stripe-listener/index.ts` with real Stripe price IDs.
- [ ] Custom domain configured (DNS + Supabase Auth redirects).
- [ ] Verify all APIs: `ai-write`, `send-sms`, `send-email`, `create-checkout`.
- [ ] Test full flow: signup → create contact → send review request.

---

## Contributing

Please read [CONTRIBUTING.md](./CONTRIBUTING.md) for guidelines on how to contribute to ReviewPing. All contributions — bug reports, feature requests, documentation improvements — are welcome.

---

## License

MIT © [ReviewPing](https://github.com/your-org/reviewping)

See [LICENSE](./LICENSE) for full text.
