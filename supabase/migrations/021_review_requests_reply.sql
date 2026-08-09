-- Add reply column to review_requests (ReviewsPage replies are stored per request)

ALTER TABLE review_requests ADD COLUMN IF NOT EXISTS reply TEXT;
