import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content') // web/content
const read = (loc: 'ru' | 'en') => readFileSync(join(CONTENT, loc, 'exercises.mdx'), 'utf8')

const ANCHORS = [
  'sop-1-pick.md', 'sop-2-document.md', 'sop-3-automate.md',
  'sop-4-build.md', 'sop-5-live.md',
]

describe('automate-practice track', () => {
  it('ru exercises.mdx contains the track heading and all five save-anchors', () => {
    const src = read('ru')
    expect(src).toContain('Задокументируй и автоматизируй свою практику')
    for (const a of ANCHORS) expect(src).toContain(a)
  })
  it('en exercises.mdx contains the track heading and all five save-anchors', () => {
    const src = read('en')
    expect(src).toContain('Document and automate your practice')
    for (const a of ANCHORS) expect(src).toContain(a)
  })
  it('the ru and en intro markers differ (bilingual, not a copy)', () => {
    expect(read('ru')).toContain('контент-конвейер')
    expect(read('en')).toContain('content mill')
  })
})
