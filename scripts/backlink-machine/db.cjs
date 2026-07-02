#!/usr/bin/env node
/**
 * Simple JSON database for tracking backlink outreach.
 * No dependencies — uses flat JSON files.
 */
const fs = require('fs');
const path = require('path');

const DB_DIR = path.resolve(__dirname, '../../backlink-data');
const TARGETS_FILE = path.join(DB_DIR, 'targets.json');
const OUTREACH_FILE = path.join(DB_DIR, 'outreach.json');
const STATS_FILE = path.join(DB_DIR, 'stats.json');

// Ensure directory exists
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

function readJson(file) {
  try { return JSON.parse(fs.readFileSync(file, 'utf-8')); } catch { return []; }
}

function writeJson(file, data) {
  fs.writeFileSync(file, JSON.stringify(data, null, 2));
}

const DB = {
  // === TARGETS ===
  getTargets() {
    return readJson(TARGETS_FILE);
  },
  
  addTargets(domains) {
    const existing = this.getTargets();
    const existingDomains = new Set(existing.map(t => t.domain));
    const newTargets = [];
    
    for (const d of domains) {
      if (!existingDomains.has(d.domain)) {
        newTargets.push({
          ...d,
          addedAt: new Date().toISOString(),
          status: 'pending' // pending | scraped | contacted | replied | no_contact
        });
      }
    }
    
    if (newTargets.length > 0) {
      writeJson(TARGETS_FILE, [...existing, ...newTargets]);
    }
    return newTargets.length;
  },
  
  updateTarget(domain, updates) {
    const targets = this.getTargets();
    const idx = targets.findIndex(t => t.domain === domain);
    if (idx !== -1) {
      targets[idx] = { ...targets[idx], ...updates, updatedAt: new Date().toISOString() };
      writeJson(TARGETS_FILE, targets);
      return true;
    }
    return false;
  },
  
  getTargetsByStatus(status) {
    return this.getTargets().filter(t => t.status === status);
  },

  // === OUTREACH ===
  getOutreach() {
    return readJson(OUTREACH_FILE);
  },
  
  logOutreach(entry) {
    const log = this.getOutreach();
    log.push({ ...entry, timestamp: new Date().toISOString() });
    writeJson(OUTREACH_FILE, log);
  },
  
  // === STATS ===
  getStats() {
    const stats = readJson(STATS_FILE);
    if (stats.length === 0) {
      return { totalTargets: 0, scraped: 0, contacted: 0, replies: 0, linksBuilt: 0, lastUpdated: null };
    }
    return stats[stats.length - 1];
  },
  
  updateStats(stats) {
    writeJson(STATS_FILE, [stats]);
  },

  // Generate summary
  summary() {
    const targets = this.getTargets();
    if (targets.length === 0) return { total: 0, status: 'Empty' };
    
    const byStatus = {};
    targets.forEach(t => {
      byStatus[t.status] = (byStatus[t.status] || 0) + 1;
    });
    
    return {
      total: targets.length,
      withEmail: targets.filter(t => t.emails && t.emails.length > 0).length,
      byStatus,
      outreachSent: this.getOutreach().length,
    };
  }
};

module.exports = DB;
