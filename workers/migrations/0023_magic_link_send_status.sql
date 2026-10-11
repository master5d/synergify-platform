-- 0023_magic_link_send_status.sql — delivery outcome for transactional sign-in emails.
-- Additive: existing magic-link rows remain valid; message content and recipient are not stored.
ALTER TABLE magic_links ADD COLUMN send_status TEXT;
ALTER TABLE magic_links ADD COLUMN send_error_code TEXT;
ALTER TABLE magic_links ADD COLUMN sent_at INTEGER;
