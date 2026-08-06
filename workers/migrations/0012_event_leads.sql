-- workers/migrations/0012_event_leads.sql
-- Rich detail for consent-first interest-capture leads (fb_667daeba55b3).
-- Additive only. Email is also upserted into users (CRM source of truth);
-- this table holds the per-event fields users has no columns for.
CREATE TABLE IF NOT EXISTS event_leads (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT NOT NULL,
  phone TEXT,
  city TEXT,
  event TEXT,
  message TEXT,
  consent_at INTEGER NOT NULL,
  source TEXT,
  language TEXT,
  created_at INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_event_leads_event ON event_leads(event);
CREATE INDEX IF NOT EXISTS idx_event_leads_email ON event_leads(email);
