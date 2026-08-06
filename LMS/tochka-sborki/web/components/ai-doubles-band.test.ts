import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'ai-doubles-band.tsx'), 'utf8')

describe('AiDoublesBand', () => {
  it('is data-driven from getAiDoubles (renders the list, no hardcoded domain copy)', () => {
    expect(src).toContain('getAiDoubles')
    expect(src).toMatch(/doubles\.map/)
    expect(src).not.toMatch(/Communication|Коммуникация/)
  })
})
