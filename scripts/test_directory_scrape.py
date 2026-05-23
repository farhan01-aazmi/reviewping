#!/usr/bin/env python3
"""Test: fetch directory page with Playwright stealth, then extract with ScrapeGraphAI."""
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
print(f"NVIDIA_API_KEY present: {bool(NVIDIA_API_KEY)}")

from scrapegraphai.graphs import SmartScraperGraph

# ── Step 1: Fetch HTML with Playwright + stealth ─────────────────
print("\n=== Step 1: Fetch directory page with Playwright stealth ===")
from playwright.sync_api import sync_playwright

urls = [
    ("ThreeBestRated", "https://threebestrated.com/local-plumbers-in-miami-fl"),
    ("BestProsInTown", "https://www.bestprosintown.com/fl/miami/plumbers/"),
]

for name, url in urls:
    print(f"\n--- {name} ---")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            
            # Apply stealth (skip undetected_playwright if not available)
            try:
                from undetected_playwright import stealth_sync
                stealth_sync(page)
                print("  Stealth applied")
            except ImportError:
                print("  No stealth module, continuing without")
                pass
            
            page.goto(url, wait_until="networkidle", timeout=30000)
            html = page.content()
            browser.close()
            print(f"  Fetched: {len(html)} bytes")
            
            # Save for debugging (to user temp dir)
            safe_name = name.lower().replace(" ", "_")
            debug_path = Path.home() / "AppData" / "Local" / "Temp" / f"debug_{safe_name}.html"
            debug_path.write_text(html, encoding="utf-8")
            print(f"  Saved HTML to {debug_path}")
            
            # ── Step 2: Extract with ScrapeGraphAI ─────────────────
            print("\n  === Step 2: ScrapeGraphAI extraction ===")
            graph_config = {
                "llm": {
                    "model": "nvidia/meta/llama-3.3-70b-instruct",
                    "api_key": NVIDIA_API_KEY,
                    "base_url": "https://integrate.api.nvidia.com/v1",
                    "temperature": 0.1,
                },
            }
            
            scraper = SmartScraperGraph(
                prompt="Extract ALL business listings on this page. For each business, return: business_name, phone_number, address, website, rating if visible. Return a JSON array.",
                source=html,  # Pass raw HTML, not URL
                config=graph_config,
            )
            
            result = scraper.run()
            print(f"  Result type: {type(result)}")
            
            if isinstance(result, list):
                print(f"  Found {len(result)} businesses:")
                for item in result[:5]:
                    print(f"    - {json.dumps(item, default=str)}")
            elif isinstance(result, dict):
                print(f"  Keys: {list(result.keys())[:10]}")
                # If it has a list inside
                for k, v in result.items():
                    if isinstance(v, list):
                        print(f"  {k}: {len(v)} items")
                        for item in v[:3]:
                            print(f"    - {json.dumps(item, default=str)[:300]}")
                    else:
                        print(f"  {k}: {str(v)[:200]}")
            else:
                print(f"  Raw: {str(result)[:1000]}")
            
            # Save results
            out_path = Path.home() / "AppData" / "Local" / "Temp" / f"leads_{safe_name}.json"
            out_path.write_text(json.dumps(result, indent=2, default=str), encoding="utf-8")
            print(f"  Saved to {out_path}")
            
    except Exception as e:
        print(f"  ERROR: {type(e).__name__}: {e}")
        import traceback
        traceback.print_exc()

print("\n=== Done ===")
