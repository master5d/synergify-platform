import { describe, expect, it } from 'vitest'
import { holidaysOverlapping } from './holidays'

describe('booklet holidays', () => {
  it('B41 Новый год ловится через переход года', () => {
    expect(holidaysOverlapping('2027-12-28', 6, 'ru').map((x) => x.id)).toContain('new-year')
  })
  it('B42 июнь — пусто', () => {
    expect(holidaysOverlapping('2027-06-10', 7, 'ru')).toEqual([])
  })
  it('B43 20.11.2025 на 7 ночей ловит День благодарения', () => {
    expect(holidaysOverlapping('2025-11-20', 7, 'en').map((x) => x.id)).toContain('thanksgiving')
  })
  it('B29 День благодарения: 22.11.2025 на 3 ночи — пусто', () => {
    expect(holidaysOverlapping('2025-11-22', 3, 'en')).toEqual([])
  })
  it('B30 День благодарения: 26.11.2025 на 3 ночи — ловится', () => {
    expect(holidaysOverlapping('2025-11-26', 3, 'en')).toEqual([{ id: 'thanksgiving', name: 'US Thanksgiving' }])
  })
})
