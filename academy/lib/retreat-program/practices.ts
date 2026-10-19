import type { Lang } from '../retreat-calc/engine'
import { STARTER } from './starter'
import { findPromises } from './promises'

/** Допустимый формат проведения практики. */
export type Format = 'group' | 'pair' | 'solo'
/** Допустимая нагрузка практики. */
export type Load = 'low' | 'medium' | 'high'
/** Нормализованная карточка практики, пригодная для хранения в реестре. */
export interface PracticeCard {
  id: string; name: string; format: Format
  groupMinutes: number | null; pairMinutes: number | null; groupSize: string
  touch: boolean; touchConsent: string; load: Load; contraindications: string
  guestDoes: string; description: string; needs: string; notPromise: string; source: string
  added: string[]
}
/** Лимиты реестра и отдельных полей карточки. */
export const PRACTICE_LIMITS = { text: 300, short: 80, cards: 200 } as const
type CardField = keyof PracticeCard
const FIELDS: CardField[] = ['id', 'name', 'format', 'groupMinutes', 'pairMinutes', 'groupSize', 'touch', 'touchConsent', 'load', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise', 'source', 'added']
const TEXT_FIELDS: CardField[] = ['touchConsent', 'contraindications', 'guestDoes', 'description', 'needs', 'notPromise', 'source']
const SHORT_FIELDS: CardField[] = ['name', 'groupSize']
const FORMATS: Format[] = ['group', 'pair', 'solo']
const LOADS: Load[] = ['low', 'medium', 'high']

const stringValue = (value: unknown, limit: number) => typeof value === 'string' ? value.trim().slice(0, limit) : ''
const duration = (value: unknown) => value === null || value === undefined ? null : Number.isInteger(value) && (value as number) >= 1 && (value as number) <= 600 ? value as number : null

/** Пустая карточка с безопасными значениями по умолчанию. */
export function emptyCard(id: string): PracticeCard {
  return { id, name: '', format: 'group', groupMinutes: null, pairMinutes: null, groupSize: '', touch: false, touchConsent: '', load: 'low', contraindications: '', guestDoes: '', description: '', needs: '', notPromise: '', source: '', added: [] }
}

export function ownCardId(existing: PracticeCard[], uuid: string): string {
  const seed = uuid.replace(/-/g, '')
  let base = seed.slice(0, 8)
  let attempt = 0
  while (existing.some((card) => card.id === `my-${base}`)) {
    attempt += 1
    base = `${seed.slice(0, 7)}${attempt.toString(36)}`.slice(0, 8)
  }
  return `my-${base}`
}

export function restoreCardAt(registry: PracticeCard[], card: PracticeCard, index: number): PracticeCard[] {
  const next = registry.filter((item) => item.id !== card.id)
  next.splice(Math.min(Math.max(index, 0), next.length), 0, card)
  return next
}

/** Очищает внешнюю карточку по allowlist и лимитам реестра. */
export function pickCard(raw: unknown): PracticeCard | null {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return null
  const input = raw as Record<string, unknown>
  const id = typeof input.id === 'string' ? input.id.trim() : ''
  const name = stringValue(input.name, PRACTICE_LIMITS.short)
  if (!/^[a-z0-9-]{1,40}$/.test(id) || !name) return null
  const card = emptyCard(id)
  card.name = name
  card.format = FORMATS.includes(input.format as Format) ? input.format as Format : 'group'
  card.load = LOADS.includes(input.load as Load) ? input.load as Load : 'low'
  card.groupMinutes = duration(input.groupMinutes)
  card.pairMinutes = duration(input.pairMinutes)
  card.touch = input.touch === true
  for (const field of TEXT_FIELDS) card[field] = stringValue(input[field], PRACTICE_LIMITS.text) as never
  for (const field of SHORT_FIELDS) if (field !== 'name') card[field] = stringValue(input[field], PRACTICE_LIMITS.short) as never
  card.added = Array.isArray(input.added) ? input.added.filter((v): v is string => typeof v === 'string' && FIELDS.includes(v as CardField)) : []
  return card
}

/** Собирает локализованный стартовый набор без потери карточек. */
export function starterCards(lang: Lang): PracticeCard[] {
  return STARTER.map((card) => pickCard({ ...card, name: card.name[lang], groupSize: card.groupSize[lang], touchConsent: card.touchConsent[lang], contraindications: card.contraindications[lang], guestDoes: card.guestDoes[lang], description: card.description[lang], needs: card.needs[lang], notPromise: card.notPromise[lang], source: card.source[lang] })!).filter(Boolean)
}

/** Идентификаторы проверок карточки. */
export type CardIssueId = 'pair-duration' | 'touch-without-consent' | 'high-load-without-contraindications' | 'promise-in-text' | 'no-duration'
/** Найденная проблема карточки и поле, в котором она обнаружена. */
export interface CardIssue { id: CardIssueId; card: string; field?: keyof PracticeCard; match?: string }
/** Проверяет карточку на обязательные ограничения и обещания. */
export function checkCard(card: PracticeCard): CardIssue[] {
  const issues: CardIssue[] = []
  if (card.groupMinutes === null && card.pairMinutes === null) issues.push({ id: 'no-duration', card: card.id })
  else if (card.format === 'pair' && card.groupMinutes === null) issues.push({ id: 'pair-duration', card: card.id })
  if (card.touch && !card.touchConsent.trim()) issues.push({ id: 'touch-without-consent', card: card.id, field: 'touchConsent' })
  if (card.load === 'high' && !card.contraindications.trim()) issues.push({ id: 'high-load-without-contraindications', card: card.id, field: 'contraindications' })
  for (const field of ['name', 'guestDoes', 'description'] as const) for (const match of findPromises(card[field])) issues.push({ id: 'promise-in-text', card: card.id, field, match })
  return issues
}

/** Сериализует карточки в версию реестра. */
export function registryToJson(cards: PracticeCard[]): string { return JSON.stringify({ v: 1, cards }, null, 2) }
/** Безопасно импортирует ограниченный и дедуплицированный реестр. */
export function registryFromJson(text: string): { cards: PracticeCard[]; error?: 'broken' | 'not-registry' } {
  let value: unknown
  try { value = JSON.parse(text) } catch { return { cards: [], error: 'broken' } }
  if (!value || typeof value !== 'object' || (value as Record<string, unknown>).v !== 1 || !Array.isArray((value as Record<string, unknown>).cards)) return { cards: [], error: 'not-registry' }
  const cards: PracticeCard[] = []; const ids = new Set<string>()
  for (const raw of (value as { cards: unknown[] }).cards) {
    const card = pickCard(raw)
    if (card && !ids.has(card.id) && cards.length < PRACTICE_LIMITS.cards) { cards.push(card); ids.add(card.id) }
  }
  return { cards }
}

function equal(a: PracticeCard, b: PracticeCard): boolean {
  const left = pickCard(a); const right = pickCard(b)
  return left !== null && right !== null && JSON.stringify(left) === JSON.stringify(right)
}
function renamedId(id: string, n: number, used: Set<string>): string | null {
  const suffix = `-${n}`; const base = id.slice(0, 40 - suffix.length); const candidate = `${base}${suffix}`
  return candidate.length <= 40 && !used.has(candidate) ? candidate : null
}
/** Объединяет реестры, переименовывая конфликтующие разные карточки. */
export function mergeRegistry(own: PracticeCard[], incoming: PracticeCard[]): { cards: PracticeCard[]; renamed: string[] } {
  const cards = [...own]; const used = new Set(cards.map((card) => card.id)); const renamed: string[] = []
  for (const card of incoming) {
    const existing = cards.find((item) => item.id === card.id)
    if (!existing) { cards.push(card); used.add(card.id); continue }
    if (equal(existing, card)) continue
    let n = 2; let id: string | null
    do { id = renamedId(card.id, n++, used) } while (!id)
    cards.push({ ...card, id }); used.add(id); renamed.push(card.id)
  }
  return { cards, renamed }
}
