<#
.SYNOPSIS
    ReviewPing — Full Deployment Script (Windows PowerShell)
.DESCRIPTION
    Automates the full deployment pipeline:
      1. Prompts for Supabase project ref
      2. Links the project and runs migrations
      3. Deploys all 5 edge functions with their secrets
      4. Builds the frontend
      5. Shows deployment instructions for Vercel/Netlify
.PREREQUISITES
    - Supabase CLI installed (npm install -g supabase)
    - Node.js 18+
    - Run from the project root (reviewping/)
.EXAMPLE
    .\scripts\deploy.ps1
#>

#Requires -Version 7.0

# ─── Helper functions ─────────────────────────────────────────
function Write-Info   { Write-Host "[INFO]  $($args[0])" -ForegroundColor Blue }
function Write-Ok     { Write-Host "[OK]    $($args[0])" -ForegroundColor Green }
function Write-Warn   { Write-Host "[WARN]  $($args[0])" -ForegroundColor Yellow }
function Write-Fail   { Write-Host "[FAIL]  $($args[0])" -ForegroundColor Red; exit 1 }

# ─── Step 1: Collect project info ────────────────────────────

Clear-Host
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            ReviewPing — Full Deployment Pipeline         ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

$PROJECT_REF = Read-Host "Enter your Supabase project reference ID"
if (-not $PROJECT_REF) {
  Write-Fail "Project ref is required. Get it from: https://supabase.com/dashboard/project/settings"
}

$SECURE_DB_PASSWORD = Read-Host "Enter your Supabase database password" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SECURE_DB_PASSWORD)
$DB_PASSWORD = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
if (-not $DB_PASSWORD) {
  Write-Fail "Database password is required."
}

# ─── Step 2: Verify prerequisites ────────────────────────────

Write-Info "Checking prerequisites..."

$supabasePath = (Get-Command supabase -ErrorAction SilentlyContinue).Source
if (-not $supabasePath) {
  Write-Fail "Supabase CLI is not installed. Run: npm install -g supabase"
}
$supabaseVersion = & supabase --version
Write-Ok "Supabase CLI found: $supabaseVersion"

$nodeVersion = node --version
if (-not $nodeVersion) {
  Write-Fail "Node.js is not installed."
}
Write-Ok "Node.js found: $nodeVersion"

if (-not (Test-Path "package.json")) {
  Write-Fail "Please run this script from the project root (reviewping/)"
}
Write-Ok "Project root verified"

# ─── Step 3: Link project ────────────────────────────────────

Write-Host ""
Write-Info "Step 1/6: Linking Supabase project..."
npx supabase link --project-ref $PROJECT_REF
if ($LASTEXITCODE -ne 0) {
  Write-Fail "Failed to link project. Check your project ref and DB password."
}
Write-Ok "Project linked: $PROJECT_REF"

# ─── Step 4: Run database migrations ─────────────────────────

Write-Host ""
Write-Info "Step 2/6: Running database migrations..."
npx supabase db push
if ($LASTEXITCODE -ne 0) {
  Write-Warn "Migrations may have partially failed. Check the output above."
  $CONTINUE = Read-Host "Continue anyway? (y/N)"
  if ($CONTINUE -ne "y") { exit 1 }
}
Write-Ok "Migrations applied"

# ─── Step 5: Deploy edge functions ──────────────────────────

Write-Host ""
Write-Info "Step 3/6: Deploying Edge Functions..."

# ═══ 5a: ai-write (Gemini AI) ═══════════════════════════════
Write-Host ""
Write-Host "─── ai-write (Gemini AI message generation) ───" -ForegroundColor Yellow
$GEMINI_KEY = Read-Host "  Enter GEMINI_API_KEY (get one at https://aistudio.google.com)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($GEMINI_KEY)
$GEMINI_PLAIN = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
if ($GEMINI_PLAIN) {
  npx supabase secrets set "GEMINI_API_KEY=$GEMINI_PLAIN"
}
npx supabase functions deploy ai-write --no-verify-jwt
Write-Ok "ai-write deployed"

# ═══ 5b: send-sms (Twilio) ═══════════════════════════════════
Write-Host ""
Write-Host "─── send-sms (Twilio SMS) ───" -ForegroundColor Yellow
$TWILIO_SID = Read-Host "  Enter TWILIO_ACCOUNT_SID"
$TWILIO_TOKEN_SECURE = Read-Host "  Enter TWILIO_AUTH_TOKEN" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($TWILIO_TOKEN_SECURE)
$TWILIO_TOKEN = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
$TWILIO_PHONE = Read-Host "  Enter TWILIO_PHONE_NUMBER (e.g., +1234567890)"

if ($TWILIO_SID)    { npx supabase secrets set "TWILIO_ACCOUNT_SID=$TWILIO_SID" }
if ($TWILIO_TOKEN)  { npx supabase secrets set "TWILIO_AUTH_TOKEN=$TWILIO_TOKEN" }
if ($TWILIO_PHONE)  { npx supabase secrets set "TWILIO_PHONE_NUMBER=$TWILIO_PHONE" }

npx supabase functions deploy send-sms --no-verify-jwt
Write-Ok "send-sms deployed"

# ═══ 5c: send-email (Resend) ═════════════════════════════════
Write-Host ""
Write-Host "─── send-email (Resend) ───" -ForegroundColor Yellow
$RESEND_KEY_SECURE = Read-Host "  Enter RESEND_API_KEY" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($RESEND_KEY_SECURE)
$RESEND_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)
$FROM_EMAIL = Read-Host "  Enter FROM_EMAIL (e.g., reviews@reviewping.io)"

if ($RESEND_KEY) { npx supabase secrets set "RESEND_API_KEY=$RESEND_KEY" }
if ($FROM_EMAIL) { npx supabase secrets set "FROM_EMAIL=$FROM_EMAIL" }

npx supabase functions deploy send-email --no-verify-jwt
Write-Ok "send-email deployed"

# ═══ 5d: create-checkout (Stripe) ════════════════════════════
Write-Host ""
Write-Host "─── create-checkout (Stripe checkout session) ───" -ForegroundColor Yellow
$STRIPE_KEY_SECURE = Read-Host "  Enter STRIPE_SECRET_KEY (sk_test_... or sk_live_...)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($STRIPE_KEY_SECURE)
$STRIPE_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ($STRIPE_KEY) { npx supabase secrets set "STRIPE_SECRET_KEY=$STRIPE_KEY" }

npx supabase functions deploy create-checkout --no-verify-jwt
Write-Ok "create-checkout deployed"

# ═══ 5e: stripe-listener (webhook) ═══════════════════════════
Write-Host ""
Write-Host "─── stripe-listener (Stripe webhook) ───" -ForegroundColor Yellow
$WEBHOOK_SECRET_SECURE = Read-Host "  Enter STRIPE_WEBHOOK_SECRET (whsec_...)" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($WEBHOOK_SECRET_SECURE)
$WEBHOOK_SECRET = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ($WEBHOOK_SECRET) { npx supabase secrets set "STRIPE_WEBHOOK_SECRET=$WEBHOOK_SECRET" }

npx supabase functions deploy stripe-listener
Write-Ok "stripe-listener deployed"

# ═══ 5f: Set shared secrets ═══════════════════════════════════
Write-Host ""
Write-Info "Setting shared secrets..."
$SUPABASE_URL = Read-Host "  Enter SUPABASE_URL (https://<ref>.supabase.co)"
$SERVICE_KEY_SECURE = Read-Host "  Enter SUPABASE_SERVICE_ROLE_KEY" -AsSecureString
$BSTR = [System.Runtime.InteropServices.Marshal]::SecureStringToBSTR($SERVICE_KEY_SECURE)
$SERVICE_KEY = [System.Runtime.InteropServices.Marshal]::PtrToStringBSTR($BSTR)
[System.Runtime.InteropServices.Marshal]::ZeroFreeBSTR($BSTR)

if ($SUPABASE_URL)  { npx supabase secrets set "SUPABASE_URL=$SUPABASE_URL" }
if ($SERVICE_KEY)   { npx supabase secrets set "SUPABASE_SERVICE_ROLE_KEY=$SERVICE_KEY" }
Write-Ok "Shared secrets set"

# ─── Step 6: Build frontend ──────────────────────────────────

Write-Host ""
Write-Info "Step 4/6: Installing dependencies and building frontend..."
npm install
if ($LASTEXITCODE -ne 0) { Write-Warn "npm install had issues, continuing..." }

npm run build
if ($LASTEXITCODE -ne 0) { Write-Fail "Frontend build failed. Check errors above." }
Write-Ok "Frontend built successfully — output in dist/"

# ─── Step 7: Summary and hosting instructions ────────────────

Write-Host ""
Write-Host "╔═══════════════════════════════════════════════════════════╗" -ForegroundColor Cyan
Write-Host "║            Deployment Complete!                           ║" -ForegroundColor Cyan
Write-Host "╚═══════════════════════════════════════════════════════════╝" -ForegroundColor Cyan
Write-Host ""

Write-Info "Edge Functions deployed:"
Write-Host "  ✔ ai-write       — /functions/v1/ai-write"
Write-Host "  ✔ send-sms       — /functions/v1/send-sms"
Write-Host "  ✔ send-email     — /functions/v1/send-email"
Write-Host "  ✔ create-checkout — /functions/v1/create-checkout"
Write-Host "  ✔ stripe-listener — /functions/v1/stripe-listener"
Write-Host ""

Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "NEXT STEPS: Deploy the frontend to a hosting provider" -ForegroundColor Cyan
Write-Host ""

Write-Host "─── Option A: Vercel (Recommended) ───" -ForegroundColor Yellow
Write-Host "  1. Push this repo to GitHub/GitLab"
Write-Host "  2. Go to https://vercel.com → Add New Project"
Write-Host "  3. Import the reviewping repository"
Write-Host "  4. Vercel auto-detects Vite — settings are in vercel.json"
Write-Host "  5. Add these environment variables in the Vercel dashboard:"
Write-Host "       VITE_SUPABASE_URL    = $SUPABASE_URL"
Write-Host "       VITE_SUPABASE_ANON_KEY = <your-anon-key>"
Write-Host "       VITE_API_URL         = $SUPABASE_URL/functions/v1"
Write-Host "  6. Deploy — SPA routing is handled automatically"
Write-Host ""

Write-Host "─── Option B: Netlify ───" -ForegroundColor Yellow
Write-Host "  1. Push repo → Netlify → Add new site → Import from Git"
Write-Host "  2. Build command: npm run build"
Write-Host "  3. Publish directory: dist"
Write-Host "  4. Add environment variables (same as above)"
Write-Host "  5. SPA fallback configured via public/_redirects"
Write-Host "  6. Deploy"
Write-Host ""

Write-Host "─── Option C: Cloudflare Pages ───" -ForegroundColor Yellow
Write-Host "  1. Push repo → Cloudflare Pages → Create a project"
Write-Host "  2. Build command: npm run build"
Write-Host "  3. Build output: dist"
Write-Host "  4. Add environment variables"
Write-Host "  5. SPA fallback: add _redirects rules in dashboard"
Write-Host ""

Write-Host "────────────────────────────────────────────────────────────" -ForegroundColor DarkGray
Write-Host ""
Write-Host "POST-DEPLOYMENT CHECKLIST:" -ForegroundColor Cyan
Write-Host "  ☐ Google OAuth configured in Supabase Auth providers"
Write-Host "  ☐ Site URL and Redirect URLs set in Supabase Auth settings"
Write-Host "  ☐ Stripe webhook endpoint created → stripe-listener"
Write-Host "  ☐ PLAN_MAP updated in stripe-listener/index.ts with real price IDs"
Write-Host "  ☐ Custom domain configured (DNS + Supabase Auth redirects)"
Write-Host "  ☐ Verify all APIs: ai-write, send-sms, send-email, create-checkout"
Write-Host "  ☐ Test full flow: signup → create contact → send review request"
Write-Host ""

Write-Info "To view function logs:     npx supabase functions logs <name>"
Write-Info "To list configured secrets: npx supabase secrets list"
Write-Info "To list deployed functions: npx supabase functions list"
