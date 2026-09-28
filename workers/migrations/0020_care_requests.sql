-- 0020_care_requests.sql — журнал службы заботы (handlers/care.ts, POST /api/care).
-- Одна строка = одно обращение с любого из трёх сайтов (site: tochka-sborki / academy / mamaev-coach).
-- ip_hash — SHA-256 от CF-Connecting-IP (сам IP не хранится): только для лимита частоты.
-- user_id — если обратившийся был вошедшим (cookie session), иначе NULL.
-- status — для ручного разбора владельцем ('new' → 'answered'); воркер пишет только 'new'.
-- Additive: новая таблица, существующие данные не трогаются. Пока миграция не применена, приёмник
-- не падает: письмо владельцу и автоответ уходят, пропуск записи громко пишется в лог воркера.
-- Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) — по слову владельца.
CREATE TABLE IF NOT EXISTS care_requests (
  id         TEXT PRIMARY KEY,
  site       TEXT NOT NULL,
  topic      TEXT NOT NULL,
  message    TEXT NOT NULL,
  email      TEXT NOT NULL,
  page_url   TEXT,
  locale     TEXT NOT NULL DEFAULT 'ru',
  user_id    TEXT REFERENCES users(id),
  ip_hash    TEXT,
  status     TEXT NOT NULL DEFAULT 'new',
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_care_requests_created ON care_requests(created_at);
CREATE INDEX IF NOT EXISTS idx_care_requests_email ON care_requests(email, created_at);
