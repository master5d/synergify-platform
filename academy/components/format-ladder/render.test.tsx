import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { CHANNELS, RUNGS_ORDER } from '../../lib/format-ladder/axes'
import { FORMATS } from '../../lib/format-ladder/formats'
import { FAMILIES, KNOWN_COURSES } from '../../lib/format-ladder/families'
import { MyMap } from '../../lib/format-ladder/my-map'
import { RUNGS } from '../../lib/format-ladder/rungs'
import { UI } from './ui'
import { LadderGrid } from './ladder-grid'
import { MyMapBlock, draftToCell, mapAsText, settleMissingFormat } from './my-map'
import { EMPTY_MAP } from '../../lib/format-ladder/my-map'
import sitemap from '../../app/sitemap'

describe('format ladder render contract', () => {
  it('P01 страница: шесть ступеней по порядку, у каждой законы и признаки', () => {
    const html = renderToStaticMarkup(<LadderGrid locale="ru" />)
    expect([...html.matchAll(/data-rung="([^"]+)"/g)].map((match) => match[1])).toEqual(RUNGS_ORDER)
    for (const rung of RUNGS) {
      const section = html.split(`data-rung="${rung.id}"`)[1].split('</section>')[0]
      expect(section.match(/<dt>/g)).toHaveLength(5)
      expect(section).toContain(rung.upSignals[0].ru)
      expect(section).toContain(rung.earlySignals[0].ru)
    }
  })

  it('P02 карточка ретрита ведёт в курс, карточка без курса — «скоро» без ссылки', () => {
    const ru = renderToStaticMarkup(<LadderGrid locale="ru" />)
    const en = renderToStaticMarkup(<LadderGrid locale="en" />)
    expect(ru).toContain('data-format="retreat"')
    expect(ru).toContain('href="https://academy.synergify.com/retrit/"')
    const marathon = ru.split('data-format="marathon"')[1].split('</article>')[0]
    expect(marathon).not.toContain('<a')
    expect(marathon).toContain('скоро')
    expect(en).toContain('href="https://academy.synergify.com/retrit/en/"')
  })

  it('P02b индивидуальные сессии в обеих клетках ведут в курс «Один на один и дальше» на своём языке', () => {
    const cards = (html: string) => html.split('data-format="individual"').slice(1).map((s) => s.split('</article>')[0])
    const ru = cards(renderToStaticMarkup(<LadderGrid locale="ru" />))
    const en = cards(renderToStaticMarkup(<LadderGrid locale="en" />))
    expect(ru).toHaveLength(2)
    expect(en).toHaveLength(2)
    for (const c of ru) expect(c).toContain('href="https://academy.synergify.com/odin-na-odin/"')
    for (const c of en) expect(c).toContain('href="https://academy.synergify.com/odin-na-odin/en/"')
  })

  it('P03 формат с двумя клетками показан в обеих, id в DOM уникальны', () => {
    const html = renderToStaticMarkup(<LadderGrid locale="ru" />)
    expect(html.match(/data-format="groups"/g)).toHaveLength(2)
    const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map((match) => match[1])
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('P04 фильтр «цикл»: пустая клетка подписана «здесь пока пусто»', () => {
    const html = renderToStaticMarkup(<LadderGrid locale="ru" initialClass="cycle" />)
    expect(html).not.toContain('data-format="groups"')
    expect(html).toContain('data-format="detox-groups"')
    expect(html.match(/здесь пока пусто/g)?.length ?? 0).toBeGreaterThan(0)
    expect(html.match(/data-rung="[^"]+"/g)).toHaveLength(6)
  })

  it('P05 «Моя карта» с initialMap показывает сохранённое, без него — пустые поля', () => {
    const initialMap: MyMap = {
      now: { rung: 'small', channel: 'online', eventClass: 'regular' },
      next: { formatId: 'groups', formatName: null, text: '', date: '2026-11-15' }, signal: 'люди возвращаются',
    }
    const saved = renderToStaticMarkup(<MyMapBlock locale="ru" initialMap={initialMap} />)
    expect(saved).toContain('value="groups" selected')
    expect(saved).toContain('value="2026-11-15"')
    expect(saved).toContain('люди возвращаются')
    const empty = renderToStaticMarkup(<MyMapBlock locale="ru" />)
    expect(empty).not.toContain('<option value="groups" selected')
    expect(empty).toContain('value=""')
  })

  it('P06 RU и EN ui.ts — одинаковый набор ключей; EN-страница без кириллицы в подписях ui', () => {
    expect(Object.keys(UI.ru).sort()).toEqual(Object.keys(UI.en).sort())
    expect(Object.values(UI.en).every((value) => !/[а-яё]/i.test(value))).toBe(true)
  })

  it('P07 sitemap содержит instrumenty/lesenka', () => {
    expect(sitemap().map((entry) => entry.url)).toContain('https://academy.synergify.com/instrumenty/lesenka/')
  })

  it('P08 страница без внешних ресурсов: нет src/href на чужие домены, кроме KNOWN_COURSES', () => {
    const html = renderToStaticMarkup(<LadderGrid locale="ru" />) + renderToStaticMarkup(<LadderGrid locale="en" />)
    expect(html).not.toMatch(/src="https?:\/\//)
    const allowed = KNOWN_COURSES.flatMap((course) => [course.ru, course.en])
    for (const match of html.matchAll(/href="(https?:\/\/[^\"]+)"/g)) expect(allowed.some((url) => match[1].startsWith(url))).toBe(true)
    expect(FAMILIES.length).toBeGreaterThan(0)
    expect(FORMATS.length).toBeGreaterThan(0)
    expect(CHANNELS.length).toBe(3)
  })

  it('P09 «Где я сейчас»: клетка появляется только когда выбраны все три поля', () => {
    expect(draftToCell({ rung: 'small', channel: '', eventClass: '' })).toBeNull()
    expect(draftToCell({ rung: 'small', channel: 'online', eventClass: '' })).toBeNull()
    expect(draftToCell({ rung: 'small', channel: 'online', eventClass: 'regular' }))
      .toEqual({ rung: 'small', channel: 'online', eventClass: 'regular' })
  })

  it('P10 «Скопировать» кладёт подписи, а не id', () => {
    const m: MyMap = {
      now: { rung: 'small', channel: 'online', eventClass: 'regular' },
      next: { formatId: 'groups', formatName: null, text: '', date: '2026-11-15' }, signal: 'люди возвращаются',
    }
    const text = mapAsText(m, 'ru')
    expect(text).toContain('Малая группа, Онлайн, Регулярное')
    expect(text).toContain('Группы, 2026-11-15')
    expect(text).not.toContain('small')
    expect(mapAsText(m, 'en')).toContain('Small group, Online, Regular')
  })

  it('P11 пропавший формат открывается как «свой формат» с сохранённым названием', () => {
    const m: MyMap = { ...EMPTY_MAP, next: { formatId: 'gone', formatName: { ru: 'Старый формат', en: 'Old format' }, text: '', date: '' } }
    const settled = settleMissingFormat(m, 'ru')
    expect(settled.next.formatId).toBeNull()
    expect(settled.next.text).toBe('Старый формат')
    const html = renderToStaticMarkup(<MyMapBlock locale="ru" initialMap={settled} />)
    expect(html).toContain('value="Старый формат"')
    expect(html).toContain('value="custom" selected')
  })

  it('P12 карточка показывает класс события своей клетки', () => {
    const html = renderToStaticMarkup(<LadderGrid locale="ru" />)
    const vipassana = html.split('data-format="vipassana"')[1].split('</article>')[0]
    expect(vipassana).toContain('Разовое · Ретрит')
  })
})
