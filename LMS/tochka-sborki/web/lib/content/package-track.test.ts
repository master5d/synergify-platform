import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = join(HERE, '..', '..', 'content') // web/content
const read = (loc: 'ru' | 'en') => readFileSync(join(CONTENT, loc, 'exercises.mdx'), 'utf8')

const ANCHORS = [
  'offer-1-gift.md', 'offer-2-core.md', 'offer-3-design.md',
  'offer-4-build.md', 'offer-5-share.md',
]

describe('package-expertise track', () => {
  it('ru exercises.mdx contains the track heading and all five save-anchors', () => {
    const src = read('ru')
    expect(src).toContain('Упакуй свою экспертизу в продукт')
    for (const a of ANCHORS) expect(src).toContain(a)
  })
  it('en exercises.mdx contains the track heading and all five save-anchors', () => {
    const src = read('en')
    expect(src).toContain('Package your expertise into a product')
    for (const a of ANCHORS) expect(src).toContain(a)
  })
  it('the ru and en intro lines differ (bilingual, not a copy)', () => {
    expect(read('ru')).toContain('машина для денег')
    expect(read('en')).toContain('money machine')
  })
})
