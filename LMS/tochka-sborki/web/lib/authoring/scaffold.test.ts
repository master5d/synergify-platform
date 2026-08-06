import { describe, it, expect } from 'vitest'
import { scaffoldCourse } from './scaffold'
import { SAMPLE_OUTLINE } from './sample-outline'
import { validateOutline } from './outline'
import { lintOutlineDehustle } from './dehustle'

const files = scaffoldCourse(SAMPLE_OUTLINE)
const byPath = (p: string) => files.find(f => f.path === p)

describe('SAMPLE_OUTLINE', () => {
  it('is itself valid and de-hustle clean', () => {
    expect(validateOutline(SAMPLE_OUTLINE)).toEqual([])
    expect(lintOutlineDehustle(SAMPLE_OUTLINE)).toEqual([])
  })
})

describe('scaffoldCourse', () => {
  it('emits both locales for each module + unit', () => {
    expect(byPath('content/ru/01-sample/_meta.json')).toBeDefined()
    expect(byPath('content/en/01-sample/_meta.json')).toBeDefined()
    expect(byPath('content/ru/01-sample/u1-intro.mdx')).toBeDefined()
    expect(byPath('content/en/01-sample/u2-practice.mdx')).toBeDefined()
  })

  it('_meta.json parses to the right shape with localized fields', () => {
    const meta = JSON.parse(byPath('content/ru/01-sample/_meta.json')!.content)
    expect(meta.module).toBe(1)
    expect(meta.level).toBe(1)
    expect(meta.title).toBe('Пример модуля')
    expect(meta.units.map((u: { slug: string }) => u.slug)).toEqual(['u1-intro', 'u2-practice'])
  })

  it('every .mdx has a title frontmatter line and the four Phase tags in order', () => {
    for (const f of files.filter(f => f.path.endsWith('.mdx'))) {
      expect(f.content).toMatch(/^---\ntitle: "/)
      const phases = [...f.content.matchAll(/<Phase type="(\w+)">/g)].map(m => m[1])
      expect(phases).toEqual(['activation', 'reflection', 'concept', 'practice'])
    }
  })

  it('activation/reflection stubs carry no write/type imperatives (drift-guard parity)', () => {
    const block = (mdx: string, type: string) => {
      const re = new RegExp(`<Phase type="${type}">([\\s\\S]*?)</Phase>`)
      return re.exec(mdx)?.[1] ?? ''
    }
    for (const f of files.filter(f => f.path.endsWith('.mdx'))) {
      for (const type of ['activation', 'reflection']) {
        expect(block(f.content, type)).not.toMatch(/\b(напиши|запиши|type|write)\b/i)
      }
    }
  })
})
