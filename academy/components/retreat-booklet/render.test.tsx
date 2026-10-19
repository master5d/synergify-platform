import React from 'react'
import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { BOOKLET_STYLE } from './styles'
import { BookletPreview } from './preview'
import { RetreatBooklet } from './retreat-booklet'
import { SectionForm } from './section-form'
import { BK_UI } from './ui'
import { defaultForm, bookletHashWithImport, formFromDecoded, pickBookletTool } from '../../lib/retreat-booklet/form'
import { SECTION_IDS, REQUIRED_SECTIONS } from '../../lib/retreat-booklet/sections'
import { sectionLabels, issueText } from '../../lib/retreat-booklet/labels'
import { checkBooklet } from '../../lib/retreat-booklet/checks'
import { encodeToolLink, decodeToolLink } from '../../lib/retreat-core/tool-link'
import { encodeLink } from '../../lib/retreat-calc/link'
import { pickProgramTool } from '../../lib/retreat-program/grid'
import { pickMenuTool } from '../../lib/retreat-menu/form'
import { pickTimelineTool } from '../../lib/retreat-timeline/form'

const form = () => {
  const base = defaultForm('2028-01-01', 'ru')
  return { ...base, passport: { title: 'Нейтральный ретрит', start: '2028-05-10' as const, nights: 6 },
    content: { ...base.content, place: 'Горы' } }
}
const markup = (f = form()) => renderToStaticMarkup(<BookletPreview form={f} locale="ru" today="2028-01-01" />)
const linkForm = (kind: 'program' | 'menu' | 'calc' | 'timeline', hash: string) => formFromDecoded(
  decodeToolLink(bookletHashWithImport({ start: '2028-05-10' }, kind, hash, '2028-01-01'), pickBookletTool, 'ru'),
  '2028-01-01', 'ru')!

describe('retreat booklet render contract', () => {
  it('R01 форма показывает заголовки всех разделов по-русски в порядке SECTION_IDS', () => {
    const h = renderToStaticMarkup(<SectionForm form={form()} locale="ru" onChange={() => undefined} />)
    let at = -1
    for (const id of SECTION_IDS) { const next = h.indexOf(sectionLabels('ru')[id]); expect(next).toBeGreaterThan(at); at = next }
  })
  it('R02 у обязательных разделов нет флажка, у необязательных есть', () => {
    const h = renderToStaticMarkup(<SectionForm form={form()} locale="ru" onChange={() => undefined} />)
    expect(h.match(/type="checkbox"/g)?.length).toBe(SECTION_IDS.length - REQUIRED_SECTIONS.length)
  })
  it('R03 на экране нет технических ключей полей', () => {
    const h = renderToStaticMarkup(<SectionForm form={form()} locale="ru" onChange={() => undefined} />)
    expect(h).not.toMatch(/>place<|fitFor|notIncluded|bookingSteps/)
  })
  it('R04 у полей есть maxLength из BOOKLET_LIMITS', () => {
    const h = renderToStaticMarkup(<SectionForm form={form()} locale="ru" onChange={() => undefined} />)
    expect(h).toContain('maxLength="2000"'); expect(h).toContain('maxLength="120"')
  })
  it('R05 предпросмотр рисует расписание таблицей', () => {
    const f = form(); f.enabled = [...SECTION_IDS]
    f.imports.program = { at: '2028-01-01', retreat: {}, blocks: [], cards: [] }
    expect(markup(f)).toContain('<table')
  })
  it('R06 предпросмотр не содержит JSON', () => { expect(markup()).not.toMatch(/\{"|":/) })
  it('R07 обложка RU пишет ночи по-русски и даты прописью', () => {
    expect(markup()).toContain('6 ночей'); expect(markup()).toContain('10–16 мая 2028')
  })
  it('R08 фото без права — плашка вместо картинки', () => {
    const f = form(); f.content.leaders = [{ name: 'Лидер', role: 'Роль', bio: 'Био', photoId: 'ph-abcdefghijkl' }]
    expect(markup(f)).toContain('нет права на фото')
  })
  it('R09 печать при ошибках начинается с листа ошибок', () => {
    expect(renderToStaticMarkup(<RetreatBooklet locale="ru" />)).toContain('bk-print-errors')
  })
  it('R10 стиль печати Letter для paper letter и A4 для a4', () => {
    expect(BOOKLET_STYLE).toContain('@page{size:var(--bk-paper, A4)')
    expect(renderToStaticMarkup(<RetreatBooklet locale="ru" />)).toContain('@page{size:A4}')
  })
  it('R11 bookletHashWithImport из меню кладёт импорт меню и паспорт', () => {
    const f = linkForm('menu', encodeToolLink({ v: 1, retreat: {}, tool: pickMenuTool({}) }))
    expect(f.imports.menu).toBeTruthy(); expect(f.passport.start).toBe('2028-05-10')
  })
  it('R12 bookletHashWithImport из таймлайна кладёт импорт таймлайна и паспорт', () => {
    const f = linkForm('timeline', encodeToolLink({ v: 1, retreat: {}, tool: pickTimelineTool({}) }))
    expect(f.imports.timeline).toBeTruthy(); expect(f.passport.start).toBe('2028-05-10')
  })
  it('R13 bookletHashWithImport из калькулятора кладёт импорт калькулятора и паспорт', () => {
    const f = linkForm('calc', encodeLink({ v: 1, title: 'R', nights: 6 }))
    expect(f.imports.calc).toBeTruthy(); expect(f.passport.start).toBe('2028-05-10')
  })
  it('R14 bookletHashWithImport из конструктора кладёт импорт конструктора и паспорт', () => {
    const f = linkForm('program', encodeToolLink({ v: 1, retreat: {}, tool: pickProgramTool({}) }))
    expect(f.imports.program).toBeTruthy(); expect(f.passport.start).toBe('2028-05-10')
  })
  it('R15 подписи «Собрать буклет» есть у четырёх соседей на обоих языках', () => {
    expect(BK_UI.ru.build).toBe('Собрать буклет'); expect(BK_UI.en.build).toBe('Build a booklet')
  })
  it('R16 у каждого id, который возвращает checkBooklet, есть текст RU и EN', () => {
    const result = checkBooklet(defaultForm('2028-01-01', 'ru'), 'ru', '2028-01-01')
    for (const issue of [...result.errors, ...result.warnings]) {
      expect(issueText(issue, 'ru')).not.toBe(issue.id); expect(issueText(issue, 'en')).not.toBe(issue.id)
    }
  })
})
