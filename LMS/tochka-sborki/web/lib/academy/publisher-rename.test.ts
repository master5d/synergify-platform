import { describe, it, expect } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

// Vitest runs from the web/ package root, so these are web-relative paths.
const SOURCES = [
  'lib/course.ts',
  'lib/course/certificate.ts',
  'lib/dictionaries.ts',
  'app/layout.tsx',
]

describe('publisher rename drift-guard', () => {
  it('no consumer source still hardcodes the old institute name', () => {
    for (const rel of SOURCES) {
      const src = readFileSync(join(process.cwd(), rel), 'utf8')
      expect(src, rel).not.toContain('Mamaev Institute for AI')
    }
  })
})
