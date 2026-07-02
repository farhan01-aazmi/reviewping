#!/usr/bin/env node
/**
 * Automated email sender for backlink outreach.
 * 
 * Usage:
 *   # Configure email provider first:
 *   node scripts/backlink-machine/send.js --configure
 *   
 *   # Send emails (dry run first):
 *   node scripts/backlink-machine/send.js --dry-run
 *   
 *   # Actually send:
 *   node scripts/backlink-machine/send.js --send --limit 5
 *   
 *   # Track replies (mock):
 *   node scripts/backlink-machine/send.js --track
 */
const fs = require('fs');
const path = require('path');
const DB = require('./db.cjs');

const CONFIG_FILE = path.resolve(__dirname, '../../backlink-data/sender-config.json');
const EMAILS_FILE = path.resolve(__dirname, '../../backlink-data/outreach-emails.json');
const SENT_LOG = path.resolve(__dirname, '../../backlink-data/sent.json');

function loadConfig() {
  try { return JSON.parse(fs.readFileSync(CONFIG_FILE, 'utf-8')); } 
  catch { return null; }
}

function saveConfig(config) {
  fs.writeFileSync(CONFIG_FILE, JSON.stringify(config, null, 2));
}

function loadSent() {
  try { return JSON.parse(fs.readFileSync(SENT_LOG, 'utf-8')); }
  catch { return []; }
}

function saveSent(sent) {
  fs.writeFileSync(SENT_LOG, JSON.stringify(sent, null, 2));
}

async function configure() {
  console.log(`
╔═══════════════════════════════════════════════════╗
║     Backlink Outreach — Email Configuration       ║
╚═══════════════════════════════════════════════════╝

Choose your email provider:
  [1] SendGrid    — API key (free: 100 emails/day)
  [2] Mailgun     — API key + domain (free: 100/day)
  [3] Resend      — API key (free: 100/day)
  [4] SMTP        — Any SMTP server (Gmail, Outlook, etc.)
  [5] Skip        — Just generate, I'll send manually
`);
  
  // Since we can't do interactive input well, provide instructions
  console.log(`
📋 Instructions for manual setup:
  
  Create file: backlink-data/sender-config.json
  Content:
  {
    "provider": "sendgrid",
    "apiKey": "YOUR_API_KEY",
    "fromEmail": "your@email.com",
    "fromName": "Team ReviewPing"
  }

  Supported providers: sendgrid, mailgun, resend, smtp

  For SMTP:
  {
    "provider": "smtp",
    "host": "smtp.gmail.com",
    "port": 587,
    "user": "your@gmail.com",
    "pass": "app-password",
    "fromEmail": "your@gmail.com",
    "fromName": "Team ReviewPing"
  }
`);
}

async function sendBatch(emails, config, isDryRun, limit = 5) {
  const toSend = emails.filter(e => e.status === 'ready').slice(0, limit);
  
  if (toSend.length === 0) {
    console.log('❌ No ready-to-send emails found.');
    return;
  }
  
  if (isDryRun) {
    console.log(`\n🔍 DRY RUN — Would send ${toSend.length} emails:\n`);
    toSend.forEach((e, i) => {
      console.log(`─── Email #${i + 1} ───────────────────────`);
      console.log(`  To:       ${e.to}`);
      console.log(`  Domain:   ${e.domain}`);
      console.log(`  Subject:  ${e.subject}`);
      console.log(`  Body preview: ${e.body.substring(0, 100)}...`);
      console.log('');
    });
    console.log(`📊 Total ready: ${emails.filter(e => e.status === 'ready').length}`);
    console.log(`📊 Need contact: ${emails.filter(e => e.status === 'needs_contact').length}`);
    console.log(`\n✅ To actually send: node scripts/backlink-machine/send.js --send --limit ${limit}`);
    return;
  }
  
  // Actually send
  console.log(`\n📧 Sending ${toSend.length} emails via ${config.provider}...\n`);
  
  const sent = loadSent();
  let success = 0;
  let failed = 0;
  
  for (const email of toSend) {
    try {
      let result;
      
      if (config.provider === 'sendgrid') {
        // SendGrid API
        const sgMail = require('@sendgrid/mail');
        sgMail.setApiKey(config.apiKey);
        result = await sgMail.send({
          to: email.to,
          from: { email: config.fromEmail, name: config.fromName },
          subject: email.subject,
          text: email.body,
        });
      } else if (config.provider === 'resend') {
        // Resend API
        const { Resend } = require('resend');
        const resend = new Resend(config.apiKey);
        result = await resend.emails.send({
          from: `${config.fromName} <${config.fromEmail}>`,
          to: email.to,
          subject: email.subject,
          text: email.body,
        });
      } else if (config.provider === 'smtp') {
        // SMTP (Gmail, Outlook, etc.)
        const nodemailer = require('nodemailer');
        const transporter = nodemailer.createTransport({
          host: config.host,
          port: config.port,
          secure: config.port === 465,
          auth: { user: config.user, pass: config.pass },
        });
        result = await transporter.sendMail({
          from: `"${config.fromName}" <${config.fromEmail}>`,
          to: email.to,
          subject: email.subject,
          text: email.body,
        });
      } else {
        throw new Error(`Unknown provider: ${config.provider}`);
      }
      
      // Log success
      const entry = {
        domain: email.domain,
        sentTo: email.to,
        subject: email.subject,
        category: email.category,
        sentAt: new Date().toISOString(),
        status: 'sent'
      };
      sent.push(entry);
      DB.logOutreach(entry);
      DB.updateTarget(email.domain, { status: 'contacted', contactedAt: new Date().toISOString() });
      
      console.log(`  ✅ ${email.domain} — sent to ${email.to}`);
      success++;
      
    } catch (err) {
      console.log(`  ❌ ${email.domain} — ${err.message}`);
      failed++;
      
      DB.logOutreach({
        domain: email.domain,
        sentTo: email.to,
        status: 'failed',
        error: err.message,
        sentAt: new Date().toISOString()
      });
    }
    
    // Rate limiting — 1 email per 3 seconds (avoid spam flags)
    if (toSend.length > 1) {
      await new Promise(r => setTimeout(r, 3000));
    }
  }
  
  saveSent(sent);
  
  console.log(`\n📊 Results: ${success} sent, ${failed} failed`);
  console.log(`📁 Log: backlink-data/sent.json`);
  
  DB.updateStats({
    totalTargets: DB.getTargets().length,
    scraped: DB.getTargetsByStatus('scraped').length,
    contacted: DB.getTargetsByStatus('contacted').length,
    replies: 0,
    linksBuilt: 0,
    lastUpdated: new Date().toISOString()
  });
}

async function trackReplies() {
  console.log('📬 Reply tracking requires a webhook endpoint.');
  console.log('   Setup:');
  console.log('   1. SendGrid: Settings → Mail Settings → Event Webhook');
  console.log('   2. Point to: https://your-server.com/api/backlink-webhook');
  console.log('   3. We\'ll track opens, clicks, and replies automatically');
  console.log('');
  console.log('   For now, check: backlink-data/sent.json for sent emails');
  console.log('   And: backlink-data/outreach.json for full outreach log');
  
  const sent = loadSent();
  console.log(`\n📊 Total sent so far: ${sent.length}`);
  const byDomain = {};
  sent.forEach(s => {
    byDomain[s.domain] = byDomain[s.domain] || 0;
    byDomain[s.domain]++;
  });
  if (Object.keys(byDomain).length > 0) {
    console.log('\n   Sent to:');
    Object.entries(byDomain).slice(0, 10).forEach(([d, c]) => console.log(`   ${d} — ${c} email(s)`));
  }
}

async function main() {
  const args = process.argv.slice(2);
  
  if (args.includes('--configure') || args.includes('--config')) {
    await configure();
    return;
  }
  
  const config = loadConfig();
  if (!config && (args.includes('--send') || args.includes('--dry-run'))) {
    console.log('❌ No configuration found.');
    console.log('   Run: node scripts/backlink-machine/send.js --configure');
    return;
  }
  
  let emails;
  try { emails = JSON.parse(fs.readFileSync(EMAILS_FILE, 'utf-8')); }
  catch { 
    console.log('❌ No outreach emails found.');
    console.log('   Run: node scripts/backlink-machine/generate-emails.js');
    return;
  }
  
  if (args.includes('--dry-run')) {
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : 5;
    await sendBatch(emails, config, true, limit);
  } else if (args.includes('--send')) {
    const limitIdx = args.indexOf('--limit');
    const limit = limitIdx > -1 ? parseInt(args[limitIdx + 1]) : 5;
    await sendBatch(emails, config, false, limit);
  } else if (args.includes('--track')) {
    await trackReplies();
  } else {
    console.log(`Usage:
  node scripts/backlink-machine/send.js --configure    Setup email provider
  node scripts/backlink-machine/send.js --dry-run       Preview emails
  node scripts/backlink-machine/send.js --send --limit 5 Actually send
  node scripts/backlink-machine/send.js --track         Check replies
`);
  }
}

main().catch(console.error);
