import { describe, expect, it } from 'vitest'
import { defaultForm } from './form'
import { bookletModel } from './pages'
import { defaultForm as timelineDefaultForm } from '../retreat-timeline/form'

const block = (f: ReturnType<typeof defaultForm>, id: string) => bookletModel(f, 'ru', '2027-01-01').find((x) => x.id === id)

describe('booklet pages', () => {
  it('B24 payments содержит дату доплаты гостя из таймлайна', () => {
    const f = defaultForm('2027-01-01', 'ru'); const t = timelineDefaultForm('2027-01-01')
    t.passport.start = '2027-09-13'; t.passport.nights = 7
    f.passport = t.passport; f.imports.timeline = { at: '2027-01-01', retreat: t.passport, terms: { ...t.terms, guestBalanceDueDays: 30 } }
    const payments = block(f, 'payments')
    expect(payments?.data).toMatchObject({ milestones: expect.arrayContaining([expect.objectContaining({ id: 'guest-balance', date: '2027-08-14' })]) })
  })
  it('B25 pricing показывает опции проживания из ссылки калькулятора', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.imports.calc = { at: '2027-01-01', data: { v: 1,
      accommodation: [{ name: 'Комната', guests: 2, surcharge: 100, cost: 400 }] } as never }
    expect(block(f, 'pricing')?.data).toMatchObject({ accommodation: [{ name: 'Комната', guests: 2, surcharge: 100, cost: 400 }] })
  })
  it('B26 даты прописью RU и EN: один месяц', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.passport.start = '2027-09-13'; f.passport.nights = 7
    expect((block(f, 'cover') as { data: { dateText: string } }).data.dateText).toBe('13–20 сентября 2027')
    expect((bookletModel(f, 'en', '2027-01-01').find((x) => x.id === 'cover') as { data: { dateText: string } }).data.dateText).toBe('September 13–20, 2027')
  })
  it('B27 даты прописью RU и EN: два месяца', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.passport.start = '2027-09-28'; f.passport.nights = 5
    expect((block(f, 'cover') as { data: { dateText: string } }).data.dateText).toBe('28 сентября – 3 октября 2027')
    expect((bookletModel(f, 'en', '2027-01-01').find((x) => x.id === 'cover') as { data: { dateText: string } }).data.dateText).toBe('September 28 – October 3, 2027')
  })
  it('B28 даты прописью RU и EN: через год', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.passport.start = '2027-12-28'; f.passport.nights = 6
    expect((block(f, 'cover') as { data: { dateText: string } }).data.dateText).toBe('28 декабря 2027 – 3 января 2028')
    expect((bookletModel(f, 'en', '2027-01-01').find((x) => x.id === 'cover') as { data: { dateText: string } }).data.dateText).toBe('December 28, 2027 – January 3, 2028')
  })
})
