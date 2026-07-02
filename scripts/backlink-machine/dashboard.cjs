#!/usr/bin/env node
/**
 * Backlink Machine — Dashboard & Status Report
 * 
 * Usage: node scripts/backlink-machine/dashboard.js
 *        node scripts/backlink-machine/dashboard.js --watch  (refresh every 30s)
 */
const fs = require('fs');
const path = require('path');
const DB = require('./db.cjs');

function formatNumber(n) { return (n || 0).toLocaleString(); }

function bar(value, max, width = 20) {
  const filled = Math.round((value / Math.max(max, 1)) * width);
  return '█'.repeat(filled) + '░'.repeat(Math.max(width - filled, 0));
}

function dashboard() {
  const summary = DB.summary();
  const stats = DB.getStats();
  
  const lines = [];

  lines.push(`
╔══════════════════════════════════════════════════════╗
║        🔗 BACKLINK MACHINE — DASHBOARD              ║
╚══════════════════════════════════════════════════════╝`);

  lines.push(`
📊 OVERVIEW
   Total targets:    ${formatNumber(summary.total)}
   With email:       ${formatNumber(summary.withEmail)}
   Outreach sent:    ${formatNumber(summary.outreachSent)}
`);

  // Status breakdown
  if (Object.keys(summary.byStatus).length > 0) {
    lines.push('📈 PROGRESS');
    const maxCount = Math.max(...Object.values(summary.byStatus), 1);
    for (const [status, count] of Object.entries(summary.byStatus).sort((a, b) => b[1] - a[1])) {
      const icon = status === 'contacted' ? '✅' : status === 'scraped' ? '📄' : status === 'pending' ? '⏳' : status === 'error' ? '❌' : '⬜';
      lines.push(`   ${icon} ${status.padEnd(12)} ${count.toString().padStart(5)} ${bar(count, maxCount)}`);
    }
  }

  // Top sites scraped with emails
  const withEmail = DB.getTargets().filter(t => t.emails?.length > 0);
  if (withEmail.length > 0) {
    lines.push(`\n📋 TOP CONTACTS FOUND`);
    withEmail.slice(0, 10).forEach(t => {
      const emailStr = t.emails.slice(0, 2).join(', ');
      const cat = t.category || '?';
      lines.push(`   ${cat.padEnd(15)} ${t.domain.padEnd(40)} ${emailStr?.substring(0, 35) || 'no email'}`);
    });
  }

  // Recent outreach
  const outreach = DB.getOutreach();
  const recentOutreach = outreach.slice(-5).reverse();
  if (recentOutreach.length > 0) {
    lines.push(`\n📨 RECENT OUTREACH`);
    recentOutreach.forEach(o => {
      const icon = o.status === 'sent' ? '✅' : o.status === 'failed' ? '❌' : '⬜';
      const date = o.sentAt ? new Date(o.sentAt).toLocaleDateString() : '??';
      lines.push(`   ${icon} ${date} — ${o.domain} — ${o.status}`);
    });
  }

  // Quick stats
  lines.push(`\n⚡ QUICK STATS
   📁 Data stored: backlink-data/
   🔧 Config: backlink-data/sender-config.json
   
   Next commands:
   ➜  node scripts/backlink-machine/scraper.js --limit 20
   ➜  node scripts/backlink-machine/generate-emails.js
   ➜  node scripts/backlink-machine/send.js --dry-run
   ➜  node scripts/backlink-machine/send.js --send --limit 5
`);

  return lines.join('\n');
}

if (require.main === module) {
  if (process.argv.includes('--watch') || process.argv.includes('-w')) {
    console.log('📡 Watching... (refresh every 30s, Ctrl+C to stop)');
    setInterval(() => {
      console.clear();
      console.log(dashboard());
    }, 30000);
    console.log(dashboard());
  } else {
    console.log(dashboard());
  }
}

module.exports = dashboard;
