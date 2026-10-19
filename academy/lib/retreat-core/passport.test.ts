import { describe, expect, it } from 'vitest'
import { passportFromCalcLink, pickPassport, validatePassport } from './passport'

describe('паспорт ретрита', () => {
  it('ошибки называют поле', () => {
    expect(validatePassport({ nights: 0 }, 'ru').some((e) => e.startsWith('nights'))).toBe(true)
    expect(validatePassport({ start: '2027-02-30' }, 'ru').some((e) => e.startsWith('start'))).toBe(true)
    expect(validatePassport({ start: '2027-05-10', nights: 6, guests: 20, currency: 'USD' }, 'en')).toEqual([])
  })
  it('из ссылки калькулятора: месяцы до старта становятся датой', () => {
    expect(passportFromCalcLink({ v: 1, monthsToStart: 6, guests: 20, nights: 6, currency: 'USD' }, '2026-11-10'))
      .toEqual({ start: '2027-05-10', guests: 20, nights: 6, currency: 'USD' })
  })
  it('allowlist: чужие ключи и не те типы отброшены', () => {
    expect(pickPassport({ id: 'retreat-1234', start: '2027-05-10', phone: '+1 555', guests_list: ['a'], nights: '6', guests: 12 }))
      .toEqual({ id: 'retreat-1234', start: '2027-05-10', guests: 12 })
    expect(pickPassport({ id: 'BAD_ID' })).toEqual({})
    expect(pickPassport(null)).toEqual({})
  })
  it('плохой id паспорта даёт ошибку валидации', () => {
    expect(validatePassport({ id: 'BAD_ID' }, 'ru').some((e) => e.startsWith('id'))).toBe(true)
  })
})
