-- 0018_progress_events.sql — журнал событий прогресса «модуль/курс завершён» (intake LMS#3).
-- Нужен для идемпотентности: событие уходит в Listmonk один раз на (ученик, курс, вид, предмет).
-- Additive: новая таблица, существующие не трогаются.
-- Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE this branch deploys.
CREATE TABLE IF NOT EXISTS progress_events (
  user_id    TEXT NOT NULL REFERENCES users(id),
  course     TEXT NOT NULL,
  kind       TEXT NOT NULL,          -- 'module' | 'course'
  subject    TEXT NOT NULL,          -- slug модуля; для 'course' — slug курса
  created_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, course, kind, subject)
);
