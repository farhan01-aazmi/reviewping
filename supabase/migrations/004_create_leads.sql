-- =============================================================================
-- ReviewPing — Lead Generation Database Schema
-- Migration: 001_create_leads
-- Description: Core leads table for mass lead generation from Google Places
-- Target: USA/UK small businesses across 26+ service categories
-- =============================================================================

-- ── 1. Create enum for lead status ───────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_status') THEN
    CREATE TYPE lead_status AS ENUM (
      'new',
      'contacted',
      'replied',
      'converted',
      'uninterested'
    );
  END IF;
END
$$;

-- ── 2. Create enum for lead source ───────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'lead_source') THEN
    CREATE TYPE lead_source AS ENUM (
      'google_places',
      'yelp',
      'facebook',
      'manual',
      'referral',
      'other'
    );
  END IF;
END
$$;

-- ── 3. Create the leads table ───────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.leads (
  -- Primary key
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Business identity
  business_name   TEXT NOT NULL,
  category        TEXT NOT NULL,  -- e.g. 'dentist', 'plumber', 'salon', 'restaurant'

  -- Contact info
  phone           TEXT,
  email           TEXT,
  website         TEXT,

  -- Location
  address         TEXT,
  city            TEXT,
  state           TEXT,
  zip             TEXT,
  country         TEXT NOT NULL DEFAULT 'US',

  -- Google Places data
  google_rating   NUMERIC(3, 2),  -- e.g. 4.50
  reviews_count   INTEGER CHECK (reviews_count >= 0),
  google_place_id TEXT UNIQUE,    -- Google's stable place identifier

  -- Tracking & status
  source          lead_source NOT NULL DEFAULT 'google_places',
  status          lead_status NOT NULL DEFAULT 'new',
  notes           TEXT,
  last_contacted_at TIMESTAMPTZ,

  -- Audit trail
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),

  -- Tags for filtering / segmentation (JSONB for flexibility)
  tags            JSONB DEFAULT '[]'::jsonb
);

-- ── 4. Indexes for query performance ─────────────────────────────────────────
CREATE INDEX IF NOT EXISTS idx_leads_category       ON public.leads (category);
CREATE INDEX IF NOT EXISTS idx_leads_status         ON public.leads (status);
CREATE INDEX IF NOT EXISTS idx_leads_city           ON public.leads (city);
CREATE INDEX IF NOT EXISTS idx_leads_country        ON public.leads (country);
CREATE INDEX IF NOT EXISTS idx_leads_rating         ON public.leads (google_rating);
CREATE INDEX IF NOT EXISTS idx_leads_reviews_count  ON public.leads (reviews_count);
CREATE INDEX IF NOT EXISTS idx_leads_source         ON public.leads (source);
CREATE INDEX IF NOT EXISTS idx_leads_created_at     ON public.leads (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_place_id       ON public.leads (google_place_id);

-- Composite index for the "suggest-leads" scoring query:
-- High rating but low review count → high potential for review improvement
CREATE INDEX IF NOT EXISTS idx_leads_scoring
  ON public.leads (google_rating DESC, reviews_count ASC)
  WHERE status = 'new';

-- ── 5. Updated-at trigger ────────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_updated_at ON public.leads;
CREATE TRIGGER trg_leads_updated_at
  BEFORE UPDATE ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── 6. Row-Level Security ────────────────────────────────────────────────────
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  RLS: SECURITY CRITICAL                                                    ║
-- ║  Leads contain business PII (phone, email) — restrict to admin(s) only.    ║
-- ║  By default, only the founder (tech00kk@gmail.com) can read/update leads.   ║
-- ║  Add additional emails here as your team grows.                             ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- Admin users can read leads
DROP POLICY IF EXISTS "Admin users can read leads" ON public.leads;
CREATE POLICY "Admin users can read leads"
  ON public.leads
  FOR SELECT
  TO authenticated
  USING (auth.email() = 'tech00kk@gmail.com');

-- Admin users can update leads (change status, add notes, etc.)
DROP POLICY IF EXISTS "Admin users can update leads" ON public.leads;
CREATE POLICY "Admin users can update leads"
  ON public.leads
  FOR UPDATE
  TO authenticated
  USING (auth.email() = 'tech00kk@gmail.com')
  WITH CHECK (auth.email() = 'tech00kk@gmail.com');

-- Only service_role (backend) can insert leads
DROP POLICY IF EXISTS "Service role can insert leads" ON public.leads;
CREATE POLICY "Service role can insert leads"
  ON public.leads
  FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service_role can delete leads (admin cleanup)
DROP POLICY IF EXISTS "Service role can delete leads" ON public.leads;
CREATE POLICY "Service role can delete leads"
  ON public.leads
  FOR DELETE
  TO service_role
  USING (true);

-- ── 7. Grant permissions ─────────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated, service_role;
GRANT SELECT, UPDATE ON public.leads TO authenticated;
GRANT INSERT, DELETE ON public.leads TO service_role;
GRANT USAGE ON SEQUENCE public.leads_id_seq TO service_role;

-- ── 8. Helpful view: scoring-ready leads ─────────────────────────────────────
-- Exposes leads that are prime targets for ReviewPing outreach:
--   - High rating (> 4.0) but low review count (< 50)
--   - OR high review count but haven't been contacted recently
CREATE OR REPLACE VIEW public.lead_scoring AS
SELECT
  id,
  business_name,
  category,
  city,
  state,
  country,
  phone,
  email,
  website,
  google_rating,
  reviews_count,
  status,
  source,
  created_at,
  -- Score: higher is better target
  ROUND(
    CASE
      WHEN google_rating IS NULL THEN 0
      WHEN reviews_count IS NULL OR reviews_count = 0 THEN google_rating * 10
      ELSE (google_rating * 2.5) + (1.0 / GREATEST(reviews_count, 1)) * 50
    END::numeric,
    2
  ) AS outreach_score
FROM public.leads
WHERE status = 'new'
  AND google_rating IS NOT NULL
ORDER BY outreach_score DESC;

COMMENT ON TABLE public.leads IS 'Business leads sourced from Google Places API and other directories. Each row represents a unique business with contact info, rating data, and outreach status.';
COMMENT ON COLUMN public.leads.google_place_id IS 'Stable Google Place ID — unique constraint prevents duplicate imports';
COMMENT ON COLUMN public.leads.status IS 'Pipeline status: new → contacted → replied → converted / uninterested';
COMMENT ON COLUMN public.leads.tags IS 'Flexible JSONB array for arbitrary segmentation (e.g. ["has_website", "no_phone"])';

-- =============================================================================
-- End of migration 001_create_leads
-- =============================================================================
