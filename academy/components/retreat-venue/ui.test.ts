import { describe, expect, it } from 'vitest'
import { defaultVenue, validateVenue } from '../../lib/retreat-venue/engine'
import { venueFieldName } from './ui'

describe('подписи полей в ошибках года площадки', () => {
  it('переводит ключи полей и месяцев в подписи страницы RU и EN', () => {
    expect(venueFieldName('borrowedCents', 'ru')).toBe('Из них заёмные')
    expect(venueFieldName('months[1].gapDays', 'ru')).toBe('Февраль · Пустых дней на группу')
    expect(venueFieldName('months[0].rateCents', 'en')).toBe('January · Month rate')
    expect(venueFieldName('rateCents', 'en')).toBe('Rate per guest per retreat week')
  })

  it('ни одна ошибка движка не показывает технический ключ', () => {
    const v = defaultVenue()
    Object.assign(v, {
      units: -1, groupBeds: -1, nightPriceCents: -1, rateCents: -1, minGuests: -1, buyoutFeeCents: -1, varPerGuestWeekCents: -1,
      varPerNightCents: -1, fixedOpenMonthCents: -1, fixedClosedMonthCents: -1, insuranceCents: -1, replacementReserveCents: -1,
      taxPct: -1, debtServiceCents: -1, seasonOpenCents: -1, seasonCloseCents: -1, investmentCents: 10, borrowedCents: 11,
    })
    v.months = v.months.map(() => ({ open: true, retreatWeeks: -1, groupGuests: -1, rateCents: -1, nightlyOccupancyPct: -1, gapDays: -1 }))
    for (const locale of ['ru', 'en'] as const) {
      const errors = validateVenue(v, locale, (field) => venueFieldName(field, locale))
      // 16 полей площадки + «заёмные больше вложений» + 12 месяцев × 5 полей
      expect(errors).toHaveLength(77)
      expect(errors.join('\n')).not.toMatch(/Cents|Pct|months\[|retreatWeeks|groupGuests|gapDays|(^|\n)units:|groupBeds|minGuests/)
    }
  })
})
