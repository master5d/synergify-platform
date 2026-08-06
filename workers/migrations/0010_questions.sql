-- Learner questions captured via the Telegram /ask flow (lead-capture). Additive.
CREATE TABLE IF NOT EXISTS questions (
  id TEXT PRIMARY KEY,
  user_id TEXT,
  telegram_id TEXT,
  text TEXT NOT NULL,
  locale TEXT,
  created_at INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'new'
);
