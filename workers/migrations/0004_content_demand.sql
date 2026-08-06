-- 0004_content_demand.sql — Content Demand Radar storage
CREATE TABLE IF NOT EXISTS content_demand_signals (
  id              TEXT PRIMARY KEY,
  user_id         TEXT NOT NULL,
  source_question TEXT NOT NULL,            -- 'F3' | 'F2_other'
  raw_text        TEXT NOT NULL,
  classification  TEXT NOT NULL,            -- 'covered' | 'gap' | 'not_feasible' | 'unclassified'
  matched_module  TEXT,
  gap_topic_key   TEXT,
  gap_topic_label TEXT,                     -- JSON {ru,en}
  feasibility_note TEXT,
  value_tier      TEXT NOT NULL DEFAULT 'normal',
  brief_id        TEXT,
  created_at      INTEGER NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_demand_topic ON content_demand_signals (gap_topic_key, created_at);

CREATE TABLE IF NOT EXISTS content_demand_briefs (
  id            TEXT PRIMARY KEY,
  gap_topic_key TEXT NOT NULL,
  status        TEXT NOT NULL DEFAULT 'open', -- 'open' | 'accepted' | 'rejected' | 'shipped'
  proposal_json TEXT NOT NULL,
  signal_count  INTEGER NOT NULL,
  created_at    INTEGER NOT NULL,
  decided_at    INTEGER
);
CREATE INDEX IF NOT EXISTS idx_brief_status ON content_demand_briefs (status, created_at);
