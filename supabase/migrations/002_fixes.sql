-- ============================
-- Migration 002: Security Fixes & Improvements
-- ============================

-- 1. Fix RLS: Prevent client-side plan changes (CRIT-2)
-- Users can update their profile but NOT change their plan from the client.
-- Plan changes only happen server-side via the Stripe webhook.
DROP POLICY IF EXISTS "profiles_own_update" ON "profiles";
CREATE POLICY "profiles_own_update" ON "profiles"
  FOR UPDATE USING (id = auth.uid())
  WITH CHECK (
    id = auth.uid()
    AND plan = (SELECT plan FROM "profiles" WHERE id = auth.uid())
  );

-- 2. Add DELETE policy for notifications (MED-1)
-- Users should be able to dismiss/delete notifications
CREATE POLICY "notifications_own_delete" ON "notifications"
  FOR DELETE USING (user_id = auth.uid());

-- 3. Profile auto-creation trigger for Google OAuth signups
-- When a user signs up via Google OAuth, this trigger automatically
-- creates a profile record so App.jsx doesn't fail on profile lookup.
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

-- Trigger fires after a new user is created in auth.users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 4. Add subscriptions table indexes for performance
CREATE INDEX IF NOT EXISTS idx_subscriptions_user_id    ON "subscriptions" ("user_id");
CREATE INDEX IF NOT EXISTS idx_subscriptions_stripe_id ON "subscriptions" ("stripe_subscription_id");
