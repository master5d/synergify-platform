import { describe, expect, it } from 'vitest'
import { checkBooklet } from './checks'
import type { Lang } from '../retreat-calc/engine'
import { defaultForm } from './form'

const warningIds = (f: ReturnType<typeof defaultForm>) => checkBooklet(f, f.content.language as Lang, '2027-01-01').warnings.map((x) => x.id)

const ids = (f: ReturnType<typeof defaultForm>, rights: Record<string, boolean> = {}) => {
  const r = checkBooklet(f, f.content.language as Lang, '2027-01-01', rights)
  return [...r.errors, ...r.warnings]
}

describe('booklet checks', () => {
  it('B34 нет «не включено» — ошибка no-not-included', () => {
    expect(ids(defaultForm('2027-01-01', 'ru'))).toContainEqual({ id: 'no-not-included', section: 'inclusions' })
  })
  it('B35 пустые контакты — ошибка required-empty в contact', () => {
    expect(ids(defaultForm('2027-01-01', 'ru'))).toContainEqual({ id: 'required-empty', section: 'contact' })
  })
  it('B36 пункт без «чему служит» — замечание', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.content.experiences = [{ text: 'Прогулка', serves: '' }]
    expect(ids(f)).toContainEqual({ id: 'experience-without-purpose', section: 'experiences' })
  })
  it('B37 отзыв без согласия — замечание', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.content.testimonials = [{ quote: 'Хорошо', author: 'Гость', consent: false }]
    expect(ids(f)).toContainEqual({ id: 'testimonial-without-consent', section: 'testimonials' })
  })
  it('B38 фото без права — замечание, с правом — нет', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.content.coverPhotoId = 'ph-abcdefghijkl'
    expect(ids(f)).toContainEqual({ id: 'photo-without-rights', detail: 'ph-abcdefghijkl' })
    expect(ids(f, { 'ph-abcdefghijkl': true }).some((x) => x.id === 'photo-without-rights')).toBe(false)
  })
  it('B39 без даты старта праздники не проверяются', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.passport.nights = 3
    expect(checkBooklet(f, 'ru', '2026-12-31').warnings.some((x) => x.id === 'holiday-overlap')).toBe(false)
  })
  it('B40 promise-words ловит forever', () => {
    const f = defaultForm('2027-01-01', 'en'); f.content.invitation = 'Change your life forever'
    expect(warningIds(f)).toContain('promise-words')
  })
  it('B14 promise-words ловит исцелит', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.content.invitation = 'Практика исцелит'
    expect(warningIds(f)).toContain('promise-words')
  })
  it('B15 promise-words ловит guaranteed', () => {
    const f = defaultForm('2027-01-01', 'en'); f.content.invitation = 'guaranteed result'
    expect(warningIds(f)).toContain('promise-words')
  })
  it('B16 promise-words не ловит целитель', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.content.invitation = 'Целитель ведёт практику'
    expect(warningIds(f)).not.toContain('promise-words')
  })
  it('B17 promise-words не ловит healthy и secure', () => {
    const f = defaultForm('2027-01-01', 'en'); f.content.invitation = 'A healthy and secure space'
    expect(warningIds(f)).not.toContain('promise-words')
  })
  it('B18 booking-without-form при практике с противопоказаниями и шагах без анкеты', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.imports.program = { at: '2027-01-01', retreat: {}, blocks: [],
      cards: [{ text: 'Практика', serves: 'отдых', contraindications: 'ограничения' } as never] }
    f.content.bookingSteps = ['Заявка']
    expect(warningIds(f)).toContain('booking-without-form')
  })
})
