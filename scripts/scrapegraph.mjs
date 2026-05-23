#!/usr/bin/env node

// =============================================================================
// ReviewPing — ScrapeGraphAI CLI Wrapper
// =============================================================================
// AI-powered web scraping for lead generation, competitor research, and
// business data extraction. Wraps the ScrapeGraphAI v2 Node.js SDK.
//
// Usage:
//   node scripts/scrapegraph.mjs scrape <url> [options]
//   node scripts/scrapegraph.mjs extract <url> --prompt "..." [options]
//   node scripts/scrapegraph.mjs search <query> [options]
//   node scripts/scrapegraph.mjs crawl <url> [--max-pages 50] [options]
//   node scripts/scrapegraph.mjs credits
//   node scripts/scrapegraph.mjs health
//   node scripts/scrapegraph.mjs history [--service scrape] [--page 1]
//
// Examples:
//   node scripts/scrapegraph.mjs extract https://example.com --prompt "What does this company do? Get name, description, pricing"
//   node scripts/scrapegraph.mjs search "salon in Miami with bad reviews" --pretty
//   node scripts/scrapegraph.mjs scrape https://example.com --format json --pretty
//   node scripts/scrapegraph.mjs crawl https://example.com/blog --max-pages 10 --output results.json
//
// Environment:
//   SGAI_API_KEY  — Your ScrapeGraphAI API key (get one at https://scrapegraphai.com/dashboard)
// =============================================================================

import { ScrapeGraphAI } from "scrapegraph-js";
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { resolve } from "node:path";

// ── Config ────────────────────────────────────────────────────────────────────
const API_KEY = process.env.SGAI_API_KEY;
// Always initialize the client. API-dependent commands will fail gracefully if no key.
const sgai = ScrapeGraphAI({ apiKey: API_KEY || "__missing__" });

// ── CLI Helpers ───────────────────────────────────────────────────────────────

function getArg(flag, fallback = null) {
  const idx = process.argv.indexOf(flag);
  if (idx !== -1 && idx + 1 < process.argv.length) return process.argv[idx + 1];
  return fallback;
}

function hasFlag(flag) {
  return process.argv.includes(flag);
}

function parseSchema(path) {
  if (!path) return undefined;
  const fullPath = resolve(process.cwd(), path);
  if (!existsSync(fullPath)) {
    console.error(`ERROR: Schema file not found: ${fullPath}`);
    process.exit(1);
  }
  try {
    return JSON.parse(readFileSync(fullPath, "utf-8"));
  } catch (err) {
    console.error(`ERROR: Failed to parse schema file: ${err.message}`);
    process.exit(1);
  }
}

function buildFetchConfig() {
  const config = {};
  if (hasFlag("--stealth")) config.stealth = true;
  if (hasFlag("--js")) config.mode = "js";
  const wait = getArg("--wait");
  if (wait) config.wait = parseInt(wait, 10);
  const scrolls = getArg("--scrolls");
  if (scrolls) config.scrolls = parseInt(scrolls, 10);
  const timeout = getArg("--timeout");
  if (timeout) config.timeout = parseInt(timeout, 10);
  const country = getArg("--country");
  if (country) config.country = country.toLowerCase();
  return Object.keys(config).length > 0 ? config : undefined;
}

function buildFormats() {
  const format = getArg("--format", "markdown");
  const formats = [];

  switch (format) {
    case "html":
      formats.push({ type: "html" });
      break;
    case "json":
      formats.push({ type: "json", prompt: getArg("--prompt", "Extract all structured data from this page") });
      break;
    case "screenshot":
      formats.push({
        type: "screenshot",
        fullPage: hasFlag("--full-page"),
        width: parseInt(getArg("--width", "1440"), 10),
        height: parseInt(getArg("--height", "900"), 10),
      });
      break;
    case "links":
      formats.push({ type: "links" });
      break;
    case "images":
      formats.push({ type: "images" });
      break;
    case "summary":
      formats.push({ type: "summary" });
      break;
    case "branding":
      formats.push({ type: "branding" });
      break;
    case "multi":
      formats.push(
        { type: "markdown", mode: getArg("--md-mode", "reader") },
        { type: "links" },
        { type: "images" }
      );
      break;
    case "markdown":
    default:
      formats.push({ type: "markdown", mode: getArg("--md-mode", "reader") });
      break;
  }

  return formats;
}

function formatOutput(data, label = "Result") {
  const pretty = hasFlag("--pretty");
  const outputPath = getArg("--output");

  let output;
  if (typeof data === "string") {
    output = data;
  } else if (pretty) {
    output = JSON.stringify(data, null, 2);
  } else {
    output = JSON.stringify(data, null, 2);
  }

  if (outputPath) {
    const outFile = resolve(process.cwd(), outputPath);
    writeFileSync(outFile, output, "utf-8");
    console.log(`\n📄 ${label} saved to: ${outFile}`);
  } else {
    console.log(`\n━━━ ${label} ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    console.log(output);
    if (pretty && typeof data === "object") {
      console.log(`\n━━━ End ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`);
    }
  }
}

function printUsage() {
  console.log(`
╔══════════════════════════════════════════════════════════════╗
║  ReviewPing — ScrapeGraphAI CLI                             ║
║  AI-powered web scraping for lead generation & research     ║
╚══════════════════════════════════════════════════════════════╝

USAGE:
  node scripts/scrapegraph.mjs <command> [options]

COMMANDS:
  scrape <url>          Fetch a page (default: markdown)
  extract <url>         AI extraction with prompt
  search <query>        Web search + optional AI extraction
  crawl <url>           Multi-page crawl
  credits               Check remaining API credits
  health                Check API health
  history               Browse past requests
  help                  Show this help message

SCRAPE OPTIONS:
  --format <type>       Output format: markdown (default), html, json,
                        screenshot, links, images, summary, branding, multi
  --md-mode <mode>      Markdown mode: reader (default), normal, prune
  --full-page           Full-page screenshot (with --format screenshot)
  --width <px>          Screenshot width (default: 1440)
  --height <px>         Screenshot height (default: 900)

EXTRACT OPTIONS:
  --prompt <text>       What to extract (REQUIRED)
  --schema <file>       JSON schema file for structured output
  --mode <mode>         HTML processing: normal, reader (default), prune

SEARCH OPTIONS:
  --results <n>         Number of results (1-20, default: 5)
  --prompt <text>       AI extraction prompt (enables auto-extraction)
  --schema <file>       JSON schema file (requires --prompt)
  --time-range <range>  past_hour, past_24_hours, past_week, past_month, past_year
  --country <code>      Two-letter country code (e.g., us, uk)

CRAWL OPTIONS:
  --max-pages <n>       Max pages to crawl (1-1000, default: 50)
  --max-depth <n>       Max crawl depth (default: 2)
  --include <pattern>   Include URL pattern (can repeat)
  --exclude <pattern>   Exclude URL pattern (can repeat)

GLOBAL OPTIONS:
  --stealth             Enable stealth/anti-detection mode (+5 credits)
  --js                  Use JavaScript rendering mode
  --wait <ms>           Wait time after page load (0-30000)
  --scrolls <n>         Number of scrolls (0-100)
  --timeout <ms>        Request timeout (1000-60000)
  --country <code>      Proxy country (ISO alpha-2)
  --pretty              Pretty-print JSON output
  --output <file>       Save output to a file
  --mock                Use mock data for testing (no API calls)

ENVIRONMENT:
  SGAI_API_KEY          Your ScrapeGraphAI API key (required)
                        Get one at: https://scrapegraphai.com/dashboard

EXAMPLES:
  # Scrape a competitor's page to markdown
  node scripts/scrapegraph.mjs scrape https://example.com --pretty

  # Extract business info from a website
  node scripts/scrapegraph.mjs extract https://example.com --prompt "Extract company name, description, pricing plans, and contact email" --pretty

  # Find businesses that need review management
  node scripts/scrapegraph.mjs search "plumber in Austin TX with bad reviews" --results 10 --prompt "Get business name, phone, website, address, and star rating" --pretty

  # Crawl a business directory
  node scripts/scrapegraph.mjs crawl https://example.com/directory --max-pages 20 --include "/directory/" --pretty

  # Take a screenshot of a business listing
  node scripts/scrapegraph.mjs scrape https://example.com --format screenshot --output listing.png
`);
}

// ── Command Handlers ─────────────────────────────────────────────────────────

async function cmdScrape(url) {
  if (!url) { console.error("ERROR: URL required. Usage: scrape <url>"); process.exit(1); }

  const formats = buildFormats();
  const fetchConfig = buildFetchConfig();
  const mock = hasFlag("--mock");

  console.log(`🔍 Scraping: ${url}`);
  if (formats.length > 0) {
    console.log(`   Formats: ${formats.map(f => f.type).join(", ")}`);
  }
  if (fetchConfig) console.log(`   Config: ${JSON.stringify(fetchConfig)}`);
  if (mock) console.log(`   Mode: MOCK (no API call)`);

  const res = await sgai.scrape({
    url,
    formats,
    fetchConfig,
    mock,
  });

  if (res.status === "success") {
    const results = res.data?.results || {};
    for (const [fmt, data] of Object.entries(results)) {
      if (fmt === "markdown" || fmt === "html") {
        const content = data?.data?.[0];
        if (content) formatOutput(content.slice(0, 5000) + (content.length > 5000 ? "\n... [truncated]" : ""), `📝 ${fmt.toUpperCase()}`);
      } else if (fmt === "links") {
        formatOutput({ count: data?.metadata?.count, links: data?.data }, "🔗 LINKS");
      } else if (fmt === "images") {
        formatOutput({ count: data?.metadata?.count, images: data?.data }, "🖼️ IMAGES");
      } else if (fmt === "screenshot") {
        formatOutput({ url: data?.data?.url }, "📸 SCREENSHOT");
      } else if (fmt === "summary") {
        formatOutput(data?.data?.[0], "📋 SUMMARY");
      } else if (fmt === "json") {
        formatOutput(data?.data, "📊 JSON");
      } else if (fmt === "branding") {
        formatOutput(data?.data, "🎨 BRANDING");
      } else {
        formatOutput(data, fmt.toUpperCase());
      }
    }
    console.log(`\n⏱️  Elapsed: ${res.elapsedMs}ms`);
  } else {
    console.error(`\n❌ Error: ${res.error}`);
    process.exit(1);
  }
}

async function cmdExtract(url) {
  const prompt = getArg("--prompt");
  if (!url && !prompt) {
    console.error("ERROR: Both <url> and --prompt are required. Usage: extract <url> --prompt \"...\"");
    process.exit(1);
  }
  if (!prompt) {
    console.error("ERROR: --prompt is required. Usage: extract <url> --prompt \"...\"");
    process.exit(1);
  }

  const schemaPath = getArg("--schema");
  const schema = parseSchema(schemaPath);
  const mode = getArg("--mode", "reader");
  const fetchConfig = buildFetchConfig();
  const mock = hasFlag("--mock");

  console.log(`🔍 Extracting from: ${url}`);
  console.log(`   Prompt: ${prompt}`);
  if (schema) console.log(`   Schema: ${Object.keys(schema.properties || {}).join(", ")}`);
  if (mock) console.log(`   Mode: MOCK (no API call)`);

  const res = await sgai.extract({
    url,
    prompt,
    schema,
    mode,
    fetchConfig,
    mock,
  });

  if (res.status === "success") {
    formatOutput(res.data?.json, "📊 EXTRACTED DATA");
    if (res.data?.usage) {
      console.log(`\n📊 Token Usage:`);
      console.log(`   Prompt tokens:     ${res.data.usage.promptTokens}`);
      console.log(`   Completion tokens: ${res.data.usage.completionTokens}`);
    }
    console.log(`\n⏱️  Elapsed: ${res.elapsedMs}ms`);
  } else {
    console.error(`\n❌ Error: ${res.error}`);
    process.exit(1);
  }
}

async function cmdSearch(query) {
  if (!query) {
    console.error("ERROR: Search query required. Usage: search <query>");
    process.exit(1);
  }

  const numResults = parseInt(getArg("--results", "5"), 10);
  const prompt = getArg("--prompt");
  const schemaPath = getArg("--schema");
  const schema = parseSchema(schemaPath);
  const timeRange = getArg("--time-range");
  const country = getArg("--country");
  const fetchConfig = buildFetchConfig();

  console.log(`🔍 Searching: "${query}"`);
  console.log(`   Results: ${numResults}`);
  if (prompt) console.log(`   Extraction: enabled`);
  if (timeRange) console.log(`   Time range: ${timeRange}`);

  const params = { query, numResults };
  if (prompt) params.prompt = prompt;
  if (schema) params.schema = schema;
  if (timeRange) params.timeRange = timeRange;
  if (country) params.locationGeoCode = country.toLowerCase();
  if (fetchConfig) params.fetchConfig = fetchConfig;

  const res = await sgai.search(params);

  if (res.status === "success") {
    const data = res.data;
    const results = data?.results || [];

    console.log(`\n📋 Search Results (${results.length}):`);
    console.log("=".repeat(70));

    results.forEach((r, i) => {
      console.log(`\n── ${i + 1}. ${r.title || "Untitled"} ──`);
      if (r.url) console.log(`   URL:   ${r.url}`);
      if (r.description) console.log(`   Desc:  ${r.description.slice(0, 200)}`);
      if (r.content) console.log(`   ${r.content.slice(0, 300)}`);
    });

    if (data?.json) {
      console.log(`\n📊 Extracted Data:`);
      console.log(JSON.stringify(data.json, null, 2));
    }

    console.log(`\n⏱️  Elapsed: ${res.elapsedMs}ms`);
  } else {
    console.error(`\n❌ Error: ${res.error}`);
    process.exit(1);
  }
}

async function cmdCrawl(url) {
  if (!url) { console.error("ERROR: URL required. Usage: crawl <url>"); process.exit(1); }

  const maxPages = parseInt(getArg("--max-pages", "50"), 10);
  const maxDepth = parseInt(getArg("--max-depth", "2"), 10);
  const fetchConfig = buildFetchConfig();

  // Collect include/exclude patterns (supports multiple --include/--exclude flags)
  const includePatterns = [];
  const excludePatterns = [];
  const args = process.argv;
  for (let i = 0; i < args.length; i++) {
    if (args[i] === "--include" && i + 1 < args.length) includePatterns.push(args[++i]);
    if (args[i] === "--exclude" && i + 1 < args.length) excludePatterns.push(args[++i]);
  }

  const formats = buildFormats();
  const mock = hasFlag("--mock");

  console.log(`🕸️  Crawling: ${url}`);
  console.log(`   Max pages: ${maxPages}, Max depth: ${maxDepth}`);
  if (includePatterns.length) console.log(`   Include: ${includePatterns.join(", ")}`);
  if (excludePatterns.length) console.log(`   Exclude: ${excludePatterns.join(", ")}`);
  if (mock) console.log(`   Mode: MOCK (no API call)`);

  console.log(`\n🚀 Starting crawl...`);
  const start = await sgai.crawl.start({
    url,
    formats,
    maxPages,
    maxDepth,
    maxLinksPerPage: parseInt(getArg("--links-per-page", "10"), 10),
    includePatterns: includePatterns.length > 0 ? includePatterns : undefined,
    excludePatterns: excludePatterns.length > 0 ? excludePatterns : undefined,
    fetchConfig,
    mock,
  });

  if (start.status !== "success") {
    console.error(`\n❌ Failed to start crawl: ${start.error}`);
    process.exit(1);
  }

  const crawlId = start.data?.id;
  if (!crawlId) {
    console.error("\n❌ No crawl ID returned");
    process.exit(1);
  }

  console.log(`   Crawl ID: ${crawlId}`);
  console.log(`\n⏳ Polling for completion...`);

  // Poll for completion
  let done = false;
  let attempts = 0;
  const MAX_ATTEMPTS = 60; // 5 min at 5s intervals

  while (!done && attempts < MAX_ATTEMPTS) {
    await new Promise((r) => setTimeout(r, 5000));
    attempts++;

    const status = await sgai.crawl.get(crawlId);
    if (status.status === "success") {
      const s = status.data;
      console.log(`   [${attempts}] Status: ${s?.status}, Pages: ${s?.pagesCrawled}/${s?.totalPages || "?"}`);

      if (s?.status === "completed" || s?.status === "failed") {
        done = true;

        if (s?.status === "completed") {
          console.log(`\n✅ Crawl complete!`);
          console.log(`   Pages crawled: ${s.pagesCrawled}`);
          console.log(`   Total pages:   ${s.totalPages}`);
          console.log(`   Depth reached: ${s.depthReached}`);

          // Get the results summary
          const crawlData = {
            id: crawlId,
            pagesCrawled: s.pagesCrawled,
            totalPages: s.totalPages,
            depthReached: s.depthReached,
            status: s.status,
          };

          formatOutput(crawlData, "🕸️  CRAWL RESULTS");

          // If output file requested, also fetch individual page results
          if (getArg("--output") && s.pagesCrawled > 0) {
            console.log(`\n📄 Page results are available via history lookup with ID: ${crawlId}`);
          }
        } else {
          console.error(`\n❌ Crawl failed: ${s?.error || "Unknown error"}`);
        }
      }
    } else {
      console.log(`   [${attempts}] Checking... (${status.error || "unknown"})`);
    }
  }

  console.log(`\n⏱️  Total elapsed: ${start.elapsedMs}ms (start) + ${attempts * 5}s (polling)`);
}

async function cmdCredits() {
  console.log("💳 Checking credits...");
  const res = await sgai.credits();

  if (res.status === "success") {
    const c = res.data;
    console.log(`\n📊 Credit Report:`);
    console.log(`   Remaining: ${c.remaining}`);
    console.log(`   Used:      ${c.used}`);
    console.log(`   Plan:      ${c.plan}`);
    if (c.jobs) {
      console.log(`\n   Active Jobs:`);
      if (c.jobs.crawl) console.log(`     Crawl:   ${c.jobs.crawl}`);
      if (c.jobs.monitor) console.log(`     Monitor: ${c.jobs.monitor}`);
    }
  } else {
    console.error(`\n❌ Error: ${res.error}`);
    process.exit(1);
  }
}

async function cmdHealth() {
  console.log("🏥 Checking API health...");
  const res = await sgai.healthy();

  if (res.status === "success") {
    console.log(`\n✅ API Status: ${res.data?.status}`);
    if (res.data?.uptime) console.log(`   Uptime: ${res.data.uptime}s`);
  } else {
    console.error(`\n❌ Error: ${res.error}`);
    process.exit(1);
  }
}

async function cmdHistory() {
  const service = getArg("--service");
  const page = parseInt(getArg("--page", "1"), 10);
  const limit = parseInt(getArg("--limit", "20"), 10);

  console.log("📜 Fetching request history...");
  const res = await sgai.history.list({
    ...(service ? { service } : {}),
    page,
    limit,
  });

  if (res.status === "success") {
    const entries = res.data?.entries || res.data || [];
    console.log(`\n📜 Request History (page ${page}):`);
    console.log("=".repeat(70));

    if (Array.isArray(entries)) {
      entries.forEach((entry, i) => {
        console.log(`\n── ${i + 1}. ${entry.id || entry.request_id || "Unknown"} ──`);
        if (entry.service) console.log(`   Service: ${entry.service}`);
        if (entry.status) console.log(`   Status:  ${entry.status}`);
        if (entry.url) console.log(`   URL:     ${entry.url}`);
        if (entry.createdAt || entry.created_at) console.log(`   Date:    ${entry.createdAt || entry.created_at}`);
      });
    } else {
      formatOutput(entries, "HISTORY");
    }
  } else {
    console.error(`\n❌ Error: ${res.error}`);
    process.exit(1);
  }
}

// ── Main CLI Dispatcher ───────────────────────────────────────────────────────

async function main() {
  // No API key check for help, health
  const command = process.argv[2]?.toLowerCase();

  if (!command || command === "help" || command === "--help" || command === "-h") {
    printUsage();
    return;
  }

  // Commands that don't need API key
  if (command === "health") {
    await cmdHealth();
    return;
  }

  // All other commands need API key
  if (!API_KEY) {
    console.error(`
╔══════════════════════════════════════════════════════════════╗
║  ERROR: SGAI_API_KEY not set                                ║
║                                                              ║
║  Get your API key at: https://scrapegraphai.com/dashboard    ║
║  Then set it in your environment:                            ║
║                                                              ║
║    $env:SGAI_API_KEY = "your-key-here"                       ║
║                                                              ║
║  Or add to .env file:                                        ║
║    SGAI_API_KEY=your-key-here                                ║
╚══════════════════════════════════════════════════════════════╝`);
    process.exit(1);
  }

  switch (command) {
    case "scrape":
      await cmdScrape(process.argv[3]);
      break;

    case "extract":
      await cmdExtract(process.argv[3]);
      break;

    case "search":
      // Collect multi-word query: everything after "search" that isn't a flag
      const searchArgs = [];
      let foundSearchCmd = false;
      for (let i = 3; i < process.argv.length; i++) {
        const arg = process.argv[i];
        if (arg.startsWith("--")) break;
        if (!foundSearchCmd) { foundSearchCmd = true; continue; }
        searchArgs.push(arg);
      }
      await cmdSearch(searchArgs.join(" ") || process.argv[3]);
      break;

    case "crawl":
      await cmdCrawl(process.argv[3]);
      break;

    case "credits":
      await cmdCredits();
      break;

    case "history":
      await cmdHistory();
      break;

    default:
      console.error(`Unknown command: "${command}". Run "help" to see available commands.`);
      process.exit(1);
  }
}

main().catch((err) => {
  console.error("FATAL:", err.message);
  process.exit(1);
});
