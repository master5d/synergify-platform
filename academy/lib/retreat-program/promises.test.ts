import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { findPromises, PROMISE_PATTERNS } from './promises'

describe('promise patterns', () => {
  it('finds healing claims case-insensitively', () => {
    expect(findPromises('Эта практика исцеляет тревогу')).toContain('исцел')
    expect(findPromises('heals anxiety')).toContain('heals')
    expect(findPromises('improves your health')).toEqual([])
  })
  it('has the manifest healing rule', () => {
    const manifest = readFileSync(join(__dirname, '..', '..', '..', 'LMS', 'tochka-sborki', 'web', 'packs', 'retreat', 'manifest.ts'), 'utf8')
    const rule = manifest.match(/pattern:\s*'([^']+)'\s*,\s*label:\s*'обещание исцеления в описании практики'/u)
    expect(rule?.[1]).toBeTruthy()
    expect(PROMISE_PATTERNS.map((item) => item.pattern)).toContain(rule?.[1])
  })
})
