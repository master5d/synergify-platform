import type { Lang } from '../retreat-calc/engine'
import { gridRows } from '../retreat-program/export'
import { computeMenu } from '../retreat-menu/engine'
import { buildTimeline, type Milestone } from '../retreat-timeline/engine'
import { addDays, type IsoDate } from '../retreat-core/dates'
import { calcAccommodation } from './imports'
import { SECTION_IDS, REQUIRED_SECTIONS, type SectionId } from './sections'
import { sectionLabels } from './labels'
import type { BookletContent, BookletForm } from './form'

interface BaseBlock { title: string }
export type BookletBlock =
  | ({ id: 'cover'; data: { title: string; place: string; start?: IsoDate; end?: IsoDate; dateText: string; nights: number } } & BaseBlock)
  | ({ id: 'pricing'; data: {
    priceCents: number | null; currency: string | null
    depositPct: number | null; depositCents: number | null; balanceDueDays: number | null; balanceDueDate: IsoDate | null
    accommodation: ReturnType<typeof calcAccommodation> | null
  } } & BaseBlock)
  | ({ id: 'food'; data: {
    foodText: string; diets: Record<string, number> | null
    firstFullDay: { breakfast: string; lunch: string; dinner: string } | null
  } } & BaseBlock)
  | ({ id: 'schedule'; data: { gridRows: unknown[] } } & BaseBlock)
  | ({ id: 'days'; data: { day: number; text: string } } & BaseBlock)
  | ({ id: 'payments'; data: { paymentsText: string; milestones: Milestone[] } } & BaseBlock)
  | ({ id: Exclude<SectionId, 'cover' | 'pricing' | 'food' | 'schedule' | 'days' | 'payments'>; data: { content: BookletContent } } & BaseBlock)

const dateLabel = (start: IsoDate | undefined, nights: number, lang: Lang) => {
  if (!start) return ''
  const end = addDays(start, nights); const a = new Date(`${start}T00:00:00Z`); const b = new Date(`${end}T00:00:00Z`)
  const ay = a.getUTCFullYear(); const by = b.getUTCFullYear(); const ad = a.getUTCDate(); const bd = b.getUTCDate()
  const format = new Intl.DateTimeFormat(lang === 'ru' ? 'ru-RU' : 'en-US', { day: 'numeric', month: 'long', timeZone: 'UTC' })
  const part = (date: Date) => format.formatToParts(date).find((x) => x.type === 'month')?.value ?? ''
  const am = part(a); const bm = part(b)
  if (lang === 'ru') return am === bm && ay === by ? `${ad}–${bd} ${am} ${ay}` : ay === by ? `${ad} ${am} – ${bd} ${bm} ${ay}` : `${ad} ${am} ${ay} – ${bd} ${bm} ${by}`
  return am === bm && ay === by ? `${am} ${ad}–${bd}, ${ay}` : ay === by ? `${am} ${ad} – ${bm} ${bd}, ${ay}` : `${am} ${ad}, ${ay} – ${bm} ${bd}, ${by}`
}
const mealText = (cell: { dish: string; side: string; drink: string } | undefined) => cell ? [cell.dish, cell.side, cell.drink].filter(Boolean).join(' · ') : ''

export function bookletModel(form: BookletForm, lang: Lang, today: IsoDate): BookletBlock[] {
  const labels = sectionLabels(lang); const c = form.content; const out: BookletBlock[] = []
  const enabled = (id: SectionId) => form.enabled.includes(id) || REQUIRED_SECTIONS.includes(id)
  const add = (block: BookletBlock) => { if (enabled(block.id)) out.push(block) }
  for (const id of SECTION_IDS) {
    if (id === 'cover') {
      const nights = form.passport.nights ?? 0
      add({ id, title: labels[id], data: { title: form.passport.title ?? '', place: c.place, start: form.passport.start,
        end: form.passport.start ? addDays(form.passport.start, nights) : undefined,
        dateText: dateLabel(form.passport.start, nights, lang), nights } })
    } else if (id === 'schedule') { const p = form.imports.program; add({ id, title: labels[id], data: { gridRows: p ? gridRows(p.retreat, p.blocks, p.cards, lang) : [] } })
    } else if (id === 'food') {
      const m = form.imports.menu; let diets: Record<string, number> | null = null
      let firstFullDay: { breakfast: string; lunch: string; dinner: string } | null = null
      if (m) { diets = computeMenu(m.retreat, m.grid, m.diets).totals as unknown as Record<string, number>; firstFullDay = {
        breakfast: mealText(m.grid['2-breakfast']), lunch: mealText(m.grid['2-lunch']), dinner: mealText(m.grid['2-dinner']) } }
      add({ id, title: labels[id], data: { foodText: c.foodText, diets, firstFullDay } })
    } else if (id === 'pricing') {
      const calc = form.imports.calc; const timeline = form.imports.timeline; const data = calc?.data
      const balanceDays = timeline?.terms.guestBalanceDueDays ?? data?.guestBalanceDueDays ?? null
      const priceCents = data?.price === undefined ? null : Math.round(data.price * 100)
      const depositPct = data?.guestDepositPct ?? timeline?.terms.guestDepositPct ?? null
      const depositCents = data?.guestDeposit === undefined ? null : Math.round(data.guestDeposit * 100)
      const balanceDueDate = form.passport.start && balanceDays !== null ? addDays(form.passport.start, -balanceDays) : null
      const accommodation = data ? calcAccommodation(data) : null
      add({ id, title: labels[id], data: { priceCents, currency: data?.currency ?? null,
        depositPct, depositCents, balanceDueDays: balanceDays,
        balanceDueDate, accommodation } })
    } else if (id === 'payments') {
      const t = form.imports.timeline
      const milestones = t ? buildTimeline(t.retreat, t.terms, today).milestones.filter((x) => x.id === 'guest-balance' || x.id === 'guest-refund-deadline') : []
      add({ id, title: labels[id], data: { paymentsText: c.paymentsText, milestones } })
    } else if (id === 'days') { for (const [i, text] of c.days.entries()) add({ id, title: labels[id], data: { day: i + 1, text } })
    } else add({ id, title: labels[id], data: { content: c } } as BookletBlock)
  }
  return out
}
