import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'showcase-video.tsx'), 'utf8')

describe('ShowcaseVideo a11y wiring', () => {
  it('renders a caption <track> on the self-hosted <video> when a track is present', () => {
    expect(src).toContain('<track')
    expect(src).toMatch(/kind="captions"/)
    expect(src).toMatch(/captionTrack &&/)
  })
  it('renders the MediaTranscript disclosure', () => {
    expect(src).toContain('MediaTranscript')
  })
})
