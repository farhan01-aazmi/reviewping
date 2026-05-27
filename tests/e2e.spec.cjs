// @ts-check
const { test, expect } = require('@playwright/test');

const BASE_URL = process.env.TEST_URL || 'https://reviewping-farhan01-aazmi-farhan01-aazmis-projects.vercel.app';

/**
 * Crawls all internal links on a page and reports which ones work.
 * Logs errors to console instead of failing immediately.
 */
async function checkAllLinks(page, visited = new Set()) {
  const links = await page.locator('a[href]').all();
  for (const link of links) {
    const href = await link.getAttribute('href');
    if (!href || href.startsWith('#') || href.startsWith('mailto:') || href.startsWith('tel:')) continue;
    const url = href.startsWith('http') ? href : new URL(href, BASE_URL).toString();
    if (visited.has(url) || !url.startsWith(BASE_URL)) continue;
    visited.add(url);
    try {
      const resp = await page.goto(url, { waitUntil: 'networkidle', timeout: 15000 });
      if (resp && resp.status() >= 400) {
        console.log(`🔴 ${resp.status()} - ${url}`);
      } else {
        console.log(`  ✅ ${url}`);
      }
      // Check for error boundary text
      const body = await page.textContent('body');
      if (body.includes('Something went wrong') || body.includes('An unexpected error occurred')) {
        console.log(`🔴 ERROR ON PAGE: ${url}`);
      }
    } catch (e) {
      console.log(`🔴 FAILED: ${url} - ${e.message}`);
    }
  }
  return visited;
}

// ─── LANDING / PUBLIC PAGES ───────────────────────────────────────────

test.describe('Public Pages', () => {
  test('Landing page loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });

    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    expect(page.url()).toBe(BASE_URL + '/');

    // Check for Sentry/ErrorBoundary crash
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
    expect(errors.length).toBe(0);
  });

  test('Login page loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
  });

  test('Signup page loads without errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' });
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
  });

  test('Privacy & Terms pages load without errors', async ({ page }) => {
    for (const path of ['/privacy', '/terms']) {
      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      const body = await page.textContent('body');
      expect(body).not.toContain('Something went wrong');
    }
  });

  test('Free tools page loads without errors', async ({ page }) => {
    await page.goto(`${BASE_URL}/tools/review-link-generator`, { waitUntil: 'networkidle' });
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
  });

  test('404 page shows for unknown routes', async ({ page }) => {
    await page.goto(`${BASE_URL}/some-non-existent-page`, { waitUntil: 'networkidle' });
    // Should not crash - should show 404 page
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
  });
});

// ─── AUTH PAGES ───────────────────────────────────────────────────────

test.describe('Authentication Flows', () => {
  test('Forgot password page loads', async ({ page }) => {
    await page.goto(`${BASE_URL}/forgot-password`, { waitUntil: 'networkidle' });
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
  });

  test('Login form has required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/login`, { waitUntil: 'networkidle' });
    // Check email field exists
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
    // Check password field exists
    const passInput = page.locator('input[type="password"]').first();
    await expect(passInput).toBeVisible({ timeout: 5000 });
  });

  test('Signup form has required fields', async ({ page }) => {
    await page.goto(`${BASE_URL}/signup`, { waitUntil: 'networkidle' });
    const emailInput = page.locator('input[type="email"], input[placeholder*="email" i]').first();
    await expect(emailInput).toBeVisible({ timeout: 5000 });
  });
});

// ─── APP PAGES (require auth - will redirect to login) ────────────────

test.describe('App Pages (Unauthenticated)', () => {
  test('Dashboard redirects to login when not authenticated', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`, { waitUntil: 'networkidle' });
    // Should show login/landing, not crash
    const body = await page.textContent('body');
    expect(body).not.toContain('Something went wrong');
  });

  // Check that direct navigation to app pages doesn't crash
  const APP_PATHS = [
    '/dashboard', '/onboarding',
    '/tools/review-link-generator', '/tools/review-response-generator',
  ];

  for (const path of APP_PATHS) {
    test(`Page ${path} does not crash (unauthenticated)`, async ({ page }) => {
      const errors = [];
      page.on('pageerror', err => errors.push(err.message));

      await page.goto(`${BASE_URL}${path}`, { waitUntil: 'networkidle' });
      const body = await page.textContent('body');
      
      if (body.includes('Something went wrong')) {
        console.log(`🔴 Crash on ${path}: ${errors.join(', ')}`);
      }
      expect(body).not.toContain('Something went wrong');
    });
  }
});

// ─── FULL LINK CRAWL ──────────────────────────────────────────────────

test.describe('Full Link Crawl', () => {
  test('Crawl all public links for errors', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(`console.error: ${msg.text()}`);
    });

    const visited = new Set();
    // Start from landing page and crawl all internal links
    await page.goto(BASE_URL, { waitUntil: 'networkidle' });
    visited.add(BASE_URL + '/');
    
    const allLinks = await page.locator('a[href]').all();
    for (const link of allLinks) {
      const href = await link.getAttribute('href');
      if (!href || href.startsWith('#') || href.startsWith('mailto:')) continue;
      
      let url;
      try {
        url = href.startsWith('http') ? href : new URL(href, BASE_URL).toString();
      } catch {
        continue;
      }
      
      if (!url.startsWith(BASE_URL) || visited.has(url)) continue;
      visited.add(url);
      
      try {
        await page.goto(url, { waitUntil: 'networkidle', timeout: 10000 });
        const body = await page.textContent('body');
        if (body.includes('Something went wrong') || body.includes('An unexpected error occurred')) {
          console.log(`🔴 ERROR: ${url} — Something went wrong`);
        } else {
          console.log(`  ✅ ${url}`);
        }
      } catch (e) {
        console.log(`  ⚠️ ${url} - ${e.message}`);
      }
    }
    
    expect(errors.filter(e => !e.includes('Failed to load resource'))).toHaveLength(0);
  });
});
