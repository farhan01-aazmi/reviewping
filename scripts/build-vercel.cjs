#!/usr/bin/env node
const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const root = path.resolve(__dirname, '..');
const distDir = path.join(root, 'dist');
const vercelOutput = path.join(root, '.vercel', 'output');
const staticDir = path.join(vercelOutput, 'static');
const functionsDir = path.join(vercelOutput, 'functions');
const configPath = path.join(vercelOutput, 'config.json');

const SUPABASE_FN_URL = 'https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1';

const FUNCTION_MAP = {
  'gbp-connect': 'gpb-connect',
  'gbp-sync': 'gpb-sync',
  'competitor-sync': 'competitor-sync',
  'weekly-digest': 'weekly-digest',
};

console.log('▶ Generating sitemap...');
execSync('node scripts/generate-sitemap.cjs', { cwd: root, stdio: 'inherit' });

console.log('▶ Generating seo-map...');
execSync('node scripts/generate-seo-map.cjs', { cwd: root, stdio: 'inherit' });

console.log('▶ Running vite build...');
execSync('npx vite build', { cwd: root, stdio: 'inherit' });

console.log('▶ Generating .vercel/output/...');
if (fs.existsSync(vercelOutput)) {
  fs.rmSync(vercelOutput, { recursive: true });
}
fs.mkdirSync(staticDir, { recursive: true });

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

if (fs.existsSync(path.join(root, 'public', 'badge.js'))) {
  fs.copyFileSync(path.join(root, 'public', 'badge.js'), path.join(staticDir, 'badge.js'));
}

console.log('▶ Prerendering per-route SEO HTML...');
const seoMap = JSON.parse(fs.readFileSync(path.join(root, 'seo-map.json'), 'utf8'));
const baseHtml = fs.readFileSync(path.join(staticDir, 'index.html'), 'utf8');
const seoRouteRules = [];

function escAttr(v) {
  return v.replace(/&/g, '&amp;').replace(/"/g, '&quot;').replace(/</g, '&lt;');
}

function injectSeo(html, route, meta) {
  let out = html;
  const robots = meta.noindex
    ? '\n    <meta name="robots" content="noindex, nofollow" />'
    : '';
  const jsonLd = meta.jsonLd
    ? `\n    <script type="application/ld+json">${JSON.stringify(meta.jsonLd)}</script>`
    : '';
  out = out.replace('</head>', `${robots}${jsonLd}\n  </head>`);
  out = out.replace(/<title>[^<]*<\/title>/, () => `<title>${escAttr(meta.title)}</title>`);
  out = out.replace(/<meta name="description" content="[^"]*" \/>/, () => `<meta name="description" content="${escAttr(meta.desc)}" />`);
  out = out.replace(/<link rel="canonical" href="[^"]*" \/>/, () => `<link rel="canonical" href="${escAttr(meta.canonical)}" />`);
  out = out.replace(/<meta property="og:title" content="[^"]*" \/>/, () => `<meta property="og:title" content="${escAttr(meta.title)}" />`);
  out = out.replace(/<meta property="og:description" content="[^"]*" \/>/, () => `<meta property="og:description" content="${escAttr(meta.desc)}" />`);
  out = out.replace(/<meta property="og:url" content="[^"]*" \/>/, () => `<meta property="og:url" content="${escAttr(meta.canonical)}" />`);
  out = out.replace(/<meta name="twitter:title" content="[^"]*" \/>/, () => `<meta name="twitter:title" content="${escAttr(meta.title)}" />`);
  out = out.replace(/<meta name="twitter:description" content="[^"]*" \/>/, () => `<meta name="twitter:description" content="${escAttr(meta.desc)}" />`);
  if (meta.ogImage) {
    out = out.replace(/<meta property="og:image" content="[^"]*" \/>/, () => `<meta property="og:image" content="${escAttr(meta.ogImage)}" />`);
    out = out.replace(/<meta name="twitter:image" content="[^"]*" \/>/, () => `<meta name="twitter:image" content="${escAttr(meta.ogImage)}" />`);
  }
  return out;
}

let homeHtml = baseHtml;
for (const [route, meta] of Object.entries(seoMap)) {
  if (route === '/') {
    homeHtml = injectSeo(homeHtml, route, meta);
    continue;
  }
  const htmlPath = path.join(staticDir, route.slice(1) + '.html');
  fs.mkdirSync(path.dirname(htmlPath), { recursive: true });
  fs.writeFileSync(htmlPath, injectSeo(baseHtml, route, meta));
  seoRouteRules.push({ src: `^${route}/?$`, dest: `/${route.slice(1)}.html` });
}
fs.writeFileSync(path.join(staticDir, 'index.html'), homeHtml);

console.log('▶ Creating /api/edge/[...slug] edge function...');
const edgeFuncDir = path.join(functionsDir, 'api', 'edge', '[...slug].func');
fs.mkdirSync(edgeFuncDir, { recursive: true });

const vcConfig = { runtime: 'edge', entrypoint: 'index.js' };
fs.writeFileSync(path.join(edgeFuncDir, '.vc-config.json'), JSON.stringify(vcConfig, null, 2));

const edgeFnCode = `
export default async function handler(request) {
  const url = new URL(request.url);
  const SUPABASE_FN_URL = '${SUPABASE_FN_URL}';
  const FUNCTION_MAP = ${JSON.stringify(FUNCTION_MAP)};
  let functionPath = url.pathname.replace(/^\\/api\\/edge\\//, '');
  if (FUNCTION_MAP[functionPath]) functionPath = FUNCTION_MAP[functionPath];
  const queryString = url.search;
  const targetUrl = SUPABASE_FN_URL + '/' + functionPath + queryString;
  if (request.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: { 'Access-Control-Allow-Origin': '*', 'Access-Control-Allow-Methods': 'GET, POST, OPTIONS', 'Access-Control-Allow-Headers': 'authorization, content-type, x-client-info, apikey' } });
  }
  let body;
  if (request.method !== 'GET' && request.method !== 'HEAD') body = await request.text();
  const headers = new Headers(request.headers);
  headers.delete('host');
  const upstream = await fetch(targetUrl, { method: request.method, headers, body: body || null });
  const respHeaders = new Headers(upstream.headers);
  respHeaders.set('Access-Control-Allow-Origin', '*');
  respHeaders.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  respHeaders.set('Access-Control-Allow-Headers', 'authorization, content-type, x-client-info, apikey');
  return new Response(upstream.body, { status: upstream.status, statusText: upstream.statusText, headers: respHeaders });
}`.trim();

fs.writeFileSync(path.join(edgeFuncDir, 'index.js'), edgeFnCode);

console.log('▶ Generating config.json...');
const config = {
  version: 3,
  routes: [
    ...seoRouteRules,
    { handle: 'filesystem' },
    { src: '^/api/edge/?(.*)', dest: '/api/edge/[...slug]' },
    { handle: 'miss', src: '^/(?!api/).*$', dest: '/index.html' },
  ],
};
fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

console.log('✓ Build complete!');
