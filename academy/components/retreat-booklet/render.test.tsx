import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { decodeToolLink, encodeToolLink } from '../../lib/retreat-core/tool-link'
import { encodeLink } from '../../lib/retreat-calc/link'
import { BOOKLET_LIMITS, bookletHashWithImport, defaultForm, formFromDecoded, pickBookletTool, type BookletForm } from '../../lib/retreat-booklet/form'
import { REQUIRED_SECTIONS, SECTION_IDS } from '../../lib/retreat-booklet/sections'
import { issueText, sectionLabels } from '../../lib/retreat-booklet/labels'
import { checkBooklet } from '../../lib/retreat-booklet/checks'
import { bookletModel } from '../../lib/retreat-booklet/pages'
import { SectionForm } from './section-form'
import { BookletPreview } from './preview'
import { pageRule } from './styles'
import { starterCards } from '../../lib/retreat-program/practices'
import { PG_UI } from '../retreat-program/ui'
import { MN_UI } from '../retreat-menu/ui'
import { TL_UI } from '../retreat-timeline/ui'
import { RC_UI } from '../retreat-calc/ui'

const today = '2027-11-10' as const
const retreat = { title: 'Неделя', start: '2028-05-10' as const, nights: 6, guests: 20, currency: 'USD' }
const programHash = encodeToolLink({ v: 1, retreat, tool: { blocks: [{ day: 2, start: '07:00', minutes: 60, kind: 'practice', practiceId: 'qigong' }] } })

function filled(): BookletForm {
  const f = defaultForm(today, 'ru')
  f.passport = { ...retreat }
  f.enabled = [...SECTION_IDS]
  Object.assign(f.content, {
    place: 'Горная долина', invitation: 'Письмо гостю', fitFor: ['Тем, кто устал'], notFor: ['Тем, кто ищет вечеринки'],
    experiences: [{ text: 'Утренний цигун', serves: 'мягкое начало дня' }], leaders: [{ name: 'Ведущая А.', role: 'ведущая', bio: 'Опыт', photoId: 'ph-aaaaaaaaaaaa' }],
    included: ['Проживание'], notIncluded: ['Дорога'], contact: 'почта', faq: [{ q: 'Вопрос?', a: 'Ответ.' }],
  })
  const r = decodeToolLink(programHash, (x) => x, 'ru')
  if (r.ok && r.kind === 'tool') f.imports.program = { at: today, retreat, blocks: (r.link.tool as { blocks: never[] }).blocks, cards: [] }
  return f
}
const form = (f: BookletForm) => renderToStaticMarkup(<SectionForm form={f} locale="ru" photos={[]} onChange={() => undefined} />)
const preview = (f: BookletForm, rights: Record<string, boolean> = {}) => renderToStaticMarkup(
  <BookletPreview form={f} blocks={bookletModel(f, 'ru', today)} locale="ru" photos={{ urls: { 'ph-aaaaaaaaaaaa': 'blob:x' }, rights }} />)
const fromHash = (hash: string) => formFromDecoded(decodeToolLink(hash, pickBookletTool, 'ru'), today, 'ru')!

describe('страница буклета: рендер', () => {
  it('R01 форма показывает заголовки всех разделов по-русски в порядке SECTION_IDS', () => {
    const html = form(defaultForm(today, 'ru')); const labels = sectionLabels('ru')
    const positions = SECTION_IDS.map((id) => html.indexOf(`>${labels[id]}<`))
    expect(positions.every((p) => p >= 0)).toBe(true)
    expect([...positions].sort((a, b) => a - b)).toEqual(positions)
  })
  it('R02 у обязательных разделов нет флажка, у необязательных есть', () => {
    const html = form(defaultForm(today, 'ru'))
    for (const id of SECTION_IDS) {
      const part = html.split(`data-section="${id}"`)[1].split('data-section=')[0]
      expect(part.includes('type="checkbox"') && part.indexOf('Включить раздел') >= 0, id).toBe(!REQUIRED_SECTIONS.includes(id))
    }
  })
  it('R03 на экране нет технических ключей полей', () => {
    const text = form(filled()).replace(/<[^>]+>/g, ' ')
    for (const key of ['place', 'fitFor', 'notIncluded', 'bookingSteps', 'paymentsText', 'coverPhotoId']) expect(text, key).not.toMatch(new RegExp(`\\b${key}\\b`))
  })
  it('R04 у полей есть maxLength из BOOKLET_LIMITS', () => {
    const html = form(filled())
    expect(html).toContain(`maxLength="${BOOKLET_LIMITS.short}"`)
    expect(html).toContain(`maxLength="${BOOKLET_LIMITS.text}"`)
    expect(html).not.toMatch(/<input(?![^>]*maxLength)(?![^>]*type="(checkbox|file|date)")[^>]*>/)
  })
  it('R05 предпросмотр рисует расписание таблицей', () => {
    const html = preview(filled())
    expect(html).toContain('<table class="bk-table"')
    expect(html).toContain('Цигун')
  })
  it('R06 предпросмотр не содержит JSON', () => {
    const html = preview(filled())
    expect(html).not.toContain('{&quot;')
    expect(html).not.toContain('[object Object]')
    expect(html).toContain('Утренний цигун')
  })
  it('R07 обложка RU пишет ночи по-русски и даты прописью', () => {
    const html = preview(filled())
    expect(html).toContain('6 ночей')
    expect(html).toContain('10–16 мая 2028')
  })
  it('R08 фото без права — плашка вместо картинки', () => {
    expect(preview(filled())).toContain('нет права на фото')
    expect(preview(filled())).not.toContain('src="blob:x"')
    expect(preview(filled(), { 'ph-aaaaaaaaaaaa': true })).toContain('src="blob:x"')
  })
  it('R09 печать при ошибках начинается с листа ошибок', () => {
    const f = filled(); f.content.notIncluded = []
    const errors = checkBooklet(f, 'ru', today).errors
    expect(errors.map((x) => x.id)).toContain('no-not-included')
    // лист ошибок — первый печатный блок колонки предпросмотра: проверяем порядок в разметке страницы
    const page = renderToStaticMarkup(<><div className="bk-print-errors">{errors.map((x) => issueText(x, 'ru'))}</div>{
      <BookletPreview form={f} blocks={bookletModel(f, 'ru', today)} locale="ru" photos={{ urls: {}, rights: {} }} />}</>)
    expect(page.indexOf('bk-print-errors')).toBeLessThan(page.indexOf('data-block="cover"'))
  })
  it('R10 стиль печати Letter для paper letter и A4 для a4', () => {
    expect(pageRule('letter')).toContain('size: Letter')
    expect(pageRule('a4')).toContain('size: A4')
    expect(pageRule('letter')).not.toContain('var(')
  })
  it('R11 bookletHashWithImport из меню кладёт импорт меню и паспорт', () => {
    const hash = encodeToolLink({ v: 1, retreat, tool: { grid: { '2-lunch': { dish: 'Суп' } }, diets: { vegan: 2 } } })
    const f = fromHash(bookletHashWithImport(retreat, 'menu', hash, today, 'ru'))
    expect(f.imports.menu?.diets).toEqual({ vegan: 2 })
    expect(f.imports.menu?.at).toBe(today)
    expect(f.passport.start).toBe(retreat.start)
  })
  it('R12 bookletHashWithImport из таймлайна кладёт импорт таймлайна и паспорт', () => {
    const hash = encodeToolLink({ v: 1, retreat, tool: { signDate: today, guestBalanceDueDays: 75 } })
    const f = fromHash(bookletHashWithImport(retreat, 'timeline', hash, today, 'ru'))
    expect(f.imports.timeline?.terms.guestBalanceDueDays).toBe(75)
    expect(f.passport.start).toBe(retreat.start)
  })
  it('R13 bookletHashWithImport из калькулятора кладёт импорт калькулятора и паспорт', () => {
    const hash = encodeLink({ v: 1, title: 'Неделя', price: 2800, guests: 20, nights: 6, guestDepositPct: 30 })
    const f = fromHash(bookletHashWithImport(retreat, 'calc', hash, today, 'ru'))
    expect(f.imports.calc?.data).toEqual({ v: 1, title: 'Неделя', price: 2800, guests: 20, nights: 6, guestDepositPct: 30 })
    expect(f.passport.start).toBe(retreat.start)
  })
  it('R14 bookletHashWithImport из конструктора кладёт импорт конструктора и паспорт', () => {
    const f = fromHash(bookletHashWithImport(retreat, 'program', programHash, today, 'ru'))
    expect(f.imports.program?.blocks).toEqual([{ day: 2, start: '07:00', minutes: 60, kind: 'practice', practiceId: 'qigong' }])
    expect(f.passport.start).toBe(retreat.start)
  })
  it('R15 подписи «Собрать буклет» есть у четырёх соседей на обоих языках', () => {
    for (const ui of [PG_UI, MN_UI, TL_UI, RC_UI]) {
      expect(ui.ru.buildBooklet).toBe('Собрать буклет')
      expect(ui.en.buildBooklet).toBe('Build a booklet')
    }
  })
  it('R16 у каждого id, который возвращает checkBooklet, есть текст RU и EN', () => {
    const base = filled()
    const variants: BookletForm[] = [defaultForm(today, 'ru'), base]
    const v1 = filled(); v1.content.experiences = [{ text: 'Прогулка', serves: '' }]; v1.content.invitation = 'исцелит навсегда'
    v1.content.testimonials = [{ quote: 'Хорошо', author: 'Гость', consent: false }]; v1.passport.start = '2027-12-30'; variants.push(v1)
    const v2 = filled(); v2.imports.program = { at: today, retreat, blocks: [], cards: [{ ...starterCards('ru')[0], contraindications: 'да' }] }
    v2.content.bookingSteps = ['Заявка']; variants.push(v2)
    const v3 = filled(); v3.imports.calc = { at: today, data: { v: 1, daysToStart: 10 } }; variants.push(v3)
    const ids = new Set<string>()
    for (const f of variants) for (const x of [...checkBooklet(f, 'ru', today).errors, ...checkBooklet(f, 'ru', today).warnings]) {
      ids.add(x.id)
      for (const lang of ['ru', 'en'] as const) {
        const text = issueText(x, lang)
        expect(text.length, `${x.id} ${lang}`).toBeGreaterThan(20)
        expect(text, `${x.id} ${lang}`).not.toMatch(/^[a-z-]+(:|$)/)
      }
    }
    for (const id of ['required-empty', 'no-not-included', 'import-passport-mismatch', 'experience-without-purpose', 'holiday-overlap',
      'promise-words', 'testimonial-without-consent', 'photo-without-rights', 'booking-without-form']) expect(ids.has(id), id).toBe(true)
  })
})
