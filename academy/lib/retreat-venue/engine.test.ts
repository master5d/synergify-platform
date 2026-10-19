import { describe, expect, it } from 'vitest'
import { checkVenue, computeYear, defaultVenue, retreatRevenue, validateVenue, type VenueYear } from './engine'

function venue(over: Partial<VenueYear> = {}): VenueYear {
  return { ...defaultVenue(), units: 6, groupBeds: 12, nightPriceCents: 10_000, rateCents: 100_000, ...over }
}

function month(over: Partial<VenueYear['months'][number]> = {}) {
  return { open: true, retreatWeeks: 0, groupGuests: 0, offsiteGuests: 0, rateCents: null, nightlyOccupancyPct: 0, gapDays: 1, ...over }
}

describe('годовая модель площадки', () => {
  it('считает ретритные и посуточные ночи и загрузку января', () => {
    const v = venue({ months: [month({ retreatWeeks: 1, groupGuests: 12, nightlyOccupancyPct: 50 }), ...venue().months.slice(1)] })
    const r = computeYear(v).months[0]
    expect(r.retreatNights).toBe(7 * 6)
    expect(r.gapNights).toBe(6)
    expect(r.nightlyNights).toBe(Math.round((31 - 8) * 6 * 0.5))
    expect(r.occupancyPct).toBe(59.7)
  })

  it('помечает февраль, если четыре недели с промежутками не помещаются', () => {
    const v = venue({ months: [month(), month({ retreatWeeks: 4, groupGuests: 12 }), ...venue().months.slice(2)] })
    const r = computeYear(v).months[1]
    expect(r.nightlyNights).toBe(0)
    expect(checkVenue(v)).toContainEqual({ id: 'weeks-overflow', month: 2 })
  })

  it('считает full_campus по местам площадки', () => {
    expect(retreatRevenue(venue({ deal: 'full_campus' }), 1, 100_000)).toBe(100_000 * 12)
  })
  it('считает per_guest не ниже минимума', () => {
    expect(retreatRevenue(venue({ deal: 'per_guest', minGuests: 14 }), 12, 100_000)).toBe(100_000 * 14)
  })
  it('считает buyout со взносом и ставкой за гостей', () => {
    expect(retreatRevenue(venue({ deal: 'buyout', buyoutFeeCents: 300_000 }), 12, 100_000)).toBe(300_000 + 100_000 * 12)
  })

  it('считает NOI налог денежный итог доходность и окупаемость', () => {
    const v = venue({ investmentCents: 1_000_000, borrowedCents: 200_000, taxPct: 10, debtServiceCents: 50_000,
      insuranceCents: 20_000, replacementReserveCents: 30_000,
      months: [month({ retreatWeeks: 1, groupGuests: 12 }), ...venue().months.slice(1)] })
    const r = computeYear(v)
    const monthResult = 100_000 * 12 - 0 - 6 * 0 - 0
    const expectedNoi = monthResult - 20_000 - 30_000
    const expectedTax = Math.round(expectedNoi * 10 / 100)
    expect(r.noiCents).toBe(expectedNoi)
    expect(r.taxCents).toBe(expectedTax)
    expect(r.ownerCashCents).toBe(expectedNoi - expectedTax - 50_000)
    expect(r.yieldPct).toBe(expectedNoi / 1_000_000 * 100)
    expect(r.paybackYears).toBe(1_000_000 / (expectedNoi - expectedTax))
    expect(r.ownPaybackYears).toBe((1_000_000 - 200_000) / (expectedNoi - expectedTax - 50_000))
  })

  it('возвращает null для окупаемости при отрицательном результате', () => {
    const v = venue({ investmentCents: 100_000, debtServiceCents: 100_000, fixedOpenMonthCents: 200_000 })
    const r = computeYear(v)
    expect(r.paybackYears).toBeNull()
    expect(r.ownPaybackYears).toBeNull()
  })

  it('окупаемость проекта есть, своих денег — нет, когда долг съедает весь денежный итог', () => {
    const v = venue({ investmentCents: 1_000_000, debtServiceCents: 2_000_000,
      months: [month({ retreatWeeks: 1, groupGuests: 12 }), ...venue().months.slice(1)] })
    const r = computeYear(v)
    expect(r.paybackYears).toBe(1_000_000 / (100_000 * 12))
    expect(r.ownPaybackYears).toBeNull()
  })

  it('при нулевом операционном доходе окупаемости нет', () => {
    expect(computeYear(venue({ investmentCents: 1 })).paybackYears).toBeNull()
  })

  it('checkVenue не бросает на сезонной площадке с ошибкой ввода', () => {
    const v = venue({ type: 'seasonal', borrowedCents: 11, investmentCents: 10 })
    expect(() => checkVenue(v)).not.toThrow()
  })

  it('проверяет заёмные деньги и ровно двенадцать месяцев', () => {
    expect(validateVenue(venue({ investmentCents: 10, borrowedCents: 11 }), 'ru')).toContain('borrowedCents: не может быть больше, чем «investmentCents»')
    expect(validateVenue({ ...venue(), months: [] }, 'ru')).toContain('months: ожидалось ровно 12 месяцев')
  })

  it('не даёт выручку закрытому месяцу и показывает проблемы сезонной площадки', () => {
    const months = venue().months.map((m, i) => i === 0 ? month({ open: false, retreatWeeks: 1, groupGuests: 12 }) : m)
    const v = venue({ type: 'seasonal', fixedClosedMonthCents: 0, months })
    expect(computeYear(v).months[0].retreatRevenueCents).toBe(0)
    expect(checkVenue(v)).toEqual(expect.arrayContaining([
      { id: 'retreat-in-closed-month', month: 1 }, { id: 'closed-months-free' },
    ]))
  })

  it('у all-season игнорирует закрытый флаг месяца', () => {
    const v = venue({ months: [month({ open: false, retreatWeeks: 1, groupGuests: 12 }), ...venue().months.slice(1)] })
    expect(computeYear(v).months[0].open).toBe(true)
    expect(computeYear(v).months[0].retreatRevenueCents).toBe(100_000 * 12)
  })

  it('вычитает открытие и закрытие сезона из NOI', () => {
    const v = venue({ type: 'seasonal', seasonOpenCents: 10_000, seasonCloseCents: 20_000 })
    expect(computeYear(v).noiCents).toBe(-30_000)
  })

  it('вклад недели вычитает выпавшую посуточную маржу, а не выручку', () => {
    const v = venue({ varPerNightCents: 2_000, varPerGuestWeekCents: 15_000,
      months: [month({ retreatWeeks: 1, groupGuests: 12, nightlyOccupancyPct: 50 }), ...venue().months.slice(1)] })
    expect(computeYear(v).months[0].weekContributionCents).toBe(12 * 100_000 - 12 * 15_000 - 8 * 6 * 0.5 * (10_000 - 2_000))
  })

  it('помечает отрицательный вклад недели и принимает высокий вклад', () => {
    const low = venue({ nightPriceCents: 100_000, rateCents: 1, months: [month({ retreatWeeks: 1, groupGuests: 12, nightlyOccupancyPct: 100 }), ...venue().months.slice(1)] })
    const high = { ...low, rateCents: 10_000_000 }
    expect(computeYear(low).months[0].weekContributionCents).toBeLessThan(0)
    expect(checkVenue(low)).toContainEqual({ id: 'week-loses-money', month: 1 })
    expect(computeYear(high).months[0].weekContributionCents).toBeGreaterThan(0)
  })

  it('сценарий nightly-only убирает ретритную выручку', () => {
    const v = venue({ months: [month({ retreatWeeks: 1, groupGuests: 12 }), ...venue().months.slice(1)] })
    expect(computeYear(v, 'nightly-only').months.every((m) => m.retreatRevenueCents === 0)).toBe(true)
  })

  it('сценарий retreats-only убирает посуточную выручку', () => {
    const v = venue({ months: [month({ retreatWeeks: 1, groupGuests: 12, nightlyOccupancyPct: 100 }), ...venue().months.slice(1)] })
    expect(computeYear(v, 'retreats-only').months.every((m) => m.nightlyRevenueCents === 0)).toBe(true)
  })

  it('загрузка переполненного месяца не выше 100 %, о переполнении говорит проверка', () => {
    const v = venue({ months: [month(), month({ retreatWeeks: 5, groupGuests: 12 }), ...venue().months.slice(2)] })
    expect(computeYear(v).months[1].occupancyPct).toBe(100)
    expect(checkVenue(v)).toContainEqual({ id: 'weeks-overflow', month: 2 })
  })

  it('помечает месяц, где гостей в группе больше мест, только если в нём есть ретритные недели', () => {
    const over = venue({ months: [month({ retreatWeeks: 1, groupGuests: 13 }), month({ retreatWeeks: 0, groupGuests: 13 }), ...venue().months.slice(2)] })
    expect(checkVenue(over)).toContainEqual({ id: 'guests-over-beds', month: 1 })
    expect(checkVenue(over)).not.toContainEqual({ id: 'guests-over-beds', month: 2 })
    const exact = venue({ months: [month({ retreatWeeks: 1, groupGuests: 12 }), ...venue().months.slice(1)] })
    expect(checkVenue(exact).some((i) => i.id === 'guests-over-beds')).toBe(false)
  })

  it('гости вне площадки платят дневную ставку при любой модели сделки, модель считается по живущим', () => {
    const base = { rateCents: 100_000, dayRateCents: 40_000, buyoutFeeCents: 500_000, minGuests: 0 }
    expect(retreatRevenue(venue({ ...base, deal: 'per_guest' }), 14, 100_000, 4)).toBe(100_000 * 10 + 40_000 * 4)
    expect(retreatRevenue(venue({ ...base, deal: 'full_campus' }), 14, 100_000, 4)).toBe(100_000 * 12 + 40_000 * 4)
    expect(retreatRevenue(venue({ ...base, deal: 'buyout' }), 14, 100_000, 4)).toBe(500_000 + 100_000 * 10 + 40_000 * 4)
    // минимум гостей — по живущим: 6 живущих при минимуме 8 оплачиваются как 8
    expect(retreatRevenue(venue({ ...base, deal: 'per_guest', minGuests: 8 }), 10, 100_000, 4)).toBe(100_000 * 8 + 40_000 * 4)
  })

  it('живущим снаружи — только кухня, и это видно в итоге месяца и вкладе недели', () => {
    const v = venue({ dayRateCents: 40_000, varPerGuestWeekCents: 20_000, varPerOffsiteGuestWeekCents: 8_000,
      months: [month({ retreatWeeks: 1, groupGuests: 14, offsiteGuests: 4 }), ...venue().months.slice(1)] })
    const r = computeYear(v).months[0]
    expect(r.retreatRevenueCents).toBe(100_000 * 10 + 40_000 * 4)
    expect(r.variableCents).toBe(20_000 * 10 + 8_000 * 4)
    expect(r.weekContributionCents).toBe(100_000 * 10 + 40_000 * 4 - (20_000 * 10 + 8_000 * 4))
  })

  it('лишние гости, отмеченные как живущие снаружи, не дают замечания о местах, но не больше вместимости зала', () => {
    const fits = venue({ hallCapacity: 16, months: [month({ retreatWeeks: 1, groupGuests: 15, offsiteGuests: 3 }), ...venue().months.slice(1)] })
    expect(checkVenue(fits).some((i) => i.id === 'guests-over-beds' || i.id === 'group-over-hall')).toBe(false)
    const unmarked = venue({ hallCapacity: 16, months: [month({ retreatWeeks: 1, groupGuests: 15, offsiteGuests: 2 }), ...venue().months.slice(1)] })
    expect(checkVenue(unmarked)).toContainEqual({ id: 'guests-over-beds', month: 1 })
    const crowded = venue({ hallCapacity: 16, months: [month({ retreatWeeks: 1, groupGuests: 17, offsiteGuests: 5 }), ...venue().months.slice(1)] })
    expect(checkVenue(crowded)).toContainEqual({ id: 'group-over-hall', month: 1 })
    expect(checkVenue(crowded)).not.toContainEqual({ id: 'guests-over-beds', month: 1 })
  })

  it('живущих снаружи не может быть больше, чем гостей в группе', () => {
    const v = venue({ months: [month({ groupGuests: 3, offsiteGuests: 4 }), ...venue().months.slice(1)] })
    expect(validateVenue(v, 'ru')).toContain('months[0].offsiteGuests: не может быть больше, чем «months[0].groupGuests»')
  })

  it('пишет в ошибке подпись поля, когда страница её передала', () => {
    const names: Record<string, string> = { borrowedCents: 'Из них заёмные', investmentCents: 'Вложения всего', 'months[1].gapDays': 'Февраль · дни' }
    const name = (field: string) => names[field] ?? field
    const v = venue({ investmentCents: 10, borrowedCents: 11 })
    v.months[1] = month({ gapDays: 29 })
    const errors = validateVenue(v, 'ru', name)
    expect(errors).toContain('Из них заёмные: не может быть больше, чем «Вложения всего»')
    expect(errors).toContain('Февраль · дни: больше допустимого (28)')
    expect(errors.join(' ')).not.toMatch(/Cents|months\[/)
  })

  it('показывает no-annual-costs только при нулевых страховании резерве и налоге', () => {
    expect(checkVenue(defaultVenue())).toContainEqual({ id: 'no-annual-costs' })
    expect(checkVenue(venue({ insuranceCents: 1 }))).not.toContainEqual({ id: 'no-annual-costs' })
  })
})
