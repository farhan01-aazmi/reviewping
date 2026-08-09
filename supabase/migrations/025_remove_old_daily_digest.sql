-- Remove old daily digest job (superseded by reviewping-digest-daily at 02:30 UTC)
-- Keep weekly-digest job (Mondays) — it sends the weekly frequency variant
select cron.unschedule('daily-digest');
