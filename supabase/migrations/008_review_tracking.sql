-- ============================
-- Migration 008: Review Tracking + Public Form
-- Run after migration 007
-- NOTE: business_settings uses user_id as PK (no id column)
-- ============================

-- 1. ADD COLUMNS TO business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS gbp_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS logo_url TEXT;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS auto_post_to_gbp BOOLEAN DEFAULT FALSE;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS website_url TEXT;

CREATE INDEX IF NOT EXISTS idx_business_settings_slug ON business_settings(slug);

-- 2. review_submissions — tracks customer-submitted reviews
CREATE TABLE IF NOT EXISTS review_submissions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  request_id BIGINT REFERENCES review_requests(id) ON DELETE SET NULL,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  author_name TEXT NOT NULL,
  author_email TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','pending_sync','posted','failed','skipped')),
  post_to_gbp BOOLEAN DEFAULT FALSE,
  gbp_posted_at TIMESTAMPTZ,
  gbp_error TEXT,
  ip_address TEXT,
  source TEXT DEFAULT 'reviewping_form' CHECK (source IN ('reviewping_form','gbp_sync','import')),
  moderation_status TEXT DEFAULT 'approved' CHECK (moderation_status IN ('pending','approved','rejected','flagged')),
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE review_submissions ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owners can view their own review submissions" ON review_submissions;
CREATE POLICY "Business owners can view their own review submissions"
  ON review_submissions FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert review submissions" ON review_submissions;
CREATE POLICY "Service role can insert review submissions"
  ON review_submissions FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update review submissions" ON review_submissions;
CREATE POLICY "Service role can update review submissions"
  ON review_submissions FOR UPDATE
  USING (true);

CREATE INDEX IF NOT EXISTS idx_review_submissions_user ON review_submissions(user_id);
CREATE INDEX IF NOT EXISTS idx_review_submissions_status ON review_submissions(status);
CREATE INDEX IF NOT EXISTS idx_review_submissions_request ON review_submissions(request_id);
CREATE INDEX IF NOT EXISTS idx_review_submissions_created ON review_submissions(submitted_at DESC);

-- 3. review_clicks — tracks when customer clicks the review link
CREATE TABLE IF NOT EXISTS review_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  request_id BIGINT REFERENCES review_requests(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  customer_name TEXT,
  ip_address TEXT,
  user_agent TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE review_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Business owners can view their own clicks" ON review_clicks;
CREATE POLICY "Business owners can view their own clicks"
  ON review_clicks FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert clicks" ON review_clicks;
CREATE POLICY "Service role can insert clicks"
  ON review_clicks FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_review_clicks_request ON review_clicks(request_id);
CREATE INDEX IF NOT EXISTS idx_review_clicks_user ON review_clicks(user_id);

-- 4. ai_email_templates table (used by AI Email Writer)
CREATE TABLE IF NOT EXISTS ai_email_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  subject TEXT NOT NULL,
  body TEXT NOT NULL,
  tone TEXT DEFAULT 'friendly',
  business_type TEXT,
  input_params JSONB,
  usage_tokens INTEGER DEFAULT 0,
  is_default BOOLEAN DEFAULT FALSE,
  use_count INTEGER DEFAULT 0,
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_email_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can manage their own AI templates" ON ai_email_templates;
CREATE POLICY "Users can manage their own AI templates"
  ON ai_email_templates
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_ai_templates_user ON ai_email_templates(user_id);

-- 5. ai_usage_log table (cost tracking)
CREATE TABLE IF NOT EXISTS ai_usage_log (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  feature TEXT NOT NULL CHECK (feature IN ('email_generation','reply_generation','sms_generation')),
  model TEXT NOT NULL,
  prompt_tokens INTEGER NOT NULL,
  completion_tokens INTEGER NOT NULL,
  total_tokens INTEGER NOT NULL,
  estimated_cost NUMERIC(10, 6),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE ai_usage_log ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own AI usage" ON ai_usage_log;
CREATE POLICY "Users can view their own AI usage"
  ON ai_usage_log FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can insert AI usage" ON ai_usage_log;
CREATE POLICY "Service role can insert AI usage"
  ON ai_usage_log FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_ai_usage_user ON ai_usage_log(user_id);
CREATE INDEX IF NOT EXISTS idx_ai_usage_date ON ai_usage_log(created_at);

-- 6. TRIGGER: When review_submission has request_id, mark review_requests as reviewed
CREATE OR REPLACE FUNCTION public.handle_review_submitted()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.request_id IS NOT NULL THEN
    UPDATE public.review_requests
    SET status = 'reviewed',
        reviewed_at = NOW()
    WHERE id = NEW.request_id;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_review_submitted ON review_submissions;
CREATE TRIGGER trg_review_submitted
  AFTER INSERT ON review_submissions
  FOR EACH ROW
  WHEN (NEW.status = 'pending')
  EXECUTE FUNCTION public.handle_review_submitted();

-- 7. TRIGGER: Auto-generate slug from business_name
CREATE OR REPLACE FUNCTION public.generate_business_slug()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  base_slug TEXT;
  final_slug TEXT;
  counter INTEGER := 0;
BEGIN
  IF NEW.business_name IS NOT NULL AND (NEW.slug IS NULL OR NEW.slug = '') THEN
    base_slug := LOWER(REGEXP_REPLACE(
      REGEXP_REPLACE(NEW.business_name, '[^a-zA-Z0-9\s-]', '', 'g'),
      '\s+', '-', 'g'
    ));
    base_slug := LEFT(base_slug, 60);
    final_slug := base_slug;

    WHILE EXISTS (SELECT 1 FROM business_settings WHERE slug = final_slug AND user_id != NEW.user_id) LOOP
      counter := counter + 1;
      final_slug := base_slug || '-' || counter::TEXT;
    END LOOP;

    NEW.slug := final_slug;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_generate_slug ON business_settings;
CREATE TRIGGER trg_generate_slug
  BEFORE INSERT OR UPDATE OF business_name ON business_settings
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_business_slug();

-- 8. Generate slugs for EXISTING businesses (backfill)
UPDATE business_settings
SET slug = LOWER(REGEXP_REPLACE(REGEXP_REPLACE(
  COALESCE(business_name, 'business-' || user_id::text),
  '[^a-zA-Z0-9\s-]', '', 'g'), '\s+', '-', 'g'
))
WHERE slug IS NULL OR slug = '';

-- 9. UNIFIED REVIEWS VIEW
CREATE OR REPLACE VIEW unified_reviews AS
SELECT
  rs.id AS review_id,
  rs.user_id,
  rs.rating,
  rs.review_text AS text,
  rs.author_name,
  rs.author_email,
  rs.submitted_at AS reviewed_at,
  rs.status AS submission_status,
  'reviewping' AS source,
  rs.moderation_status
FROM review_submissions rs
WHERE rs.status IN ('pending', 'pending_sync', 'posted')

UNION ALL

SELECT
  gr.id AS review_id,
  gr.user_id,
  gr.rating,
  gr.comment AS text,
  gr.reviewer_name AS author_name,
  NULL AS author_email,
  gr.create_time AS reviewed_at,
  'synced' AS submission_status,
  'google' AS source,
  'approved' AS moderation_status
FROM gbp_reviews gr
WHERE gr.is_synced = true;

-- 10. Service role access
GRANT ALL ON review_submissions TO service_role;
GRANT ALL ON review_clicks TO service_role;
GRANT ALL ON ai_email_templates TO service_role;
GRANT ALL ON ai_usage_log TO service_role;
