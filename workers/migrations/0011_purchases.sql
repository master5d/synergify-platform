-- 0011_purchases.sql — digital-goods purchase ledger (idempotency + delivery state)
CREATE TABLE IF NOT EXISTS purchases (
  id                TEXT PRIMARY KEY,
  stripe_session_id TEXT NOT NULL UNIQUE,
  product_id        TEXT NOT NULL,
  email             TEXT NOT NULL,
  amount_cents      INTEGER NOT NULL,
  locale            TEXT NOT NULL,
  delivered_at      INTEGER,
  created_at        INTEGER NOT NULL
);
