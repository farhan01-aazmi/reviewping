#!/usr/bin/env node
/**
 * Custom Vercel build script.
 * 1. Generates sitemap
 * 2. Runs vite build
 * 3. Generates .vercel/output/ with correct SPA routing
 * 
 * This bypasses Vercel's Vite builder which has routing bugs.
 */
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const vercelOutput = path.join(root, '.vercel', 'output');
const staticDir = path.join(vercelOutput, 'static');
const functionsDir = path.join(vercelOutput, 'functions');
const configPath = path.join(vercelOutput, 'config.json');

// Supabase Edge Functions URL for the proxy
const SUPABASE_FN_URL = 'https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1';

// Function name mapping (same as middleware.js)
const FUNCTION_MAP = {
  'gbp-connect': 'gpb-connect',
  'gpb-sync': 'gpb-sync',
  'competitor-sync': 'competitor-sync',
  'weekly-digest': 'weekly-digest',
};

// Step 0: Generate sitemap from blog data
console.log('▶ Generating sitemap...');
execSync('node scripts/generate-sitemap.cjs', { cwd: root, stdio: 'inherit' });

// Step 1: Run vite build
console.log('▶ Running vite build...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

// Step 2: Create vercel output structure
console.log('▶ Generating .vercel/output/...');
if (fs.existsSync(vercelOutput)) {
  fs.rmSync(vercelOutput, { recursive: true });
}
fs.mkdirSync(staticDir, { recursive: true });

// Step 3: Copy dist/ to static/
function copyDir(src, dest) {
  for (const entry of fs.readdirSync(src, { withFileTypes: true })) {
    const s = path.join(src, entry.name);
    const d = path.join(dest, entry.name);
    if (entry.isDirectory()) {
      copyDir(s, d);
    } else {
      fs.mkdirSync(path.dirname(d), { recursive: true });
      fs.copyFileSync(s, d);
    }
  }
}
copyDir(distDir, staticDir);

// Step 4: Create Vercel Edge Function for /api/edge/* proxy
// This replaces middleware.js since custom build output skips it
console.log('▶ Creating /api/edge/[...slug] edge function...');
const edgeFuncDir = path.join(functionsDir, 'api', 'edge', '[...slug].func');
fs.mkdirSync(edgeFuncDir, { recursive: true });

// Write .vc-config.json
const vcConfig = {
  runtime: 'edge',
  entrypoint: 'index.js',
};
fs.writeFileSync(path.join(edgeFuncDir, '.vc-config.json'), JSON.stringify(vcConfig, null, 2));

// Write the actual edge function code (proxies to Supabase)
const edgeFnCode = `
export default async function handler(request) {
  const url = new URL(request.url);
  const SUPABASE_FN_URL = '${SUPABASE_FN_URL}';
  const FUNCTION_MAP = ${JSON.stringify(FUNCTION_MAP)};

  let functionPath = url.pathname.replace(/^\\/api\\/edge\\//, '');
  if (FUNCTION_MAP[functionPath]) {
    functionPath = FUNCTION_MAP[functionPath];
  }
  const queryString = url.search;
  const targetUrl = SUPABASE_FN_URL + '/' + functionPath + queryString;

  // Handle OPTIONS (CORS preflight)
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
        'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey',
      },
    });
  }

  // Read body for non-GET requests
  let body;
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    body = await request.text();
  }

  // Forward headers (remove host to avoid conflicts)
  const headers = new Headers(request.headers);
  headers.delete('host');

  // Forward the request to Supabase
  const upstream = await fetch(targetUrl, {
    method: request.method,
    headers,
    body: body || null,
  });

  // Build response with CORS headers
  const respHeaders = new Headers(upstream.headers);
  respHeaders.set('Access-Control-Allow-Origin', '*');
  respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  respHeaders.set('Access-Control-Allow-Headers', 'authorization, content-type, x-client-info, apikey');

  return new Response(upstream.body, {
    status: upstream.status,
    statusText: upstream.statusText,
    headers: respHeaders,
  });
}
`.trim();

fs.writeFileSync(path.join(edgeFuncDir, 'index.js'), edgeFnCode);

// Step 5: Generate config.json with API proxy routing + SPA catch-all
console.log('▶ Generating config.json...');
const config = {
  version: 3,
  routes: [
    { handle: 'filesystem' },
    // API edge proxy must come before catch-all
    { src: '^/api/edge/?(.*)', dest: '/api/edge/[...slug]' },
    // SPA catch-all
    { src: '/(.*)', dest: '/index.html' },
  ],
};
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✓ Build complete! .vercel/output/ ready for deployment');
