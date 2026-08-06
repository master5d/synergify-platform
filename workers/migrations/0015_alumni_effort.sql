-- 0015_alumni_effort.sql — synergem matching key (Phase C, fb_bfbdbcf0)
-- Additive, safe. Apply to prod D1 via cloudflare-api MCP /query (NOT wrangler) BEFORE push.
-- Existing opted-in rows get NULL → they cluster into 'other' until the learner re-saves.
ALTER TABLE users ADD COLUMN alumni_effort TEXT;  -- effort-intent key: co-build|mastermind|teach-swap|clients|peer-support (null = undeclared)
