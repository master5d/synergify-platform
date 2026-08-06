import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = CONTENT_ROOT // S3: контент в course-pack
const read = (loc: 'ru' | 'en') => readFileSync(join(CONTENT, loc, 'exercises.mdx'), 'utf8')

const ANCHORS = [
  'sop-1-pick.md', 'sop-2-document.md', 'sop-3-automate.md',
  'sop-4-build.md', 'sop-5-live.md',
]

// Трек живёт в exercises.mdx Точки Сборки; для других pack'ов его нет по замыслу.
describe.runIf(PACK_SLUG === 'tochka-sborki')('automate-practice track', () => {
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
