-- =============================================================================
-- ReviewPing — Google Maps Lead Scraping & Email Outreach Schema
-- Migration: 20260628_create_leads
-- Description: Extends leads table + creates email_campaigns, industries,
--              scrape_jobs tables for the automated lead generation pipeline
-- Dependencies: Runs AFTER 004_create_leads.sql (base leads table)
-- =============================================================================

-- ── 0. Create extension for UUID generation (if not already present) ──────
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ── 1. Enums for new status types ──────────────────────────────────────────
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'campaign_status') THEN
    CREATE TYPE campaign_status AS ENUM (
      'draft',
      'sending',
      'sent',
      'opened',
      'clicked',
      'bounced',
      'failed',
      'unsubscribed'
    );
  END IF;
END
$$;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'job_status') THEN
    CREATE TYPE job_status AS ENUM (
      'queued',
      'running',
      'completed',
      'partial',
      'failed',
      'cancelled'
    );
  END IF;
END
$$;

-- ── 2. Extend existing leads table with Google Maps scraping fields ───────

-- Add industry_id FK (nullable until industries are seeded)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS industry_id BIGINT;

-- Source URL on Google Maps
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS source_url TEXT;

-- Timestamp of last scrape
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS scraped_at TIMESTAMPTZ;

-- Track which scrape_job produced this lead
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS scrape_job_id BIGINT;

-- Latitude/longitude for mapping
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

-- Social profiles found during scrape
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS social_links JSONB DEFAULT '{}'::jsonb;

-- Unsubscribe token for opt-out tracking (cryptographically random)
ALTER TABLE public.leads
  ADD COLUMN IF NOT EXISTS unsubscribe_token TEXT UNIQUE;

-- Index for faster scrape deduplication
CREATE INDEX IF NOT EXISTS idx_leads_source_url ON public.leads (source_url)
  WHERE source_url IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_leads_scraped_at ON public.leads (scraped_at DESC);
CREATE INDEX IF NOT EXISTS idx_leads_unsubscribe ON public.leads (unsubscribe_token)
  WHERE unsubscribe_token IS NOT NULL;

-- ── 3. Industries table ───────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.industries (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  name            TEXT NOT NULL UNIQUE,              -- e.g. "Dental"
  slug            TEXT NOT NULL UNIQUE,              -- e.g. "dental"
  category        TEXT,                              -- e.g. "Healthcare"
  description     TEXT,
  search_queries  TEXT[] DEFAULT '{}',               -- Default Google Maps search queries
  email_templates JSONB DEFAULT '{}'::jsonb,         -- industry-specific pitch templates
  is_active       BOOLEAN DEFAULT TRUE,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- FK from leads to industries
ALTER TABLE public.leads
  ADD CONSTRAINT fk_leads_industry
  FOREIGN KEY (industry_id) REFERENCES public.industries(id)
  ON DELETE SET NULL;

-- ── 4. Scrape Jobs table ──────────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.scrape_jobs (
  id              BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  search_query    TEXT NOT NULL,                      -- e.g. "best dentist in Austin"
  industry_id     BIGINT REFERENCES public.industries(id) ON DELETE SET NULL,
  category_filter TEXT,                               -- Optional category filter
  location        TEXT NOT NULL,                      -- e.g. "Austin, TX, USA"
  location_lat    DOUBLE PRECISION,                   -- Center point
  location_lng    DOUBLE PRECISION,
  radius_km       INTEGER DEFAULT 10,                 -- Search radius
  max_results     INTEGER DEFAULT 50,                 -- Target per session
  total_found     INTEGER DEFAULT 0,                  -- How many leads matched
  total_inserted  INTEGER DEFAULT 0,                  -- How many were new (not duplicates)
  total_skipped   INTEGER DEFAULT 0,                  -- How many were duplicates
  started_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  completed_at    TIMESTAMPTZ,
  duration_seconds INTEGER,                           -- How long the scrape took
  error_message   TEXT,                               -- If status = 'failed'
  status          job_status NOT NULL DEFAULT 'queued',
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_scrape_jobs_status ON public.scrape_jobs (status);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_location ON public.scrape_jobs (location);
CREATE INDEX IF NOT EXISTS idx_scrape_jobs_started ON public.scrape_jobs (started_at DESC);

-- ── 5. Email Campaigns table ──────────────────────────────────────────────
CREATE TABLE IF NOT EXISTS public.email_campaigns (
  id                BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,

  -- Relationship
  lead_id           BIGINT NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
  scrape_job_id     BIGINT REFERENCES public.scrape_jobs(id) ON DELETE SET NULL,

  -- Template info
  template_used     TEXT,                              -- Name/slug of template used
  subject           TEXT,                              -- Actual subject sent
  body_preview      TEXT,                              -- First 100 chars of body
  tone              TEXT DEFAULT 'friendly',           -- friendly / professional / warm

  -- Tracking (via tracking pixel + redirect links)
  sent_at           TIMESTAMPTZ,
  opened_at         TIMESTAMPTZ,
  opened_count      INTEGER DEFAULT 0,
  clicked_at        TIMESTAMPTZ,
  clicked_count     INTEGER DEFAULT 0,
  replied_at        TIMESTAMPTZ,

  -- Tracking tokens for open/click tracking
  tracking_token    UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,

  -- Engagement metadata
  user_agent        TEXT,                              -- From open tracking pixel
  ip_address        INET,                              -- From open/click

  -- Outcome
  status            campaign_status NOT NULL DEFAULT 'draft',
  error_message     TEXT,
  is_unsubscribed   BOOLEAN DEFAULT FALSE,
  unsubscribe_reason TEXT,

  -- Audit
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Performance indexes
CREATE INDEX IF NOT EXISTS idx_email_campaigns_lead ON public.email_campaigns (lead_id);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_status ON public.email_campaigns (status);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_sent ON public.email_campaigns (sent_at DESC);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_tracking ON public.email_campaigns (tracking_token);
CREATE INDEX IF NOT EXISTS idx_email_campaigns_unsub ON public.email_campaigns (lead_id, is_unsubscribed);

-- ── 6. Updated-at triggers ────────────────────────────────────────────────
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_industries_updated_at ON public.industries;
CREATE TRIGGER trg_industries_updated_at
  BEFORE UPDATE ON public.industries
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_scrape_jobs_updated_at ON public.scrape_jobs;
CREATE TRIGGER trg_scrape_jobs_updated_at
  BEFORE UPDATE ON public.scrape_jobs
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS trg_email_campaigns_updated_at ON public.email_campaigns;
CREATE TRIGGER trg_email_campaigns_updated_at
  BEFORE UPDATE ON public.email_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.set_updated_at();

-- ── 7. Auto-generate unsubscribe_token for new leads ──────────────────────
CREATE OR REPLACE FUNCTION public.generate_unsubscribe_token()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.unsubscribe_token IS NULL THEN
    NEW.unsubscribe_token := encode(gen_random_bytes(24), 'hex');
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_leads_unsubscribe_token ON public.leads;
CREATE TRIGGER trg_leads_unsubscribe_token
  BEFORE INSERT ON public.leads
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_unsubscribe_token();

-- ── 8. Row-Level Security ─────────────────────────────────────────────────

-- Industries: all authenticated users can read
ALTER TABLE public.industries ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated users can read industries" ON public.industries;
CREATE POLICY "Authenticated users can read industries"
  ON public.industries
  FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Service role can manage industries" ON public.industries;
CREATE POLICY "Service role can manage industries"
  ON public.industries
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Scrape Jobs: admin can read, service_role can manage
ALTER TABLE public.scrape_jobs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view scrape jobs" ON public.scrape_jobs;
CREATE POLICY "Admin can view scrape jobs"
  ON public.scrape_jobs
  FOR SELECT
  TO authenticated
  USING (auth.email() = 'tech00kk@gmail.com');

DROP POLICY IF EXISTS "Service role can manage scrape jobs" ON public.scrape_jobs;
CREATE POLICY "Service role can manage scrape jobs"
  ON public.scrape_jobs
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Email Campaigns: admin can read, service_role can manage
ALTER TABLE public.email_campaigns ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admin can view email campaigns" ON public.email_campaigns;
CREATE POLICY "Admin can view email campaigns"
  ON public.email_campaigns
  FOR SELECT
  TO authenticated
  USING (auth.email() = 'tech00kk@gmail.com');

DROP POLICY IF EXISTS "Admin can update email campaigns" ON public.email_campaigns;
CREATE POLICY "Admin can update email campaigns"
  ON public.email_campaigns
  FOR UPDATE
  TO authenticated
  USING (auth.email() = 'tech00kk@gmail.com')
  WITH CHECK (auth.email() = 'tech00kk@gmail.com');

DROP POLICY IF EXISTS "Service role can manage email campaigns" ON public.email_campaigns;
CREATE POLICY "Service role can manage email campaigns"
  ON public.email_campaigns
  FOR ALL
  TO service_role
  USING (true)
  WITH CHECK (true);

-- ── 9. Grant permissions ─────────────────────────────────────────────────
GRANT USAGE ON SCHEMA public TO authenticated, service_role, anon;

GRANT SELECT ON public.industries TO authenticated;
GRANT ALL ON public.industries TO service_role;

GRANT SELECT ON public.scrape_jobs TO authenticated;
GRANT ALL ON public.scrape_jobs TO service_role;

GRANT SELECT, UPDATE ON public.email_campaigns TO authenticated;
GRANT ALL ON public.email_campaigns TO service_role;
GRANT USAGE ON SEQUENCE public.email_campaigns_id_seq TO service_role;

-- ── 10. Helpful views ────────────────────────────────────────────────────

-- Campaign performance dashboard
CREATE OR REPLACE VIEW public.campaign_stats AS
SELECT
  date_trunc('day', ec.sent_at)::date AS day,
  COUNT(*) AS total_sent,
  COUNT(*) FILTER (WHERE ec.opened_at IS NOT NULL) AS total_opened,
  COUNT(*) FILTER (WHERE ec.clicked_at IS NOT NULL) AS total_clicked,
  COUNT(*) FILTER (WHERE ec.replied_at IS NOT NULL) AS total_replied,
  COUNT(*) FILTER (WHERE ec.is_unsubscribed) AS total_unsubscribed,
  ROUND(
    COUNT(*) FILTER (WHERE ec.opened_at IS NOT NULL)::numeric /
    NULLIF(COUNT(*), 0) * 100, 1
  ) AS open_rate_pct,
  ROUND(
    COUNT(*) FILTER (WHERE ec.clicked_at IS NOT NULL)::numeric /
    NULLIF(COUNT(*) FILTER (WHERE ec.opened_at IS NOT NULL), 0) * 100, 1
  ) AS click_to_open_rate_pct
FROM public.email_campaigns ec
WHERE ec.sent_at IS NOT NULL
GROUP BY date_trunc('day', ec.sent_at)
ORDER BY day DESC;

-- Leads with campaign summaries
CREATE OR REPLACE VIEW public.lead_with_campaign AS
SELECT
  l.id,
  l.business_name,
  l.category,
  l.phone,
  l.email,
  l.website,
  l.address,
  l.city,
  l.state,
  l.country,
  l.google_rating,
  l.reviews_count,
  l.source,
  l.status AS lead_status,
  l.source_url,
  l.scraped_at,
  l.latitude,
  l.longitude,
  l.unsubscribe_token,
  i.name AS industry_name,
  i.slug AS industry_slug,
  sj.search_query AS last_scrape_query,
  sj.completed_at AS last_scrape_at,
  -- Latest campaign info
  ec_latest.status AS campaign_status,
  ec_latest.sent_at AS last_sent_at,
  ec_latest.opened_at AS last_opened_at,
  ec_latest.clicked_at AS last_clicked_at,
  ec_latest.replied_at AS last_replied_at,
  ec_latest.template_used AS last_template,
  -- Campaign count
  ec_stats.campaign_count
FROM public.leads l
LEFT JOIN public.industries i ON l.industry_id = i.id
LEFT JOIN public.scrape_jobs sj ON l.scrape_job_id = sj.id
LEFT JOIN LATERAL (
  SELECT status, sent_at, opened_at, clicked_at, replied_at, template_used
  FROM public.email_campaigns
  WHERE lead_id = l.id
  ORDER BY sent_at DESC NULLS LAST
  LIMIT 1
) ec_latest ON true
LEFT JOIN LATERAL (
  SELECT COUNT(*) AS campaign_count
  FROM public.email_campaigns
  WHERE lead_id = l.id
) ec_stats ON true;

COMMENT ON TABLE public.industries IS 'Industry categories with default search queries and email templates for lead generation';
COMMENT ON TABLE public.scrape_jobs IS 'Tracks each Google Maps scraping session — query, location, results, and duration';
COMMENT ON TABLE public.email_campaigns IS 'Outbound email campaign tracking with open/click tracking tokens per lead';
COMMENT ON VIEW public.campaign_stats IS 'Daily aggregated email campaign performance metrics';
COMMENT ON VIEW public.lead_with_campaign IS 'Leads enriched with industry info, last scrape metadata, and campaign summary';

-- ── End of migration 20260628_create_leads ─────────────────────────────────
