ALTER TABLE review_templates ADD COLUMN IF NOT EXISTS source TEXT DEFAULT 'manual' CHECK (source IN ('manual', 'ai_generated'));

ALTER TABLE review_templates DROP CONSTRAINT IF EXISTS review_templates_user_id_biz_type_star_rating_template_text_key;

DROP INDEX IF EXISTS idx_review_templates_biz;
CREATE INDEX IF NOT EXISTS idx_review_templates_biz_rating ON review_templates(user_id, biz_type, star_rating);

GRANT ALL ON review_templates TO service_role;
