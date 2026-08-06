import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'media-transcript.tsx'), 'utf8')

describe('MediaTranscript', () => {
  it('returns null when text is empty (dark-ship invariant)', () => {
    expect(src).toMatch(/if\s*\(!text\)\s*return null/)
  })
  it('uses a native <details> disclosure', () => {
    expect(src).toContain('<details')
    expect(src).toContain('<summary')
  })
  it('labels the summary bilingually', () => {
    expect(src).toContain('Транскрипт')
    expect(src).toContain('Transcript')
  })
})
