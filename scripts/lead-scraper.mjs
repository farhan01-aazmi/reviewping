#!/usr/bin/env node

// =============================================================================
// ReviewPing — Mass Lead Scraper
// =============================================================================
// Sources business leads from the Google Places API across 26 categories and
// 50+ US/UK cities, then stores them in Supabase for outreach.
//
// Usage:
//   node scripts/lead-scraper.mjs
//   node scripts/lead-scraper.mjs --dry-run
//   node scripts/lead-scraper.mjs --city "New York"
//   node scripts/lead-scraper.mjs --category "dentist"
//   node scripts/lead-scraper.mjs --city "London" --category "plumber" --country UK
//
// Environment:
//   SUPABASE_URL              — your Supabase project URL
//   SUPABASE_SERVICE_ROLE_KEY — service_role key (allows inserts)
//   GOOGLE_PLACES_API_KEY     — Google Places API key
// =============================================================================

import https from 'node:https';
import { URL } from 'node:url';

// ── Config ────────────────────────────────────────────────────────────────────
const API_KEY = process.env.GOOGLE_PLACES_API_KEY;
const SUPABASE_URL = process.env.SUPABASE_URL?.replace(/\/+$/, '');
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

const DRY_RUN = process.argv.includes('--dry-run');
const TARGET_CITY = extractArg('--city');
const TARGET_CATEGORY = extractArg('--category');
const TARGET_COUNTRY = (extractArg('--country') || 'US').toUpperCase();

// ── Target Categories (USA/UK small businesses) ──────────────────────────────
const CATEGORIES = [
  'dentist', 'salon', 'restaurant', 'plumber', 'mechanic', 'gym',
  'hotel', 'physiotherapist', 'home cleaner', 'retail shop',
  'veterinarian', 'chiropractor', 'optometrist', 'spa', 'nail salon',
  'barber', 'electrician', 'hvac', 'landscaper', 'mover',
  'photographer', 'bakery', 'cafe', 'yoga studio', 'auto detailer',
  'car wash',
];

// ── Target Cities (USA) ──────────────────────────────────────────────────────
const CITIES_US = [
  'New York', 'Los Angeles', 'Chicago', 'Houston', 'Phoenix',
  'Philadelphia', 'San Antonio', 'San Diego', 'Dallas', 'San Jose',
  'Austin', 'Jacksonville', 'Fort Worth', 'Columbus', 'Charlotte',
  'Indianapolis', 'San Francisco', 'Seattle', 'Denver', 'Nashville',
  'Miami', 'Portland', 'Oklahoma City', 'Las Vegas', 'Louisville',
  'Baltimore', 'Milwaukee', 'Albuquerque', 'Tucson', 'Fresno',
  'Sacramento', 'Kansas City', 'Long Beach', 'Mesa', 'Atlanta',
  'Colorado Springs', 'Raleigh', 'Omaha', 'Virginia Beach', 'Tampa',
  'Orlando', 'Cleveland', 'Tulsa', 'Honolulu', 'Minneapolis',
  'Arlington', 'New Orleans', 'Boston', 'Pittsburgh', 'Cincinnati',
  'St. Louis',
];

const CITIES_UK = [
  'London', 'Birmingham', 'Manchester', 'Glasgow', 'Edinburgh',
  'Liverpool', 'Bristol', 'Leeds', 'Leicester', 'Nottingham',
  'Sheffield', 'Newcastle upon Tyne', 'Cardiff', 'Belfast',
  'Southampton', 'Portsmouth', 'Brighton', 'Oxford', 'Cambridge',
  'York',
];

// ── Stats tracking ───────────────────────────────────────────────────────────
const stats = {
  totalFound: 0,
  totalInserted: 0,
  totalSkipped: 0,
  totalErrors: 0,
  byCategory: {},
  byCity: {},
};

// ── Helpers ───────────────────────────────────────────────────────────────────

function extractArg(flag) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) {
    return process.argv[idx + 1];
  }
  return null;
}

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function log(level, message, data = null) {
  const ts = new Date().toISOString();
  const prefix = `[${ts}] [${level.toUpperCase()}]`;
  if (data) {
    console.log(`${prefix} ${message}`, JSON.stringify(data, null, 2));
  } else {
    console.log(`${prefix} ${message}`);
  }
}

// ── HTTP Request (Promise-based) ──────────────────────────────────────────────

function httpsRequest(url, retries = 3) {
  return new Promise((resolve, reject) => {
    const attempt = (remaining) => {
      const req = https.get(url, { timeout: 15000 }, (res) => {
        let body = '';
        res.on('data', (chunk) => (body += chunk));
        res.on('end', () => {
          if (res.statusCode === 200) {
            try {
              resolve(JSON.parse(body));
            } catch {
              reject(new Error(`Failed to parse JSON from ${url}`));
            }
          } else if (res.statusCode === 403) {
            reject(new Error('API key invalid or quota exceeded (403)'));
          } else if (res.statusCode === 429 && remaining > 0) {
            log('warn', `Rate limited (429), retrying in 5s... (${remaining} retries left)`);
            setTimeout(() => attempt(remaining - 1), 5000);
          } else if (res.statusCode >= 500 && remaining > 0) {
            log('warn', `Server error ${res.statusCode}, retrying in 3s...`);
            setTimeout(() => attempt(remaining - 1), 3000);
          } else {
            reject(new Error(`HTTP ${res.statusCode}: ${body.slice(0, 300)}`));
          }
        });
      });
      req.on('timeout', () => {
        req.destroy();
        if (remaining > 0) {
          log('warn', `Timeout, retrying... (${remaining} retries left)`);
          attempt(remaining - 1);
        } else {
          reject(new Error('Request timed out after retries'));
        }
      });
      req.on('error', (err) => {
        if (remaining > 0) {
          log('warn', `Network error: ${err.message}, retrying...`);
          setTimeout(() => attempt(remaining - 1), 2000);
        } else {
          reject(err);
        }
      });
    };
    attempt(retries);
  });
}

// ── Supabase Client (direct REST, no dependency needed) ──────────────────────

function supabaseRequest(method, path, body = null) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${SUPABASE_URL}/rest/v1/${path}`);
    const options = {
      hostname: url.hostname,
      path: url.pathname + url.search,
      method,
      headers: {
        'apikey': SUPABASE_KEY,
        'Authorization': `Bearer ${SUPABASE_KEY}`,
        'Content-Type': 'application/json',
        'Prefer': 'return=minimal',
      },
      timeout: 15000,
    };

    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        if (res.statusCode >= 200 && res.statusCode < 300) {
          resolve(data ? safeParse(data) : null);
        } else {
          reject(new Error(`Supabase ${method} ${path} → ${res.statusCode}: ${data.slice(0, 300)}`));
        }
      });
    });

    req.on('timeout', () => { req.destroy(); reject(new Error('Supabase request timed out')); });
    req.on('error', reject);

    if (body) req.write(JSON.stringify(body));
    req.end();
  });
}

function safeParse(str) {
  try {
    return JSON.parse(str);
  } catch {
    return str;
  }
}

// ── Google Places API — Text Search ──────────────────────────────────────────

async function searchPlaces(query, pageToken = null) {
  const params = new URLSearchParams({
    query,
    key: API_KEY,
    type: 'establishment',
    ...(pageToken ? { pagetoken: pageToken } : {}),
  });

  const url = `https://maps.googleapis.com/maps/api/place/textsearch/json?${params}`;
  return await httpsRequest(url);
}

// ── Google Places API — Place Details ────────────────────────────────────────

async function getPlaceDetails(placeId) {
  const params = new URLSearchParams({
    place_id: placeId,
    key: API_KEY,
    fields: 'name,formatted_address,formatted_phone_number,website,rating,user_ratings_total,address_component',
  });

  const url = `https://maps.googleapis.com/maps/api/place/details/json?${params}`;
  return await httpsRequest(url);
}

// ── Extract address components from Place Details ────────────────────────────

function extractAddressComponents(placeDetails) {
  const result = {
    address: null,
    city: null,
    state: null,
    zip: null,
    country: TARGET_COUNTRY,
  };

  const components = placeDetails?.result?.address_components || [];

  result.address = placeDetails?.result?.formatted_address || null;

  for (const comp of components) {
    const types = comp.types || [];
    if (types.includes('locality') || types.includes('postal_town')) {
      result.city = comp.long_name;
    }
    if (types.includes('administrative_area_level_1')) {
      result.state = comp.short_name;
    }
    if (types.includes('postal_code')) {
      result.zip = comp.long_name;
    }
    if (types.includes('country')) {
      result.country = comp.short_name?.toUpperCase() || TARGET_COUNTRY;
    }
  }

  return result;
}

// ── Normalise a single business result ───────────────────────────────────────

function normaliseBusiness(item, category, city) {
  const name = item.name?.trim();
  if (!name) return null;

  return {
    business_name: name,
    category,
    google_place_id: item.place_id,
    google_rating: item.rating != null ? Math.round(item.rating * 100) / 100 : null,
    reviews_count: item.user_ratings_total != null ? item.user_ratings_total : 0,
    address: item.formatted_address || null,
    city: city,
    source: 'google_places',
    status: 'new',
    country: TARGET_COUNTRY,
  };
}

// ── Enrich with Place Details (phone, website, address components) ───────────

async function enrichBusiness(business) {
  try {
    const details = await getPlaceDetails(business.google_place_id);

    if (details?.status === 'OK' && details?.result) {
      const r = details.result;
      business.phone = r.formatted_phone_number || null;
      business.website = r.website || null;

      const addr = extractAddressComponents(details);
      business.address = business.address || addr.address;
      business.city = business.city || addr.city;
      business.state = addr.state;
      business.zip = addr.zip;
      business.country = addr.country;
    }

    return business;
  } catch (err) {
    log('warn', `Failed to enrich ${business.business_name}: ${err.message}`);
    return business;  // return what we have without enrichment
  }
}

// ── Upsert into Supabase (insert on conflict → do nothing) ────────────────────

async function upsertLead(business) {
  if (DRY_RUN) {
    stats.totalInserted++;
    return business;
  }

  try {
    // Build the INSERT payload — uses google_place_id as conflict resolution
    const payload = {
      business_name: business.business_name,
      category: business.category,
      phone: business.phone || null,
      email: business.email || null,
      website: business.website || null,
      address: business.address || null,
      city: business.city || null,
      state: business.state || null,
      zip: business.zip || null,
      country: business.country || TARGET_COUNTRY,
      google_rating: business.google_rating,
      reviews_count: business.reviews_count,
      google_place_id: business.google_place_id,
      source: business.source || 'google_places',
      status: 'new',
    };

    await supabaseRequest('POST', 'leads?on_conflict=google_place_id', payload);
    stats.totalInserted++;
    return business;
  } catch (err) {
    // If it's a duplicate (23505), count as skipped
    if (err.message?.includes('23505') || err.message?.includes('duplicate')) {
      stats.totalSkipped++;
    } else {
      stats.totalErrors++;
      log('error', `Failed to insert ${business.business_name} (${business.google_place_id}): ${err.message}`);
    }
    return null;
  }
}

// ── Scrape a single category + city combination ──────────────────────────────

async function scrapeCategoryCity(category, city) {
  const query = `${category} in ${city}`;
  log('info', `Scraping: "${query}"`);

  let pageToken = null;
  let pageCount = 0;
  const MAX_PAGES = 3;  // max 3 pages per search (≈ 60 results)
  let found = 0;

  do {
    const data = await searchPlaces(query, pageToken);

    if (data.status === 'OK' || data.status === 'ZERO_RESULTS') {
      const results = data.results || [];

      for (const item of results) {
        const business = normaliseBusiness(item, category, city);
        if (!business) continue;

        // Enrich with place details to get phone/website
        const enriched = await enrichBusiness(business);

        // Upsert into Supabase
        await upsertLead(enriched);
        found++;

        // Small delay between individual detail requests to be polite
        await sleep(250);
      }

      pageToken = data.next_page_token || null;
      pageCount++;

      // Google requires a short delay before using next_page_token
      if (pageToken) {
        await sleep(2000);
      }
    } else if (data.status === 'OVER_QUERY_LIMIT') {
      log('warn', `Over query limit for "${query}". Waiting 60s...`);
      await sleep(60000);
      // Don't increment pageCount — retry same page
      continue;
    } else if (data.status === 'INVALID_REQUEST') {
      log('error', `Invalid request for "${query}" — skipping`);
      break;
    } else {
      log('warn', `Unknown status for "${query}": ${data.status} — ${data.error_message || ''}`);
      break;
    }
  } while (pageToken && pageCount < MAX_PAGES);

  log('info', `Found ${found} leads for "${query}" (pages: ${pageCount})`);
  stats.totalFound += found;
  stats.byCategory[category] = (stats.byCategory[category] || 0) + found;
  stats.byCity[city] = (stats.byCity[city] || 0) + found;

  return found;
}

// ── Print final report ────────────────────────────────────────────────────────

function printReport() {
  const separator = '='.repeat(60);
  console.log('\n' + separator);
  console.log('  SCRAPE COMPLETE — STATISTICS');
  console.log(separator);
  console.log(`  Total businesses found:   ${stats.totalFound}`);
  console.log(`  Total inserted/updated:   ${stats.totalInserted}`);
  console.log(`  Total skipped (dupes):    ${stats.totalSkipped}`);
  console.log(`  Total errors:             ${stats.totalErrors}`);
  console.log(separator);

  if (Object.keys(stats.byCategory).length > 0) {
    console.log('\n  By Category:');
    const sortedCat = Object.entries(stats.byCategory).sort((a, b) => b[1] - a[1]);
    for (const [cat, count] of sortedCat) {
      console.log(`    ${cat.padEnd(20)} ${count}`);
    }
  }

  if (Object.keys(stats.byCity).length > 0) {
    console.log('\n  By City:');
    const sortedCity = Object.entries(stats.byCity).sort((a, b) => b[1] - a[1]);
    for (const [city, count] of sortedCity) {
      console.log(`    ${city.padEnd(25)} ${count}`);
    }
  }

  if (DRY_RUN) {
    console.log('\n  ⚠️  DRY RUN — no data was inserted into Supabase.');
  }

  console.log(separator + '\n');
}

// ── Main entry point ─────────────────────────────────────────────────────────

async function main() {
  // ── Validation ──────────────────────────────────────────────────────────
  if (!API_KEY) {
    console.error('ERROR: GOOGLE_PLACES_API_KEY environment variable is required.');
    process.exit(1);
  }
  if (!DRY_RUN && (!SUPABASE_URL || !SUPABASE_KEY)) {
    console.error('ERROR: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required (or use --dry-run).');
    process.exit(1);
  }

  log('info', `ReviewPing Lead Scraper — Dry Run: ${DRY_RUN}, Country: ${TARGET_COUNTRY}`);

  // ── Determine the target list ───────────────────────────────────────────
  const categories = TARGET_CATEGORY ? [TARGET_CATEGORY] : CATEGORIES;
  const cities = TARGET_CITY
    ? [TARGET_CITY]
    : (TARGET_COUNTRY === 'UK' ? CITIES_UK : CITIES_US);

  log('info', `Categories: ${categories.length} | Cities: ${cities.length}`);
  log('info', `Estimated API calls: ${categories.length * cities.length * 3} (with pagination)`);
  log('info', 'Starting scrape...\n');

  // ── Scrape each combination ─────────────────────────────────────────────
  let totalBatches = categories.length * cities.length;
  let batchNum = 0;

  for (const category of categories) {
    for (const city of cities) {
      batchNum++;
      const pct = ((batchNum / totalBatches) * 100).toFixed(1);
      log('info', `[${batchNum}/${totalBatches} — ${pct}%] Processing ${category} / ${city}`);

      try {
        await scrapeCategoryCity(category, city);
      } catch (err) {
        stats.totalErrors++;
        log('error', `Failed scrape for "${category} in ${city}": ${err.message}`);
      }

      // Rate-limit: 200ms between different searches to not hammer the API
      await sleep(350);
    }
  }

  // ── Report ──────────────────────────────────────────────────────────────
  printReport();
}

main().catch((err) => {
  console.error('FATAL:', err.message);
  process.exit(1);
});
