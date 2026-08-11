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

// Blog posts with dates — derived from seoPages.js BLOG_POSTS (single source of truth)
const dataSource = fs.readFileSync(DATA_FILE, 'utf8');
const seoData = {};
eval(dataSource.replace(/export const (\w+) =/g, (_, n) => `seoData.${n} =`));
const BLOG_POSTS = seoData.BLOG_POSTS.map((p) => ({
  slug: p.slug,
  date: p.date || '2026-06-01',
}));

function escapeXml(str) {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function urlEntry(loc, lastmod) {
  return `  <url>
    <loc>${escapeXml(SITE + loc)}</loc>
    <lastmod>${lastmod}</lastmod>
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
  lines.push(urlEntry(page.loc, page.date));
}

lines.push('</urlset>');

fs.writeFileSync(OUTPUT, lines.join('\n') + '\n');
console.log(`✓ Sitemap generated: ${OUTPUT}`);
console.log(`  ${allPages.length} URLs total`);
