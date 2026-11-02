import { describe, it, expect } from 'vitest'
import { join } from 'node:path'
import { pathToFileURL } from 'node:url'
import { validateConcepts, linkFirstMentions, plainText, findOccurrences, BOUNDARY_BEFORE as B, BOUNDARY_AFTER as A } from './concepts'
import { parseMdx, toNotionMarkdown } from './md'
import type { Concept } from './types'
import { PACK_SLUG, PACK_DIR } from '../pack'

const re = (s: string, f = 'i') => new RegExp(`${B}(?:${s})${A}`, f)
const mk = (id: string, ru: string, en: string, forms: [string, string], unit: string): Concept => ({
  id, term: { ru, en }, forms: { ru: re(forms[0]), en: re(forms[1]) },
  short: { ru: `${ru} — это.`, en: `${en} is.` }, source: { unit, heading: { ru: ru, en: en } }, related: [],
})
const STATE = mk('state-md', 'STATE.md', 'STATE.md', ['STATE\\.md', 'STATE\\.md'], '01-alpha/u2-deep')
const AGENT = mk('agent', 'агент', 'agent', ['агент(?:а|у|ом|е|ы|ов|ам|ами|ах)?', 'agents?'], '01-alpha/u1-start')
const AI_AGENT = mk('ai-agent', 'AI-агент', 'AI agent', ['AI-агент(?:а|у|ом|е|ы|ов)?', 'AI agents?'], '01-alpha/u1-start')
const render = (src: string, unitKey: string | null = '02-beta/u1-next', locale: 'ru' | 'en' = 'ru') => {
  const tree = parseMdx(src)
  linkFirstMentions(tree, { concepts: [STATE, AGENT, AI_AGENT], locale, unitKey, href: (id) => `https://www.notion.so/${id}` })
  return toNotionMarkdown(tree)
}
const renderWith = (concepts: Concept[], src: string) => {
  const tree = parseMdx(src)
  linkFirstMentions(tree, { concepts, locale: 'ru', unitKey: null, href: (id) => `https://www.notion.so/${id}` })
  return toNotionMarkdown(tree)
}
const AB = mk('ab', 'alpha beta', 'alpha beta', ['alpha beta', 'alpha beta'], '09-z/u1-z')
const BG = mk('bg', 'beta gamma', 'beta gamma', ['beta gamma', 'beta gamma'], '09-z/u1-z')
const BGD = mk('bgd', 'beta gamma delta', 'beta gamma delta', ['beta gamma delta', 'beta gamma delta'], '09-z/u1-z')
const AL = mk('al', 'alpha', 'alpha', ['alpha', 'alpha'], '09-z/u1-z')

type GlossaryLike = { banned: { ru: RegExp[]; en: RegExp[] }; allow?: string[] }
function glossaryViolations(concepts: Concept[], glossary: GlossaryLike[]): string[] {
  const violations: string[] = []
  for (const concept of concepts) {
    for (const locale of ['ru', 'en'] as const) {
      for (const field of ['term', 'short'] as const) {
        const text = concept[field][locale]
        for (const entry of glossary) {
          if (entry.allow?.some((snippet) => text.toLocaleLowerCase().includes(snippet.toLocaleLowerCase()))) continue
          for (const banned of entry.banned[locale]) {
            const match = text.match(banned)
            if (match) violations.push(`${concept.id}.${field}.${locale}: ${match[0]}`)
          }
        }
      }
    }
  }
  return violations
}

describe('validateConcepts', () => {
  it('чистый список — без ошибок', () => expect(validateConcepts([STATE, AGENT, AI_AGENT])).toEqual([]))
  it.each([
    ['повтор id', [STATE, STATE], /state-md/],
    ['неизвестный related', [{ ...STATE, related: ['nope'] }], /related/],
    ['форма без границ слова', [{ ...STATE, forms: { ru: /STATE\.md/i, en: STATE.forms.en } }], /границ/],
    ['флаг g у формы', [{ ...STATE, forms: { ru: re('STATE\\.md', 'gi'), en: STATE.forms.en } }], /флаг/],
    ['пустой short.en', [{ ...STATE, short: { ru: 'x', en: '' } }], /short\.en/],
    ['id не kebab-case', [{ ...STATE, id: 'State_MD' }], /id.*State_MD/],
    ['«Коротко» длиннее 300 знаков', [{ ...STATE, short: { ru: 'а'.repeat(301), en: 'x' } }], /300/],
    ['повтор термина', [STATE, { ...AGENT, term: { ru: 'STATE.md', en: 'agent' } }], /term.*STATE\.md/],
  ])('%s', (_n, list, rx) => expect(validateConcepts(list as Concept[]).join('\n')).toMatch(rx))
})

describe('linkFirstMentions', () => {
  it('первое упоминание — ссылка, второе — текст', () => {
    expect(render('Открой STATE.md. Потом снова STATE.md.')).toBe('Открой [STATE.md](https://www.notion.so/state-md). Потом снова STATE.md.')
  })
  it('код, ссылки и заголовки не трогает; inline-код, равный форме целиком, — упоминание', () => {
    const out = render('## STATE.md\n\n`STATE.md` и [STATE.md](https://x.y)\n\n```\nSTATE.md\n```\n\nпотом STATE.md')
    expect(out.match(/\(https:\/\/www\.notion\.so\/state-md\)/g)).toHaveLength(1)
    expect(out).toContain('[`STATE.md`](https://www.notion.so/state-md) и [STATE.md](https://x.y)')
    expect(out).toContain('потом STATE.md')
    expect(out).not.toContain('потом [STATE.md]')
  })
  it('фраза 11/u1: ссылкой становится только inline-код, равный форме', () => {
    expect(render('Вспомни модуль 05: `AGENTS.md`, `TODO.md`, `STATE.md`.')).toBe('Вспомни модуль 05: `AGENTS.md`, `TODO.md`, [`STATE.md`](https://www.notion.so/state-md).')
  })
  it('форма внутри inline-кода не целиком — не упоминание', () => {
    expect(render('Запусти `rm STATE.md`, потом открой STATE.md.')).toBe('Запусти `rm STATE.md`, потом открой [STATE.md](https://www.notion.so/state-md).')
  })
  it('длинная форма побеждает короткую', () => expect(render('Наш AI-агент работает')).toContain('[AI-агент](https://www.notion.so/ai-agent)'))
  it('в юните-источнике понятие не ссылается само на себя', () => expect(render('Открой STATE.md', '01-alpha/u2-deep')).toBe('Открой STATE.md'))
  it('заглавная в начале фразы — тоже упоминание', () => expect(render('Агент ответил')).toContain('[Агент](https://www.notion.so/agent)'))
  it('слово внутри другого слова — не упоминание', () => expect(render('субагент ответил')).toBe('субагент ответил'))
  it('EN-страница ищет EN-формы', () => expect(render('Two agents talk', null, 'en')).toContain('[agents](https://www.notion.so/agent)'))
  it('частичное пересечение: побеждает более длинное совпадение, даже если оно начинается позже', () => {
    expect(renderWith([AB, BGD], 'alpha beta gamma delta')).toBe('alpha [beta gamma delta](https://www.notion.so/bgd)')
  })
  it('пересечение равной длины: побеждает понятие раньше в списке', () => {
    expect(renderWith([AB, BG], 'alpha beta gamma')).toBe('[alpha beta](https://www.notion.so/ab) gamma')
    expect(renderWith([BG, AB], 'alpha beta gamma')).toBe('alpha [beta gamma](https://www.notion.so/bg)')
  })
  it('общее начало: более длинное совпадение побеждает при любом порядке в списке', () => {
    expect(renderWith([AL, AB], 'alpha beta')).toBe('[alpha beta](https://www.notion.so/ab)')
    expect(renderWith([AB, AL], 'alpha beta')).toBe('[alpha beta](https://www.notion.so/ab)')
  })
  it('у понятия с несколькими формами ссылкой становится первое вхождение, а не самое длинное', () => {
    expect(render('Агент и агентами')).toBe('[Агент](https://www.notion.so/agent) и агентами')
  })
  it('после замены узла соседний узел тоже проверяется', () => {
    expect(render('агент**STATE.md**')).toContain('[STATE.md](https://www.notion.so/state-md)')
    expect(render('агент`STATE.md`')).toContain('[`STATE.md`](https://www.notion.so/state-md)')
  })
  it('текст ссылки не становится упоминанием, следующее упоминание — ссылка', () => {
    expect(render('[STATE.md](https://x.y) и потом STATE.md')).toBe('[STATE.md](https://x.y) и потом [STATE.md](https://www.notion.so/state-md)')
    expect(render('[STATE.md][r] и потом STATE.md\n\n[r]: https://x.y')).toContain('[STATE.md][r] и потом [STATE.md](https://www.notion.so/state-md)')
  })
})

describe('plainText и findOccurrences', () => {
  it('без забора кода, с текстом inline-кода и детей компонентов', () => {
    expect(plainText('Текст `код`\n\n```\nне это\n```\n\n<OsBlock os="mac">\n\nвнутри\n\n</OsBlock>')).toBe('Текст код внутри')
  })
  it('пункты списка и ячейки таблицы не слипаются', () => {
    expect(plainText('- один\n- два\n\n| a | b |\n|---|---|\n| c | d |')).toBe('один два a b c d')
  })
  it('юниты с упоминанием — в порядке входа', () => {
    expect(findOccurrences([STATE], 'ru', [{ key: 'a', text: 'про STATE.md' }, { key: 'b', text: 'нет' }, { key: 'c', text: 'и STATE.md' }]).get('state-md')).toEqual(['a', 'c'])
  })
})

describe('glossaryViolations', () => {
  it('ловит запрещённый вариант и пропускает строку с разрешённым контекстом (allow)', () => {
    const glossary = [{ banned: { ru: [/пайплайн/i], en: [/pipeline/i] }, allow: ['контент-конвейер'] }]
    const bad = { ...STATE, id: 'x', short: { ru: 'Пайплайн — цепочка шагов.', en: 'A pipeline is a chain.' } }
    const ok = { ...STATE, id: 'y', short: { ru: 'Контент-конвейер, а не пайплайн.', en: 'A chain.' } }
    expect(glossaryViolations([bad], glossary)).toEqual(['x.short.ru: Пайплайн', 'x.short.en: pipeline'])
    expect(glossaryViolations([ok], glossary)).toEqual([])
  })
})

describe.runIf(PACK_SLUG === 'tochka-sborki')('словарь pack’а', () => {
  it('схема без ошибок', async () => {
    const { CONCEPTS } = await import(pathToFileURL(join(PACK_DIR, 'concepts.ts')).href)
    expect(validateConcepts(CONCEPTS)).toEqual([])
  })
  it('термины и короткие описания не нарушают канон словаря', async () => {
    const { CONCEPTS } = await import(pathToFileURL(join(PACK_DIR, 'concepts.ts')).href)
    const { GLOSSARY } = await import(pathToFileURL(join(PACK_DIR, 'glossary.ts')).href)
    expect(GLOSSARY.length).toBeGreaterThan(0)
    expect(glossaryViolations(CONCEPTS, GLOSSARY)).toEqual([])
  })
})
