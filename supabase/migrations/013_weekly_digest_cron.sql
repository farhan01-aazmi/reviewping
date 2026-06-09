-- ============================
-- Migration 013: Weekly Digest Cron + Review Submissions RLS
-- ============================

-- 1. Allow business owners to update their own review submissions
-- (needed for "Mark as Resolved" in the Needs Attention section)
DROP POLICY IF EXISTS "Users can update their own review submissions" ON review_submissions;
CREATE POLICY "Users can update their own review submissions"
  ON review_submissions FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- 2. Enable pg_cron extension (required for scheduling)
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- 3. Enable pg_net extension (required for HTTP requests from cron)
CREATE EXTENSION IF NOT EXISTS pg_net;

-- 4. Schedule the weekly digest every Monday at 9:00 AM
-- Uses the project's Supabase function URL
-- Note: If your Supabase project URL differs, update the URL below
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1',
  $$SELECT
    net.http_post(
      url:='https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/weekly-digest',
      headers:='{"Content-Type":"application/json"}'::jsonb
    ) AS request_id;
  $$
);

-- ── Manual test query (uncomment to run a one-off execution): ──
-- SELECT net.http_post(
--   url:='https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/weekly-digest',
--   headers:='{"Content-Type":"application/json"}'::jsonb
-- );

-- ── To remove the schedule (if needed): ──
-- SELECT cron.unschedule('weekly-digest');
