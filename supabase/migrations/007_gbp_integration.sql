-- ============================
-- Migration 007: Google Business Profile Integration
-- Run after migration 006
-- ============================

-- GBP connections: stores OAuth tokens and business info
CREATE TABLE IF NOT EXISTS gbp_connections (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gbp_account_name TEXT,
  gbp_account_id TEXT,
  gbp_location_name TEXT,
  gbp_location_id TEXT,
  gbp_location_address TEXT,
  gbp_location_phone TEXT,
  access_token TEXT,
  refresh_token TEXT,
  token_expires_at TIMESTAMPTZ,
  is_connected BOOLEAN DEFAULT FALSE,
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_gbp_connections_user ON gbp_connections(user_id);

ALTER TABLE gbp_connections ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP connection" ON gbp_connections;
CREATE POLICY "Users can view their own GBP connection"
  ON gbp_connections FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own GBP connection" ON gbp_connections;
CREATE POLICY "Users can insert their own GBP connection"
  ON gbp_connections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own GBP connection" ON gbp_connections;
CREATE POLICY "Users can update their own GBP connection"
  ON gbp_connections FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete their own GBP connection" ON gbp_connections;
CREATE POLICY "Users can delete their own GBP connection"
  ON gbp_connections FOR DELETE
  USING (auth.uid() = user_id);

-- GBP reviews: fetched from Google Business Profile API
CREATE TABLE IF NOT EXISTS gbp_reviews (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  gbp_review_id TEXT,
  reviewer_name TEXT,
  reviewer_avatar_url TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  comment TEXT,
  review_reply TEXT,
  review_reply_timestamp TIMESTAMPTZ,
  create_time TIMESTAMPTZ,
  update_time TIMESTAMPTZ,
  is_synced BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gbp_reviews_user ON gbp_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_gbp_reviews_rating ON gbp_reviews(rating);
CREATE INDEX IF NOT EXISTS idx_gbp_reviews_time ON gbp_reviews(create_time DESC);

ALTER TABLE gbp_reviews ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Users can view their own GBP reviews" ON gbp_reviews;
CREATE POLICY "Users can view their own GBP reviews"
  ON gbp_reviews FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Service role can insert GBP reviews" ON gbp_reviews;
CREATE POLICY "Service role can insert GBP reviews"
  ON gbp_reviews FOR INSERT
  WITH CHECK (true);

DROP POLICY IF EXISTS "Service role can update GBP reviews" ON gbp_reviews;
CREATE POLICY "Service role can update GBP reviews"
  ON gbp_reviews FOR UPDATE
  USING (true);

-- OAuth state store (temporary, for OAuth flow)
CREATE TABLE IF NOT EXISTS gbp_oauth_states (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  state_token TEXT UNIQUE NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '10 minutes')
);

CREATE INDEX IF NOT EXISTS idx_gbp_oauth_states_token ON gbp_oauth_states(state_token);

-- Cleanup old states
CREATE INDEX IF NOT EXISTS idx_gbp_oauth_states_expires ON gbp_oauth_states(expires_at);

-- Give service role full access (needed for edge functions)
GRANT ALL ON gbp_connections TO service_role;
GRANT ALL ON gbp_reviews TO service_role;
GRANT ALL ON gbp_oauth_states TO service_role;
