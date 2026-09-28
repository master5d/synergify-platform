-- 0019_email_chains.sql — учебные цепочки писем через Listmonk tx (lib/email-chains.ts, handlers/email-chain-cron.ts).
-- email_sends — журнал отправленных шагов: шаг уходит один раз на (ученик, курс, ключ шага);
-- строка захватывается ДО отправки и снимается, если Listmonk письмо не принял.
-- users.email_optout — отписка от учебных писем (не от маркетинговых списков Listmonk);
-- users.last_email_at — лимит «не больше одного учебного письма в 20 часов».
-- Additive: новая таблица и две колонки, существующие данные не трогаются.
-- Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE this branch deploys.
CREATE TABLE IF NOT EXISTS email_sends (
  user_id  TEXT NOT NULL REFERENCES users(id),
  course   TEXT NOT NULL,
  step_key TEXT NOT NULL,            -- 'start-1', 'lapse-2@2026-09-20', 'milestone@03-stack-selection', 'finish-1'
  sent_at  INTEGER NOT NULL,
  PRIMARY KEY (user_id, course, step_key)
);
ALTER TABLE users ADD COLUMN email_optout INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN last_email_at INTEGER;
