-- ============================
-- Migration 012: Smart Review Gateway + Features
-- ============================

-- 1. ADD gateway_token to review_requests
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS gateway_token TEXT UNIQUE;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS gateway_clicked BOOLEAN DEFAULT FALSE;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS gateway_converted BOOLEAN DEFAULT FALSE;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS gateway_rating INTEGER;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS gateway_feedback TEXT;
CREATE INDEX IF NOT EXISTS idx_review_requests_gateway_token ON review_requests(gateway_token);

-- 2. review_gateway_clicks — tracks every gateway visit
CREATE TABLE IF NOT EXISTS review_gateway_clicks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  request_id BIGINT REFERENCES review_requests(id) ON DELETE SET NULL,
  customer_name TEXT,
  customer_email TEXT,
  customer_phone TEXT,
  clicked_at TIMESTAMPTZ DEFAULT NOW(),
  device TEXT,
  converted BOOLEAN DEFAULT FALSE,
  review_posted_on TEXT DEFAULT 'reviewping',
  rating INTEGER,
  feedback TEXT
);
ALTER TABLE review_gateway_clicks ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own gateway clicks" ON review_gateway_clicks;
CREATE POLICY "Users can view their own gateway clicks"
  ON review_gateway_clicks FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Anyone can insert gateway clicks" ON review_gateway_clicks;
CREATE POLICY "Anyone can insert gateway clicks"
  ON review_gateway_clicks FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_gateway_clicks_user ON review_gateway_clicks(user_id);
CREATE INDEX IF NOT EXISTS idx_gateway_clicks_request ON review_gateway_clicks(request_id);

-- 3. milestones_reached — track achievement milestones
CREATE TABLE IF NOT EXISTS milestones_reached (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  milestone_type TEXT NOT NULL,
  milestone_value TEXT,
  reached_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user_id, milestone_type)
);
ALTER TABLE milestones_reached ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own milestones" ON milestones_reached;
CREATE POLICY "Users can view their own milestones"
  ON milestones_reached FOR SELECT
  USING (user_id = auth.uid());

DROP POLICY IF EXISTS "Service role can manage milestones" ON milestones_reached;
CREATE POLICY "Service role can manage milestones"
  ON milestones_reached FOR INSERT
  WITH CHECK (true);

CREATE INDEX IF NOT EXISTS idx_milestones_user ON milestones_reached(user_id);

-- 4. ADD avg_order_value to business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS avg_order_value NUMERIC(10,2) DEFAULT 500;

-- 5. ADD theme_pref to profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS theme_pref TEXT DEFAULT 'light';

-- 6. Grant service role access
GRANT ALL ON review_gateway_clicks TO service_role;
GRANT ALL ON milestones_reached TO service_role;
