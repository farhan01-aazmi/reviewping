-- ============================
-- Migration 003: Ensure core tables exist with proper RLS
-- ============================

-- 1. PROFILES table (extends auth.users)
CREATE TABLE IF NOT EXISTS "profiles" (
  "id"            UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  "email"         TEXT,
  "name"          TEXT,
  "business_name" TEXT,
  "plan"          TEXT DEFAULT 'growth',
  "created_at"    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "profiles" ENABLE ROW LEVEL SECURITY;

-- Drop existing policies first to avoid duplicates
DROP POLICY IF EXISTS "profiles_own_select" ON "profiles";
DROP POLICY IF EXISTS "profiles_own_insert" ON "profiles";
DROP POLICY IF EXISTS "profiles_own_update" ON "profiles";
DROP POLICY IF EXISTS "own_profile" ON "profiles";

CREATE POLICY "profiles_own_select" ON "profiles"
  FOR SELECT USING (id = auth.uid());
CREATE POLICY "profiles_own_insert" ON "profiles"
  FOR INSERT WITH CHECK (id = auth.uid());
CREATE POLICY "profiles_own_update" ON "profiles"
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND plan = (SELECT plan FROM "profiles" WHERE id = auth.uid())
  );

-- 2. BUSINESS_SETTINGS table
CREATE TABLE IF NOT EXISTS "business_settings" (
  "user_id"       UUID PRIMARY KEY REFERENCES profiles(id) ON DELETE CASCADE,
  "business_name" TEXT,
  "biz_type"      TEXT,
  "google_link"   TEXT,
  "updated_at"    TIMESTAMPTZ DEFAULT now()
);

ALTER TABLE "business_settings" ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "business_settings_own_select" ON "business_settings";
DROP POLICY IF EXISTS "business_settings_own_insert" ON "business_settings";
DROP POLICY IF EXISTS "business_settings_own_update" ON "business_settings";
DROP POLICY IF EXISTS "own_settings" ON "business_settings";

CREATE POLICY "business_settings_own_select" ON "business_settings"
  FOR SELECT USING (user_id = auth.uid());
CREATE POLICY "business_settings_own_insert" ON "business_settings"
  FOR INSERT WITH CHECK (user_id = auth.uid());
CREATE POLICY "business_settings_own_update" ON "business_settings"
  FOR UPDATE USING (user_id = auth.uid());

-- 3. Auto-profile trigger for Google OAuth signups
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, name, business_name, plan)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email),
    '',
    'growth'
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
