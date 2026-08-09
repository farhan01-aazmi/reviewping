-- ============================
-- Migration 016: Smart QR Review Gateway — Schema
-- Phase 1: review_templates, review_events, qr_codes, subscription fields
-- ============================

-- 1. review_templates — customizable review prompt templates per biz_type + rating
CREATE TABLE IF NOT EXISTS review_templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  biz_type TEXT NOT NULL,
  star_rating INTEGER NOT NULL CHECK (star_rating >= 1 AND star_rating <= 5),
  template_text TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, biz_type, star_rating, template_text)
);

ALTER TABLE review_templates ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_templates_own_select" ON review_templates;
DROP POLICY IF EXISTS "review_templates_own_insert" ON review_templates;
DROP POLICY IF EXISTS "review_templates_own_update" ON review_templates;
DROP POLICY IF EXISTS "review_templates_own_delete" ON review_templates;
CREATE POLICY "review_templates_own_select" ON review_templates FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "review_templates_own_insert" ON review_templates FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "review_templates_own_update" ON review_templates FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "review_templates_own_delete" ON review_templates FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_review_templates_user ON review_templates(user_id);
CREATE INDEX IF NOT EXISTS idx_review_templates_biz ON review_templates(biz_type, star_rating);

-- 2. review_events — logs every gateway interaction (scan → template copy → redirect)
CREATE TABLE IF NOT EXISTS review_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  slug TEXT,
  customer_phone TEXT,
  star_rating INTEGER CHECK (star_rating >= 1 AND star_rating <= 5),
  template_used TEXT,
  destination_url TEXT,
  copied_at TIMESTAMPTZ,
  redirected_at TIMESTAMPTZ,
  source TEXT DEFAULT 'qr',
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE review_events ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "review_events_own_select" ON review_events;
DROP POLICY IF EXISTS "review_events_own_insert" ON review_events;
DROP POLICY IF EXISTS "review_events_own_update" ON review_events;
CREATE POLICY "review_events_own_select" ON review_events FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "review_events_own_insert" ON review_events FOR INSERT WITH CHECK (true);
CREATE POLICY "review_events_own_update" ON review_events FOR UPDATE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_review_events_user ON review_events(user_id);
CREATE INDEX IF NOT EXISTS idx_review_events_slug ON review_events(slug);
CREATE INDEX IF NOT EXISTS idx_review_events_created ON review_events(created_at DESC);

-- 3. qr_codes — manage QR code slugs and metadata per business
CREATE TABLE IF NOT EXISTS qr_codes (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  label TEXT,
  is_active BOOLEAN DEFAULT TRUE,
  total_scans INTEGER DEFAULT 0,
  last_scanned_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE qr_codes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "qr_codes_own_select" ON qr_codes;
DROP POLICY IF EXISTS "qr_codes_own_insert" ON qr_codes;
DROP POLICY IF EXISTS "qr_codes_own_update" ON qr_codes;
DROP POLICY IF EXISTS "qr_codes_own_delete" ON qr_codes;
CREATE POLICY "qr_codes_own_select" ON qr_codes FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "qr_codes_own_insert" ON qr_codes FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "qr_codes_own_update" ON qr_codes FOR UPDATE USING (user_id = auth.uid());
CREATE POLICY "qr_codes_own_delete" ON qr_codes FOR DELETE USING (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_qr_codes_user ON qr_codes(user_id);
CREATE INDEX IF NOT EXISTS idx_qr_codes_slug ON qr_codes(slug);

-- 4. Add subscription / grace-period fields to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS grace_period_end TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS blocked_scans INTEGER DEFAULT 0;

-- 5. Add opt-in columns to business_settings for gateway features
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS gateway_enabled BOOLEAN DEFAULT FALSE;

-- 6. RPC to increment blocked_scans atomically
CREATE OR REPLACE FUNCTION public.increment_blocked_scans(user_uuid uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  UPDATE profiles
  SET blocked_scans = COALESCE(blocked_scans, 0) + 1
  WHERE id = user_uuid;
END;
$$;

-- 7. other_categories — stores custom business type entries from "Other" selection
CREATE TABLE IF NOT EXISTS other_categories (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  category_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE other_categories ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "other_categories_own_select" ON other_categories;
DROP POLICY IF EXISTS "other_categories_own_insert" ON other_categories;
CREATE POLICY "other_categories_own_select" ON other_categories FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "other_categories_own_insert" ON other_categories FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE INDEX IF NOT EXISTS idx_other_categories_user ON other_categories(user_id);

-- Add other_business_type column to business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS other_business_type TEXT;

-- 8. Grant service_role access
GRANT ALL ON review_templates TO service_role;
GRANT ALL ON review_events TO service_role;
GRANT ALL ON qr_codes TO service_role;
GRANT ALL ON other_categories TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_blocked_scans(uuid) TO service_role;
