-- Remove competitor tracking feature (tables were created manually in production, never in migrations)

DROP TABLE IF EXISTS public.competitor_snapshots;
DROP TABLE IF EXISTS public.competitor_tracking;
