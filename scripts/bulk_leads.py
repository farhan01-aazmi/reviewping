#!/usr/bin/env python3
"""
ReviewPing — Bulk Lead Scraper (Playwright + ScrapeGraphAI)
=============================================================
Scrapes YellowPages.com and Yell.com for small business leads
using Playwright for stealth browsing and NVIDIA API for AI extraction.

Usage:
    python scripts/bulk_leads.py --category plumber --city Miami --count 50
    python scripts/bulk_leads.py --category salon --city London --country UK --count 100
    python scripts/bulk_leads.py --categories-file categories.txt --cities-file cities.txt --count 1000

Environment:
    NVIDIA_API_KEY  — Your NVIDIA API key (nvapi-...)
"""

import argparse
import json
import os
import sys
import time
import re
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
    print("ERROR: NVIDIA_API_KEY is required")
    sys.exit(1)

MODEL = "nvidia/meta/llama-3.3-70b-instruct"

# ── Categories ────────────────────────────────────────────────────────────────
ALL_CATEGORIES = [
    "plumber", "electrician", "hvac", "roofer", "painter", "landscaper",
    "mover", "cleaner", "carpenter", "contractor",
    "dentist", "doctor", "chiropractor", "optometrist", "physical therapist",
    "salon", "barber", "nail salon", "spa", "massage",
    "restaurant", "bakery", "cafe", "pizza", "bar",
    "gym", "yoga studio", "personal trainer", "dance studio",
    "mechanic", "auto detailer", "car wash", "tire shop",
    "hotel", "motel", "bed and breakfast",
    "veterinarian", "pet groomer", "pet store",
    "photographer", "real estate agent", "insurance agent", "lawyer",
    "accountant", "financial advisor", "tax preparer",
    "daycare", "tutor", "music teacher", "art studio",
    "laundry", "dry cleaner", "tailor", "locksmith",
    "pest control", "window cleaning", "carpet cleaning",
]

ALL_CITIES_US = [
    "New York", "Los Angeles", "Chicago", "Houston", "Phoenix",
    "Philadelphia", "San Antonio", "San Diego", "Dallas", "San Jose",
    "Austin", "Jacksonville", "Fort Worth", "Columbus", "Charlotte",
    "Indianapolis", "San Francisco", "Seattle", "Denver", "Nashville",
    "Miami", "Portland", "Oklahoma City", "Las Vegas", "Louisville",
    "Baltimore", "Milwaukee", "Albuquerque", "Tucson", "Fresno",
    "Sacramento", "Kansas City", "Long Beach", "Mesa", "Atlanta",
    "Colorado Springs", "Raleigh", "Omaha", "Virginia Beach", "Tampa",
    "Orlando", "Cleveland", "Tulsa", "Honolulu", "Minneapolis",
    "Arlington", "New Orleans", "Boston", "Pittsburgh", "Cincinnati",
]

ALL_CITIES_UK = [
    "London", "Manchester", "Birmingham", "Glasgow", "Edinburgh",
    "Liverpool", "Bristol", "Leeds", "Leicester", "Nottingham",
    "Sheffield", "Newcastle upon Tyne", "Cardiff", "Belfast",
    "Southampton", "Portsmouth", "Brighton", "Oxford", "Cambridge",
]


def fetch_page(url):
    """Fetch a page using Playwright + stealth."""
    from playwright.sync_api import sync_playwright
    from undetected_playwright import stealth_sync
    
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        stealth_sync(page)
        page.goto(url, wait_until="networkidle", timeout=60000)
        # Wait for content to render
        try:
            page.wait_for_selector('[class*="result"], [class*="listing"], [class*="business"]', timeout=10000)
        except:
            pass
        html = page.content()
        browser.close()
        return html


def extract_listings_from_html(html):
    """Parse YellowPages HTML to extract business listings using regex."""
    leads = []
    
    # Look for business listing patterns in YellowPages HTML
    # Each listing typically has: business name in h3/a, phone, address, website
    
    # Extract business name + link blocks
    # YellowPages pattern: <a class="business-name" href="...">Name</a>
    name_pattern = re.compile(
        r'class="business-name"[^>]*>\s*<span[^>]*>\s*([^<]+)\s*</span>',
        re.IGNORECASE
    )
    
    phone_pattern = re.compile(
        r'class="phone"[^>]*>\s*(?:<span[^>]*>\s*)?([\d\-\(\)\.\s]{7,20})',
        re.IGNORECASE
    )
    
    address_pattern = re.compile(
        r'class="street-address"[^>]*>\s*([^<]+)',
        re.IGNORECASE
    )
    
    # Alternative: look for listing containers
    # Each .result or .listing container
    listing_blocks = re.findall(
        r'<div[^>]*class="[^"]*result[^"]*"[^>]*>(.*?)</div>\s*</div>\s*</div>\s*</div>',
        html,
        re.DOTALL | re.IGNORECASE
    )
    
    if not listing_blocks:
        # Try simpler approach - just find all business names
        names = name_pattern.findall(html)
        phones = phone_pattern.findall(html)
        
        for i, name in enumerate(names):
            lead = {"business_name": name.strip()}
            if i < len(phones):
                lead["phone"] = phones[i].strip()
            leads.append(lead)
    else:
        for block in listing_blocks:
            name_match = name_pattern.search(block)
            phone_match = phone_pattern.search(block)
            address_match = address_pattern.search(block)
            
            lead = {}
            if name_match:
                lead["business_name"] = name_match.group(1).strip()
            if phone_match:
                lead["phone"] = phone_match.group(1).strip()
            if address_match:
                lead["address"] = address_match.group(1).strip()
            
            if lead.get("business_name"):
                leads.append(lead)
    
    return leads


def scrape_yellowpages(category, city, country="US", max_results=50):
    """Scrape YellowPages for business leads."""
    city_formatted = city.replace(" ", "+")
    category_formatted = category.replace(" ", "+")
    
    if country == "UK":
        # Use yell.com for UK
        url = f"https://www.yell.com/s/{category_formatted}-{city_formatted}.html"
        domain = "yell.com"
    else:
        # Use yellowpages.com for US
        state = ""
        # Map major cities to states
        city_state_map = {
            "New York": "NY", "Los Angeles": "CA", "Chicago": "IL",
            "Houston": "TX", "Phoenix": "AZ", "Philadelphia": "PA",
            "San Antonio": "TX", "San Diego": "CA", "Dallas": "TX",
            "San Jose": "CA", "Austin": "TX", "Jacksonville": "FL",
            "Fort Worth": "TX", "Columbus": "OH", "Charlotte": "NC",
            "Indianapolis": "IN", "San Francisco": "CA", "Seattle": "WA",
            "Denver": "CO", "Nashville": "TN", "Miami": "FL",
            "Portland": "OR", "Oklahoma City": "OK", "Las Vegas": "NV",
            "Louisville": "KY", "Baltimore": "MD", "Milwaukee": "WI",
            "Albuquerque": "NM", "Tucson": "AZ", "Fresno": "CA",
            "Sacramento": "CA", "Kansas City": "MO", "Long Beach": "CA",
            "Mesa": "AZ", "Atlanta": "GA", "Colorado Springs": "CO",
            "Raleigh": "NC", "Omaha": "NE", "Virginia Beach": "VA",
            "Tampa": "FL", "Orlando": "FL", "Cleveland": "OH",
            "Tulsa": "OK", "Honolulu": "HI", "Minneapolis": "MN",
            "Arlington": "TX", "New Orleans": "LA", "Boston": "MA",
            "Pittsburgh": "PA", "Cincinnati": "OH", "St. Louis": "MO",
        }
        state = city_state_map.get(city, "")
        geo = f"{city_formatted}%2C+{state}" if state else city_formatted
        url = f"https://www.yellowpages.com/search?search_terms={category_formatted}&geo_location_terms={geo}"
        domain = "yellowpages.com"
    
    print(f"  Fetching {domain} for {category} in {city}...")
    
    try:
        html = fetch_page(url)
        print(f"  Page size: {len(html)} bytes")
        
        leads = extract_listings_from_html(html)
        
        if leads:
            print(f"  Found {len(leads)} leads via regex parsing")
            return leads[:max_results]
        else:
            print(f"  Regex parsing found nothing, trying AI extraction...")
            # Fallback to AI extraction
            from scrapegraphai.graphs import SmartScraperGraph
            from langchain_nvidia_ai_endpoints import ChatNVIDIA
            
            llm = ChatNVIDIA(
                model="meta/llama-3.3-70b-instruct",
                nvidia_api_key=NVIDIA_API_KEY,
                temperature=0.1,
            )
            
            graph = SmartScraperGraph(
                prompt=f"Extract all business listings from this page. For each business, return: business_name, phone, address, website. Return as a JSON array.",
                source=html,
                config={"llm": {"model_instance": llm, "model_tokens": 8192}},
            )
            
            result = graph.run()
            
            # Parse the result
            if isinstance(result, dict):
                content = result.get("content", {})
                if isinstance(content, list):
                    return content[:max_results]
                elif isinstance(content, dict):
                    # Might be wrapped
                    for key in content:
                        if isinstance(content[key], list):
                            return content[key][:max_results]
            
            return []
    
    except Exception as e:
        print(f"  [ERROR] {e}")
        return []


def main():
    parser = argparse.ArgumentParser(description="ReviewPing — Bulk Lead Scraper")
    parser.add_argument("--category", "-c", help="Business category (e.g., plumber, dentist)")
    parser.add_argument("--categories-file", help="File with one category per line")
    parser.add_argument("--city", help="City name")
    parser.add_argument("--city-list", help="Comma-separated city names")
    parser.add_argument("--cities-file", help="File with one city per line")
    parser.add_argument("--country", default="US", choices=["US", "UK"], help="Country")
    parser.add_argument("--count", type=int, default=50, help="Max leads per category/city")
    parser.add_argument("--output", "-o", default="leads.json", help="Output JSON file")
    parser.add_argument("--delay", type=int, default=3, help="Delay between requests (seconds)")
    
    args = parser.parse_args()
    
    # Determine categories
    if args.categories_file:
        with open(args.categories_file) as f:
            categories = [line.strip() for line in f if line.strip()]
    elif args.category:
        categories = [args.category]
    else:
        categories = ALL_CATEGORIES
    
    # Determine cities
    if args.cities_file:
        with open(args.cities_file) as f:
            cities = [line.strip() for line in f if line.strip()]
    elif args.city_list:
        cities = [c.strip() for c in args.city_list.split(",")]
    elif args.city:
        cities = [args.city]
    elif args.country == "UK":
        cities = ALL_CITIES_UK
    else:
        cities = ALL_CITIES_US
    
    all_leads = []
    total_combos = len(categories) * len(cities)
    combo_num = 0
    
    print(f"ReviewPing Bulk Lead Scraper")
    print(f"  Categories: {len(categories)}")
    print(f"  Cities: {len(cities)} ({args.country})")
    print(f"  Total combos: {total_combos}")
    print(f"  Max per combo: {args.count}")
    print(f"  Target: ~{total_combos * args.count} leads")
    print()
    
    for category in categories:
        for city in cities:
            combo_num += 1
            pct = (combo_num / total_combos) * 100
            print(f"[{combo_num}/{total_combos} ({pct:.0f}%)] {category} / {city}")
            
            leads = scrape_yellowpages(category, city, args.country, args.count)
            all_leads.extend(leads)
            
            print(f"  Total so far: {len(all_leads)} leads")
            print()
            
            # Save progress periodically
            if len(all_leads) % 50 < len(leads) and len(all_leads) > 0:
                with open(args.output, 'w') as f:
                    json.dump(all_leads, f, indent=2)
                print(f"  [Saved to {args.output}]")
            
            # Delay between requests
            if combo_num < total_combos:
                time.sleep(args.delay)
    
    # Final save
    with open(args.output, 'w') as f:
        json.dump(all_leads, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"COMPLETE! Total leads: {len(all_leads)}")
    print(f"Saved to: {args.output}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
