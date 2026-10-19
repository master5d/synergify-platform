import { describe, expect, it } from 'vitest'
import { join } from 'node:path'
import { readFileSync } from 'node:fs'
import { computeYear, defaultVenue, type VenueYear } from './engine'
import { parseCsv, separatorFor } from '../retreat-core/csv'
import { menuMoney } from '../retreat-menu/export'
import { venueHeader, venueRows, venueToCsv } from './export'

function templateHeader(lang: 'ru' | 'en'): string[] {
  const path = join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'public', 'retreat-materials', `venue-year.${lang}.csv`)
  return parseCsv(readFileSync(path, 'utf8').replace(/^\uFEFF/, ''))[0]
}

function sample(): VenueYear {
  const v = defaultVenue()
  v.units = 10
  v.groupBeds = 20
  v.rateCents = 123_450
  v.nightPriceCents = 10_000
  v.varPerGuestWeekCents = 1_000
  v.varPerNightCents = 100
  v.fixedOpenMonthCents = 20_000
  v.fixedClosedMonthCents = 7_000
  v.insuranceCents = 12_000
  v.replacementReserveCents = 3_000
  v.taxPct = 10
  v.debtServiceCents = 5_000
  v.investmentCents = 1_000_000
  v.months[0] = { open: true, retreatWeeks: 1, groupGuests: 10, rateCents: null, nightlyOccupancyPct: 50, gapDays: 1 }
  return v
}

describe('venue CSV export', () => {
  it('matches the RU and EN course template headers', () => {
    expect(venueHeader('ru')).toEqual(templateHeader('ru'))
    expect(venueHeader('en')).toEqual(templateHeader('en'))
  })

  it('starts with BOM and uses the locale separator', () => {
    expect(venueToCsv(sample(), 'ru').startsWith('\uFEFF')).toBe(true)
    expect(venueToCsv(sample(), 'ru').split('\r\n')[0].includes(separatorFor('ru'))).toBe(true)
    expect(venueToCsv(sample(), 'en').split('\r\n')[0].includes(separatorFor('en'))).toBe(true)
  })

  it('has twelve named month rows followed by Year', () => {
    const rows = venueRows(sample(), 'en')
    expect(rows.slice(1, 13).map((row) => row[0])).toEqual([
      'January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December',
    ])
    expect(rows[13][0]).toBe('Year')
    const ru = venueRows(sample(), 'ru')
    expect(ru[1][0]).toBe('Январь')
    expect(ru[12][0]).toBe('Декабрь')
    expect(ru[13][0]).toBe('Год')
  })

  it('sums monthly totals into the Year total', () => {
    const rows = venueRows(sample(), 'en')
    const cents = (value: string) => Math.round(Number(value) * 100)
    expect(rows.slice(1, 13).reduce((sum, row) => sum + cents(row[10]), 0)).toBe(cents(rows[13][10]))
  })

  it('keeps a closed seasonal month at zero revenue with closed fixed costs', () => {
    const v = sample()
    v.type = 'seasonal'
    v.fixedClosedMonthCents = 7_000
    v.months[0] = { open: false, retreatWeeks: 0, groupGuests: 0, rateCents: null, nightlyOccupancyPct: 0, gapDays: 1 }
    const row = venueRows(v, 'en')[1]
    expect(row[1]).toBe('0')
    expect(row[2]).toBe('0')
    expect(row[4]).toBe('0')
    expect(row[7]).toBe('0')
    expect(row[8]).toBe('0')
    expect(row[9]).toBe(menuMoney(7_000, 'en'))
  })

  it('prints the no-payback label when the result is non-positive', () => {
    const v = defaultVenue()
    v.investmentCents = 100_000
    const rows = venueRows(v, 'ru')
    expect(rows.find((row) => row[0] === 'Окупаемость проекта, лет')?.[1]).toBe('не окупается')
    expect(rows.find((row) => row[0] === 'Окупаемость своих денег, лет')?.[1]).toBe('не окупается')
    const en = venueRows(v, 'en')
    expect(en.find((row) => row[0] === 'Project payback, years')?.[1]).toBe('does not pay back')
    expect(en.find((row) => row[0] === 'Payback of own money, years')?.[1]).toBe('does not pay back')
  })

  it('says «no investment» instead of 0.0 years when nothing is invested or all of it is borrowed', () => {
    const v = defaultVenue()
    v.rateCents = 100_000
    v.months[0] = { open: true, retreatWeeks: 1, groupGuests: 10, rateCents: null, nightlyOccupancyPct: 0, gapDays: 1 }
    const ru = venueRows(v, 'ru')
    expect(ru.find((row) => row[0] === 'Окупаемость проекта, лет')?.[1]).toBe('нет вложений')
    expect(ru.find((row) => row[0] === 'Окупаемость своих денег, лет')?.[1]).toBe('нет вложений')
    v.investmentCents = 3_500_000
    v.borrowedCents = 3_500_000
    const en = venueRows(v, 'en')
    expect(en.find((row) => row[0] === 'Project payback, years')?.[1]).toBe('3.5')
    expect(en.find((row) => row[0] === 'Payback of own money, years')?.[1]).toBe('no investment')
  })

  it('writes a positive payback as a bare number with one decimal', () => {
    const v = defaultVenue()
    v.rateCents = 100_000
    v.investmentCents = 3_500_000
    v.months[0] = { open: true, retreatWeeks: 1, groupGuests: 10, rateCents: null, nightlyOccupancyPct: 0, gapDays: 1 }
    // выручка 10 × 1 000 = 10 000, расходов нет: окупаемость 35 000 ÷ 10 000 = 3,5 года
    expect(venueRows(v, 'ru').find((row) => row[0] === 'Окупаемость проекта, лет')?.[1]).toBe('3,5')
    expect(venueRows(v, 'en').find((row) => row[0] === 'Project payback, years')?.[1]).toBe('3.5')
  })

  it('uses menuMoney for locale-specific money formatting', () => {
    expect(menuMoney(123_450, 'ru')).toBe('1234,50')
    expect(menuMoney(123_450, 'en')).toBe('1234.50')
    expect(menuMoney(100_000, 'ru')).toBe('1000')
    expect(menuMoney(100_000, 'en')).toBe('1000')
    expect(venueRows(sample(), 'ru')[1][3]).toBe('1234,50')
    expect(venueRows(sample(), 'en')[1][3]).toBe('1234.50')
  })

  it('throws when borrowed money exceeds the investment', () => {
    const v = defaultVenue()
    v.investmentCents = 100
    v.borrowedCents = 101
    expect(() => venueToCsv(v, 'en')).toThrow('borrowedCents')
  })

  it('uses the computed annual totals for the summary rows', () => {
    const v = sample()
    const result = computeYear(v)
    const rows = venueRows(v, 'en')
    expect(rows.find((row) => row[0] === 'Revenue for the year')?.[1]).toBe(menuMoney(result.revenueCents, 'en'))
    expect(rows.find((row) => row[0] === 'Tax')?.[1]).toBe(menuMoney(result.taxCents, 'en'))
  })
})
