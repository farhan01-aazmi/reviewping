#!/usr/bin/env python3
"""Test ThreeBestRated directory patterns + alternative directories with domcontentloaded."""
import json, os, sys, time
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
from scrapegraphai.graphs import SmartScraperGraph
from playwright.sync_api import sync_playwright

def fetch_page(url, timeout=15000, wait_until="domcontentloaded"):
    """Fetch page HTML with Playwright stealth."""
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        try:
            from undetected_playwright import stealth_sync
            stealth_sync(page)
        except ImportError:
            pass
        page.goto(url, wait_until=wait_until, timeout=timeout)
        time.sleep(2)  # extra wait for dynamic content
        html = page.content()
        browser.close()
        return html

def extract_leads(html, site_name):
    """Extract business leads from HTML using ScrapeGraphAI."""
    graph_config = {
        "llm": {
            "model": "nvidia/meta/llama-3.3-70b-instruct",
            "api_key": NVIDIA_API_KEY,
            "base_url": "https://integrate.api.nvidia.com/v1",
            "temperature": 0.1,
        },
    }
    
    scraper = SmartScraperGraph(
        prompt="Extract ALL business listings from this page. For each business, return: business_name, phone_number, address, website. Return a JSON array of objects. Extract EVERY listing - be thorough.",
        source=html,
        config=graph_config,
    )
    
    result = scraper.run()
    
    leads = []
    if isinstance(result, list):
        leads = result
    elif isinstance(result, dict):
        for v in result.values():
            if isinstance(v, list):
                leads = v
                break
    
    return leads

# ── Test 1: ThreeBestRated across categories ─────────────────
print("=" * 60)
print("TEST 1: ThreeBestRated - Multiple Categories (Miami)")
print("=" * 60)

categories = ["plumbers", "electricians", "dentists", "salons", "restaurants"]
city = "miami-fl"

out_dir = Path.home() / "AppData" / "Local" / "Temp"
total_leads_3br = 0

for cat in categories:
    url = f"https://threebestrated.com/local-{cat}-in-{city}"
    print(f"\n  Fetching: {cat}...")
    
    try:
        html = fetch_page(url)
        print(f"  HTML: {len(html)} bytes")
        
        if len(html) > 5000:
            leads = extract_leads(html, f"3br_{cat}")
            print(f"  Leads: {len(leads)}")
            total_leads_3br += len(leads)
            
            for lead in leads[:3]:
                name = lead.get("business_name", lead.get("name", "?"))
                phone = lead.get("phone_number", lead.get("phone", lead.get("telephone", "-")))
                print(f"    {name[:40]:40s} | {phone}")
            
            # Save
            out_path = out_dir / f"leads_3br_{cat}.json"
            out_path.write_text(json.dumps(leads, indent=2, default=str), encoding="utf-8")
        else:
            print(f"  SKIP: too small ({len(html)} bytes)")
    except Exception as e:
        print(f"  ERROR: {e}")

# ── Test 2: Try with domcontentloaded for other sites ────────
print(f"\n\n{'=' * 60}")
print("TEST 2: Alternative directories (domcontentloaded, no networkidle)")
print("=" * 60)

alt_sites = [
    ("Expertise.com", "https://www.expertise.com/home-improvement/plumbing/florida/miami"),
    ("HomeGuide", "https://homeguide.com/fl/miami/plumbers/"),
]

for name, url in alt_sites:
    print(f"\n  Fetching: {name}...")
    try:
        html = fetch_page(url)
        print(f"  HTML: {len(html)} bytes")
        
        if len(html) > 10000:
            leads = extract_leads(html, name)
            print(f"  Leads: {len(leads)}")
        else:
            print(f"  SKIP: too small ({len(html)} bytes)")
            
            # Dump first 2000 chars to see what's there
            print(f"  Content preview: {html[:500]}")
    except Exception as e:
        print(f"  ERROR: {e}")

# ── Summary ──────────────────────────────────────────────
print(f"\n\n{'=' * 60}")
print(f"TOTAL ThreeBestRated leads (Miami, {len(categories)} cats): {total_leads_3br}")
print(f"Estimated per category: {total_leads_3br / len(categories) if categories else 0:.1f}")
print(f"Estimated per city (52 US cities x 53 cats): ~{total_leads_3br * 52 * (53/len(categories)):.0f}")
print("=" * 60)
print("\n=== Done ===")
