-- workers/migrations/0006_instrument_version.sql
-- Additive only. Existing rows default to v1 (frozen on the old instrument).
ALTER TABLE intake_profiles ADD COLUMN instrument_version INTEGER NOT NULL DEFAULT 1;
ALTER TABLE intake_profiles ADD COLUMN mbti TEXT;
ALTER TABLE intake_profiles ADD COLUMN relational_style TEXT;
