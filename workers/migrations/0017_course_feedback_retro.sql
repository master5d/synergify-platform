-- 0017_course_feedback_retro.sql — graduate-retro fields on course_feedback (intake LMS#10)
-- Additive, nullable — reuses the existing feedback table/handler instead of a new one.
-- Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE this branch deploys.
ALTER TABLE course_feedback ADD COLUMN retro_before TEXT;
ALTER TABLE course_feedback ADD COLUMN retro_after TEXT;
ALTER TABLE course_feedback ADD COLUMN retro_prompt TEXT;
ALTER TABLE course_feedback ADD COLUMN retro_plan TEXT;
