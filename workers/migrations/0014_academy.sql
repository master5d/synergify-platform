-- workers/migrations/0014_academy.sql
-- S.A.S.H.A S4: admissions + additive course-keying (fb_97517f307a46).
CREATE TABLE IF NOT EXISTS admissions (
  user_id    TEXT NOT NULL REFERENCES users(id),
  course     TEXT NOT NULL,
  granted_at INTEGER NOT NULL,
  PRIMARY KEY (user_id, course)
);

ALTER TABLE progress ADD COLUMN course TEXT NOT NULL DEFAULT 'tochka-sborki';
ALTER TABLE intake_profiles ADD COLUMN course TEXT NOT NULL DEFAULT 'tochka-sborki';
