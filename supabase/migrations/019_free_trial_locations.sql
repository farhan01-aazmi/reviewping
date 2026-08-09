-- ============================
-- Migration 019: Free trial + Multi-location + Delivery tracking
-- ============================

-- 1. Free trial columns on profiles
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_started_at TIMESTAMPTZ;
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS trial_end TIMESTAMPTZ;

-- 2. Locations table for multi-location support
CREATE TABLE IF NOT EXISTS locations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  address TEXT,
  phone TEXT,
  email TEXT,
  google_link TEXT,
  biz_type TEXT,
  slug TEXT UNIQUE,
  is_primary BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_locations_user_id ON locations(user_id);
CREATE INDEX IF NOT EXISTS idx_locations_slug ON locations(slug);

ALTER TABLE locations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own locations"
  ON locations FOR ALL
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 3. Add location_id to review_requests
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- 4. Add location_id to business_settings
ALTER TABLE business_settings ADD COLUMN IF NOT EXISTS location_id UUID REFERENCES locations(id) ON DELETE SET NULL;

-- 5. Delivery tracking on review_requests
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS delivery_status TEXT DEFAULT 'pending';
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS delivered_at TIMESTAMPTZ;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS opened_at TIMESTAMPTZ;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS clicked_at TIMESTAMPTZ;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS failed_reason TEXT;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS error_message TEXT;
ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS provider_message_id TEXT;

-- 6. Add error_message to review_requests if not exists from above
-- (already added above)

-- 7. Function to auto-set trial dates on profile creation
CREATE OR REPLACE FUNCTION public.set_trial_dates()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.trial_started_at IS NULL THEN
    NEW.trial_started_at := now();
    NEW.trial_end := now() + interval '14 days';
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trg_set_trial_dates ON profiles;
CREATE TRIGGER trg_set_trial_dates
  BEFORE INSERT ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.set_trial_dates();

-- 8. Function to check if trial is active
CREATE OR REPLACE FUNCTION public.is_trial_active(user_uuid UUID)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  trial_end_val TIMESTAMPTZ;
BEGIN
  SELECT trial_end INTO trial_end_val FROM profiles WHERE id = user_uuid;
  RETURN trial_end_val IS NOT NULL AND trial_end_val > now();
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_trial_active(UUID) TO service_role;
GRANT EXECUTE ON FUNCTION public.set_trial_dates() TO service_role;