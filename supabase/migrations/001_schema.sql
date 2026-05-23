-- ============================
-- Migration 001: Initial schema
-- Run in Supabase Dashboard → SQL Editor
-- ============================

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES
CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  full_name TEXT,
  avatar_url TEXT,
  onboarding_completed BOOLEAN DEFAULT FALSE,
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
  review_link TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending','sent','opened','clicked','reviewed','failed')),
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

-- ROW LEVEL SECURITY
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE business_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE review_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE templates ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "profiles_select" ON profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert" ON profiles FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update" ON profiles FOR UPDATE USING (auth.uid() = id);

-- Business settings policies
CREATE POLICY "business_settings_all" ON business_settings
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Reviews policies
CREATE POLICY "reviews_all" ON reviews
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Contacts policies
CREATE POLICY "contacts_all" ON contacts
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Review requests policies
CREATE POLICY "review_requests_all" ON review_requests
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- Templates policies
CREATE POLICY "templates_all" ON templates
  USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);

-- AUTO-CREATE PROFILE ON SIGNUP
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = ''
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', NEW.email)
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
