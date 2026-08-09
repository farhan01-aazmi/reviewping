-- Scheduled jobs: daily digest + new-review notification poll
-- Digest: 02:30 UTC = 08:00 IST, every day
-- Notify: every 30 minutes

select cron.schedule(
  'reviewping-digest-daily',
  '30 2 * * *',
  $$
  select net.http_post(
    url := 'https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/weekly-digest',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dWdyY3FqcnR3YWJhb2J1aWdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg5MzI3OSwiZXhwIjoyMDk0NDY5Mjc5fQ.0iv0Fw8TC1pR3rmEyB7bsS1QRNwH6lKltdIcS9XCL38'
    ),
    body := '{"frequency":"daily"}'
  ) as content;
  $$
);

select cron.schedule(
  'reviewping-notify-new-reviews',
  '*/30 * * * *',
  $$
  select net.http_post(
    url := 'https://fvugrcqjrtwabaobuigb.supabase.co/functions/v1/notify-new-reviews',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZ2dWdyY3FqcnR3YWJhb2J1aWdiIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc3ODg5MzI3OSwiZXhwIjoyMDk0NDY5Mjc5fQ.0iv0Fw8TC1pR3rmEyB7bsS1QRNwH6lKltdIcS9XCL38',
      'x-cron-secret', 'rp-cron-7f3k9m2x'
    ),
    body := '{}'
  ) as content;
  $$
);
