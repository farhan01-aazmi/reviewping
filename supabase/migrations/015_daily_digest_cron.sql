-- Migration 015: Daily Morning Digest Cron
-- Schedules the weekly-digest edge function to run daily at 9am
-- Also upgrades the existing weekly cron to send frequency="weekly"

-- Enable extensions if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Schedule daily digest at 9am every day
-- Uses the same weekly-digest function but defaults to frequency="daily"
SELECT cron.schedule(
  'daily-digest',
  '0 9 * * *',
  $$
  SELECT net.http_post(
    url:='https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/weekly-digest',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body:='{"frequency": "daily"}'::jsonb
  ) AS request_id;
  $$
);

-- Update the existing weekly cron to send frequency="weekly"
SELECT cron.schedule(
  'weekly-digest',
  '0 9 * * 1',
  $$
  SELECT net.http_post(
    url:='https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/weekly-digest',
    headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('supabase.service_role_key') || '"}'::jsonb,
    body:='{"frequency": "weekly"}'::jsonb
  ) AS request_id;
  $$
);
