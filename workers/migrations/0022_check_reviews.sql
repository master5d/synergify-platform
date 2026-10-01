-- 0022_check_reviews.sql — интервальный повтор самопроверок (BACKLOG «Педагогика 1», intake LMS#20).
-- Одна строка на (ученик, курс, модуль, вопрос): коробка Лейтнера (0..3 = 1/3/7/21 день), срок следующего
-- повтора и время последнего ответа. Сам вариант ответа и текст вопроса НЕ хранятся — только верно/нет.
-- reviewed_at — последний ответ ИМЕННО на повтор (блок «Вспомни», source='review'): знаменатель/числитель
-- стоп-критерия пилота «доля учеников, ответивших на повтор» (handlers/stats.ts, за флагом).
-- Additive: новая таблица и индекс, существующие не трогаются.
-- Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE SPACED_REVIEW_ENABLED = "1" — слово владельца.
CREATE TABLE IF NOT EXISTS check_reviews (
  user_id      TEXT NOT NULL REFERENCES users(id),
  course       TEXT NOT NULL,          -- progress.course
  module       TEXT NOT NULL,          -- slug модуля (id вопроса уникален только внутри модуля)
  check_id     TEXT NOT NULL,          -- checks[].id из _meta.json
  unit         TEXT NOT NULL,          -- checks[].unit
  box          INTEGER NOT NULL DEFAULT 0,
  due_at       INTEGER NOT NULL,       -- unix-секунды
  last_at      INTEGER NOT NULL,
  last_correct INTEGER NOT NULL,       -- 0 | 1
  answers      INTEGER NOT NULL DEFAULT 1,
  reviewed_at  INTEGER,                -- NULL = на повтор ещё не отвечал
  PRIMARY KEY (user_id, course, module, check_id)
);
CREATE INDEX IF NOT EXISTS idx_check_reviews_due ON check_reviews (course, due_at);
