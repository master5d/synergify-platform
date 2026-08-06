// web/lib/quests/build-daily.ts
import type { DailyInput, DailyQuest, DailySet } from './types'
import { MODULE_SLUGS } from '@/lib/rpg/modules'
import { SKINS_META } from '@/lib/rpg/skins-meta'
import { getAppliedChallenge } from '@/lib/cs/applied-challenge'
import { RETRIEVAL_BANK } from './retrieval-bank'
import { dailySeed, pick } from './seed'

const ADVANCE_TITLE = { ru: 'Продвижение', en: 'Advance' }
const PRACTICE_TITLE = { ru: 'Сегодняшний подход', en: "Today's rep" }
const RETRIEVAL_TITLE = { ru: 'Вспомни', en: 'Recall' }
const COMPLETE_TITLE = { ru: 'Все зоны пройдены', en: 'All zones cleared' }
const COMPLETE_BODY = {
  ru: 'Ты прошёл весь курс. Возвращайся за подходами и повторением — или начни свой проект.',
  en: 'You have cleared the whole course. Come back for reps and recall — or start your own project.',
}

// Valid tiers are 1–4 (from intake cogTier). Tiers 3 and 4 intentionally yield the same daily set
// (cap of 3 quests, per the SP2b spec's anti-burnout decision); invalid input falls back to 2.
function clampTier(t: number): number {
  return Number.isInteger(t) && t >= 1 && t <= 4 ? t : 2
}

function lessonHref(moduleSlug: string, unitSlug: string, locale: 'ru' | 'en'): string {
  return `${locale === 'en' ? '/en' : ''}/lessons/${moduleSlug}/${unitSlug}/`
}

function nextUnit(
  unitsByModule: DailyInput['unitsByModule'],
  isUnitDone: DailyInput['isUnitDone'],
): { module: string; unit: string; title: string } | null {
  for (const m of MODULE_SLUGS) {
    for (const u of unitsByModule[m] ?? []) {
      if (!isUnitDone(m, u.slug)) return { module: m, unit: u.slug, title: u.title }
    }
  }
  return null
}

export function buildDaily(input: DailyInput): DailySet {
  const { date, locale, skin, niche, outcome, unitsByModule, isUnitDone, completedModules } = input
  const tier = clampTier(input.cogTier)
  const quests: DailyQuest[] = []

  // --- advance (or course-complete) ---
  const advance = nextUnit(unitsByModule, isUnitDone)
  if (advance) {
    quests.push({
      id: `advance:${advance.module}/${advance.unit}`,
      kind: 'advance',
      title: ADVANCE_TITLE[locale],
      body: advance.title,
      cs: 0,
      module: advance.module,
      unit: advance.unit,
      href: lessonHref(advance.module, advance.unit, locale),
    })
  } else {
    quests.push({ id: 'complete', kind: 'complete', title: COMPLETE_TITLE[locale], body: COMPLETE_BODY[locale], cs: 0 })
  }

  const reached = advance ? Array.from(new Set([...completedModules, advance.module])) : [...completedModules]
  const used = new Set<string>()

  const wantPractice = tier >= 2 ? 1 : 0
  const wantRetrieval = tier >= 3 ? 1 : 0

  // --- practice (reuses SP3 applied-challenge templates) ---
  // Daily reps deliberately use the 'task' tier (lowest-friction framing); per-unit mode selection
  // (process/outcome) stays a UnitWizard concept, not a daily-quest one. See SP2b spec.
  for (let i = 0; i < wantPractice; i++) {
    const pool = reached.filter(m => !used.has(m) && getAppliedChallenge({ niche, outcome }, m, 'task', locale) !== null)
    const mod = pick(pool, dailySeed(`${skin}:p${i}`, date), 1)[0]
    if (!mod) break
    const body = getAppliedChallenge({ niche, outcome }, mod, 'task', locale)
    if (!body) break
    used.add(mod)
    quests.push({ id: `practice:${mod}`, kind: 'practice', title: PRACTICE_TITLE[locale], body, cs: 10, module: mod })
  }

  // --- retrieval (completed modules only, excluding any used by practice; otherwise omitted) ---
  for (let i = 0; i < wantRetrieval; i++) {
    const pool = completedModules.filter(m => RETRIEVAL_BANK[m] && !used.has(m))
    const mod = pick(pool, dailySeed(`${skin}:r${i}`, date), 1)[0]
    if (!mod) continue
    used.add(mod)
    const mentor = SKINS_META[skin]?.mentor
    const prompt = RETRIEVAL_BANK[mod][locale]
    quests.push({ id: `retrieval:${mod}`, kind: 'retrieval', title: RETRIEVAL_TITLE[locale], body: mentor ? `${mentor.name[locale]}: ${prompt}` : prompt, cs: 10, module: mod })
  }

  return { date, quests }
}
