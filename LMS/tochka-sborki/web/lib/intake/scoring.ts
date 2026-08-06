import { SCORING } from './scoring-weights'
import type { Answers, AttributeCode, CharacterClass, WorldSkin, ScoreResult } from './types'

const SOURCES: Record<AttributeCode, { ids: string[]; rawMax: number; range: number }> = {
  INT: { ids: ['C1', 'C3', 'C4', 'C8', 'D3', 'D7'], rawMax: 40, range: 30 },
  WIS: { ids: ['D1', 'D5', 'D9', 'E3', 'E4'], rawMax: 21, range: 25 },
  CON: { ids: ['E1', 'E2', 'E7', 'B7', 'B8'], rawMax: 25, range: 25 },
  DEX: { ids: ['A9', 'F5', 'E5', 'B6'], rawMax: 19, range: 20 },
  CHA: { ids: ['A5', 'A6', 'F2', 'E3'], rawMax: 16, range: 20 },
  STR: { ids: ['F4', 'A9'], rawMax: 11, range: 20 },
}

function pointsFor(id: string, answers: Answers): number {
  const raw = answers[id]
  if (raw == null) return 0
  const table = SCORING[id]
  if (!table) return 0
  const key = typeof raw === 'number' ? String(raw) : Array.isArray(raw) ? '' : raw
  return table[key] ?? 0
}

export interface Attributes {
  int: number; wis: number; con: number; dex: number; cha: number; str: number
}

export function computeAttributes(answers: Answers): Attributes {
  const out = {} as Record<Lowercase<AttributeCode>, number>
  for (const code of Object.keys(SOURCES) as AttributeCode[]) {
    const { ids, rawMax, range } = SOURCES[code]
    const raw = ids.reduce((sum, id) => sum + pointsFor(id, answers), 0)
    out[code.toLowerCase() as Lowercase<AttributeCode>] = Math.round((raw / rawMax) * range)
  }
  return out as Attributes
}

export function assignClass(a: Attributes): CharacterClass {
  if (a.int >= 20 && a.str >= 15 && a.con >= 18) return 'artificer'
  if (a.wis >= 18 && a.int >= 15 && a.cha >= 15) return 'mage'
  if (a.wis >= 20 && a.cha >= 18 && a.con >= 20) return 'sovereign'
  if (a.dex >= 15 && a.str >= 12 && a.int >= 10 && a.wis < 15) return 'operator'
  if (a.cha >= 15 && a.con >= 15 && a.int < 15) return 'healer'
  return 'wanderer'
}

const CHAR_LEVEL: Record<string, number> = { tier0: 0, tier1: 1, tier2: 2, tier3: 3, tier4: 4 }
const COG_BY_D2: Record<string, number> = { '5_10': 1, '15_20': 2, '30_45': 3, '60_plus': 4 }

export function assignWorldSkin(answers: Answers): { skin: WorldSkin; source: 'g9' | 'g3' | 'wanderer-fallback' } {
  const g9 = answers['G9'] as string | undefined
  if (g9) return { skin: g9 as WorldSkin, source: 'g9' }
  if (answers['G3']) return { skin: 'wanderer', source: 'g3' }
  return { skin: 'wanderer', source: 'wanderer-fallback' }
}

export function computeCogTier(answers: Answers): number {
  const base = COG_BY_D2[answers['D2'] as string] ?? 2
  if (answers['G6'] === 'under3') return 1
  return base
}

const STR_NUMERIC_IDS = ['F4', 'A9']

export function scoreProfile(answers: Answers): ScoreResult {
  const attrs = computeAttributes(answers)
  const { skin, source } = assignWorldSkin(answers)
  const strInputs = STR_NUMERIC_IDS.filter(id => answers[id] != null).length
  return {
    int: attrs.int, wis: attrs.wis, con: attrs.con, dex: attrs.dex, cha: attrs.cha, str: attrs.str,
    charClass: assignClass(attrs),
    charLevel: CHAR_LEVEL[answers['C1'] as string] ?? 0,
    worldSkin: skin,
    worldSkinSource: source,
    cogTier: computeCogTier(answers),
    register: (answers['G8'] as string) ?? 'adaptive',
    sheetLanguage: (answers['G12'] as string) ?? 'ru-tech',
    niche: (answers['F2'] as string) ?? null,
    os: (answers['OS'] as string) ?? null,
    strLowConfidence: strInputs < 2,
    mbti: null,
    relationalStyle: null,
  }
}
