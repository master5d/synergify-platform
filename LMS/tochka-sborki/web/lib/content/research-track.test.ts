import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content') // web/content
const read = (loc: 'ru' | 'en') => readFileSync(join(CONTENT, loc, 'exercises.mdx'), 'utf8')

const ANCHORS = [
  'research-1-question.md', 'research-2-loop.md', 'research-3-deep.md',
  'research-4-verify.md', 'research-5-synthesis.md',
]

describe('research-with-AI track', () => {
  it('ru exercises.mdx contains the track heading and all five save-anchors', () => {
    const src = read('ru')
    expect(src).toContain('Поиск с ИИ')
    for (const a of ANCHORS) expect(src).toContain(a)
  })
  it('en exercises.mdx contains the track heading and all five save-anchors', () => {
    const src = read('en')
    expect(src).toContain('Research with AI')
    for (const a of ANCHORS) expect(src).toContain(a)
  })
  it('the ru and en verification markers differ (bilingual, not a copy)', () => {
    expect(read('ru')).toContain('не верь без источника')
    expect(read('en')).toContain('don’t trust the unsourced')
  })
})
