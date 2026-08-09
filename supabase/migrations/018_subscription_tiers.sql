-- ============================
-- Migration 018: Subscription tiers — tracking columns + RPCs
-- ============================

-- 1. Monthly usage counters on business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS qr_scans_this_month INTEGER DEFAULT 0;
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS ai_generations_this_month INTEGER DEFAULT 0;

-- 2. Index for faster per-user lookups
CREATE INDEX IF NOT EXISTS idx_business_settings_user_usage ON business_settings(user_id);

-- 3. RPC to increment ai_generations_this_month atomically
CREATE OR REPLACE FUNCTION public.increment_ai_generations(count INTEGER, user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO business_settings (user_id, ai_generations_this_month)
  VALUES (user_uuid, count)
  ON CONFLICT (user_id)
  DO UPDATE SET ai_generations_this_month = COALESCE(business_settings.ai_generations_this_month, 0) + count;
END;
$$;

-- 4. RPC to increment qr_scans_this_month atomically
CREATE OR REPLACE FUNCTION public.increment_qr_scans(user_uuid UUID)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO business_settings (user_id, qr_scans_this_month)
  VALUES (user_uuid, 1)
  ON CONFLICT (user_id)
  DO UPDATE SET qr_scans_this_month = COALESCE(business_settings.qr_scans_this_month, 0) + 1;
END;
$$;

-- 5. Grant service_role access
GRANT EXECUTE ON FUNCTION public.increment_ai_generations(INTEGER, UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.increment_qr_scans(UUID) TO service_role;
