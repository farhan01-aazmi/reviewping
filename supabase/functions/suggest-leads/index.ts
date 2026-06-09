// =============================================================================
// ReviewPing — Suggest Leads Edge Function
// =============================================================================
// Returns the top 50 leads most likely to convert for ReviewPing outreach,
// ordered by an outreach score that balances:
//   - High Google rating (> 4.0) but low review count (< 50)
//     → high potential for review volume improvement
//   - High review count but low recent activity → dormant reviewer base
//
// Called as:  POST /functions/v1/suggest-leads
// Body:       { category: "dentist" }
// Auth:       Requires valid JWT (authenticated user)
// =============================================================================

import { serve } from 'https://deno.land/std@0.208.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { verifyAuth, CORS } from '../_shared/auth.ts';

// ── Environment ──────────────────────────────────────────────────────────────
const SUPABASE_URL = Deno.env.get('SUPABASE_URL') ?? '';
const SUPABASE_ANON_KEY = Deno.env.get('SUPABASE_ANON_KEY') ?? '';
// ── CORS headers (restricted to production origin) ──────────────────────────
const ALLOWED_ORIGIN = Deno.env.get('CORS_ORIGIN') || 'https://reviewping.pro';
const CORS_HEADERS = {
  'Access-Control-Allow-Origin': ALLOWED_ORIGIN,
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Max-Age': '86400',
};

// ── Request schema ──────────────────────────────────────────────────────────
interface SuggestLeadsRequest {
  /** Business category filter (e.g. "dentist", "plumber") */
  category?: string;
  /** Maximum number of leads to return (default 50) */
  limit?: number;
  /** Minimum Google rating threshold (default 4.0) */
  min_rating?: number;
  /** Maximum review count for "high potential" scoring (default 50) */
  max_reviews_for_potential?: number;
  /** City filter (optional) */
  city?: string;
  /** State filter (optional) */
  state?: string;
}

// ── Lead response shape ─────────────────────────────────────────────────────
interface LeadResult {
  id: number;
  business_name: string;
  category: string;
  phone: string | null;
  email: string | null;
  website: string | null;
  address: string | null;
  city: string | null;
  state: string | null;
  zip: string | null;
  google_rating: number | null;
  reviews_count: number | null;
  google_place_id: string | null;
  status: string;
  created_at: string;
  outreach_score: number;
  /** Human-readable explanation of why this lead was suggested */
  suggestion_reason: string;
}

// ── Scoring logic ────────────────────────────────────────────────────────────
// We score leads on two axes:
//   1. "Low-hanging fruit": high rating (≥4.0), low reviews (< 50)
//      → business is good but not getting enough reviews → ReviewPing is ideal
//   2. "Volume potential": high reviews (≥ 50) but stale (never contacted)
//      → already has review culture, likely receptive to more
//
// Score formula:
//   base = rating * 2.5  (rating weight: a 5.0 gets 12.5, 4.0 gets 10)
//   review_bonus = clamp( (50 - reviews_count) / 50, 0, 1 ) * 10
//     → 0 reviews = +10 bonus, 25 reviews = +5, 50+ reviews = +0
//   volume_bonus = if reviews_count >= 50 and status == 'new' then 5 else 0
//     → already has reviews but not contacted yet
//   score = base + review_bonus + volume_bonus
//
// Result: higher score = more likely to convert with ReviewPing outreach

function calculateScore(
  rating: number | null,
  reviewsCount: number | null,
  maxReviewThreshold: number,
): { score: number; reason: string } {
  const r = rating ?? 0;
  const rc = reviewsCount ?? 0;
  const reasons: string[] = [];

  // Base from rating
  const base = r * 2.5;
  reasons.push(`Rating ${r} → base score ${base.toFixed(1)}`);

  // Low review count bonus — biggest opportunity
  if (rc < maxReviewThreshold) {
    const bonus = Math.max(0, ((maxReviewThreshold - rc) / maxReviewThreshold)) * 10;
    const total = base + bonus;
    reasons.push(
      `Only ${rc} reviews (below ${maxReviewThreshold}) → bonus +${bonus.toFixed(1)} → total ${total.toFixed(1)}`,
    );
    return { score: Math.round(total * 100) / 100, reason: reasons.join('; ') };
  }

  // Volume bonus — established review culture, not yet contacted
  const volumeBonus = 5;
  const total = base + volumeBonus;
  reasons.push(
    `${rc} reviews, high volume → volume bonus +${volumeBonus} → total ${total.toFixed(1)}`,
  );

  return { score: Math.round(total * 100) / 100, reason: reasons.join('; ') };
}

// ── Handler ──────────────────────────────────────────────────────────────────

serve(async (req: Request): Promise<Response> => {
  // ── CORS preflight ────────────────────────────────────────────────────
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: CORS_HEADERS });
  }

  // ── Method check — only POST allowed ──────────────────────────────────
  if (req.method !== 'POST') {
    return new Response(
      JSON.stringify({ error: 'Method not allowed. Use POST.' }),
      { status: 405, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // ── Auth check (reuses shared verifyAuth from _shared/auth.ts) ────────
  const auth = await verifyAuth(req);
  if (auth instanceof Response) return auth;

  // ── Parse request body ─────────────────────────────────────────────────
  let body: SuggestLeadsRequest = {};
  try {
    body = await req.json();
  } catch {
    return new Response(
      JSON.stringify({ error: 'Invalid JSON body. Send a valid JSON object or omit for defaults.' }),
      { status: 400, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  const category = body.category?.trim().toLowerCase() || null;
  const limit = Math.min(Math.max(body.limit ?? 50, 1), 200);
  const minRating = body.min_rating ?? 4.0;
  const maxReviewsForPotential = body.max_reviews_for_potential ?? 50;
  const cityFilter = body.city?.trim() || null;
  const stateFilter = body.state?.trim() || null;

  // ── Build Supabase client (uses anon key — RLS restricts to admin email) ─
  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: false },
  });

  // ── Build query ────────────────────────────────────────────────────────
  let query = supabase
    .from('leads')
    .select('*')
    .eq('status', 'new')
    .not('google_rating', 'is', null)
    .gte('google_rating', minRating)
    .order('google_rating', { ascending: false })
    .limit(1000);  // fetch a wide set, we'll score and slice

  if (category) {
    query = query.eq('category', category);
  }
  if (cityFilter) {
    query = query.ilike('city', cityFilter);
  }
  if (stateFilter) {
    query = query.ilike('state', stateFilter);
  }

  const { data: leads, error } = await query;

  if (error) {
    console.error('Supabase query error:', error);
    return new Response(
      JSON.stringify({ error: 'Failed to fetch leads' }),
      { status: 500, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  if (!leads || leads.length === 0) {
    return new Response(
      JSON.stringify({
        leads: [],
        total: 0,
        params: { category, min_rating: minRating, city: cityFilter, state: stateFilter },
        message: 'No matching leads found. Try lowering the min_rating or expanding your filters.',
      }),
      { status: 200, headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' } },
    );
  }

  // ── Score and rank ─────────────────────────────────────────────────────
  const scored: LeadResult[] = leads
    .map((lead: Record<string, unknown>) => {
      const { score, reason } = calculateScore(
        lead.google_rating as number | null,
        lead.reviews_count as number | null,
        maxReviewsForPotential,
      );

      return {
        id: lead.id as number,
        business_name: lead.business_name as string,
        category: lead.category as string,
        phone: (lead.phone as string) ?? null,
        email: (lead.email as string) ?? null,
        website: (lead.website as string) ?? null,
        address: (lead.address as string) ?? null,
        city: (lead.city as string) ?? null,
        state: (lead.state as string) ?? null,
        zip: (lead.zip as string) ?? null,
        google_rating: (lead.google_rating as number) ?? null,
        reviews_count: (lead.reviews_count as number) ?? null,
        google_place_id: (lead.google_place_id as string) ?? null,
        status: lead.status as string,
        created_at: lead.created_at as string,
        outreach_score: score,
        suggestion_reason: reason,
      };
    })
    .sort((a: LeadResult, b: LeadResult) => b.outreach_score - a.outreach_score)
    .slice(0, limit);

  // ── Response ───────────────────────────────────────────────────────────
  const response = {
    leads: scored,
    total: scored.length,
    params: {
      category: category || 'all',
      min_rating: minRating,
      max_reviews_for_potential: maxReviewsForPotential,
      city: cityFilter,
      state: stateFilter,
    },
    meta: {
      queried_count: leads.length,
      scored_range: {
        min_score: scored.length > 0 ? scored[scored.length - 1].outreach_score : 0,
        max_score: scored.length > 0 ? scored[0].outreach_score : 0,
      },
    },
    generated_at: new Date().toISOString(),
  };

  return new Response(JSON.stringify(response, null, 2), {
    status: 200,
    headers: { ...CORS_HEADERS, 'Content-Type': 'application/json' },
  });
});
