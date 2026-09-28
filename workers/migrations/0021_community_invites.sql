-- 0021_community_invites.sql — слой сообщества (intake LMS#13, spec 2026-09-28-community-layer.md).
-- community_invites — факт «бот уже пригласил в группу»: одно приглашение на (ученик, место).
-- place = ключ курса (progress.course) или 'academy'. Строка захватывается ДО отправки и снимается,
-- если Telegram сообщение не принял. Участники группы и их сообщения здесь НЕ хранятся.
-- users.community_optout — отказ ученика от приглашений (кнопка «Не присылать такое»).
-- Additive: новая таблица и одна колонка, существующие данные не трогаются.
-- Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE COMMUNITY_INVITES_ENABLED = "1".
CREATE TABLE IF NOT EXISTS community_invites (
  user_id  TEXT NOT NULL REFERENCES users(id),
  place    TEXT NOT NULL,            -- 'tochka-sborki' | 'living-practice' | 'academy'
  trigger  TEXT NOT NULL,            -- 'first-lesson' | 'admission'
  sent_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, place)
);
ALTER TABLE users ADD COLUMN community_optout INTEGER NOT NULL DEFAULT 0;
