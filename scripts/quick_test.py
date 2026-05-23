#!/usr/bin/env python3
"""Quick test of DuckDuckGo search + NVIDIA LLM extraction."""
import json, os, re, time, urllib.parse
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

# ── Step 1: DuckDuckGo Search ──────────────────────────────────
print("\n=== Step 1: DuckDuckGo Search ===")
import primp
client = primp.Client()
resp = client.get(
    'https://lite.duckduckgo.com/lite/?q=plumber+Miami+FL',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},
    timeout=30,
)
html = resp.text
print(f"HTML size: {len(html)} bytes")

# Parse results
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

print(f"Titles: {len(titles)}, Snippets: {len(snippets)}, URLs: {len(urls)}")

results = []
for i, (ddg_url, title) in enumerate(titles[:10]):
    real_url = ddg_url
    if '/l/?uddg=' in ddg_url:
        qs = urllib.parse.urlparse(ddg_url).query
        parsed_qs = urllib.parse.parse_qs(qs)
        if 'uddg' in parsed_qs:
            real_url = urllib.parse.unquote(parsed_qs['uddg'][0])
    snippet = snippets[i] if i < len(snippets) else ""
    display_url = urls[i] if i < len(urls) else ""
    results.append({"title": title.strip(), "url": real_url, "body": snippet, "display_url": display_url})
    print(f"  {i+1}. {title.strip()[:60]}")
    print(f"     URL: {real_url[:80]}")
    print(f"     Snippet: {snippet[:100]}")
    print()

if not results:
    print("NO RESULTS FOUND. Debugging HTML structure...")
    # Look for any <a> tags
    all_links = re.findall(r'<a\s+[^>]*href="([^"]*)"[^>]*>', html)
    print(f"All <a> tags found: {len(all_links)}")
    for link in all_links[:10]:
        print(f"  {link}")
    # Look for 'result' in HTML
    for m in re.finditer(r'result[^=]*=', html, re.IGNORECASE):
        start = max(0, m.start() - 40)
        end = min(len(html), m.end() + 60)
        print(f"  ...{html[start:end]}...")
    exit(1)

# ── Step 2: NVIDIA LLM Extraction ──────────────────────────────
print("\n=== Step 2: NVIDIA LLM Extraction ===")
from openai import OpenAI

client_openai = OpenAI(
    api_key=NVIDIA_API_KEY,
    base_url="https://integrate.api.nvidia.com/v1",
)

context = "Search results for plumber in Miami FL:\n\n"
for i, r in enumerate(results[:10], 1):
    context += f"{i}. Title: {r['title']}\n   URL: {r['url']}\n   Snippet: {r['body'][:300]}\n\n"

prompt = f"""You are a business lead extraction expert. Given the search results above, extract business listings for plumber in Miami FL.

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

models_to_try = [
    "meta/llama-3.3-70b-instruct",
    "moonshotai/kimi-k2.6",
]

for model in models_to_try:
    print(f"\nTrying model: {model}")
    try:
        response = client_openai.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": "You extract business data from search results. Return ONLY valid JSON arrays."},
                {"role": "user", "content": prompt},
            ],
            temperature=0.1,
            max_tokens=2000,
            timeout=60,
        )
        content = response.choices[0].message.content.strip()
        print(f"Response ({len(content)} chars):")
        print(content[:500])
        
        # Try to parse JSON
        json_str = content
        if "```json" in content:
            json_str = content.split("```json")[1].split("```")[0].strip()
        elif "```" in content:
            json_str = content.split("```")[1].split("```")[0].strip()
        
        # Clean up
        if json_str.startswith("["):
            depth = 0
            end = 0
            for i, c in enumerate(json_str):
                if c == "[": depth += 1
                elif c == "]": 
                    depth -= 1
                    if depth == 0:
                        end = i + 1
                        break
            json_str = json_str[:end]
        
        data = json.loads(json_str)
        print(f"\nParsed {len(data)} leads:")
        for lead in data:
            print(f"  - {lead.get('business_name', 'N/A')}")
            print(f"    Phone: {lead.get('phone', 'N/A')}")
            print(f"    Website: {lead.get('website', 'N/A')}")
            print(f"    Address: {lead.get('address', 'N/A')}")
        break
    except Exception as e:
        print(f"  Error: {e}")
        continue

print("\n=== Done ===")
