import { describe, it, expect } from 'vitest'
import { parseMdx, parseMarkdown, toNotionMarkdown, inlineMd, toggle, callout, pageTag, notionUrl, anchorUrl, TABLE_OF_CONTENTS } from './md'

describe('notion-kb/md', () => {
  it('MDX-компонент разбирается в mdxJsxFlowElement', () => {
    expect(parseMdx('<Phase type="concept">\n\nтекст\n\n</Phase>').children[0]).toMatchObject({ type: 'mdxJsxFlowElement', name: 'Phase' })
  })
  it('маркер списка «-», разделитель «---»', () => {
    const out = toNotionMarkdown(parseMarkdown('* a\n* b\n\n***'))
    expect(out).toMatch(/^- a\n- b$/m)
    expect(out).toMatch(/^---$/m)
  })
  it('литеральный тег в прозе экранируется как \\<', () => {
    expect(toNotionMarkdown(parseMarkdown('пиши \\<b> тут'))).toBe('пиши \\<b> тут')
  })
  it('| в ячейке таблицы экранируется', () => {
    expect(toNotionMarkdown(parseMarkdown('| a |\n|---|\n| x \\| y |'))).toContain('x \\| y')
  })
  it('код с ``` внутри получает забор из четырёх обратных кавычек', () => {
    expect(toNotionMarkdown(parseMarkdown('````md\n```js\nx\n```\n````')).startsWith('````md\n')).toBe(true)
  })
  it('inlineMd сохраняет inline-код', () => {
    expect(inlineMd('Что хранит `STATE.md`?')).toBe('Что хранит `STATE.md`?')
  })
  it('теги Notion', () => {
    expect(toggle('Заголовок', 'тело')).toBe('<toggle>\nЗаголовок\n\nтело\n</toggle>')
    expect(callout('🧭', 'тело')).toBe('<callout icon="🧭">\nтело\n</callout>')
    expect(pageTag('https://www.notion.so/ab', 'A <b>')).toBe('<page url="https://www.notion.so/ab">A &lt;b&gt;</page>')
    expect(TABLE_OF_CONTENTS).toBe('<table-of-contents />')
  })
  it('адреса Notion — без дефисов', () => {
    expect(notionUrl('1d407c94-a4a7-807f-84cb-cac646a67fe5')).toBe('https://www.notion.so/1d407c94a4a7807f84cbcac646a67fe5')
    expect(anchorUrl('https://www.notion.so/aabb', 'cc-dd')).toBe('https://www.notion.so/aabb#ccdd')
  })
})
