import { menuSlots, type Slot } from '../retreat-menu/engine'
import type { Meal, RetreatPassport } from '../retreat-core/passport'
import type { Lang } from '../retreat-calc/engine'
import { KIND } from './labels'
import { PRACTICE_LIMITS, pickCard, type Load, type PracticeCard } from './practices'

export type BlockKind = 'practice' | 'meal' | 'free' | 'transfer' | 'other'
export interface Block { day: number; start: string; minutes: number; kind: BlockKind; practiceId?: string; title?: string }
export const MEAL_TIMES: Record<Meal, string> = { breakfast: '08:00', lunch: '13:00', dinner: '19:00' }
export const MEAL_MINUTES = 60
export const DAY_START = '07:00'; export const DAY_END = '22:00'; export const STEP = 30
export const PROGRAM_LIMITS = { blocks: 300, title: 80 } as const
const KINDS: BlockKind[] = ['practice', 'meal', 'free', 'transfer', 'other']
const START = /^\d{2}:\d{2}$/; const ID = /^[a-z0-9-]{1,40}$/

export const toMinutes = (hhmm: string): number => { const [h, m] = hhmm.split(':').map(Number); return h * 60 + m }
export const fromMinutes = (m: number): string => `${String(Math.floor(m / 60)).padStart(2, '0')}:${String(m % 60).padStart(2, '0')}`
export function defaultBlocks(p: RetreatPassport): Block[] { return menuSlots(p).map((slot: Slot) => ({ day: slot.day, start: MEAL_TIMES[slot.meal], minutes: MEAL_MINUTES, kind: 'meal', title: '' })) }
export function blockMinutes(b: Block, card?: PracticeCard): number { return b.minutes > 0 ? b.minutes : card?.groupMinutes ?? card?.pairMinutes ?? 30 }

export type GridIssueId = 'overlap' | 'outside-day' | 'block-outside-retreat' | 'two-high-in-a-row' | 'no-free-time' | 'pair-duration' | 'touch-check-form' | 'high-load-without-contraindications' | 'practice-missing' | 'off-step'
export interface GridIssue { id: GridIssueId; day?: number; start?: string; card?: string }
const ordered = (blocks: Block[]) => [...blocks].sort((a, b) => a.day - b.day || toMinutes(a.start) - toMinutes(b.start))

export function checkGrid(p: RetreatPassport, blocks: Block[], cards: PracticeCard[]): GridIssue[] {
  const byId = new Map(cards.map((card) => [card.id, card])); const list = ordered(blocks); const dayIssues: GridIssue[] = []
  for (const b of list) {
    const start = toMinutes(b.start); const card = b.practiceId ? byId.get(b.practiceId) : undefined
    if (!Number.isFinite(start) || start % STEP !== 0) dayIssues.push({ id: 'off-step', day: b.day, start: b.start })
    if (start < toMinutes(DAY_START) || start + blockMinutes(b, card) > 1440) dayIssues.push({ id: 'outside-day', day: b.day, start: b.start })
    if (b.day < 1 || b.day > (p.nights ?? 0) + 1) dayIssues.push({ id: 'block-outside-retreat', day: b.day, start: b.start })
    if (b.kind === 'practice' && (!b.practiceId || !byId.has(b.practiceId))) dayIssues.push({ id: 'practice-missing', day: b.day, start: b.start })
  }
  const maxEnd = new Map<number, number>()
  for (const current of list) {
    const start = toMinutes(current.start)
    const end = start + blockMinutes(current, current.practiceId ? byId.get(current.practiceId) : undefined)
    const previousMaxEnd = maxEnd.get(current.day)
    if (previousMaxEnd !== undefined && start < previousMaxEnd) dayIssues.push({ id: 'overlap', day: current.day, start: current.start })
    maxEnd.set(current.day, Math.max(previousMaxEnd ?? Number.NEGATIVE_INFINITY, end))
  }
  const days = new Map<number, Block[]>(); for (const b of list) days.set(b.day, [...(days.get(b.day) ?? []), b])
  for (const [day, dayBlocks] of days) {
    let high = false
    for (const b of dayBlocks) {
      if (b.kind === 'free' || b.kind === 'meal' || (b.kind === 'practice' && byId.get(b.practiceId ?? '')?.load !== 'high')) high = false
      else if (b.kind === 'practice' && b.practiceId && byId.get(b.practiceId)?.load === 'high') { if (high) dayIssues.push({ id: 'two-high-in-a-row', day, start: b.start }); high = true }
    }
  }
  for (let day = 2; day <= (p.nights ?? 0); day++) if (!days.get(day)?.some((b) => b.kind === 'free')) dayIssues.push({ id: 'no-free-time', day })
  const issues = dayIssues.sort((a, b) => (a.day ?? 0) - (b.day ?? 0) || toMinutes(a.start ?? '00:00') - toMinutes(b.start ?? '00:00'))
  const seen = new Set<string>(); const appearances = new Map<string, Block[]>()
  for (const b of list) {
    if (b.kind !== 'practice' || !b.practiceId) continue
    const card = byId.get(b.practiceId); if (!card) continue
    appearances.set(card.id, [...(appearances.get(card.id) ?? []), b])
  }
  for (const [id, usedBlocks] of appearances) {
    const card = byId.get(id)!; if (seen.has(card.id)) continue; seen.add(card.id)
    if (card.format === 'pair' && card.groupMinutes === null && usedBlocks.some((b) => b.minutes <= 0)) issues.push({ id: 'pair-duration', card: card.id })
    if (card.load === 'high' && !card.contraindications.trim()) issues.push({ id: 'high-load-without-contraindications', card: card.id })
    if (card.touch) issues.push({ id: 'touch-check-form', card: card.id })
  }
  return issues
}

const LOADS: Load[] = ['low', 'medium', 'high']
export function dayLoad(day: number, blocks: Block[], cards: PracticeCard[]): Load | null { const byId = new Map(cards.map((c) => [c.id, c])); let best = -1; for (const b of blocks) if (b.day === day && b.kind === 'practice' && b.practiceId) { const load = byId.get(b.practiceId)?.load; if (load) best = Math.max(best, LOADS.indexOf(load)) }; return best < 0 ? null : LOADS[best] }
export function freeMinutes(day: number, blocks: Block[], cards: PracticeCard[] = []): number {
  const byId = new Map(cards.map((card) => [card.id, card]))
  return blocks.filter((b) => b.day === day && b.kind === 'free').reduce((sum, b) => sum + blockMinutes(b, b.practiceId ? byId.get(b.practiceId) : undefined), 0)
}
export function blockTitle(b: Block, cards: PracticeCard[], lang: Lang): string { return cards.find((c) => c.id === b.practiceId)?.name || b.title || KIND[lang][b.kind] }

export function pickProgramTool(raw: unknown): { blocks: Block[]; cards: PracticeCard[] } {
  if (!raw || typeof raw !== 'object' || Array.isArray(raw)) return { blocks: [], cards: [] }
  const o = raw as Record<string, unknown>; const blocks: Block[] = []
  if (Array.isArray(o.blocks)) for (const value of o.blocks) {
    if (!value || typeof value !== 'object' || Array.isArray(value)) continue; const b = value as Record<string, unknown>
    if (!Number.isInteger(b.day) || (b.day as number) < 1 || (b.day as number) > 60 || typeof b.start !== 'string' || !START.test(b.start) || ![0, 30].includes(Number(b.start.slice(3)))) continue
    if (!Number.isInteger(b.minutes) || (b.minutes as number) < 0 || (b.minutes as number) > 600 || !KINDS.includes(b.kind as BlockKind)) continue
    const item: Block = { day: b.day as number, start: b.start, minutes: b.minutes as number, kind: b.kind as BlockKind }
    if (typeof b.practiceId === 'string' && ID.test(b.practiceId)) item.practiceId = b.practiceId
    if (typeof b.title === 'string') item.title = b.title.slice(0, PROGRAM_LIMITS.title)
    blocks.push(item); if (blocks.length >= PROGRAM_LIMITS.blocks) break
  }
  const cards: PracticeCard[] = []; const ids = new Set<string>()
  if (Array.isArray(o.cards)) for (const value of o.cards) { const card = pickCard(value); if (card && !ids.has(card.id)) { cards.push(card); ids.add(card.id) }; if (cards.length >= PRACTICE_LIMITS.cards) break }
  return { blocks, cards }
}
