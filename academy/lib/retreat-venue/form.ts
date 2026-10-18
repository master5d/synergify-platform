import type { Lang } from '../retreat-calc/engine'
import { decodeLink, encodeLink } from '../retreat-calc/link'
import { encodeToolLink, type DecodedTool } from '../retreat-core/tool-link'
import { pickPassport, type RetreatPassport } from '../retreat-core/passport'
import { CALC_PATH, localePath } from '../retreat-timeline/form'
import { defaultVenue, VENUE_LIMITS, type DealModel, type MonthInput, type VenueType, type VenueYear } from './engine'

export const VENUE_DRAFT_KEY = 'retreat-venue:draft'
export const VENUE_PREV_KEY = 'retreat-venue:draft-before-link'
export const VENUE_PATH = '/instrumenty/god-ploshchadki/'

export interface VenueForm {
  venue: VenueYear
  currency: string
  title: string
}

export function defaultVenueForm(): VenueForm {
  return { venue: defaultVenue(), currency: 'USD', title: '' }
}

const int = (v: unknown, max: number): v is number => typeof v === 'number' && Number.isInteger(v) && v >= 0 && v <= max
const money = (v: unknown): v is number => int(v, VENUE_LIMITS.moneyCents)
const pct = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v) && v >= 0 && v <= 100
const pickMonth = (raw: unknown): MonthInput => {
  const d = defaultVenue().months[0]
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return d
  const o = raw as Record<string, unknown>
  return {
    open: typeof o.open === 'boolean' ? o.open : d.open,
    retreatWeeks: int(o.retreatWeeks, VENUE_LIMITS.weeks) ? (o.retreatWeeks as number) : d.retreatWeeks,
    groupGuests: int(o.groupGuests, VENUE_LIMITS.units) ? (o.groupGuests as number) : d.groupGuests,
    rateCents: o.rateCents === null ? null : money(o.rateCents) ? (o.rateCents as number) : d.rateCents,
    nightlyOccupancyPct: pct(o.nightlyOccupancyPct) ? (o.nightlyOccupancyPct as number) : d.nightlyOccupancyPct,
    gapDays: int(o.gapDays, 31) ? (o.gapDays as number) : d.gapDays,
  }
}

export function pickVenueTool(raw: unknown): VenueYear | null {
  if (typeof raw !== 'object' || raw === null || Array.isArray(raw)) return null
  const d = defaultVenue()
  const o = raw as Record<string, unknown>
  if (!Array.isArray(o.months) || o.months.length !== 12) return null
  const field = <T>(key: string, valid: (v: unknown) => v is T, fallback: T): T => (valid(o[key]) ? (o[key] as T) : fallback)
  const venue: VenueYear = {
    type: field<VenueType>('type', (v): v is VenueType => v === 'all-season' || v === 'seasonal', d.type),
    units: field('units', (v): v is number => int(v, VENUE_LIMITS.units), d.units),
    groupBeds: field('groupBeds', (v): v is number => int(v, VENUE_LIMITS.units), d.groupBeds),
    nightPriceCents: field('nightPriceCents', money, d.nightPriceCents),
    deal: field<DealModel>('deal', (v): v is DealModel => v === 'full_campus' || v === 'per_guest' || v === 'buyout', d.deal),
    rateCents: field('rateCents', money, d.rateCents),
    minGuests: field('minGuests', (v): v is number => int(v, VENUE_LIMITS.units), d.minGuests),
    buyoutFeeCents: field('buyoutFeeCents', money, d.buyoutFeeCents),
    varPerGuestWeekCents: field('varPerGuestWeekCents', money, d.varPerGuestWeekCents),
    varPerNightCents: field('varPerNightCents', money, d.varPerNightCents),
    fixedOpenMonthCents: field('fixedOpenMonthCents', money, d.fixedOpenMonthCents),
    fixedClosedMonthCents: field('fixedClosedMonthCents', money, d.fixedClosedMonthCents),
    insuranceCents: field('insuranceCents', money, d.insuranceCents),
    replacementReserveCents: field('replacementReserveCents', money, d.replacementReserveCents),
    taxPct: field('taxPct', pct, d.taxPct),
    debtServiceCents: field('debtServiceCents', money, d.debtServiceCents),
    seasonOpenCents: field('seasonOpenCents', money, d.seasonOpenCents),
    seasonCloseCents: field('seasonCloseCents', money, d.seasonCloseCents),
    investmentCents: field('investmentCents', money, d.investmentCents),
    borrowedCents: field('borrowedCents', money, d.borrowedCents),
    months: o.months.map(pickMonth),
  }
  return venue
}

export function venueHash(f: VenueForm): string {
  return encodeToolLink({ v: 1, retreat: { currency: f.currency, title: f.title }, tool: f.venue })
}

export function venueFromDecoded(d: DecodedTool<VenueYear | null>): { form: VenueForm; linkHasVenue: boolean } | null {
  if (!d.ok || d.kind !== 'tool') return null
  const tool = d.link.tool
  return {
    form: { venue: tool ?? defaultVenue(), currency: d.link.retreat.currency ?? 'USD', title: d.link.retreat.title ?? '' },
    linkHasVenue: Boolean(tool),
  }
}

export function draftOf(f: VenueForm): string {
  return JSON.stringify(f)
}
export function formFromDraft(text: string | null): VenueForm | null {
  if (!text) return null
  try {
    const o = JSON.parse(text) as Record<string, unknown>
    const venue = pickVenueTool(o.venue)
    if (!venue) return null
    return {
      venue,
      currency: typeof o.currency === 'string' && /^[A-Z]{3}$/.test(o.currency) ? o.currency : 'USD',
      title: typeof o.title === 'string' ? o.title : '',
    }
  } catch {
    return null
  }
}
export function draftWorthKeeping(saved: string | null, fromLink: VenueForm): boolean {
  const draft = formFromDraft(saved)
  return Boolean(
    draft && draftOf(draft) !== draftOf(fromLink) && draftOf(draft) !== draftOf(defaultVenueForm()) && !(draft.title && draft.title === fromLink.title),
  )
}

export function calcHrefForMonth(f: VenueForm, month: number, lang: Lang): string {
  const m = f.venue.months[month - 1]
  return `${localePath(CALC_PATH, lang)}#data=${encodeLink({
    v: 1,
    currency: f.currency,
    title: f.title,
    nights: 7,
    guests: m.groupGuests,
    venue: {
      model: f.venue.deal,
      ratePerGuest: (m.rateCents ?? f.venue.rateCents) / 100,
      capacity: f.venue.groupBeds,
      minGuests: f.venue.minGuests,
      buyoutFee: f.venue.buyoutFeeCents / 100,
    },
  }).slice(6)}`
}

export function venueHashFromPassport(p: RetreatPassport): string {
  return encodeToolLink({ v: 1, retreat: pickPassport(p), tool: {} })
}
