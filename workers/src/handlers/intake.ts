import { scoreProfile } from '../../../LMS/tochka-sborki/web/lib/intake/scoring'
import { scoreProfileV2 } from '../../../LMS/tochka-sborki/web/lib/intake/scoring-v2'
import { requiredIds } from '../../../LMS/tochka-sborki/web/lib/intake/instrument'
import { generateSheetProse, classifyFilmSkin } from '../lib/gemini'
import type { Answers, InstrumentVersion, Locale } from '../../../LMS/tochka-sborki/web/lib/intake/types'

export async function handleMe(db: D1Database, userId: string): Promise<Response> {
  const row = await db.prepare('SELECT * FROM intake_profiles WHERE user_id = ?').bind(userId).first()
  if (!row) return new Response(null, { status: 404 })
  return Response.json(row)
}

export async function handleProgress(
  db: D1Database,
  userId: string,
  body: { answers: Answers; currentStep: number; instrumentVersion?: InstrumentVersion },
): Promise<Response> {
  const now = Date.now()
  const version = body.instrumentVersion === 2 ? 2 : 1
  // instrument_version is set on first insert and NEVER updated on conflict — the version freezes.
  await db.prepare(
    `INSERT INTO intake_profiles (user_id, instrument_version, answers, current_step, created_at, updated_at)
     VALUES (?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET answers=excluded.answers, current_step=excluded.current_step, updated_at=excluded.updated_at`,
  ).bind(userId, version, JSON.stringify(body.answers), body.currentStep, now, now).run()
  return Response.json({ ok: true })
}

export async function handleSubmit(
  db: D1Database,
  userId: string,
  body: { answers: Answers; locale?: Locale },
  geminiKey: string,
  fetchImpl: typeof fetch = fetch,
): Promise<Response> {
  const answers = body.answers ?? {}
  const existing = await db.prepare('SELECT instrument_version FROM intake_profiles WHERE user_id = ?').bind(userId).first<{ instrument_version: number }>()
  const version: InstrumentVersion = existing?.instrument_version === 2 ? 2 : 1
  const locale: Locale = body.locale === 'en' ? 'en' : 'ru'

  const missing = requiredIds(version).filter(id => answers[id] == null || answers[id] === '')
  if (missing.length) return Response.json({ error: 'missing_required', missing }, { status: 400 })

  const score = version === 2 ? scoreProfileV2(answers, locale) : scoreProfile(answers)
  if (score.worldSkinSource === 'g3' && typeof answers['G3'] === 'string') {
    score.worldSkin = (await classifyFilmSkin(answers['G3'] as string, geminiKey, fetchImpl)) as any
  }
  const prose = await generateSheetProse({
    charClass: score.charClass, worldSkin: score.worldSkin, language: score.sheetLanguage,
    register: score.register, niche: score.niche,
    attributes: { int: score.int, wis: score.wis, con: score.con, dex: score.dex, cha: score.cha, str: score.str },
    aspirational: (answers['G11'] ?? answers['V_OUTCOME']) as string,
    firstWin: (answers['A2'] ?? answers['V_OUTCOME']) as string,
    successDef: (answers['A10'] ?? answers['V_OUTCOME']) as string,
  }, geminiKey, fetchImpl)

  const now = Date.now()
  await db.prepare(
    `INSERT INTO intake_profiles
       (user_id, status, instrument_version, answers, current_step, int_score, wis_score, con_score, dex_score, cha_score, str_score,
        char_class, char_level, world_skin, cog_tier, register, sheet_language, niche, os, mbti, relational_style,
        legendary_title, backstory, first_quest, final_boss, prose_source, created_at, updated_at, completed_at)
     VALUES (?, 'completed', ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
     ON CONFLICT(user_id) DO UPDATE SET status='completed', answers=excluded.answers,
        int_score=excluded.int_score, wis_score=excluded.wis_score, con_score=excluded.con_score,
        dex_score=excluded.dex_score, cha_score=excluded.cha_score, str_score=excluded.str_score,
        char_class=excluded.char_class, char_level=excluded.char_level, world_skin=excluded.world_skin,
        cog_tier=excluded.cog_tier, register=excluded.register, sheet_language=excluded.sheet_language,
        niche=excluded.niche, os=excluded.os, mbti=excluded.mbti, relational_style=excluded.relational_style,
        legendary_title=excluded.legendary_title, backstory=excluded.backstory, first_quest=excluded.first_quest,
        final_boss=excluded.final_boss, prose_source=excluded.prose_source, updated_at=excluded.updated_at, completed_at=excluded.completed_at`,
  ).bind(
    userId, version, JSON.stringify(answers), 0, score.int, score.wis, score.con, score.dex, score.cha, score.str,
    score.charClass, score.charLevel, score.worldSkin, score.cogTier, score.register, score.sheetLanguage,
    score.niche, score.os, score.mbti, score.relationalStyle ? JSON.stringify(score.relationalStyle) : null,
    prose.legendaryTitle, prose.backstory, prose.firstQuest, prose.finalBoss, prose.source, now, now, now,
  ).run()

  return Response.json({ ok: true, redirect: '/character' })
}
