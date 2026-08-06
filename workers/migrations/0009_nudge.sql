-- Companion-bot daily nudge: throttle stamp + opt-out flag. Additive, idempotent-friendly.
ALTER TABLE users ADD COLUMN last_nudge_at INTEGER;
ALTER TABLE users ADD COLUMN nudge_optout INTEGER NOT NULL DEFAULT 0;
