import { describe, it, expect } from 'vitest'
import { readdirSync, statSync, readFileSync } from 'fs'
import { dirname, join } from 'path'
import { CONTENT_ROOT, PACK_SLUG } from '../pack'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const CONTENT = CONTENT_ROOT // S3: контент в course-pack

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    return statSync(p).isDirectory() ? walk(p) : p.endsWith('.mdx') ? [p] : []
  })
}

const PHASES = ['activation', 'reflection', 'concept', 'practice'] as const
const files = walk(CONTENT)

describe('Kolb cycle coverage', () => {
  it('discovers unit mdx files', () => {
    // Порог параметризован по pack'у: у Точки Сборки 30+ юнитов (1-в-1), у младших pack'ов — 1+.
    expect(files.length).toBeGreaterThan(PACK_SLUG === 'tochka-sborki' ? 30 : 0)
  })

  it.each(files)('%s', (file) => {
    const src = readFileSync(file, 'utf8')
    if (!/<Phase type="/.test(src)) return // overview page, not a unit
    for (const type of PHASES) {
      const count = (src.match(new RegExp(`<Phase type="${type}"`, 'g')) || []).length
      expect(count, `${file}: missing <Phase type="${type}"> (Kolb stage)`).toBeGreaterThanOrEqual(1)
    }
  })
})
