import { describe, expect, it } from 'vitest'
import { decodeToolLink, encodeToolLink } from '../retreat-core/tool-link'
import { TIMELINE_PATH } from '../retreat-timeline/form'
import { importLink } from './imports'
import { bookletModel } from './pages'
import { bookletHash, defaultForm, enabledSections, exportJson, formFromDecoded, importJson, pickBookletTool } from './form'
import { REQUIRED_SECTIONS, SECTION_IDS } from './sections'

const photo = 'ph-abcdefghijkl'
const seeded = () => {
  const f = defaultForm('2027-01-01', 'ru')
  f.passport = { title: 'Нейтральный ретрит', start: '2027-09-13', nights: 7, currency: 'USD' }
  f.content.coverPhotoId = photo; f.content.placePhotoIds = [photo]; f.content.leaders = [{ name: 'Ведущий', role: 'Автор', bio: 'Опыт', photoId: photo }]
  f.content.contact = 'contact'; f.content.fitFor = ['Практика']; f.content.included = ['Материалы']; f.content.notIncluded = ['Дорога']
  return f
}

describe('booklet form', () => {
  it('B44 импорт таймлайна переживает два круга ссылки без роста денег', () => {
    const plan = { signDate: '2027-11-10', guestDepositPct: 30, guestBalanceDueDays: 75, guestRefundDays: 75, venueNoReturnDays: 60,
      venue: { model: 'full_campus', ratePerGuest: 1800.5, capacity: 20, minGuests: 0, buyoutFee: 0, depositPct: 25, finalDueDays: 60,
        payInFullDiscountPct: 5, installments: true, payInFull: false } }
    const retreat = { start: '2028-05-10' as const, nights: 6, guests: 20, currency: 'USD' }
    const r = importLink(defaultForm('2027-11-10', 'ru'), `https://host${TIMELINE_PATH}${encodeToolLink({ v: 1, retreat, tool: plan })}`, 'ru', '2027-11-10')
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.form.imports.timeline?.terms.venue.ratePerGuest).toBe(180050)
    const once = formFromDecoded(decodeToolLink(bookletHash(r.form), pickBookletTool, 'ru'), '2027-11-10', 'ru')!
    const twice = formFromDecoded(decodeToolLink(bookletHash(once), pickBookletTool, 'ru'), '2027-11-10', 'ru')!
    expect(twice.imports.timeline).toEqual(r.form.imports.timeline)
  })
  it('B32 обязательный раздел нельзя выключить', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.enabled = []
    expect(enabledSections(f)).toEqual([...REQUIRED_SECTIONS])
  })
  it('B33 по умолчанию пять шагов записи на каждом языке', () => {
    expect(defaultForm('2027-01-01', 'ru').content.bookingSteps).toEqual(['Заявка', 'Короткий созвон', 'Анкета гостя', 'Депозит', 'Подтверждение места'])
    expect(defaultForm('2027-01-01', 'en').content.bookingSteps).toEqual(['Application', 'Short call', 'Guest form', 'Deposit', 'Place confirmed'])
  })
  it('B19 bookletHash туда и обратно с фото обложки и фото ведущего', () => {
    const f = seeded(); const d = decodeToolLink(bookletHash(f), pickBookletTool, 'ru')
    expect(d.ok).toBe(true)
    if (d.ok) expect(formFromDecoded(d, '2027-01-01', 'ru')).toEqual(f)
  })
  it('B20 JSON туда и обратно с фото обложки и фото ведущего', () => {
    const f = seeded()
    expect(importJson(exportJson(f), '2027-01-01', 'ru')).toEqual(f)
  })
  it('B21 pickBookletTool отбрасывает мусорные imports', () => {
    expect(pickBookletTool({ imports: { evil: { at: '2027-01-01' }, calc: 'junk' } }).imports).toEqual({})
  })
  it('B22 pickBookletTool режет place до 120, пункт списка до 120, days по лимиту ночей', () => {
    const f = pickBookletTool({ content: { place: 'x'.repeat(200), fitFor: ['y'.repeat(200)], days: Array(400).fill('z') } })
    expect(f.content.place).toHaveLength(120)
    expect(f.content.fitFor).toEqual(['y'.repeat(120)])
    expect(f.content.days).toHaveLength(366)
  })
  it('B23 порядок блоков модели совпадает с SECTION_IDS для всех включённых разделов', () => {
    const f = defaultForm('2027-01-01', 'ru'); f.enabled = [...SECTION_IDS]; f.content.days = ['День']
    const ids = bookletModel(f, 'ru', '2027-01-01').map((x) => x.id)
    expect(ids).toEqual([...SECTION_IDS])
  })
})
