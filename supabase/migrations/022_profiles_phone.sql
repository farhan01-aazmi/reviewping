-- Add phone to profiles for required mobile number at signup
ALTER TABLE public.profiles ADD COLUMN IF NOT EXISTS phone TEXT;
