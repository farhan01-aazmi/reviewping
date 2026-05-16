#!/usr/bin/env bash
# ============================================================
# ReviewPing — Full Deployment Script
# ============================================================
# This script automates the full deployment pipeline:
#   1. Prompts for Supabase project ref
#   2. Links the project and runs migrations
#   3. Deploys all 5 edge functions with their secrets
#   4. Builds the frontend
#   5. Shows deployment instructions for Vercel/Netlify
#
# Usage:
#   chmod +x scripts/deploy.sh
#   ./scripts/deploy.sh
#
# Prerequisites:
#   - Supabase CLI installed (npm install -g supabase)
#   - Node.js 18+
# ============================================================

set -euo pipefail

# ─── Color helpers ───────────────────────────────────────────
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

info()  { printf "${BLUE}[INFO]${NC}  %s\n" "$*"; }
ok()    { printf "${GREEN}[OK]${NC}    %s\n" "$*"; }
warn()  { printf "${YELLOW}[WARN]${NC}  %s\n" "$*"; }
fail()  { printf "${RED}[FAIL]${NC}  %s\n" "$*"; exit 1; }

# ─── Step 1: Collect project info ────────────────────────────

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║            ReviewPing — Full Deployment Pipeline         ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

read -rp "Enter your Supabase project reference ID: " PROJECT_REF
if [ -z "$PROJECT_REF" ]; then
  fail "Project ref is required. Get it from: https://supabase.com/dashboard/project/settings"
fi

read -rsp "Enter your Supabase database password: " DB_PASSWORD
echo ""
if [ -z "$DB_PASSWORD" ]; then
  fail "Database password is required."
fi

# ─── Step 2: Verify prerequisites ────────────────────────────

info "Checking prerequisites..."

if ! command -v supabase &> /dev/null; then
  fail "Supabase CLI is not installed. Run: npm install -g supabase"
fi
ok "Supabase CLI found: $(supabase --version)"

if ! command -v node &> /dev/null; then
  fail "Node.js is not installed."
fi
ok "Node.js found: $(node --version)"

if [ ! -f "package.json" ]; then
  fail "Please run this script from the project root (reviewping/)"
fi
ok "Project root verified"

# ─── Step 3: Link project ────────────────────────────────────

echo ""
info "Step 1/6: Linking Supabase project..."
npx supabase link --project-ref "$PROJECT_REF" || fail "Failed to link project. Check your project ref and DB password."
ok "Project linked: $PROJECT_REF"

# ─── Step 4: Run database migrations ─────────────────────────

echo ""
info "Step 2/6: Running database migrations..."
npx supabase db push || {
  warn "Migrations may have partially failed. Check the output above."
  read -rp "Continue anyway? (y/N): " CONTINUE
  [ "$CONTINUE" != "y" ] && exit 1
}
ok "Migrations applied"

# ─── Step 5: Deploy edge functions ──────────────────────────

echo ""
info "Step 3/6: Deploying Edge Functions..."

# ═══ 5a: ai-write (Gemini AI) ═══════════════════════════════
echo ""
echo "─── ai-write (Gemini AI message generation) ───"
read -rsp "  Enter GEMINI_API_KEY (get one at https://aistudio.google.com): " GEMINI_KEY
echo ""
if [ -n "$GEMINI_KEY" ]; then
  npx supabase secrets set GEMINI_API_KEY="$GEMINI_KEY"
fi
npx supabase functions deploy ai-write --no-verify-jwt
ok "ai-write deployed"

# ═══ 5b: send-sms (Twilio) ═══════════════════════════════════
echo ""
echo "─── send-sms (Twilio SMS) ───"
read -rp "  Enter TWILIO_ACCOUNT_SID: " TWILIO_SID
read -rsp "  Enter TWILIO_AUTH_TOKEN: " TWILIO_TOKEN
echo ""
read -rp "  Enter TWILIO_PHONE_NUMBER (e.g., +1234567890): " TWILIO_PHONE
if [ -n "$TWILIO_SID" ]; then
  npx supabase secrets set TWILIO_ACCOUNT_SID="$TWILIO_SID"
fi
if [ -n "$TWILIO_TOKEN" ]; then
  npx supabase secrets set TWILIO_AUTH_TOKEN="$TWILIO_TOKEN"
fi
if [ -n "$TWILIO_PHONE" ]; then
  npx supabase secrets set TWILIO_PHONE_NUMBER="$TWILIO_PHONE"
fi
npx supabase functions deploy send-sms --no-verify-jwt
ok "send-sms deployed"

# ═══ 5c: send-email (Resend) ═════════════════════════════════
echo ""
echo "─── send-email (Resend) ───"
read -rsp "  Enter RESEND_API_KEY: " RESEND_KEY
echo ""
read -rp "  Enter FROM_EMAIL (e.g., reviews@reviewping.io): " FROM_EMAIL
if [ -n "$RESEND_KEY" ]; then
  npx supabase secrets set RESEND_API_KEY="$RESEND_KEY"
fi
if [ -n "$FROM_EMAIL" ]; then
  npx supabase secrets set FROM_EMAIL="$FROM_EMAIL"
fi
npx supabase functions deploy send-email --no-verify-jwt
ok "send-email deployed"

# ═══ 5d: create-checkout (Stripe) ════════════════════════════
echo ""
echo "─── create-checkout (Stripe checkout session) ───"
read -rsp "  Enter STRIPE_SECRET_KEY (sk_test_... or sk_live_...): " STRIPE_KEY
echo ""
if [ -n "$STRIPE_KEY" ]; then
  npx supabase secrets set STRIPE_SECRET_KEY="$STRIPE_KEY"
fi
npx supabase functions deploy create-checkout --no-verify-jwt
ok "create-checkout deployed"

# ═══ 5e: stripe-listener (webhook) ═══════════════════════════
echo ""
echo "─── stripe-listener (Stripe webhook) ───"
read -rsp "  Enter STRIPE_WEBHOOK_SECRET (whsec_...): " WEBHOOK_SECRET
echo ""
if [ -n "$WEBHOOK_SECRET" ]; then
  npx supabase secrets set STRIPE_WEBHOOK_SECRET="$WEBHOOK_SECRET"
fi
npx supabase functions deploy stripe-listener
ok "stripe-listener deployed"

# ═══ 5f: Set shared secrets ═══════════════════════════════════
echo ""
info "Setting shared secrets..."
read -rp "  Enter SUPABASE_URL (https://<ref>.supabase.co): " SUPABASE_URL
read -rsp "  Enter SUPABASE_SERVICE_ROLE_KEY: " SERVICE_KEY
echo ""

if [ -n "$SUPABASE_URL" ]; then
  npx supabase secrets set SUPABASE_URL="$SUPABASE_URL"
fi
if [ -n "$SERVICE_KEY" ]; then
  npx supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SERVICE_KEY"
fi
ok "Shared secrets set"

# ─── Step 6: Build frontend ──────────────────────────────────

echo ""
info "Step 4/6: Installing dependencies and building frontend..."
npm install || warn "npm install had issues, continuing..."
npm run build || fail "Frontend build failed. Check errors above."
ok "Frontend built successfully — output in dist/"

# ─── Step 7: Summary and hosting instructions ────────────────

echo ""
echo "╔═══════════════════════════════════════════════════════════╗"
echo "║            Deployment Complete!                           ║"
echo "╚═══════════════════════════════════════════════════════════╝"
echo ""

info "Edge Functions deployed:"
echo "  ✔ ai-write       — /functions/v1/ai-write"
echo "  ✔ send-sms       — /functions/v1/send-sms"
echo "  ✔ send-email     — /functions/v1/send-email"
echo "  ✔ create-checkout — /functions/v1/create-checkout"
echo "  ✔ stripe-listener — /functions/v1/stripe-listener"
echo ""

echo "────────────────────────────────────────────────────────────"
echo ""
echo "NEXT STEPS: Deploy the frontend to a hosting provider"
echo ""

echo "─── Option A: Vercel (Recommended) ───"
echo "  1. Push this repo to GitHub/GitLab"
echo "  2. Go to https://vercel.com → Add New Project"
echo "  3. Import the reviewping repository"
echo "  4. Vercel auto-detects Vite — settings are in vercel.json"
echo "  5. Add these environment variables in the Vercel dashboard:"
echo "       VITE_SUPABASE_URL    = $SUPABASE_URL"
echo "       VITE_SUPABASE_ANON_KEY = <your-anon-key>"
echo "       VITE_API_URL         = $SUPABASE_URL/functions/v1"
echo "  6. Deploy — SPA routing is handled automatically"
echo ""

echo "─── Option B: Netlify ───"
echo "  1. Push repo → Netlify → Add new site → Import from Git"
echo "  2. Build command: npm run build"
echo "  3. Publish directory: dist"
echo "  4. Add environment variables (same as above)"
echo "  5. SPA fallback configured via public/_redirects"
echo "  6. Deploy"
echo ""

echo "─── Option C: Cloudflare Pages ───"
echo "  1. Push repo → Cloudflare Pages → Create a project"
echo "  2. Build command: npm run build"
echo "  3. Build output: dist"
echo "  4. Add environment variables"
echo "  5. SPA fallback: add _redirects rules in dashboard"
echo ""

echo "────────────────────────────────────────────────────────────"
echo ""
echo "POST-DEPLOYMENT CHECKLIST:"
echo "  ☐ Google OAuth configured in Supabase Auth providers"
echo "  ☐ Site URL and Redirect URLs set in Supabase Auth settings"
echo "  ☐ Stripe webhook endpoint created → stripe-listener"
echo "  ☐ PLAN_MAP updated in stripe-listener/index.ts with real price IDs"
echo "  ☐ Custom domain configured (DNS + Supabase Auth redirects)"
echo "  ☐ Verfiy all APIs: ai-write, send-sms, send-email, create-checkout"
echo "  ☐ Test full flow: signup → create contact → send review request"
echo ""

info "To view function logs:     npx supabase functions logs <name>"
info "To list configured secrets: npx supabase secrets list"
info "To list deployed functions: npx supabase functions list"
echo ""
