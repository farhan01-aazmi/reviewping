#!/usr/bin/env python3
"""
ReviewPing — ScrapeGraphAI with NVIDIA API
===========================================
Uses open-source ScrapeGraphAI with NVIDIA's OpenAI-compatible API.

Usage:
    python scripts/nvidia_scrapegraph.py extract <url> --prompt "..."
    python scripts/nvidia_scrapegraph.py search "<query>"
    python scripts/nvidia_scrapegraph.py crawl <url> --max-pages 10

Environment:
    NVIDIA_API_KEY  — Your NVIDIA API key (nvapi-...)
"""

import argparse
import json
import os
import sys
from pathlib import Path

# Load .env file if exists
try:
    from dotenv import load_dotenv
    env_path = Path(__file__).parent.parent / '.env'
    if env_path.exists():
        load_dotenv(env_path)
except ImportError:
    pass

# ScrapeGraphAI imports (moved to top for global availability)
from scrapegraphai.graphs import SmartScraperGraph, SearchGraph, DepthSearchGraph

# ── Config ────────────────────────────────────────────────────────────────────
NVIDIA_API_KEY = os.environ.get("NVIDIA_API_KEY")

# NVIDIA provider is built into ScrapeGraphAI via langchain-nvidia-ai-endpoints
MODEL = "nvidia/meta/llama-3.3-70b-instruct"

if not NVIDIA_API_KEY:
    print("ERROR: NVIDIA_API_KEY environment variable is required.")
    print("Set it with: $env:NVIDIA_API_KEY = 'nvapi-your-key-here'")
    print("Or add to .env file: NVIDIA_API_KEY=nvapi-your-key-here")
    sys.exit(1)


def setup_scrapegraph():
    """Setup ScrapeGraphAI with NVIDIA API."""
    
    # Common LLM config for NVIDIA provider
    llm_config = {
        "llm": {
            "model": MODEL,
            "api_key": NVIDIA_API_KEY,
            "temperature": 0.1,
        },
    }
    
    return llm_config


def fetch_page_html(url):
    """Fetch a page using Playwright + stealth for JS-heavy sites."""
    from playwright.sync_api import sync_playwright
    from undetected_playwright import stealth_sync
    
    print(f"  Fetching page with stealth Playwright...")
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            stealth_sync(page)
            page.goto(url, wait_until="networkidle", timeout=60000)
            html = page.content()
            browser.close()
            print(f"  Page fetched: {len(html)} bytes")
            return html
    except Exception as e:
        print(f"  Playwright fetch failed: {e}")
        return None


def cmd_extract(url, prompt, schema_file=None, output=None, use_playwright=False):
    """Extract structured data from a URL using AI."""
    print(f"[EXTRACT] URL: {url}")
    print(f"  Prompt: {prompt}")
    print(f"  Model: {MODEL}")
    
    llm_config = setup_scrapegraph()
    
    schema = None
    if schema_file:
        with open(schema_file, 'r') as f:
            schema = json.load(f)
        print(f"  Schema: {list(schema.get('properties', {}).keys())}")
    
    if use_playwright:
        # Fetch with Playwright first, then pass HTML directly
        html = fetch_page_html(url)
        if not html:
            print("  [ERR] Failed to fetch page, falling back to ScrapeGraphAI's loader")
            graph = SmartScraperGraph(
                prompt=prompt, source=url, config=llm_config, schema=schema,
            )
        else:
            graph = SmartScraperGraph(
                prompt=prompt, source=html, config=llm_config, schema=schema,
            )
    else:
        graph = SmartScraperGraph(
            prompt=prompt, source=url, config=llm_config, schema=schema,
        )
    
    print("  Running ScrapeGraphAI extraction...")
    result = graph.run()
    
    if output:
        with open(output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"  [OK] Results saved to: {output}")
    else:
        print(f"\n[RESULT]")
        print(json.dumps(result, indent=2))
    
    return result


def cmd_search(query, num_results=5, output=None, prompt=None):
    """Search the web and extract structured data."""
    print(f"[SEARCH] Query: {query}")
    print(f"  Results: {num_results}")
    print(f"  Model: {MODEL}")
    
    llm_config = setup_scrapegraph()
    
    graph = SearchGraph(
        prompt=prompt or f"Extract all business information from search results for: {query}",
        source=query,
        config={
            **llm_config,
            "max_results": num_results,
        },
    )
    
    print("  Running ScrapeGraphAI search...")
    result = graph.run()
    
    if output:
        with open(output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"  [OK] Results saved to: {output}")
    else:
        print(f"\n[RESULT]")
        print(json.dumps(result, indent=2))
    
    return result


def cmd_crawl(url, max_pages=10, max_depth=2, output=None, prompt=None):
    """Crawl a website and extract data."""
    print(f"[CRAWL] URL: {url}")
    print(f"  Max pages: {max_pages}, Max depth: {max_depth}")
    print(f"  Model: {MODEL}")
    
    llm_config = setup_scrapegraph()
    
    graph = DepthSearchGraph(
        prompt=prompt or "Extract all business information from each page",
        source=url,
        config={
            **llm_config,
            "max_pages": max_pages,
            "max_depth": max_depth,
        },
    )
    
    print("  Running ScrapeGraphAI crawl...")
    result = graph.run()
    
    if output:
        with open(output, 'w') as f:
            json.dump(result, f, indent=2)
        print(f"  [OK] Results saved to: {output}")
    else:
        print(f"\n[RESULT]")
        if isinstance(result, dict):
            print(json.dumps(result, indent=2)[:2000])
            if len(json.dumps(result)) > 2000:
                print("  ... [truncated, use --output to save full results]")
        else:
            print(result)
    
    return result


def main():
    parser = argparse.ArgumentParser(
        description="ReviewPing — ScrapeGraphAI with NVIDIA API",
        formatter_class=argparse.RawDescriptionHelpFormatter,
        epilog="""
Examples:
  python scripts/nvidia_scrapegraph.py extract https://example.com --prompt "Extract business name, phone, email"
  python scripts/nvidia_scrapegraph.py search "plumber in Miami with bad reviews" --results 5
  python scripts/nvidia_scrapegraph.py crawl https://example.com/directory --max-pages 20 --output leads.json
        """
    )
    
    subparsers = parser.add_subparsers(dest="command", help="Available commands")
    
    # Extract command
    extract_parser = subparsers.add_parser("extract", help="Extract structured data from a URL")
    extract_parser.add_argument("url", help="URL to scrape")
    extract_parser.add_argument("--prompt", "-p", required=True, help="What to extract")
    extract_parser.add_argument("--schema", "-s", help="JSON schema file for structured output")
    extract_parser.add_argument("--output", "-o", help="Save output to JSON file")
    extract_parser.add_argument("--playwright", "-pw", action="store_true", help="Use Playwright for JS rendering (bypasses anti-bot)")
    
    # Search command
    search_parser = subparsers.add_parser("search", help="Web search + AI extraction")
    search_parser.add_argument("query", help="Search query")
    search_parser.add_argument("--results", "-n", type=int, default=5, help="Number of results (default: 5)")
    search_parser.add_argument("--prompt", "-p", help="Extraction prompt (default: auto-generated)")
    search_parser.add_argument("--output", "-o", help="Save output to JSON file")
    
    # Crawl command
    crawl_parser = subparsers.add_parser("crawl", help="Crawl a website")
    crawl_parser.add_argument("url", help="Starting URL")
    crawl_parser.add_argument("--max-pages", "-m", type=int, default=10, help="Max pages to crawl (default: 10)")
    crawl_parser.add_argument("--max-depth", "-d", type=int, default=2, help="Max crawl depth (default: 2)")
    crawl_parser.add_argument("--prompt", "-p", help="Extraction prompt")
    crawl_parser.add_argument("--output", "-o", help="Save output to JSON file")
    
    args = parser.parse_args()
    
    if not args.command:
        parser.print_help()
        sys.exit(1)
    
    if args.command == "extract":
        cmd_extract(args.url, args.prompt, args.schema, args.output, args.playwright)
    elif args.command == "search":
        cmd_search(args.query, args.results, args.output, args.prompt)
    elif args.command == "crawl":
        cmd_crawl(args.url, args.max_pages, args.max_depth, args.output, args.prompt)


if __name__ == "__main__":
    main()
