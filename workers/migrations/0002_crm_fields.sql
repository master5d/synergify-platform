-- workers/migrations/0002_crm_fields.sql
ALTER TABLE users ADD COLUMN language TEXT;
ALTER TABLE users ADD COLUMN source TEXT;
ALTER TABLE users ADD COLUMN telegram_handle TEXT;
