-- ============================
-- Migration 006: Production-grade schema with UUIDs
-- Run in Supabase Dashboard → SQL Editor
-- ============================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (extends auth.users)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
  business_name TEXT,
  plan TEXT DEFAULT 'growth',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- BUSINESS SETTINGS
CREATE TABLE IF NOT EXISTS business_settings (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  business_name TEXT,
  business_category TEXT,
  business_phone TEXT,
  business_website TEXT,
  google_place_id TEXT,
  review_link TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  platform TEXT DEFAULT 'manual' CHECK (platform IN ('google','trustpilot','yelp','manual')),
  external_id TEXT,
  author_name TEXT NOT NULL,
  author_avatar TEXT,
  rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
  review_text TEXT,
  sentiment TEXT CHECK (sentiment IN ('positive','neutral','negative')),
  sentiment_score FLOAT,
  topics TEXT[],
  replied BOOLEAN DEFAULT FALSE,
  reply_text TEXT,
  replied_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- CONTACTS
CREATE TABLE IF NOT EXISTS contacts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  tags TEXT[] DEFAULT '{}',
  unsubscribed BOOLEAN DEFAULT FALSE,
  last_requested_at TIMESTAMPTZ,
  review_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- REVIEW REQUESTS
CREATE TABLE IF NOT EXISTS review_requests (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  contact_id UUID REFERENCES contacts(id) ON DELETE SET NULL,
  customer_name TEXT NOT NULL,
  customer_email TEXT,
  customer_phone TEXT,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  template_id UUID,
  review_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','delivered','opened','clicked','reviewed','failed')),
  sent_at TIMESTAMPTZ,
  opened_at TIMESTAMPTZ,
  clicked_at TIMESTAMPTZ,
  reviewed_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- TEMPLATES
CREATE TABLE IF NOT EXISTS templates (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  channel TEXT NOT NULL CHECK (channel IN ('email','sms','whatsapp')),
  subject TEXT,
  body TEXT NOT NULL,
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT,
  title TEXT,
  body TEXT,
  icon TEXT,
  read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  stripe_customer_id TEXT,
  stripe_subscription_id TEXT,
  plan TEXT CHECK (plan IN ('free','starter','growth','agency')),
  status TEXT DEFAULT 'active',
  current_period_end TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE subscriptions ENABLE ROW LEVEL SECURITY;

-- Profiles policies
DROP POLICY IF EXISTS "profiles_select" ON profiles;
DROP POLICY IF EXISTS "profiles_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_update" ON profiles;
DROP POLICY IF EXISTS "profiles_own_select" ON profiles;
DROP POLICY IF EXISTS "profiles_own_insert" ON profiles;
DROP POLICY IF EXISTS "profiles_own_update" ON profiles;
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Business settings policies
DROP POLICY IF EXISTS "business_settings_all" ON business_settings;
DROP POLICY IF EXISTS "business_settings_own_select" ON business_settings;
DROP POLICY IF EXISTS "business_settings_own_insert" ON business_settings;
DROP POLICY IF EXISTS "business_settings_own_update" ON business_settings;
CREATE POLICY "business_settings_all" ON business_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews policies
DROP POLICY IF EXISTS "reviews_all" ON reviews;
DROP POLICY IF EXISTS "reviews_own_select" ON reviews;
DROP POLICY IF EXISTS "reviews_own_insert" ON reviews;
DROP POLICY IF EXISTS "reviews_own_update" ON reviews;
DROP POLICY IF EXISTS "reviews_own_delete" ON reviews;
CREATE POLICY "reviews_all" ON reviews
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Contacts policies
DROP POLICY IF EXISTS "contacts_all" ON contacts;
DROP POLICY IF EXISTS "contacts_own_select" ON contacts;
DROP POLICY IF EXISTS "contacts_own_insert" ON contacts;
DROP POLICY IF EXISTS "contacts_own_update" ON contacts;
DROP POLICY IF EXISTS "contacts_own_delete" ON contacts;
CREATE POLICY "contacts_all" ON contacts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Review requests policies
DROP POLICY IF EXISTS "review_requests_all" ON review_requests;
DROP POLICY IF EXISTS "review_requests_own_select" ON review_requests;
DROP POLICY IF EXISTS "review_requests_own_insert" ON review_requests;
DROP POLICY IF EXISTS "review_requests_own_update" ON review_requests;
DROP POLICY IF EXISTS "review_requests_own_delete" ON review_requests;
CREATE POLICY "review_requests_all" ON review_requests
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Templates policies
DROP POLICY IF EXISTS "templates_all" ON templates;
DROP POLICY IF EXISTS "templates_own_select" ON templates;
DROP POLICY IF EXISTS "templates_own_insert" ON templates;
DROP POLICY IF EXISTS "templates_own_update" ON templates;
DROP POLICY IF EXISTS "templates_own_delete" ON templates;
CREATE POLICY "templates_all" ON templates
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Notifications policies
DROP POLICY IF EXISTS "notifications_all" ON notifications;
DROP POLICY IF EXISTS "notifications_own_select" ON notifications;
DROP POLICY IF EXISTS "notifications_own_insert" ON notifications;
DROP POLICY IF EXISTS "notifications_own_update" ON notifications;
DROP POLICY IF EXISTS "notifications_own_delete" ON notifications;
CREATE POLICY "notifications_all" ON notifications
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Subscriptions policies
DROP POLICY IF EXISTS "subscriptions_all" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_own_select" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_own_insert" ON subscriptions;
DROP POLICY IF EXISTS "subscriptions_own_update" ON subscriptions;
CREATE POLICY "subscriptions_all" ON subscriptions
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, business_name, plan)
  VALUES (
    NEW.id,
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
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews (user_id);
CREATE INDEX IF NOT EXISTS idx_contacts_user_id ON contacts (user_id);
CREATE INDEX IF NOT EXISTS idx_review_requests_user_id ON review_requests (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications (user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications (user_id, read);
