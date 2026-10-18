import { describe, expect, it } from 'vitest'
import { addDays, addMonths, daysBetween, isIsoDate, monthsBetween } from './dates'

describe('даты без локального времени', () => {
  it('месяц вперёд с 31-го — последний день месяца, високосный год учтён', () => {
    expect(addMonths('2027-01-31', 1)).toBe('2027-02-28')
    expect(addMonths('2028-01-31', 1)).toBe('2028-02-29')
    expect(addMonths('2026-11-10', 6)).toBe('2027-05-10')
  })
  it('перевод часов не сдвигает день', () => {
    expect(addDays('2027-03-13', 1)).toBe('2027-03-14')
    expect(addDays('2027-11-06', 1)).toBe('2027-11-07')
    expect(addDays('2027-05-10', -60)).toBe('2027-03-11')
  })
  it('полные месяцы между датами', () => {
    expect(monthsBetween('2026-11-10', '2027-05-10')).toBe(6)
    expect(monthsBetween('2026-11-11', '2027-05-10')).toBe(5)
    expect(monthsBetween('2027-05-10', '2026-11-10')).toBe(0)
  })
  it('дни между датами', () => {
    expect(daysBetween('2027-03-11', '2027-05-10')).toBe(60)
  })
  it('строгий формат и реальная дата', () => {
    expect(isIsoDate('2027-02-30')).toBe(false)
    expect(isIsoDate('2027-5-1')).toBe(false)
    expect(isIsoDate('2028-02-29')).toBe(true)
    expect(() => addDays('завтра', 1)).toThrow()
  })
})
