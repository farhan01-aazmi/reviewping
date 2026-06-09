-- ============================
-- Migration 009: Add notif_prefs and phone columns
-- ============================

-- Add phone and notif_prefs columns to profiles
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "phone" TEXT;
ALTER TABLE "profiles" ADD COLUMN IF NOT EXISTS "notif_prefs" JSONB DEFAULT '{"newReview":true,"daily":true,"weekly":false,"sms":false}'::jsonb;

-- Update RLS to allow users to update notif_prefs
DROP POLICY IF EXISTS "profiles_own_update" ON "profiles";
CREATE POLICY "profiles_own_update" ON "profiles"
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND plan = (SELECT plan FROM "profiles" WHERE id = auth.uid())
  );
