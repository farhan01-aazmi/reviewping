#!/usr/bin/env node
/**
 * Quick-win: Auto-open SaaS directory submission pages.
 * These sites accept tool listings — just fill out the form.
 * 
 * Usage: node scripts/backlink-machine/quick-wins.cjs
 */
const { chromium } = require('playwright');
const DB = require('./db.cjs');

const QUICK_WINS = [
  { name: 'Zipdo', url: 'https://zipdo.co/submit', type: 'SaaS Directory', pageType: 'form' },
  { name: 'WebCatalog', url: 'https://webcatalog.io/submit', type: 'SaaS Directory', pageType: 'form' },
  { name: 'PhDeck', url: 'https://phdeck.com/submit', type: 'Product Hunt Alternative', pageType: 'form' },
  { name: 'What Are The Best', url: 'https://whatarethebest.com/submit', type: 'Review Site', pageType: 'form' },
  { name: 'PPCMate', url: 'https://ppcmate.com/submit-tool', type: 'Marketing Tools', pageType: 'form' },
  { name: 'Advids', url: 'https://advids.co/submit', type: 'Video/Marketing Tools', pageType: 'form' },
  { name: 'SaaSworthy', url: 'https://www.saasworthy.com/listing', type: 'SaaS Directory', pageType: 'form' },
  { name: 'HubSpot Marketplace', url: 'https://ecosystem.hubspot.com/marketplace/listing', type: 'Marketplace', pageType: 'complex' },
  { name: 'Branchenbuch', url: 'https://www.branchenbuch.ch/eintragen', type: 'Business Directory', pageType: 'form' },
  { name: 'Working Nomads', url: 'https://www.workingnomads.com/jobs', type: 'Jobs', pageType: 'form' },
];

async function main() {
  console.log(`
╔══════════════════════════════════════════════════════╗
║        🚀 QUICK WINS — Auto-Submit Directories      ║
╚══════════════════════════════════════════════════════╝
`);
  
  console.log('These sites accept free tool/directory listings:\n');
  
  for (const site of QUICK_WINS) {
    console.log(`  ${site.name.padEnd(30)} ${site.url}`);
    console.log(`  ${' '.repeat(30)} Type: ${site.type}`);
    console.log();
  }
  
  console.log('────────────────────────────────────────────\n');
  console.log('📋 INFORMATION NEEDED FOR SUBMISSIONS:');
  console.log('   Tool Name:        ReviewPing');
  console.log('   URL:              https://www.reviewping.pro');
  console.log('   Description:      Google Review Automation for Small Businesses');
  console.log('   Tagline:          Get 30+ Google Reviews/Month Automatically | $29/mo');
  console.log('   Category:         Review Management / Customer Feedback');
  console.log('   Pricing:          $29/mo (Starter), $79/mo (Pro), $149/mo (Agency)');
  console.log('   Competitors:      Podium, Birdeye, Grade.Us, NiceJob, TrueReview');
  console.log('   Email:            support@reviewping.pro');
  
  console.log('\n────────────────────────────────────────────\n');
  
  const browser = await chromium.launch({ headless: false, args: ['--no-sandbox'] });
  const context = await browser.newContext();
  
  for (const site of QUICK_WINS) {
    console.log(`\n🌐 Opening ${site.name}...`);
    const page = await context.newPage();
    try {
      await page.goto(site.url, { waitUntil: 'domcontentloaded', timeout: 15000 });
      await page.waitForTimeout(2000);
      console.log(`   ✅ ${site.url} — ready for manual fill`);
      
      // Take a screenshot
      await page.screenshot({ path: `backlink-data/screenshots/${site.name.replace(/[^a-z0-9]/gi, '_')}.png`, fullPage: true });
      
      // Mark in DB
      DB.addTargets([{ 
        domain: new URL(site.url).hostname.replace('www.', ''),
        status: 'scraped',
        category: 'saas_review',
        title: site.name,
        url: site.url
      }]);
      
    } catch (err) {
      console.log(`   ❌ Error: ${err.message}`);
    }
    await page.close();
  }
  
  await browser.close();
  
  console.log('\n✅ Done! Check backlink-data/screenshots/ for previews.');
  console.log('   Now manually fill out the forms that opened.');
  console.log('\n💡 Run: node scripts/backlink-machine/dashboard.cjs');
}

// Ensure screenshots dir exists
const fs = require('fs');
const path = require('path');
const shotsDir = path.resolve(__dirname, '../../backlink-data/screenshots');
if (!fs.existsSync(shotsDir)) fs.mkdirSync(shotsDir, { recursive: true });

main().catch(console.error);
