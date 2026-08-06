-- Stable numeric Telegram id (TEXT to preserve 64-bit precision) linking a user
-- to their Telegram account for the Mini App auth bridge. Additive, idempotent.
ALTER TABLE users ADD COLUMN telegram_id TEXT;
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_telegram_id
  ON users(telegram_id) WHERE telegram_id IS NOT NULL;
