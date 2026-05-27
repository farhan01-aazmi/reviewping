/**
 * ReviewPing Authenticated Smoke Test
 * Tests all dashboard pages after login.
 * Usage: TEST_EMAIL=x TEST_PASSWORD=y node scripts/test-auth.mjs
 */
import { chromium } from 'playwright';

const BASE_URL = 'https://reviewping-seven.vercel.app';
const EMAIL = process.env.TEST_EMAIL;
const PASSWORD = process.env.TEST_PASSWORD;

const DASHBOARD_PAGES = [
  'dashboard', 'reviews', 'analytics', 'templates',
  'automations', 'contacts', 'sentlog', 'billing',
  'settings', 'team', 'help', 'referral', 'changelog',
  'qrcode', 'widget', 'integrations', 'bulk',
];

if (!EMAIL || !PASSWORD) {
  console.error('❌ Set TEST_EMAIL and TEST_PASSWORD environment variables');
  process.exit(1);
}

const RESULTS = { pass: 0, fail: 0, errors: [] };

async function main() {
  console.log(`\n🔍 ReviewPing Authenticated Smoke Test\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext();
  const page = await context.newPage();
  const jsErrors = [];

  page.on('pageerror', err => jsErrors.push(err.message));

  try {
    // Login
    console.log('  Logging in...');
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    await page.fill('input[type="email"]', EMAIL);
    await page.fill('input[type="password"]', PASSWORD);
    await page.click('button[type="submit"]');
    await page.waitForTimeout(3000);

    // Check if login succeeded (redirected to dashboard or onboarding)
    const currentUrl = page.url();
    if (currentUrl.includes('login')) {
      console.log('  🔴 Login failed - still on login page');
      RESULTS.fail++;
      RESULTS.errors.push('Login failed - check credentials');
    } else {
      console.log(`  ✅ Logged in — redirected to ${currentUrl}`);

      // Test each dashboard page
      for (const screen of DASHBOARD_PAGES) {
        jsErrors.length = 0;
        
        try {
          // Navigate to page (AppShell handles routing via screen state)
          // We need to trigger navigation via UI since it's client-side routing
          // Try direct URL first
          await page.goto(`${BASE_URL}/dashboard?screen=${screen}`, { 
            waitUntil: 'networkidle', timeout: 15000 
          }).catch(() => {});
          
          // Click on the More nav to access more screens
          const moreBtn = page.locator('button:has-text("More")');
          if (await moreBtn.isVisible().catch(() => false)) {
            await moreBtn.click();
            await page.waitForTimeout(500);
          }

          // Try to navigate to the screen
          const screenBtn = page.locator(`button:has-text("${screen}")`).first();
          if (await screenBtn.isVisible().catch(() => false)) {
            await screenBtn.click();
            await page.waitForTimeout(2000);
          }

          const body = await page.textContent('body').catch(() => '');
          const hasError = body.includes('Something went wrong') || 
                          body.includes('An unexpected error occurred');

          if (hasError) {
            RESULTS.fail++;
            RESULTS.errors.push(`🔴 ${screen}: ErrorBoundary triggered`);
            console.log(`  🔴 ${screen} — CRASH`);
          } else if (jsErrors.length > 0) {
            RESULTS.fail++;
            RESULTS.errors.push(`🔴 ${screen}: JS Error - ${jsErrors[0]}`);
            console.log(`  🔴 ${screen} — ${jsErrors[0]}`);
          } else {
            RESULTS.pass++;
            const title = await page.title().catch(() => screen);
            console.log(`  ✅ ${screen} — ${title}`);
          }
        } catch (e) {
          RESULTS.fail++;
          RESULTS.errors.push(`🔴 ${screen}: ${e.message}`);
          console.log(`  🔴 ${screen} — ${e.message}`);
        }
      }
    }
  } catch (e) {
    console.error('Fatal error:', e.message);
    RESULTS.fail++;
  }

  await browser.close();

  console.log(`\n📊 AUTH TEST RESULTS: ${RESULTS.pass} passed, ${RESULTS.fail} failed\n`);
  if (RESULTS.errors.length > 0) {
    console.log('❌ FAILURES:');
    RESULTS.errors.forEach(e => console.log(`  ${e}`));
  }
  process.exit(RESULTS.fail > 0 ? 1 : 0);
}

main();
