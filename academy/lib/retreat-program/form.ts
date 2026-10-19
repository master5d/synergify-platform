import type { IsoDate } from '../retreat-core/dates'
import { passportFromCalcLink, pickPassport, type RetreatPassport } from '../retreat-core/passport'
import { decodeToolLink, encodeToolLink, type DecodedTool, TOOL_MAX_FRAGMENT } from '../retreat-core/tool-link'
import type { Lang } from '../retreat-calc/engine'
import { defaultBlocks, pickProgramTool, type Block } from './grid'
import { PRACTICE_LIMITS, registryFromJson, registryToJson, starterCards, type PracticeCard } from './practices'
import { defaultForm as timelineDefaultForm } from '../retreat-timeline/form'

export interface ProgramForm { passport: RetreatPassport; blocks: Block[] }
export const programDraftKey = (lang: Lang) => `retreat-program:draft:${lang}`
export const programPrevKey = (lang: Lang) => `retreat-program:draft-before-link:${lang}`
export const LEGACY_PROGRAM_DRAFT_KEY = 'retreat-program:draft'
export const LEGACY_PROGRAM_PREV_KEY = 'retreat-program:draft-before-link'
export const REGISTRY_KEY = 'retreat-program:registry'
export const registryKey = (lang: Lang) => `${REGISTRY_KEY}:${lang}`
export const PROGRAM_PATH = '/instrumenty/konstruktor-programmy/'

export interface DraftStorage {
  getItem: (key: string) => string | null
  setItem: (key: string, value: string) => void
  removeItem: (key: string) => void
}

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

/** Карточки для черновика: только пришедшие по ссылке и отсутствующие в реестре языка. Карточку реестра черновик не хранит,
 * иначе удалённая из реестра карточка возвращалась бы после перезагрузки как «из ссылки». */
export function draftCardsOf(linkedCards: PracticeCard[], registry: PracticeCard[]): PracticeCard[] {
  return linkedCards.filter((item) => !registry.some((card) => card.id === item.id))
}

export function draftOf(f: ProgramForm, cards: PracticeCard[] = []): string {
  return JSON.stringify({ passport: pickPassport(f.passport), tool: pickProgramTool({ blocks: f.blocks, cards: usedCards(f.blocks, cards) }) })
}

export function formFromDecoded(
  d: DecodedTool<{ blocks: Block[]; cards: PracticeCard[] }>,
  today: IsoDate,
): { form: ProgramForm; cards: PracticeCard[]; linkHasBlocks: boolean } | null {
  if (!d.ok) return null
  const base = defaultForm(today)
  if (d.kind === 'calc') {
    const passport = { ...base.passport, ...passportFromCalcLink(d.calc, today) }
    return { form: { passport, blocks: defaultBlocks(passport) }, cards: [], linkHasBlocks: false }
  }
  const passport = { ...base.passport, ...d.link.retreat }
  const blocks = d.link.tool.blocks.length ? d.link.tool.blocks : defaultBlocks(passport)
  return { form: { passport, blocks }, cards: d.link.tool.cards, linkHasBlocks: d.link.tool.blocks.length > 0 }
}

export function formFromDraft(text: string | null, today: IsoDate): ProgramForm | null {
  return formAndCardsFromDraft(text, today)?.form ?? null
}

export function formAndCardsFromDraft(text: string | null, today: IsoDate): { form: ProgramForm; cards: PracticeCard[] } | null {
  if (!text) return null
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    const tool = pickProgramTool(o.tool)
    const result = formFromDecoded({ ok: true, kind: 'tool', link: { v: 1, retreat: pickPassport(o.passport), tool } }, today)
    return result ? { form: result.form, cards: result.cards } : null
  } catch { return null }
}

export function migrateLegacy(storage: DraftStorage, lang: Lang, kind: 'draft' | 'previous'): string | null {
  const languageKey = kind === 'draft' ? programDraftKey(lang) : programPrevKey(lang)
  const legacyKey = kind === 'draft' ? LEGACY_PROGRAM_DRAFT_KEY : LEGACY_PROGRAM_PREV_KEY
  const languageValue = storage.getItem(languageKey)
  if (languageValue !== null) return languageValue
  const legacyValue = storage.getItem(legacyKey)
  if (legacyValue === null) return null
  storage.setItem(languageKey, legacyValue)
  storage.removeItem(legacyKey)
  return legacyValue
}

export function registryFromStorage(text: string | null, lang: Lang): PracticeCard[] {
  if (!text) return starterCards(lang)
  const result = registryFromJson(text)
  return result.error ? starterCards(lang) : result.cards
}

export function restoreStarter(own: PracticeCard[], lang: Lang): PracticeCard[] {
  return [...own, ...starterCards(lang).filter((starter) => !own.some((card) => card.id === starter.id))]
}

export function withDraftBlocks(fromLink: ProgramForm, draft: ProgramForm | null, linkHasBlocks: boolean): ProgramForm {
  if (linkHasBlocks || !draft) return fromLink
  // блоки — из черновика, еда — под паспорт ссылки (больше ночей, другие приёмы заезда и выезда)
  return { ...fromLink, blocks: draft.blocks.length ? reconcileMeals(draft.blocks, draft.passport, fromLink.passport) : defaultBlocks(fromLink.passport) }
}

export function draftWorthKeeping(saved: string | null, fromLink: ProgramForm, today: IsoDate): boolean {
  const draft = formFromDraft(saved, today)
  if (!draft || draftOf(draft) === draftOf(fromLink)) return false
  // черновик с тем же названием, что в ссылке, — это та же учебная неделя (урок u1, потом u2): её не откладываем,
  // иначе она перезаписала бы уже отложенную настоящую программу ведущего
  if (draft.passport.title && draft.passport.title === fromLink.passport.title) return false
  const defaultSignatures = new Set(defaultBlocks(draft.passport).map((b) => JSON.stringify(b)))
  return draft.blocks.some((block) => !defaultSignatures.has(JSON.stringify(block)))
}

export function reconcileMeals(blocks: Block[], before: RetreatPassport, after: RetreatPassport): Block[] {
  const oldDefaults = defaultBlocks(before); const nextDefaults = defaultBlocks(after)
  const byDay = (items: Block[]) => new Map<number, Block[]>(items.map((b) => [b.day, items.filter((item) => item.day === b.day)]))
  const oldByDay = byDay(oldDefaults); const nextByDay = byDay(nextDefaults); const result = [...blocks]
  for (const day of new Set([...oldByDay.keys(), ...nextByDay.keys()])) {
    const oldMeals = oldByDay.get(day) ?? []; const nextMeals = nextByDay.get(day) ?? []
    // еда дня по умолчанию не изменилась (например, правили название) — блоки не трогаем и не переставляем
    if (JSON.stringify(oldMeals) === JSON.stringify(nextMeals)) continue
    const currentMeals = result.filter((b) => b.day === day && b.kind === 'meal')
    const exactOld = currentMeals.length === oldMeals.length && currentMeals.every((b) => oldMeals.some((old) => JSON.stringify(old) === JSON.stringify(b)))
    const newDay = oldMeals.length === 0 && nextMeals.length > 0
    if (!exactOld && !newDay) continue
    result.splice(0, result.length, ...result.filter((b) => !(b.day === day && b.kind === 'meal')), ...nextMeals)
  }
  return result
}

/** Собирает ссылку на конструктор только с паспортом. */

export function programHashFromPassport(p: RetreatPassport): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(p), tool: {} })
}

export { decodeToolLink, registryToJson, TOOL_MAX_FRAGMENT, PRACTICE_LIMITS }
