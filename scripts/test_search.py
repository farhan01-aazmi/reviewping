import sys, re, urllib.parse
import primp

query = 'plumber in Miami FL'
client = primp.Client()
resp = client.get(
    'https://lite.duckduckgo.com/lite/?q=plumber+Miami+FL',
    headers={'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'},
)

html = resp.text
print(f'HTML size: {len(html)}')

# Simpler pattern - find <a with result-link class
p = re.compile(r'<a[^>]+class=\'result-link\'[^>]*>([^<]+)</a>')
titles = p.findall(html)
print(f'Found {len(titles)} titles')
for i, t in enumerate(titles[:10]):
    print(f'  {i+1}. {t.strip()}')

# URLs
p2 = re.compile(r'<span[^>]+class=\'link-text\'[^>]*>([^<]+)</span>')
urls = p2.findall(html)
print(f'\nFound {len(urls)} URLs')
for i, u in enumerate(urls[:10]):
    print(f'  {i+1}. {u.strip()}')
