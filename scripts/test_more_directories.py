#!/usr/bin/env python3
"""Test fetching + extracting from multiple business directory sites."""
import json, os, sys
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
    print("ERROR: NVIDIA_API_KEY not found")
    sys.exit(1)

from scrapegraphai.graphs import SmartScraperGraph
from playwright.sync_api import sync_playwright

# Directories to test
sites = [
    ("Expertise.com", "https://www.expertise.com/home-improvement/plumbing/florida/miami"),
    ("HomeGuide", "https://homeguide.com/fl/miami/plumbers/"),
    ("Angi", "https://www.angi.com/companylist/us/fl/miami/plumbing.htm"),
    ("BBB", "https://www.bbb.org/us/fl/miami/category/plumber"),
    ("ThreeBestRated", "https://threebestrated.com/local-plumbers-in-miami-fl"),
    ("BestProsInTown", "https://www.bestprosintown.com/fl/miami/plumbers/"),
]

out_dir = Path.home() / "AppData" / "Local" / "Temp"
results_summary = []

for name, url in sites:
    print(f"\n{'='*60}")
    print(f"Testing: {name}")
    print(f"URL: {url}")
    print(f"{'='*60}")
    
    # Step 1: Fetch with Playwright
    print("\nStep 1: Fetch with Playwright...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            try:
                from undetected_playwright import stealth_sync
                stealth_sync(page)
            except ImportError:
                pass
            
            page.goto(url, wait_until="networkidle", timeout=20000)
            html = page.content()
            browser.close()
            print(f"  HTML: {len(html)} bytes")
    except Exception as e:
        print(f"  FETCH ERROR: {e}")
        results_summary.append({"site": name, "status": "fetch_error", "error": str(e), "leads": 0})
        continue
    
    # Step 2: Extract with ScrapeGraphAI
    print("Step 2: ScrapeGraphAI extraction...")
    try:
        graph_config = {
            "llm": {
                "model": "nvidia/meta/llama-3.3-70b-instruct",
                "api_key": NVIDIA_API_KEY,
                "base_url": "https://integrate.api.nvidia.com/v1",
                "temperature": 0.1,
            },
        }
        
        scraper = SmartScraperGraph(
            prompt="Extract ALL business listings on this page. For each business, return: business_name, phone_number, address, website, rating. Return a JSON array. IMPORTANT: extract every single business listing, not just the first few.",
            source=html,
            config=graph_config,
        )
        
        result = scraper.run()
        print(f"  Result type: {type(result).__name__}")
        
        leads = []
        if isinstance(result, list):
            leads = result
        elif isinstance(result, dict):
            for k, v in result.items():
                if isinstance(v, list):
                    leads = v
                    break
        
        print(f"  Leads found: {len(leads)}")
        for lead in leads[:3]:
            print(f"    - {lead.get('business_name', lead.get('name', '?'))[:50]}")
            print(f"      Phone: {lead.get('phone_number', lead.get('phone', lead.get('telephone', 'N/A')))}")
        
        # Save results
        safe_name = name.lower().replace(" ", "_").replace(".", "")
        out_path = out_dir / f"leads_{safe_name}.json"
        out_path.write_text(json.dumps(leads, indent=2, default=str), encoding="utf-8")
        
        results_summary.append({
            "site": name,
            "status": "ok",
            "leads": len(leads),
            "sample_phone": leads[0].get("phone_number", leads[0].get("phone", "N/A")) if leads else "N/A",
        })
        
    except Exception as e:
        print(f"  EXTRACTION ERROR: {e}")
        import traceback
        traceback.print_exc()
        results_summary.append({"site": name, "status": "extract_error", "error": str(e), "leads": 0})

# Summary
print(f"\n\n{'='*60}")
print("SUMMARY")
print(f"{'='*60}")
for r in results_summary:
    status_icon = "✅" if r["leads"] > 0 else ("⚠️" if r["status"] == "ok" else "❌")
    print(f"  {status_icon} {r['site']}: {r['leads']} leads", end="")
    if r.get("sample_phone"):
        print(f" (sample: {r['sample_phone']})", end="")
    print()
    
print("\n=== Done ===")
