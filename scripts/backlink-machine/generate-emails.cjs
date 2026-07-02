#!/usr/bin/env node
/**
 * Automated email generator for backlink outreach.
 * Reads scraped targets and generates personalized emails.
 * 
 * Usage: node scripts/backlink-machine/generate-emails.js [--category saas_review]
 *        node scripts/backlink-machine/generate-emails.js --all
 */
const DB = require('./db.cjs');

const TEMPLATES = {
  saas_review: {
    subject: 'List ReviewPing on {site_name} — Best Alternative to Podium',
    body: `Hi {name},

I noticed {site_name} lists tools like Podium for review management.

We built ReviewPing (https://www.reviewping.pro) — a simpler, more affordable alternative to Podium starting at just $29/month. We help local businesses automate Google review requests via SMS, email, and WhatsApp.

Would {site_name} be interested in adding ReviewPing to your software listings? It's a great option for small businesses who find Podium too expensive.

Happy to provide screenshots, API details, or anything else you need.

Thanks,
{your_name}
{your_site}`
  },

  blog: {
    subject: 'Guest Post: How Small Businesses Can Automate Google Reviews',
    body: `Hi {name},

I'm reaching out because {site_name} publishes great content for local businesses.

I'd love to contribute a guest post: "How to Get 30+ Google Reviews Per Month (Without Begging Customers)". It would cover practical automation strategies using tools like ReviewPing.

I think your audience would find this valuable, especially small business owners struggling to build their online reputation.

Let me know if you're open to guest contributions!

Best,
{your_name}
{your_site}`
  },

  directory: {
    subject: 'Add ReviewPing to {site_name} Directory',
    body: `Hi {name},

I'd like to submit ReviewPing to the {site_name} directory.

ReviewPing (https://www.reviewping.pro) is a Google review automation platform — an affordable alternative to Podium. We help local businesses automate SMS, email, and WhatsApp review requests.

Could you please let me know the process for adding a listing?

Thanks,
{your_name}
{your_site}`
  },

  local_business: {
    subject: 'Save on Review Management — ReviewPing vs Podium',
    body: `Hi there,

I noticed your business might be using or considering Podium for review management.

We built ReviewPing (https://www.reviewping.pro) — same core functionality as Podium but at a fraction of the cost ($29/month vs Podium's $300+).

Many service businesses (plumbers, electricians, garage doors, etc.) use us to automate Google review requests and grow their reputation.

Would you be open to a 14-day free trial? Happy to set everything up for you.

Cheers,
{your_name}
{your_site}`
  },

  medspa: {
    subject: 'Get More Google Reviews for {site_name}',
    body: `Hi {name},

Med spas rely heavily on Google reviews — I get it. 

ReviewPing (https://www.reviewping.pro) helps med spas automate review requests after every appointment via SMS and email. Several aesthetic clinics use us to grow from 20 to 200+ Google reviews.

We're like Podium but priced for small businesses: $29/month, no contracts.

Want to try it free for 14 days?

Best,
{your_name}
{your_site}`
  },

  edu: {
    subject: 'Partnership: ReviewPing for Alumni/Student Reviews',
    body: `Hi {name},

I'm reaching out because {site_name} is an educational institution that values reputation.

ReviewPing helps organizations manage their Google reviews. We'd love to offer your students/alumni a special discount or explore a partnership.

Let me know if this is something {site_name} would be interested in.

Thanks,
{your_name}
{your_site}`
  },

  default: {
    subject: 'Quick question about {site_name}',
    body: `Hi {name},

I came across {site_name} and wanted to reach out.

We built ReviewPing (https://www.reviewping.pro) — a platform that helps businesses automate Google review requests. We're an affordable alternative to Podium starting at $29/month.

If {site_name} ever covers review management tools or software for local businesses, I'd love to connect.

Thanks,
{your_name}
{your_site}`
  }
};

function classifyTarget(target) {
  // Try saved category first
  if (target.category && TEMPLATES[target.category]) return target.category;
  
  // Guess from domain
  const d = target.domain.toLowerCase();
  if (d.includes('medspa') || d.includes('aesthetics') || d.includes('spa') || d.includes('wellness')) return 'medspa';
  if (d.includes('plumbing') || d.includes('electric') || d.includes('garage') || d.includes('roof') || d.includes('hvac') || d.includes('locksmith')) return 'local_business';
  if (d.includes('review') || d.includes('catalog') || d.includes('directory') || d.includes('listing')) return 'directory';
  if (d.endsWith('.edu')) return 'edu';
  
  return 'default';
}

function generateEmails(targets, userName = 'Team ReviewPing') {
  const emails = [];
  
  for (const target of targets) {
    const category = classifyTarget(target);
    const template = TEMPLATES[category] || TEMPLATES.default;
    const siteName = target.title || target.domain.replace('.com', '').replace('.pro', '').replace(/[-.]/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
    
    let body = template.body
      .replace(/{name}/g, 'Team')
      .replace(/{site_name}/g, siteName)
      .replace(/{your_name}/g, userName)
      .replace(/{your_site}/g, 'https://www.reviewping.pro');
    
    let subject = template.subject
      .replace(/{site_name}/g, siteName);
    
    // If we have contact name, try to use it
    const contactName = target.contactName || 'Team';
    if (contactName !== 'Team') {
      body = body.replace('Hi Team,', `Hi ${contactName},`);
    }
    
    const primaryEmail = target.emails?.[0] || null;
    const fallbackEmails = target.emails?.slice(1) || [];
    
    emails.push({
      domain: target.domain,
      category,
      subject,
      body,
      to: primaryEmail,
      cc: fallbackEmails.join(', '),
      status: primaryEmail ? 'ready' : 'needs_contact',
      url: target.url || `https://${target.domain}`,
      siteName,
      contactPage: target.contactPage || null
    });
  }
  
  return emails;
}

// CLI mode
if (require.main === module) {
  const DB = require('./db.cjs');
  const fs = require('fs');
  const path = require('path');
  
  const mode = process.argv.includes('--all') ? 'all' : 'scraped';
  const userName = process.argv.find(a => a.startsWith('--name='))?.split('=')[1] || 'Team ReviewPing';
  const outputFile = path.resolve(__dirname, '../../backlink-data/outreach-emails.json');
  
  let targets;
  if (mode === 'all') {
    targets = DB.getTargets();
  } else {
    targets = DB.getTargetsByStatus('scraped');
  }
  
  // Filter to only those with emails or contact info
  const viable = targets.filter(t => t.emails?.length > 0 || t.contactPage);
  
  if (viable.length === 0) {
    console.log('❌ No scraped targets with contact info found.');
    console.log('   Run scraper first: node scripts/backlink-machine/scraper.js --limit 20');
    process.exit(1);
  }
  
  console.log(`📧 Generating emails for ${viable.length} viable targets...`);
  const emails = generateEmails(viable, userName);
  
  // Save
  fs.writeFileSync(outputFile, JSON.stringify(emails, null, 2));
  
  // Summary
  const ready = emails.filter(e => e.status === 'ready').length;
  const needContact = emails.filter(e => e.status === 'needs_contact').length;
  
  console.log(`\n📊 Summary:`);
  console.log(`   ✅ ${ready} emails ready to send`);
  console.log(`   ⚠️  ${needContact} need manual contact info`);
  console.log(`   📁 Saved to: backlink-data/outreach-emails.json`);
  
  // Group by category
  const byCategory = {};
  emails.forEach(e => {
    byCategory[e.category] = (byCategory[e.category] || 0) + 1;
  });
  console.log(`\n📂 By category:`);
  Object.entries(byCategory).forEach(([cat, count]) => {
    console.log(`   ${cat}: ${count}`);
  });
  
  console.log('\n💡 To send: node scripts/backlink-machine/send.js');
}

module.exports = { generateEmails, TEMPLATES };
