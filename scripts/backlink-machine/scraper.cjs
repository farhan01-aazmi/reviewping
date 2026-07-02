#!/usr/bin/env node
/**
 * Backlink Machine — Fast Scraper
 * Visits target sites, finds contact info, categorizes.
 * 
 * Usage: node scripts/backlink-machine/scraper.cjs [--limit 10]
 *        node scripts/backlink-machine/scraper.cjs --limit 5 --headless
 */
const { chromium } = require('playwright');
const DB = require('./db.cjs');

const MAX_CONCURRENT = 2;

const CATEGORY_RULES = [
  { type: 'saas_review', keywords: ['alternativeto', 'g2.com', 'capterra', 'getapp', 'saasworthy', 'producthunt', 'crozdesk', 'softwareadvice', 'webcatalog', 'zipdo', 'phdeck', 'whatarethebest', 'ppcmate', 'advids', 'glarity', 'slintel', 'trustradius'] },
  { type: 'blog', keywords: ['blog', 'medium.com', 'wordpress', 'tumblr', 'blogspot'] },
  { type: 'news', keywords: ['news', 'times', 'herald', 'chronicle', 'tribune', 'post-gazette', 'newscafe'] },
  { type: 'local_business', keywords: ['plumbing', 'electric', 'garage', 'roofing', 'hvac', 'locksmith', 'chimney', 'duct'] },
  { type: 'medspa', keywords: ['medspa', 'aesthetics', 'spa', 'wellness', 'rejuvenation', 'skindale'] },
  { type: 'jewelry', keywords: ['jewelry', 'jewellers', 'jewelers', 'pawn'] },
  { type: 'auto', keywords: ['honda', 'chevy', 'ford', 'toyota', 'dealer'] },
  { type: 'insurance', keywords: ['insurance'] },
  { type: 'edu', keywords: ['.edu'] },
];

function categorize(domain) {
  const d = domain.toLowerCase();
  for (const rule of CATEGORY_RULES) {
    for (const kw of rule.keywords) {
      if (d.includes(kw)) return rule.type;
    }
  }
  return 'other';
}

async function scrapeOne(browser, domain) {
  const url = `https://${domain}`;
  const result = { domain, emails: [], phones: [], social: [], title: '', category: 'other', contactPage: null, error: null };

  try {
    const page = await browser.newPage();
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 10000 }).catch(() => {});

    result.title = await page.title().catch(() => '');
    result.category = categorize(domain);

    // Check main page
    const text = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
    extractContacts(text, result);

    // Try /contact and /about
    for (const sub of ['/contact', '/contact-us', '/about']) {
      try {
        await page.goto(new URL(sub, url).href, { waitUntil: 'domcontentloaded', timeout: 6000 });
        const subText = await page.evaluate(() => document.body?.innerText || '').catch(() => '');
        const beforeCount = result.emails.length;
        extractContacts(subText, result);
        if (sub.includes('contact') && result.emails.length > beforeCount) {
          result.contactPage = new URL(sub, url).href;
        }
      } catch {}
    }

    await page.close();
  } catch (err) {
    result.error = err.message;
  }

  return result;
}

function extractContacts(text, result) {
  // Emails
  const emails = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g) || [];
  for (const e of emails) {
    const clean = e.trim().toLowerCase();
    if (!clean.includes('.png') && !clean.includes('.jpg') && !clean.includes('noreply') && !clean.includes('donotreply') && !clean.includes('example')) {
      if (!result.emails.includes(clean)) result.emails.push(clean);
    }
  }
  // Phones
  const phones = text.match(/(\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}/g) || [];
  for (const p of phones) {
    const clean = p.trim();
    if (!result.phones.includes(clean)) result.phones.push(clean);
  }
}

async function main() {
  const headless = !process.argv.includes('--visible');
  const limitIdx = process.argv.indexOf('--limit');
  const limit = limitIdx > -1 ? parseInt(process.argv[limitIdx + 1]) || 10 : 10;
  const filterCat = process.argv.indexOf('--category');
  const category = filterCat > -1 ? process.argv[filterCat + 1] : null;

  const browser = await chromium.launch({ headless, args: ['--no-sandbox'] });

  let targets = DB.getTargetsByStatus('pending');
  if (category) targets = targets.filter(t => t.category === category);
  
  const batch = targets.slice(0, limit);
  console.log(`🎯 Scraping ${batch.length} targets...\n`);

  let withContact = 0;
  for (let i = 0; i < batch.length; i += MAX_CONCURRENT) {
    const group = batch.slice(i, i + MAX_CONCURRENT);
    const results = await Promise.all(group.map(t => scrapeOne(browser, t.domain)));
    
    for (const r of results) {
      const hasEmail = r.emails.length > 0;
      const icon = r.error ? '❌' : hasEmail ? '✅' : '⚠️';
      console.log(`  ${icon} ${r.domain.padEnd(40)} ${r.category.padEnd(15)} ${hasEmail ? r.emails[0] : 'no email'}`);
      
      if (hasEmail) withContact++;
      DB.updateTarget(r.domain, {
        status: r.error ? 'error' : hasEmail ? 'scraped' : 'pending',
        title: r.title?.substring(0, 100),
        category: r.category,
        emails: r.emails,
        phones: r.phones,
        contactPage: r.contactPage,
        scrapeError: r.error
      });
    }
  }

  await browser.close();

  console.log(`\n✅ ${withContact}/${batch.length} domains have contact info`);
  console.log('\n💡 Next: node scripts/backlink-machine/generate-emails.cjs');
  console.log('   Or:   node scripts/backlink-machine/dashboard.cjs');
}

main().catch(console.error);
