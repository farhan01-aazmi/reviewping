import re
import primp

client = primp.Client()
resp = client.get(
    'https://lite.duckduckgo.com/lite/?q=plumber+Miami',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},
)
html = resp.text

# Save HTML to file for inspection
with open('ddg_debug.html', 'w', encoding='utf-8') as f:
    f.write(html)

print(f"HTML size: {len(html)} bytes")
print(f"Saved to ddg_debug.html")

# Look for result-related patterns
for match in re.finditer(r'(class|id)\s*=\s*"[^"]*result[^"]*"', html, re.IGNORECASE):
    start = max(0, match.start() - 50)
    end = min(len(html), match.end() + 100)
    ctx = html[start:end].replace('\n', '\\n')
    print(f"Result at {match.start()}: ...{ctx}...")

# Also look for links
link_matches = re.findall(r'<a[^>]+href="([^"]+)"[^>]*>', html)
print(f"\nTotal links found: {len(link_matches)}")
for url in link_matches[:5]:
    print(f"  {url}")
