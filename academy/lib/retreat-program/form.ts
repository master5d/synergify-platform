import type { IsoDate } from '../retreat-core/dates'
import { passportFromCalcLink, pickPassport, type RetreatPassport } from '../retreat-core/passport'
import { decodeToolLink, encodeToolLink, type DecodedTool, TOOL_MAX_FRAGMENT } from '../retreat-core/tool-link'
import type { Lang } from '../retreat-calc/engine'
import { defaultBlocks, pickProgramTool, type Block } from './grid'
import { PRACTICE_LIMITS, registryFromJson, registryToJson, starterCards, type PracticeCard } from './practices'
import { defaultForm as timelineDefaultForm } from '../retreat-timeline/form'

export interface ProgramForm { passport: RetreatPassport; blocks: Block[] }
export const PROGRAM_DRAFT_KEY = 'retreat-program:draft'
export const REGISTRY_KEY = 'retreat-program:registry'
export const PROGRAM_PATH = '/instrumenty/konstruktor-programmy/'

export function defaultForm(today: IsoDate): ProgramForm {
  const passport = timelineDefaultForm(today).passport
  return { passport, blocks: defaultBlocks(passport) }
}

export function usedCards(blocks: Block[], registry: PracticeCard[]): PracticeCard[] {
  const ids = new Set(blocks.filter((b) => b.kind === 'practice' && b.practiceId).map((b) => b.practiceId))
  return registry.filter((card) => ids.has(card.id))
}

export function programHash(f: ProgramForm, registry: PracticeCard[]): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(f.passport), tool: pickProgramTool({ blocks: f.blocks, cards: usedCards(f.blocks, registry) }) })
}

export function draftOf(f: ProgramForm): string {
  return JSON.stringify({ passport: pickPassport(f.passport), tool: pickProgramTool({ blocks: f.blocks, cards: [] }) })
}

export function formFromDecoded(d: DecodedTool<{ blocks: Block[]; cards: PracticeCard[] }>, today: IsoDate): { form: ProgramForm; cards: PracticeCard[] } | null {
  if (!d.ok) return null
  const base = defaultForm(today)
  if (d.kind === 'calc') {
    const passport = { ...base.passport, ...passportFromCalcLink(d.calc, today) }
    return { form: { passport, blocks: defaultBlocks(passport) }, cards: [] }
  }
  const passport = { ...base.passport, ...d.link.retreat }
  const blocks = d.link.tool.blocks.length ? d.link.tool.blocks : defaultBlocks(passport)
  return { form: { passport, blocks }, cards: d.link.tool.cards }
}

export function formFromDraft(text: string | null, today: IsoDate): ProgramForm | null {
  if (!text) return null
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    const result = formFromDecoded({ ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(o.passport), tool: pickProgramTool(o.tool) } }, today)
    return result?.form ?? null
  } catch { return null }
}

export function registryFromStorage(text: string | null, lang: Lang): PracticeCard[] {
  if (!text) return starterCards(lang)
  const result = registryFromJson(text)
  return result.error ? starterCards(lang) : result.cards
}

/** Собирает ссылку на конструктор только с паспортом. */

export function programHashFromPassport(p: RetreatPassport): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(p), tool: {} })
}

export { decodeToolLink, registryToJson, TOOL_MAX_FRAGMENT, PRACTICE_LIMITS }
