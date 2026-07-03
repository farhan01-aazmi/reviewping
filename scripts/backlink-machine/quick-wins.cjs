#!/usr/bin/env node
/**
 * Quick wins — SaaS directories and listing sites that accept free submissions.
 * Just click and fill. Ready-to-use info below.
 * 
 * Usage: node scripts/backlink-machine/quick-wins.cjs
 */

const SITES = [
  { name: 'Zipdo', url: 'https://zipdo.co/submit', type: 'SaaS Directory', difficulty: 'Easy' },
  { name: 'WebCatalog', url: 'https://webcatalog.io/submit', type: 'SaaS Directory', difficulty: 'Easy' },
  { name: 'PhDeck', url: 'https://phdeck.com/submit', type: 'Product Hunt Alt', difficulty: 'Easy' },
  { name: 'What Are The Best', url: 'https://whatarethebest.com/submit', type: 'Review Site', difficulty: 'Easy' },
  { name: 'PPCMate', url: 'https://ppcmate.com/submit-tool', type: 'Marketing Tools', difficulty: 'Easy' },
  { name: 'Advids', url: 'https://advids.co/submit', type: 'Video Tools', difficulty: 'Easy' },
  { name: 'SaaSworthy', url: 'https://www.saasworthy.com/listing', type: 'SaaS Directory', difficulty: 'Easy' },
  { name: 'Branchenbuch', url: 'https://www.branchenbuch.ch/eintragen', type: 'Business Dir', difficulty: 'Easy' },
  { name: 'HubSpot Marketplace', url: 'https://ecosystem.hubspot.com/marketplace/listing', type: 'Marketplace', difficulty: 'Medium' },
  { name: 'Crozdesk', url: 'https://crozdesk.com/submit', type: 'SaaS Directory', difficulty: 'Easy' },
  { name: 'AlternativeTo', url: 'https://alternativeto.net/submit/', type: 'SaaS Directory', difficulty: 'Easy' },
  { name: 'TrustRadius', url: 'https://www.trustradius.com/vendors/submit-your-product', type: 'Review Site', difficulty: 'Medium' },
  { name: 'Slintel', url: 'https://www.slintel.com/add-product', type: 'SaaS Directory', difficulty: 'Easy' },
  { name: 'GetApp', url: 'https://www.getapp.com/services/submit-vendor/', type: 'Review Site', difficulty: 'Medium' },
  { name: 'Software Advice', url: 'https://www.softwareadvice.com/vendor-signup/', type: 'Review Site', difficulty: 'Medium' },
];

console.log(`
╔══════════════════════════════════════════════════════╗
║     🚀 QUICK WINS — SaaS Directory Submissions      ║
║     Total: ${SITES.length} sites — Estimated time: 30 mins     ║
╚══════════════════════════════════════════════════════╝

📋 COPY-PASTE INFO FOR ALL SUBMISSIONS:
─────────────────────────────────────
  Tool Name:        ReviewPing
  URL:              https://www.reviewping.pro
  Tagline:          Get 30+ Google Reviews/Month Automatically
  Category:         Review Management / Customer Feedback
  Pricing:          Free plan + $29/mo (Starter), $79/mo (Pro)
  Competitors:      Podium, Birdeye, Grade.Us, NiceJob
  Email:            support@reviewping.pro
  Short Desc:       ReviewPing helps local businesses automate Google review 
                    requests via SMS, email, and WhatsApp. Affordable alternative 
                    to Podium starting at $29/month.
─────────────────────────────────────\n`);

SITES.forEach((s, i) => {
  console.log(`  ${i + 1}. ${s.name.padEnd(25)} ${s.difficulty.padEnd(8)} ${s.url}`);
});

console.log(`
✅ ${SITES.filter(s => s.difficulty === 'Easy').length} easy submissions — just fill form, submit, done
⚠️ ${SITES.filter(s => s.difficulty === 'Medium').length} medium — might need account creation or review

💡 Tip: Start with Zipdo, WebCatalog, PhDeck — fastest to get listed.
    Each backlink from these directories = +1 referring domain.
`);
