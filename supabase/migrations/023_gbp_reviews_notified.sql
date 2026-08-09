-- Track which GBP reviews have already been emailed to the business owner
ALTER TABLE public.gbp_reviews ADD COLUMN IF NOT EXISTS notified_at TIMESTAMPTZ;
