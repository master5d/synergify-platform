-- 0007_alumni_optin.sql — opt-in alumni networking directory (Phase A)
-- Additive, safe. Apply to prod D1 before the /alumni feature goes live:
--   npx wrangler d1 execute tochka-sborki-db --remote --file migrations/0007_alumni_optin.sql
ALTER TABLE users ADD COLUMN alumni_optin INTEGER NOT NULL DEFAULT 0;
ALTER TABLE users ADD COLUMN alumni_contact TEXT;   -- how to reach me (the learner's chosen handle/link, not email)
ALTER TABLE users ADD COLUMN alumni_blurb TEXT;     -- one line: what I'm building / want to connect on
