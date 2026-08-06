import { assignClass, type Attributes } from './scoring'
import { deriveMbti, relationalStyle } from './mbti'
import type { Answers, Locale, ScoreResult, WorldSkin } from './types'

const num = (a: Answers, id: string, table: Record<string, number>) => {
  const v = a[id]
  if (Array.isArray(v)) return v.reduce((m, k) => Math.max(m, table[k as string] ?? 0), 0)
  return (typeof v === 'string' && table[v] != null) ? table[v] : 0
}

// Core proxy points (small, always available). 0..~10 raw per attribute before depth.
function coreAttributes(a: Answers): Attributes {
  const int = num(a, 'V_HOOK', { understand: 6, build: 5, order: 4, create: 3, talk: 2 })
  const wis = num(a, 'V_ANCHOR', { structure: 6, topics: 4, support: 3, quick_wins: 2, freedom: 3 })
  const con = num(a, 'V_RHYTHM', { ritual: 6, fuego: 4, suave: 3, libre: 2 })
  const dex = num(a, 'V_ATTN', { long: 6, mid: 4, short: 2 })
  const cha = num(a, 'V_NICHE', { content: 6, coach: 5, astrology: 5, massage: 4, service: 3, ecommerce: 3, tech: 1, other: 2 })
  const str = num(a, 'V_WHY', { money_time: 6, project: 5, edge: 4, community: 3, curiosity: 2 })
  return { int, wis, con, dex, cha, str }
}

// Depth points (sharper). Reuse v1-equivalent weight tables, keyed by VD_* ids.
function depthAttributes(a: Answers): Attributes {
  return {
    int: num(a, 'VD_INT', { never: 0, basic: 4, scripts: 8, comfortable: 12 }),
    wis: num(a, 'VD_WIS', { do_now: 8, teach: 6, notes: 4, review: 2 }),
    con: num(a, 'VD_CON', { lt_week: 1, w1_4: 4, m1_3: 7, m6_plus: 10 }),
    dex: num(a, 'VD_DEX', { lt2h: 2, h2_5: 6, h5_plus: 10 }),
    cha: 0,
    str: num(a, 'VD_STR', { solo: 2, helpers: 5, small: 8, large: 12 }),
  }
}

const RANGE = 30
const RAWMAX = { int: 18, wis: 16, con: 16, dex: 16, cha: 6, str: 18 } as const

export function scoreProfileV2(answers: Answers, locale: Locale): ScoreResult {
  const hasDepth = answers['V_DEEPEN'] === 'yes'
  const core = coreAttributes(answers)
  const depth = hasDepth ? depthAttributes(answers) : { int: 0, wis: 0, con: 0, dex: 0, cha: 0, str: 0 }
  const attrs = {} as Attributes
  ;(['int','wis','con','dex','cha','str'] as const).forEach(k => {
    const raw = core[k] + depth[k]
    attrs[k] = Math.min(RANGE, Math.round((raw / RAWMAX[k]) * RANGE))
  })

  const skinAns = answers['V_SKIN']
  const skin: WorldSkin = (typeof skinAns === 'string' ? skinAns : 'wanderer') as WorldSkin
  const cog = { short: 1, mid: 2, long: 3 }[answers['V_ATTN'] as string] ?? 2

  return {
    int: attrs.int, wis: attrs.wis, con: attrs.con, dex: attrs.dex, cha: attrs.cha, str: attrs.str,
    charClass: assignClass(attrs),
    charLevel: hasDepth ? num(answers, 'VD_INT', { never: 0, basic: 1, scripts: 2, comfortable: 3 }) : 0,
    worldSkin: skin,
    worldSkinSource: typeof skinAns === 'string' ? 'v2' : 'wanderer-fallback',
    cogTier: cog,
    register: 'adaptive',
    sheetLanguage: locale === 'en' ? 'en' : 'ru-tech',
    niche: (answers['V_NICHE'] as string) ?? null,
    os: (answers['V_OS'] as string) ?? null,
    strLowConfidence: !hasDepth,
    mbti: deriveMbti(answers),
    relationalStyle: relationalStyle(answers),
  }
}
