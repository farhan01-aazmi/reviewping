#!/usr/bin/env python3
"""
ReviewPing — Lead Generation Pipeline (FREE, no credit card)
=============================================================
Architecture:
  1. For each (category, city): search DuckDuckGo for directory URLs
  2. Fetch each directory page with Playwright stealth
  3. Extract business listings with ScrapeGraphAI + NVIDIA LLM
  4. Deduplicate and save to JSON

Usage:
    python scripts/lead_pipeline.py --category plumber --city "Miami FL"
    python scripts/lead_pipeline.py --all --cities 5
    python scripts/lead_pipeline.py --batch --output leads_batch.json

Requires:
    NVIDIA_API_KEY    — in .env or environment
    playwright        — pip install playwright && playwright install chromium
    scrapegraphai     — pip install scrapegraphai langchain-nvidia-ai-endpoints
    undetected-playwright — pip install undetected-playwright
"""

import argparse
import json
import os
import re
import sys
import time
import urllib.parse
from pathlib import Path

# Load .env
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")
if not NVIDIA_API_KEY:
    print("ERROR: NVIDIA_API_KEY environment variable is required.")
    sys.exit(1)

from scrapegraphai.graphs import SmartScraperGraph
from playwright.sync_api import sync_playwright

# ── Known-good directory sites ──────────────────────────────────
# These sites work with our Playwright stealth approach
DIRECTORY_SITES = {
    "threebestrated": "threebestrated.com",
}

# ── Categories & Cities ────────────────────────────────────────
ALL_CATEGORIES = [
    "plumber", "electrician", "hvac", "roofer", "landscaper", "mover", "painter",
    "dentist", "chiropractor", "optometrist",
    "salon", "barber", "nail salon", "spa", "massage therapist",
    "restaurant", "bakery", "cafe", "pizza", "bar",
    "gym", "yoga studio", "personal trainer",
    "mechanic", "auto detailer", "car wash",
    "veterinarian", "pet groomer",
    "photographer", "real estate agent", "insurance agent",
    "accountant", "tax preparer", "lawyer",
    "daycare", "tutor", "music teacher", "art studio",
    "laundry", "dry cleaner", "locksmith",
    "pest control", "window cleaner", "carpet cleaner",
    "hotel", "motel",
]

ALL_CITIES_US = [
    "New York NY", "Los Angeles CA", "Chicago IL", "Houston TX", "Phoenix AZ",
    "Philadelphia PA", "San Antonio TX", "San Diego CA", "Dallas TX", "San Jose CA",
    "Austin TX", "Jacksonville FL", "Fort Worth TX", "Columbus OH", "Charlotte NC",
    "Indianapolis IN", "San Francisco CA", "Seattle WA", "Denver CO", "Nashville TN",
    "Miami FL", "Portland OR", "Oklahoma City OK", "Las Vegas NV", "Louisville KY",
    "Baltimore MD", "Milwaukee WI", "Albuquerque NM", "Tucson AZ", "Fresno CA",
    "Sacramento CA", "Kansas City MO", "Atlanta GA", "Omaha NE", "Tampa FL",
    "Orlando FL", "Cleveland OH", "Honolulu HI", "Minneapolis MN", "Boston MA",
    "Pittsburgh PA", "Cincinnati OH", "St. Louis MO", "New Orleans LA",
    "Raleigh NC", "Virginia Beach VA", "Richmond VA", "Salt Lake City UT",
    "Birmingham AL", "Rochester NY", "Buffalo NY",
]

ALL_CITIES_UK = [
    "London", "Manchester", "Birmingham", "Glasgow", "Edinburgh",
    "Liverpool", "Bristol", "Leeds", "Leicester", "Nottingham",
    "Sheffield", "Newcastle upon Tyne", "Cardiff", "Belfast",
    "Southampton", "Portsmouth", "Brighton", "Oxford", "Cambridge",
]


def slugify(text):
    """Convert text to URL-friendly slug."""
    return text.lower().replace(" ", "-").replace("--", "-")


def search_duckduckgo(query, max_results=10):
    """Search DuckDuckGo Lite and parse results."""
    import primp
    
    client = primp.Client()
    resp = client.get(
        f"https://lite.duckduckgo.com/lite/?q={query.replace(' ', '+')}",
        headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
        timeout=15,
    )
    
    html = resp.text
    results = []
    
    link_pattern = re.compile(
        r'<a\s+rel="nofollow"\s+href="([^"]+)"\s+class=\'result-link\'[^>]*>([^<]+)</a>',
        re.DOTALL,
    )
    snippet_pattern = re.compile(
        r'<td\s+class=\'result-snippet\'[^>]*>(.*?)</td>',
        re.DOTALL,
    )
    url_pattern = re.compile(
        r'<span\s+class=\'link-text\'[^>]*>(.*?)</span>',
        re.DOTALL,
    )
    
    titles = link_pattern.findall(html)
    snippets = [re.sub(r'<[^>]+>', '', s).strip() for s in snippet_pattern.findall(html)]
    urls = [u.strip() for u in url_pattern.findall(html)]
    
    for i, (ddg_url, title) in enumerate(titles[:max_results]):
        real_url = ddg_url
        if '/l/?uddg=' in ddg_url:
            qs = urllib.parse.urlparse(ddg_url).query
            parsed_qs = urllib.parse.parse_qs(qs)
            if 'uddg' in parsed_qs:
                real_url = urllib.parse.unquote(parsed_qs['uddg'][0])
        
        snippet = snippets[i] if i < len(snippets) else ""
        display_url = urls[i] if i < len(urls) else ""
        
        results.append({
            "title": title.strip(),
            "url": real_url,
            "body": snippet,
            "display_url": display_url,
        })
    
    return results


def find_directory_urls(search_results):
    """Filter DuckDuckGo results to find known-good directory URLs."""
    directory_urls = []
    
    for r in search_results:
        url = r["url"]
        for site_name, site_domain in DIRECTORY_SITES.items():
            if site_domain in url:
                directory_urls.append({
                    "site": site_name,
                    "url": url,
                    "title": r["title"],
                })
                break
    
    return directory_urls


def fetch_page_playwright(url, timeout=15000):
    """Fetch page HTML using Playwright with stealth."""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                from undetected_playwright import stealth_sync
                stealth_sync(page)
            except ImportError:
                pass
            
            page.goto(url, wait_until="domcontentloaded", timeout=timeout)
            time.sleep(2)  # Wait for dynamic content
            html = page.content()
            browser.close()
            return html
    except Exception as e:
        print(f"    [WARN] Playwright fetch failed: {e}")
        return None


def extract_leads_from_html(html, category, city, source_url):
    """Extract business listings from HTML using ScrapeGraphAI + NVIDIA."""
    graph_config = {
        "llm": {
            "model": "nvidia/meta/llama-3.3-70b-instruct",
            "api_key": NVIDIA_API_KEY,
            "base_url": "https://integrate.api.nvidia.com/v1",
            "temperature": 0.1,
        },
    }
    
    prompt = (
        f"Extract ALL business listings related to {category} in {city} from this page. "
        "For each business, return: business_name, phone_number, address, website. "
        "Return a JSON array of objects. Extract EVERY single listing."
    )
    
    scraper = SmartScraperGraph(
        prompt=prompt,
        source=html,
        config=graph_config,
    )
    
    try:
        result = scraper.run()
        
        leads = []
        if isinstance(result, list):
            leads = result
        elif isinstance(result, dict):
            for v in result.values():
                if isinstance(v, list):
                    leads = v
                    break
            else:
                # Maybe the whole dict is a single lead
                if "business_name" in result or "name" in result:
                    leads = [result]
        
        # Normalize field names and add metadata
        normalized = []
        for lead in leads:
            if not isinstance(lead, dict):
                continue
            
            nl = {
                "business_name": lead.get("business_name") or lead.get("name") or lead.get("title", ""),
                "phone": lead.get("phone_number") or lead.get("phone") or lead.get("telephone", ""),
                "address": lead.get("address") or lead.get("location", ""),
                "website": lead.get("website") or lead.get("url") or lead.get("site", ""),
                "category": category,
                "city": city,
                "source_url": source_url,
            }
            
            # Only include if we have at least a name
            if nl["business_name"]:
                normalized.append(nl)
        
        return normalized
        
    except Exception as e:
        print(f"    [WARN] Extraction error: {e}")
        return []


def scrape_category_city(category, city, country="US"):
    """Full pipeline for one category + city combo."""
    query = f"{category} in {city}"
    if country == "UK":
        query = f"{category} in {city} UK"
    
    print(f"  [{category} @ {city}]")
    
    # Step 1: DuckDuckGo search
    print(f"    Searching DuckDuckGo...")
    search_results = search_duckduckgo(query)
    print(f"    Found {len(search_results)} search results")
    
    if not search_results:
        return []
    
    # Step 2: Find directory URLs
    directory_urls = find_directory_urls(search_results)
    print(f"    Found {len(directory_urls)} known directory URLs")
    
    if not directory_urls:
        print(f"    [SKIP] No known directory URLs found")
        return []
    
    # Step 3: Fetch & extract from each directory
    all_leads = []
    for d in directory_urls:
        print(f"    Fetching: {d['site']}...")
        html = fetch_page_playwright(d["url"])
        
        if not html or len(html) < 5000:
            print(f"    [SKIP] Page too small or failed ({len(html) if html else 0} bytes)")
            continue
        
        print(f"    HTML: {len(html)} bytes | Extracting leads...")
        leads = extract_leads_from_html(html, category, city, d["url"])
        print(f"    Found {len(leads)} leads from {d['site']}")
        all_leads.extend(leads)
    
    return all_leads


def deduplicate_leads(leads):
    """Deduplicate leads by business name."""
    seen = set()
    unique = []
    for lead in leads:
        key = lead["business_name"].lower().strip()
        if key and key not in seen:
            seen.add(key)
            unique.append(lead)
    return unique


def main():
    parser = argparse.ArgumentParser(
        description="ReviewPing — Lead Generation Pipeline (Free, no credit card)",
        formatter_class=argparse.RawDescriptionHelpFormatter,
    )
    parser.add_argument("--category", "-c", help="Single category")
    parser.add_argument("--city", help="Single city")
    parser.add_argument("--country", default="US", choices=["US", "UK"])
    parser.add_argument("--all", action="store_true", help="All categories x all cities")
    parser.add_argument("--categories", help="Comma-separated categories")
    parser.add_argument("--cities", type=int, default=0, help="Number of cities (default: all)")
    parser.add_argument("--output", "-o", default="leads.json", help="Output file")
    parser.add_argument("--delay", type=int, default=5, help="Delay between combos (seconds)")
    parser.add_argument("--resume", help="Resume from existing output file")
    parser.add_argument("--batch", type=int, default=0, help="Process N category-city combos then exit")
    
    args = parser.parse_args()
    
    # Determine scope
    if args.category and args.city:
        combos = [(args.category, args.city, args.country)]
    elif args.all:
        combos = []
        cats = args.categories.split(",") if args.categories else ALL_CATEGORIES
        cities = ALL_CITIES_US if args.country == "US" else ALL_CITIES_UK
        if args.cities > 0:
            cities = cities[:args.cities]
        for cat in cats:
            for city in cities:
                combos.append((cat.strip(), city.strip(), args.country))
    else:
        print("Use: --category plumber --city 'Miami FL'  OR  --all  OR  --all --cities 5")
        sys.exit(1)
    
    # Load existing leads if resuming
    all_leads = []
    if args.resume:
        resume_path = Path(args.resume)
        if resume_path.exists():
            with open(resume_path) as f:
                all_leads = json.load(f)
            print(f"Resumed with {len(all_leads)} existing leads")
    
    print(f"\nReviewPing — Lead Pipeline")
    print(f"  Strategy: DuckDuckGo -> Directory -> ScrapeGraphAI -> Leads")
    print(f"  Combos to process: {len(combos)}")
    print(f"  Estimated leads: ~{len(combos) * 3}")
    print()
    
    start_time = time.time()
    
    for i, (cat, city, country) in enumerate(combos):
        elapsed = time.time() - start_time
        pct = (i / len(combos)) * 100 if combos else 0
        leads_per_min = (len(all_leads) / (elapsed / 60)) if elapsed > 60 else len(all_leads) / max(elapsed / 60, 0.01)
        eta_min = (len(combos) - i) * (elapsed / max(i, 1)) / 60 if i > 0 else 0
        
        print(f"\n[{i+1}/{len(combos)}] ({pct:.0f}%) | {len(all_leads)} leads total | {leads_per_min:.1f} leads/min | ETA: {eta_min:.0f}min")
        
        try:
            leads = scrape_category_city(cat, city, country)
            all_leads.extend(leads)
            
            # Save periodically
            if len(all_leads) > 0 and len(all_leads) % 10 < len(leads):
                deduped = deduplicate_leads(all_leads)
                with open(args.output, 'w') as f:
                    json.dump(deduped, f, indent=2)
                print(f"    Auto-saved: {len(deduped)} unique leads")
            
            if i < len(combos) - 1:
                print(f"    Waiting {args.delay}s...")
                time.sleep(args.delay)
            
            # Batch mode: exit after N combos
            if args.batch > 0 and i + 1 >= args.batch:
                print(f"\nBatch limit ({args.batch}) reached, stopping.")
                break
                
        except KeyboardInterrupt:
            print("\nInterrupted. Saving progress...")
            break
        except Exception as e:
            print(f"    [ERROR] {e}")
            import traceback
            traceback.print_exc()
            continue
    
    # Final save
    deduped = deduplicate_leads(all_leads)
    with open(args.output, 'w') as f:
        json.dump(deduped, f, indent=2)
    
    elapsed = time.time() - start_time
    print(f"\n{'='*60}")
    print(f"COMPLETE!")
    print(f"  Total leads collected: {len(deduped)}")
    print(f"  Unique businesses: {len(deduped)}")
    print(f"  Time elapsed: {elapsed/60:.1f} minutes")
    print(f"  Rate: {(len(deduped)/(elapsed/60)):.1f} leads/hour")
    print(f"  Saved to: {args.output}")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
