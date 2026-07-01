#!/usr/bin/env node
/**
 * Sitemap Generator for ReviewPing
 * Run after adding new blog posts to keep sitemap in sync.
 * Usage: node scripts/generate-sitemap.cjs
 */
const fs = require('fs');
const path = require('path');

const SITE = 'https://www.reviewping.pro';
const OUTPUT = path.resolve(__dirname, '..', 'public', 'sitemap.xml');
const DATA_FILE = path.resolve(__dirname, '..', 'src', 'data', 'seoPages.js');

// Core static pages (always included)
const STATIC_PAGES = [
  { loc: '/', priority: '1.0', changefreq: 'weekly', date: '2026-06-30' },
  { loc: '/features', priority: '0.9', changefreq: 'monthly', date: '2026-06-20' },
  { loc: '/pricing', priority: '0.9', changefreq: 'monthly', date: '2026-06-30' },
  { loc: '/faq', priority: '0.8', changefreq: 'monthly', date: '2026-06-20' },
  { loc: '/blog', priority: '0.8', changefreq: 'weekly', date: '2026-06-30' },
  { loc: '/about', priority: '0.6', changefreq: 'monthly', date: '2026-06-20' },
  { loc: '/contact', priority: '0.6', changefreq: 'monthly', date: '2026-06-20' },
  { loc: '/podium-alternative', priority: '0.9', changefreq: 'monthly', date: '2026-06-24' },
  { loc: '/privacy', priority: '0.3', changefreq: 'monthly', date: '2026-06-10' },
  { loc: '/terms', priority: '0.3', changefreq: 'monthly', date: '2026-06-10' },
  { loc: '/refund', priority: '0.3', changefreq: 'monthly', date: '2026-06-10' },
  { loc: '/tools/review-link-generator', priority: '0.7', changefreq: 'monthly', date: '2026-06-20' },
  { loc: '/tools/review-response-generator', priority: '0.7', changefreq: 'monthly', date: '2026-06-20' },
];

// Comparison pages
const VS_PAGES = [
  { loc: '/vs/podium', priority: '0.8', changefreq: 'monthly', date: '2026-06-18' },
  { loc: '/vs/nicejob', priority: '0.8', changefreq: 'monthly', date: '2026-06-18' },
  { loc: '/vs/birdeye', priority: '0.8', changefreq: 'monthly', date: '2026-06-18' },
  { loc: '/vs/grade-us', priority: '0.8', changefreq: 'monthly', date: '2026-06-18' },
  { loc: '/vs/truereview', priority: '0.8', changefreq: 'monthly', date: '2026-06-18' },
];

// Industry pages
const INDUSTRY_PAGES = [
  { loc: '/industry/restaurants', priority: '0.7', changefreq: 'monthly', date: '2026-06-15' },
  { loc: '/industry/clinics', priority: '0.7', changefreq: 'monthly', date: '2026-06-15' },
  { loc: '/industry/salons', priority: '0.7', changefreq: 'monthly', date: '2026-06-15' },
  { loc: '/industry/ecommerce', priority: '0.7', changefreq: 'monthly', date: '2026-06-15' },
];

// Blog posts with dates
const BLOG_POSTS = [
  { slug: 'reviewping-vs-birdeye-comparison', date: '2026-06-18' },
  { slug: 'whatsapp-review-requests-guide', date: '2026-06-16' },
  { slug: 'best-review-request-automation-software-2026', date: '2026-06-14' },
  { slug: 'review-request-automation-statistics-2026', date: '2026-06-12' },
  { slug: 'what-is-review-request-automation', date: '2026-06-10' },
  { slug: 'why-google-reviews-matter-for-small-business', date: '2026-05-20' },
  { slug: 'sms-vs-email-review-requests-which-works-better', date: '2026-05-12' },
  { slug: 'how-to-respond-to-negative-google-reviews', date: '2026-05-05' },
  { slug: 'review-management-for-restaurants', date: '2026-04-28' },
  { slug: 'google-business-profile-optimization-checklist', date: '2026-04-20' },
  { slug: 'reviewping-vs-podium-comparison', date: '2026-06-03' },
  { slug: 'how-to-automate-google-review-requests', date: '2026-06-02' },
  { slug: 'podium-pricing-2026', date: '2026-06-22' },
  { slug: 'google-review-request-templates', date: '2026-06-21' },
  { slug: 'how-to-get-5-star-google-reviews', date: '2026-06-20' },
  { slug: 'how-to-reply-to-google-reviews-professionally', date: '2026-06-19' },
];

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlEntry(loc, priority, changefreq, lastmod) {
  return `  <url>
    <loc>${escapeXml(SITE + loc)}</loc>
    <lastmod>${lastmod}</lastmod>
    <changefreq>${changefreq}</changefreq>
    <priority>${priority}</priority>
  </url>`;
}

const lines = [
  '<?xml version="1.0" encoding="UTF-8"?>',
  '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">',
];

// Add all pages
const allPages = [
  ...STATIC_PAGES,
  ...VS_PAGES,
  ...INDUSTRY_PAGES,
  ...BLOG_POSTS.map(p => ({
    loc: '/blog/' + p.slug,
    priority: '0.8',
    changefreq: 'monthly',
    date: p.date,
  })),
];

// Sort by priority descending, then by date
allPages.sort((a, b) => {
  if (a.priority !== b.priority) return b.priority - a.priority;
  return b.date.localeCompare(a.date);
});

for (const page of allPages) {
  lines.push(urlEntry(page.loc, page.priority, page.changefreq, page.date));
}

lines.push('</urlset>');

fs.writeFileSync(OUTPUT, lines.join('\n') + '\n');
console.log(`✓ Sitemap generated: ${OUTPUT}`);
console.log(`  ${allPages.length} URLs total`);
