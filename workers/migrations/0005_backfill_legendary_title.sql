-- 0005_backfill_legendary_title.sql
-- One-time backfill: earlier fallback prose (prose_source='template') interpolated the
-- raw world_skin enum slug into legendary_title, e.g. «slavic-myth» instead of «Славянский Миф».
-- gemini.ts is fixed going forward; this repairs existing rows by replacing the slug substring
-- with its readable display name, localized by sheet_language (en → EN name, else RU name).
-- Apply with:  wrangler d1 execute tochka-sborki-db --remote --file=migrations/0005_backfill_legendary_title.sql
-- (NOT `migrations apply` — 0002 has a non-idempotent ALTER TABLE.)

-- RU titles
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'slavic-myth',   'Славянский Миф'),      updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%slavic-myth%'   AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'dark-fantasy',  'Тёмное Фэнтези'),      updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%dark-fantasy%'  AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'cyber-noir',    'Кибер-Нуар'),          updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%cyber-noir%'    AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'space-opera',   'Космическая Опера'),   updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%space-opera%'   AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'anime-quest',   'Аниме-Квест'),         updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%anime-quest%'   AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'soviet-heroic', 'Советский Героизм'),   updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%soviet-heroic%' AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'mystic-arcane', 'Мистическая Аркана'),  updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%mystic-arcane%' AND sheet_language != 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'wanderer',      'Странник'),            updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%wanderer%'      AND sheet_language != 'en';

-- EN titles
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'slavic-myth',   'Slavic Myth'),    updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%slavic-myth%'   AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'dark-fantasy',  'Dark Fantasy'),   updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%dark-fantasy%'  AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'cyber-noir',    'Cyber Noir'),     updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%cyber-noir%'    AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'space-opera',   'Space Opera'),    updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%space-opera%'   AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'anime-quest',   'Anime Quest'),    updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%anime-quest%'   AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'soviet-heroic', 'Soviet Heroic'),  updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%soviet-heroic%' AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'mystic-arcane', 'Mystic Arcane'),  updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%mystic-arcane%' AND sheet_language = 'en';
UPDATE intake_profiles SET legendary_title = REPLACE(legendary_title, 'wanderer',      'Wanderer'),       updated_at = CAST(strftime('%s','now') AS INTEGER) * 1000 WHERE legendary_title LIKE '%wanderer%'      AND sheet_language = 'en';
