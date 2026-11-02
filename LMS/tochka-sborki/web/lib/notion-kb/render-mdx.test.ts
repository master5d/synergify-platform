import { describe, it, expect } from 'vitest'
import { renderMdx, withUtm, COMPONENT_RULES, type RenderCtx } from './render-mdx'

const links = {
  page: (k: string) => (['ru/m/01-alpha', 'ru/u/01-alpha/u2-deep', 'en/u/01-alpha/u2-deep'].includes(k) ? `https://www.notion.so/${k.replaceAll('/', '_')}` : null),
  anchor: () => null,
}
const SITE = 'https://ai.synergify.com/lessons/01-alpha/u1-start/?utm_source=notion-kb'
const ctx = (over: Partial<RenderCtx> = {}): RenderCtx => ({
  locale: 'ru', unitKey: '01-alpha/u1-start', siteUrl: SITE, links, domain: 'https://ai.synergify.com', concepts: [],
  checks: [{ id: 'c1', unit: 'u1-start', objective: 'o1', question: 'Что хранит `STATE.md`?', options: ['Задачи', 'Где остановились'], answer: 1, explain: 'Это журнал остановки.' }],
  ...over,
})
const AGENT = { id: 'agent', term: { ru: 'агент', en: 'agent' }, forms: { ru: /(?<![A-Za-zА-Яа-яЁё])(?:агент)(?![A-Za-zА-Яа-яЁё])/i, en: /(?<![A-Za-zА-Яа-яЁё])(?:agent)(?![A-Za-zА-Яа-яЁё])/i }, short: { ru: 'Агент — это.', en: 'An agent is.' }, source: { unit: '02-beta/u1-next', heading: { ru: 'Агент', en: 'Agent' } }, related: [] }
const CONCEPT_LINKS = { page: (k: string) => (k === 'ru/c/agent' ? 'https://www.notion.so/ru_c_agent' : null), anchor: () => null }

describe('renderMdx', () => {
  it('Phase → заголовок фазы, заголовки внутри — на уровень ниже', () => {
    expect(renderMdx('<Phase type="concept">\n\n## Идея\n\nтекст\n\n</Phase>', ctx())).toBe('## 💡 Концепция\n\n### Идея\n\nтекст')
  })
  it('activation несёт пометку «в уме»', () => {
    expect(renderMdx('<Phase type="activation">\n\nвопрос\n\n</Phase>', ctx())).toBe('## ⚡ Активация\n\n*💭 в уме · писать не нужно*\n\nвопрос')
  })
  it('SelfCheck → раскрывашка с вариантами и вложенным ответом', () => {
    expect(renderMdx('<SelfCheck id="c1"/>', ctx())).toBe(
      '<toggle>\n🧩 Проверь себя: Что хранит `STATE.md`?\n\n1. Задачи\n2. Где остановились\n\n<toggle>\nОтвет\n\n**Где остановились** — Это журнал остановки.\n</toggle>\n</toggle>')
  })
  it('SelfCheck с неизвестным id — RenderError, а не пустота', () => expect(() => renderMdx('<SelfCheck id="c9"/>', ctx())).toThrow(/c9/))
  it('OsBlock → раскрывашки Mac и Windows, OsToggle исчезает по правилу', () => {
    expect(renderMdx('<OsToggle />\n\n<OsBlock os="mac">\n\n```bash\nbrew install x\n```\n\n</OsBlock>\n\n<OsBlock os="windows">\n\nwinget\n\n</OsBlock>', ctx()))
      .toBe('<toggle>\n🍎 Mac\n\n```bash\nbrew install x\n```\n</toggle>\n\n<toggle>\n🪟 Windows\n\nwinget\n</toggle>')
  })
  it('site-link → callout со ссылкой на эту страницу сайта', () => {
    expect(renderMdx('<RolePlay id="x"/>', ctx())).toBe(`<callout icon="🧭">\nИнтерактивный блок — на сайте: [открыть →](${SITE})\n</callout>`)
  })
  it('компонент без правила — RenderError с именем и строкой', () => expect(() => renderMdx('текст\n\n<Foo />', ctx())).toThrow(/Foo.*строка 3/))
  it('ссылки: есть страница → Notion; нет → сайт с utm; прочие пути сайта → сайт с utm; внешние — как есть', () => {
    expect(renderMdx('[a](/lessons/01-alpha/u2-deep/) [b](/lessons/02-beta/u1-next/) [c](/try/) [d](https://x.y/z)', ctx())).toBe(
      '[a](https://www.notion.so/ru_u_01-alpha_u2-deep) [b](https://ai.synergify.com/lessons/02-beta/u1-next/?utm_source=notion-kb) [c](https://ai.synergify.com/try/?utm_source=notion-kb) [d](https://x.y/z)')
  })
  it('/en/-ссылка ведёт в EN-дерево, EN-подписи', () => {
    expect(renderMdx('[a](/en/lessons/01-alpha/u2-deep/)', ctx({ locale: 'en' }))).toBe('[a](https://www.notion.so/en_u_01-alpha_u2-deep)')
    expect(renderMdx('<Phase type="concept">\n\nx\n\n</Phase>', ctx({ locale: 'en' }))).toBe('## 💡 Concept\n\nx')
  })
  it('withUtm сохраняет прочие параметры', () => {
    expect(withUtm('https://ai.synergify.com/try/?a=1')).toBe('https://ai.synergify.com/try/?a=1&utm_source=notion-kb')
  })
  it('ссылка на модуль → страница модуля', () => {
    expect(renderMdx('[m](/lessons/01-alpha/)', ctx())).toBe('[m](https://www.notion.so/ru_m_01-alpha)')
  })
  it('ссылка с якорем на страницу Notion — якорь отброшен', () => {
    expect(renderMdx('[a](/lessons/01-alpha/u2-deep/#x)', ctx())).toBe('[a](https://www.notion.so/ru_u_01-alpha_u2-deep)')
  })
  it('ссылка с якорем на сайт — якорь после utm', () => {
    expect(renderMdx('[b](/lessons/02-beta/u1-next/#x)', ctx())).toBe('[b](https://ai.synergify.com/lessons/02-beta/u1-next/?utm_source=notion-kb#x)')
  })
  it('figure со схемой svg → site-link; svg, rect и text внутри правил не требуют', () => {
    const src = '<figure>\n<svg viewBox="0 0 10 10" role="img" aria-label="схема">\n  <rect x="0" y="0" width="5" height="5" />\n  <text x="1" y="2" fontSize="14">AI</text>\n</svg>\n</figure>'
    expect(renderMdx(src, ctx())).toBe(`<callout icon="🧭">\nИнтерактивный блок — на сайте: [открыть →](${SITE})\n</callout>`)
  })
  it('выражение в атрибуте site-link-компонента допустимо', () => {
    expect(renderMdx('<Walkthrough minHeight={520} />', ctx())).toBe(`<callout icon="🧭">\nИнтерактивный блок — на сайте: [открыть →](${SITE})\n</callout>`)
  })
  it('Phase с неизвестным type — RenderError', () => expect(() => renderMdx('<Phase type="nope">\n\nx\n\n</Phase>', ctx())).toThrow(/nope/))
  it('Phase, SelfCheck и OsBlock внутри текста — RenderError', () => {
    expect(() => renderMdx('Текст <Phase type="concept">x</Phase> дальше', ctx())).toThrow(/Phase.*внутри текста/)
    expect(() => renderMdx('Текст <SelfCheck id="c1"/> дальше', ctx())).toThrow(/SelfCheck.*внутри текста/)
    expect(() => renderMdx('Текст <OsBlock os="mac">x</OsBlock> дальше', ctx())).toThrow(/OsBlock.*внутри текста/)
  })
  it('figure не забирает первое упоминание: ссылка встаёт на видимое упоминание после схемы', () => {
    const src = '<figure>\n<svg viewBox="0 0 10 10" role="img" aria-label="схема">\n  <text x="1" y="2" fontSize="14">агент</text>\n</svg>\n</figure>\n\nПотом агент ответил.'
    const md = renderMdx(src, ctx({ concepts: [AGENT], links: CONCEPT_LINKS }))
    expect(md.match(/ru_c_agent/g)).toHaveLength(1)
    expect(md).toContain('Потом [агент](https://www.notion.so/ru_c_agent) ответил.')
  })
  it('figure внутри списка или цитаты тоже не забирает первое упоминание', () => {
    for (const src of ['- <figure><svg><text>агент</text></svg></figure>\n\nПотом агент ответил.', '> <figure>\n> <svg><text>агент</text></svg>\n> </figure>\n\nПотом агент ответил.']) {
      const md = renderMdx(src, ctx({ concepts: [AGENT], links: CONCEPT_LINKS }))
      expect(md.match(/ru_c_agent/g)).toHaveLength(1)
      expect(md).toContain('Потом [агент](https://www.notion.so/ru_c_agent) ответил.')
    }
  })
  it.each(Object.entries(COMPONENT_RULES).filter(([, r]) => r === 'site-link').map(([n]) => n))('%s → callout со ссылкой на сайт', (name) => {
    expect(renderMdx(`<${name} />`, ctx())).toBe(`<callout icon="🧭">\nИнтерактивный блок — на сайте: [открыть →](${SITE})\n</callout>`)
  })
})
