#!/usr/bin/env python3
"""
ReviewPing — Free Lead Scraper (DuckDuckGo + NVIDIA LLM)
==========================================================
Uses DuckDuckGo search (FREE, no API key, no Cloudflare) to find
business listings, then NVIDIA LLM extracts structured data.

Usage:
    python scripts/duckduckgo_leads.py --category plumber --city Miami --count 50
    python scripts/duckduckgo_leads.py --all --country US --count 1000
    python scripts/duckduckgo_leads.py --categories-file cats.txt --cities-file cities.txt

Environment:
    NVIDIA_API_KEY  — Your NVIDIA API key
"""

import argparse
import json
import os
import sys
import time
import re
from pathlib import Path

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

# ── Categories ────────────────────────────────────────────────────────────────
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
]

ALL_CITIES_UK = [
    "London", "Manchester", "Birmingham", "Glasgow", "Edinburgh",
    "Liverpool", "Bristol", "Leeds", "Leicester", "Nottingham",
    "Sheffield", "Newcastle upon Tyne", "Cardiff", "Belfast",
    "Southampton", "Portsmouth", "Brighton", "Oxford", "Cambridge",
]


def search_duckduckgo(query, max_results=10):
    """Search DuckDuckGo lite HTML and parse results."""
    import re
    import urllib.parse
    try:
        import primp
        client = primp.Client()
        resp = client.get(
            f"https://lite.duckduckgo.com/lite/?q={query.replace(' ', '+')}",
            headers={"User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36"},
        )
        
        html = resp.text
        results = []
        
        # DuckDuckGo Lite HTML pattern:
        # 3 rows per result:
        # 1: <a class="result-link" href="...">Title</a>
        # 2: <td class="result-snippet">Snippet</td>
        # 3: <span class="link-text">URL</span>
        
        # Find all result-link anchors
        link_pattern = re.compile(
            r'<a\s+rel="nofollow"\s+href="([^"]+)"\s+class=\'result-link\'[^>]*>([^<]+)</a>',
            re.DOTALL,
        )
        
        # Find all result-snippets  
        snippet_pattern = re.compile(
            r'<td\s+class=\'result-snippet\'[^>]*>(.*?)</td>',
            re.DOTALL,
        )
        
        # Find all link-text spans
        url_pattern = re.compile(
            r'<span\s+class=\'link-text\'[^>]*>(.*?)</span>',
            re.DOTALL,
        )
        
        titles = link_pattern.findall(html)
        snippets = [re.sub(r'<[^>]+>', '', s).strip() for s in snippet_pattern.findall(html)]
        urls = [u.strip() for u in url_pattern.findall(html)]
        
        for i, (ddg_url, title) in enumerate(titles[:max_results]):
            # Extract real URL from DuckDuckGo redirect
            real_url = ddg_url
            if '/l/?uddg=' in ddg_url:
                parsed = urllib.parse.parse_qs(urllib.parse.urlparse(ddg_url).query)
                if 'uddg' in parsed:
                    real_url = urllib.parse.unquote(parsed['uddg'][0])
            
            snippet = snippets[i] if i < len(snippets) else ""
            display_url = urls[i] if i < len(urls) else ""
            
            results.append({
                "title": title.strip(),
                "url": real_url,
                "body": snippet,
                "display_url": display_url,
            })
        
        return results
    except Exception as e:
        print(f"  DuckDuckGo error: {e}")
        return []


def extract_leads_with_llm(search_results, category, city):
    """Use NVIDIA LLM to extract business leads from search results."""
    from openai import OpenAI
    
    client = OpenAI(
        api_key=NVIDIA_API_KEY,
        base_url="https://integrate.api.nvidia.com/v1",
    )
    
    # Prepare search results as context
    context = f"Search results for {category} in {city}:\n\n"
    for i, r in enumerate(search_results[:15], 1):
        context += f"{i}. Title: {r['title']}\n   URL: {r['url']}\n   Snippet: {r['body'][:300]}\n\n"
    
    prompt = f"""You are a business lead extraction expert. Given the search results above, extract business listings for {category} in {city}.

For each business found, return ONLY a JSON array with these fields:
- business_name (required)
- phone (if found in results)
- website (if found)
- address (if found)
- source_url (the URL where this info was found)

Rules:
- Only return REAL businesses, no duplicates
- If no businesses found, return empty array []
- Return ONLY valid JSON, no other text
- Example: [{{"business_name": "ABC Plumbers", "phone": "305-555-0123", "website": "https://abcplumbers.com", "address": "Miami, FL"}}]

Search results:
{context}"""
    
    try:
        response = client.chat.completions.create(
            model="moonshotai/kimi-k2.6",
            messages=[
                {"role": "system", "content": "You extract business data from search results. Return ONLY valid JSON arrays."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=2000,
        )
        
        content = response.choices[0].message.content.strip()
        
        # Extract JSON from response (handle markdown-wrapped JSON)
        if "```json" in content:
            content = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            content = content.split("```")[1].split("```")[0].strip()
        
        # Remove any trailing punctuation after the JSON array
        if content.startswith("["):
            # Find the matching closing bracket
            depth = 0
            end = 0
            for i, c in enumerate(content):
                if c == "[":
                    depth += 1
                elif c == "]":
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            content = content[:end]
        
        leads = json.loads(content)
        return leads if isinstance(leads, list) else []
    
    except Exception as e:
        print(f"  LLM extraction error: {e}")
        return []


def scrape_category_city(category, city, country="US", max_results=50):
    """Scrape leads for one category/city combination."""
    query = f"{category} in {city}"
    if country == "UK":
        query = f"{category} in {city} UK"
    
    print(f"  Searching: \"{query}\"")
    
    # Search DuckDuckGo
    search_results = search_duckduckgo(query, max_results=10)
    print(f"  Found {len(search_results)} search results")
    
    if not search_results:
        return []
    
    # Extract with LLM
    leads = extract_leads_with_llm(search_results, category, city)
    print(f"  Extracted {len(leads)} leads")
    
    # Add category and city metadata
    for lead in leads:
        lead["category"] = category
        lead["city"] = city
        lead["country"] = country
        lead["source"] = "duckduckgo"
    
    return leads[:max_results]


def main():
    parser = argparse.ArgumentParser(description="ReviewPing — Free Lead Scraper")
    parser.add_argument("--category", "-c", help="Business category")
    parser.add_argument("--categories-file", help="File with categories")
    parser.add_argument("--city", help="City name")
    parser.add_argument("--city-list", help="Comma-separated cities")
    parser.add_argument("--cities-file", help="File with cities")
    parser.add_argument("--all", action="store_true", help="Run all categories x cities")
    parser.add_argument("--country", default="US", choices=["US", "UK"])
    parser.add_argument("--count", type=int, default=10, help="Max leads per combo")
    parser.add_argument("--output", "-o", default="leads.json", help="Output file")
    parser.add_argument("--delay", type=int, default=2, help="Delay between searches")
    
    args = parser.parse_args()
    
    # Determine categories
    if args.categories_file:
        with open(args.categories_file) as f:
            categories = [l.strip() for l in f if l.strip()]
    elif args.category:
        categories = [args.category]
    elif args.all:
        categories = ALL_CATEGORIES
    else:
        categories = ALL_CATEGORIES[:5]  # Default: 5 categories
    
    # Determine cities
    if args.cities_file:
        with open(args.cities_file) as f:
            cities = [l.strip() for l in f if l.strip()]
    elif args.city_list:
        cities = [c.strip() for c in args.city_list.split(",")]
    elif args.city:
        cities = [args.city]
    elif args.all or args.country == "UK":
        cities = ALL_CITIES_UK if args.country == "UK" else ALL_CITIES_US
    else:
        cities = ALL_CITIES_US[:5]  # Default: 5 cities
    
    all_leads = []
    total = len(categories) * len(cities)
    done = 0
    
    print(f"ReviewPing — Free Lead Scraper")
    print(f"  Source: DuckDuckGo search + NVIDIA LLM")
    print(f"  Categories: {len(categories)}, Cities: {len(cities)} ({args.country})")
    print(f"  Total combos: {total}")
    print(f"  Target: ~{total * args.count} leads")
    print()
    
    for category in categories:
        for city in cities:
            done += 1
            pct = (done / total) * 100
            print(f"[{done}/{total} ({pct:.0f}%)] {category} @ {city}")
            
            leads = scrape_category_city(category, city, args.country, args.count)
            all_leads.extend(leads)
            
            print(f"  Total: {len(all_leads)} leads")
            print()
            
            # Save periodically
            if len(all_leads) % 20 < len(leads) and len(all_leads) > 0:
                with open(args.output, 'w') as f:
                    json.dump(all_leads, f, indent=2)
            
            if done < total:
                time.sleep(args.delay)
    
    # Final save
    with open(args.output, 'w') as f:
        json.dump(all_leads, f, indent=2)
    
    print(f"\n{'='*50}")
    print(f"COMPLETE! {len(all_leads)} leads saved to {args.output}")
    print(f"{'='*50}")


if __name__ == "__main__":
    main()
