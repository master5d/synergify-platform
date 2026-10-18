import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { DEFAULT_FORM } from '../retreat-calc/form'
import { decodeLink, encodeLink } from '../retreat-calc/link'
import { decodeToolLink } from '../retreat-core/tool-link'
import {
  calcHashFromTimeline, defaultForm, draftOf, formFromDecoded, formFromDraft, pickTimelineTool,
  timelineHash, timelineHashFromCalcForm, type TimelineForm,
} from './form'

const TODAY = '2026-10-17'
const fixture = JSON.parse(readFileSync(join(__dirname, '..', 'retreat-calc', 'fixtures', 'link-v1.json'), 'utf8'))

describe('форма таймлайна', () => {
  it('черновик не несёт данных гостей, даже если их подложить в форму', () => {
    const f = { ...defaultForm(TODAY), arrivals: [{ guest: 'Гость 1', phone: '+1 555' }] } as TimelineForm
    const draft = draftOf(f)
    expect(draft).not.toMatch(/Гость 1|555|arrivals|phone/)
    expect(formFromDraft(draft, TODAY)).toEqual(defaultForm(TODAY))
  })
  it('из ссылки калькулятора v1: подписание сегодня, старт через «месяцев до старта», условия площадки', () => {
    const f = formFromDecoded(decodeToolLink(encodeLink(fixture), pickTimelineTool, 'ru'), TODAY)
    expect(f?.terms.signDate).toBe(TODAY)
    expect(f?.passport).toMatchObject({ start: '2027-03-17', guests: 18, nights: 6, currency: 'USD', title: 'Example retreat' })
    expect(f?.terms.venue).toMatchObject({ model: 'full_campus', ratePerGuest: 200000, capacity: 18, depositPct: 25, finalDueDays: 45 })
    expect(f?.terms.venueNoReturnDays).toBe(45)
  })
  it('своя ссылка — круг без потерь', () => {
    const f = defaultForm(TODAY)
    expect(formFromDecoded(decodeToolLink(timelineHash(f), pickTimelineTool, 'ru'), TODAY)).toEqual(f)
  })
  it('битая ссылка — null', () => {
    expect(formFromDecoded(decodeToolLink('#data=@@', pickTimelineTool, 'ru'), TODAY)).toBeNull()
  })
  it('кнопка в калькуляторе ведёт в таймлайн своей ссылкой', () => {
    const d = decodeToolLink(timelineHashFromCalcForm(DEFAULT_FORM, TODAY), pickTimelineTool, 'en')
    expect(d.ok && d.kind).toBe('tool')
  })
  it('из таймлайна в калькулятор — ссылка v1, которую калькулятор понимает', () => {
    const d = decodeLink(calcHashFromTimeline(defaultForm(TODAY)), 'ru')
    expect(d.ok).toBe(true)
    if (d.ok) expect(d.data).toMatchObject({ guests: 18, nights: 6, monthsToStart: 5, venue: { ratePerGuest: 2000, finalDueDays: 45 } })
  })
})
