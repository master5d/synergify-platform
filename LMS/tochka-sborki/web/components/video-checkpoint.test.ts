import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'video-checkpoint.tsx'), 'utf8')

describe('VideoCheckpoint transcript wiring', () => {
  it('accepts transcript + locale props', () => {
    expect(src).toMatch(/transcript\?:\s*string/)
    expect(src).toMatch(/locale\?:\s*'ru'\s*\|\s*'en'/)
  })
  it('renders the shared MediaTranscript disclosure', () => {
    expect(src).toContain('MediaTranscript')
  })
})
