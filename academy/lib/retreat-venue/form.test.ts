import { describe, expect, it } from 'vitest'
import { decodeLink } from '../retreat-calc/link'
import { decodeToolLink } from '../retreat-core/tool-link'
import { defaultVenue, type VenueYear } from './engine'
import {
  calcHrefForMonth,
  defaultVenueForm,
  draftOf,
  draftWorthKeeping,
  formFromDraft,
  pickVenueTool,
  venueFromDecoded,
  venueHash,
  venueHashFromPassport,
} from './form'

describe('retreat venue form', () => {
  it('round-trips a venue link', () => {
    const f = { venue: defaultVenue(), currency: 'EUR', title: 'Lake' }
    expect(venueFromDecoded(decodeToolLink(venueHash(f), pickVenueTool, 'ru'))).toEqual({ form: f, linkHasVenue: true })
  })

  it('keeps only the venue allowlist and defaults invalid values', () => {
    const raw = {
      ...defaultVenue(),
      extra: 1,
      rateCents: -1,
      taxPct: 150,
      months: Array.from({ length: 12 }, () => ({ ...defaultVenue().months[0], extra: true })),
    }
    const picked = pickVenueTool(raw) as VenueYear
    expect((picked as unknown as Record<string, unknown>).extra).toBeUndefined()
    expect((picked.months[0] as unknown as Record<string, unknown>).extra).toBeUndefined()
    expect(picked.rateCents).toBe(defaultVenue().rateCents)
    expect(picked.taxPct).toBe(defaultVenue().taxPct)
    expect(pickVenueTool({ ...raw, months: Array.from({ length: 13 }, () => defaultVenue().months[0]) })).toBeNull()
  })

  it('opens a neighbour link with passport data and an empty venue', () => {
    const decoded = decodeToolLink(venueHashFromPassport({ currency: 'EUR', title: 'X' }), pickVenueTool, 'ru')
    expect(venueFromDecoded(decoded)).toEqual({ form: { venue: defaultVenue(), currency: 'EUR', title: 'X' }, linkHasVenue: false })
  })

  it('passes the selected month to the calculator', () => {
    const venue = defaultVenue()
    venue.deal = 'buyout'
    venue.rateCents = 50000
    venue.months[2].rateCents = 70000
    venue.months[2].groupGuests = 9
    const result = decodeLink(calcHrefForMonth({ venue, currency: 'USD', title: 'X' }, 3, 'ru').split('#')[1], 'ru')
    expect(result.ok && result.data.venue?.ratePerGuest).toBe(700)
    expect(result.ok && result.data.nights).toBe(7)
    expect(result.ok && result.data.guests).toBe(9)
    expect(result.ok && result.data.venue?.model).toBe('buyout')
    venue.months[2].rateCents = null
    const generalRate = decodeLink(calcHrefForMonth({ venue, currency: 'USD', title: 'X' }, 3, 'ru').split('#')[1], 'ru')
    expect(generalRate.ok && generalRate.data.venue?.ratePerGuest).toBe(500)
  })

  it('keeps only a valuable draft with a different title', () => {
    const base = defaultVenueForm()
    const same = { ...base, venue: { ...base.venue, units: 8 }, title: 'X' }
    expect(draftWorthKeeping(draftOf(base), { ...base, title: 'X' })).toBe(false)
    expect(draftWorthKeeping(draftOf(same), { ...base, title: 'X' })).toBe(false)
    expect(draftWorthKeeping(draftOf(same), { ...base, title: 'Y' })).toBe(true)
    expect(draftWorthKeeping(null, base)).toBe(false)
  })

  it('keeps an untitled draft when the link is untitled too', () => {
    const base = defaultVenueForm()
    const own = { ...base, venue: { ...base.venue, units: 8 } }
    const linked = { ...base, venue: { ...base.venue, units: 4 } }
    expect(draftWorthKeeping(draftOf(own), linked)).toBe(true)
  })

  it('serializes drafts and rejects rubbish', () => {
    const f = { ...defaultVenueForm(), title: 'Draft' }
    expect(formFromDraft(draftOf(f))).toEqual(f)
    expect(formFromDraft('not json')).toBeNull()
  })
})
