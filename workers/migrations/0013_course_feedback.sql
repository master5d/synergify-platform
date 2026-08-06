-- workers/migrations/0013_course_feedback.sql
-- Course-feedback submissions, persisted directly in D1 (replaces the n8n forward).
-- Likert/open fields are nullable — the post-class survey is skippable (only lesson required).
CREATE TABLE IF NOT EXISTS course_feedback (
  id TEXT PRIMARY KEY,
  lesson TEXT NOT NULL,
  recommend TEXT,
  impact TEXT,
  apply TEXT,
  unclear TEXT,
  other TEXT,
  locale TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_course_feedback_lesson ON course_feedback(lesson);
