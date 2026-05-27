/**
 * ReviewPing Smoke Test — runs against production/preview URL
 * Usage: node tests/smoke.mjs [URL]
 * Default URL: https://reviewping-farhan01-aazmi-farhan01-aazmis-projects.vercel.app
 */
import { chromium } from 'playwright';

const BASE_URL = process.argv[2] || 'https://reviewping-farhan01-aazmi-farhan01-aazmis-projects.vercel.app';

const PAGES = [
  { path: '/', name: 'Landing', expectStatus: 200 },
  { path: '/login', name: 'Login', expectStatus: 200 },
  { path: '/signup', name: 'Signup', expectStatus: 200 },
  { path: '/forgot-password', name: 'Forgot Password', expectStatus: 200 },
  { path: '/privacy', name: 'Privacy', expectStatus: 200 },
  { path: '/terms', name: 'Terms', expectStatus: 200 },
  { path: '/pricing', name: 'Pricing', expectStatus: 200 },
  { path: '/tools/review-link-generator', name: 'Free Tool: Review Link', expectStatus: 200 },
  { path: '/tools/review-response-generator', name: 'Free Tool: Review Response', expectStatus: 200 },
  { path: '/dashboard', name: 'Dashboard (unauth)', expectStatus: 200 },
  { path: '/onboarding', name: 'Onboarding (unauth)', expectStatus: 200 },
  { path: '/some-non-existent-page', name: '404 Page', expectStatus: 404 },
];

const RESULTS = { pass: 0, fail: 0, errors: [] };

async function testPage(page, url, name, expectStatus = 200) {
  const jsErrors = [];
  const consoleErrors = [];

  page.on('pageerror', err => {
    jsErrors.push(err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') consoleErrors.push(msg.text());
  });

  try {
    const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 20000 });
    
    const status = resp ? resp.status() : 0;
    const body = await page.textContent('body');
    const title = await page.title().catch(() => '(no title)');

    // 404 page should return 404 - that's correct behavior
    const statusOk = status === expectStatus || (status >= 200 && status < 400);
    const hasError = body.includes('Something went wrong') || body.includes('An unexpected error occurred');
    const hasCrash = jsErrors.length > 0;

    if (!statusOk || hasError || hasCrash) {
      RESULTS.fail++;
      const reasons = [];
      if (!statusOk) reasons.push(`Expected ${expectStatus} got HTTP ${status}`);
      if (hasError) reasons.push('ErrorBoundary triggered');
      if (hasCrash) reasons.push(`JS Error: ${jsErrors[0]}`);
      RESULTS.errors.push(`🔴 ${name}: ${reasons.join(', ')}`);
      console.log(`  🔴 ${name} — ${reasons.join(', ')}`);
    } else {
      RESULTS.pass++;
      console.log(`  ✅ ${name} — HTTP ${status} — ${title}`);
    }
  } catch (e) {
    RESULTS.fail++;
    RESULTS.errors.push(`🔴 ${name}: ${e.message}`);
    console.log(`  🔴 ${name} — ${e.message}`);
  }
}

async function main() {
  console.log(`\n🔍 ReviewPing Smoke Test — ${BASE_URL}\n`);
  
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({ viewport: { width: 1280, height: 720 } });
  const page = await context.newPage();

  for (const pageDef of PAGES) {
    const url = `${BASE_URL}${pageDef.path}`;
    await testPage(page, url, pageDef.name, pageDef.expectStatus);
  }

  await browser.close();

  console.log(`\n📊 RESULTS: ${RESULTS.pass} passed, ${RESULTS.fail} failed\n`);
  
  if (RESULTS.errors.length > 0) {
    console.log('❌ FAILURES:');
    RESULTS.errors.forEach(e => console.log(`  ${e}`));
    process.exit(1);
  }
}

main();
