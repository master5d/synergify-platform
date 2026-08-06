-- workers/migrations/0003_intake_profiles.sql
CREATE TABLE IF NOT EXISTS intake_profiles (
  user_id        TEXT PRIMARY KEY REFERENCES users(id),
  status         TEXT NOT NULL DEFAULT 'in_progress',
  answers        TEXT NOT NULL DEFAULT '{}',
  current_step   INTEGER NOT NULL DEFAULT 0,

  int_score INTEGER, wis_score INTEGER, con_score INTEGER,
  dex_score INTEGER, cha_score INTEGER, str_score INTEGER,
  char_class    TEXT,
  char_level    INTEGER,
  world_skin    TEXT,
  cog_tier      INTEGER,
  register      TEXT,
  sheet_language TEXT,
  niche         TEXT,
  os            TEXT,

  legendary_title TEXT, backstory TEXT, first_quest TEXT, final_boss TEXT,
  prose_source  TEXT,

  created_at INTEGER NOT NULL, updated_at INTEGER NOT NULL, completed_at INTEGER
);
