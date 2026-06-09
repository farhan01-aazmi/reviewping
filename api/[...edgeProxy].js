// api/[...edgeProxy].js — Vercel Serverless Function (catch-all proxy for Supabase Edge Functions)
const SUPABASE_FN_URL = 'https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'authorization, content-type, x-client-info, apikey');
  if (req.method === 'OPTIONS') return res.status(204).end();

  const url = new URL(req.url, 'http://' + (req.headers.host || 'localhost'));
  const functionPath = url.pathname.replace(/^\/api\/edge\//, '');
  if (!functionPath) return res.status(400).json({ error: 'No function path' });

  let body;
  if (req.method !== 'GET' && req.method !== 'HEAD') {
    body = await new Promise(r => { let d = ''; req.on('data', c => d += c); req.on('end', () => r(d || undefined)); });
  }

  const headers = { 'Content-Type': req.headers['content-type'] || 'application/json' };
  if (req.headers.authorization) headers['Authorization'] = req.headers.authorization;

  const response = await fetch(SUPABASE_FN_URL + '/' + functionPath, {
    method: req.method, headers,
    body: body ? body : undefined,
  });

  res.setHeader('Content-Type', response.headers.get('content-type') || 'application/json');
  return res.status(response.status).send(await response.text());
}
