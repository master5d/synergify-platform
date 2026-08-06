import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'certificate-page.tsx'), 'utf8')
const certData = readFileSync(join(HERE, '..', '..', 'lib', 'course', 'certificate.ts'), 'utf8')

describe('certificate page — academy admission wiring (S4)', () => {
  it('requests the admission fire-and-forget', () => {
    expect(src).toContain("/api/academy/admission")
    expect(src).toContain("credentials: 'include'")
    expect(src).toMatch(/\.catch\(\(\) => \{\}\)/)
  })

  it('certificate data no longer claims the ticket is symbolic', () => {
    expect(certData).not.toMatch(/SYMBOLIC/i)
    expect(certData).toContain('granted server-side')
  })

  it('shows the academy door only on a server grant (both locales)', () => {
    // Блок-приглашение рендерится ТОЛЬКО при granted — билет сам по себе
    // рендерится одинаково при fail/401 (инвариант fb_6ded7b0b7980 не нарушен).
    expect(src).toContain('academyGranted && (')
    expect(src).toMatch(/d\?\.granted.*setAcademyGranted\(true\)/)
    expect(src).toContain('https://academy.synergify.com/')
    expect(src).toContain('https://academy.synergify.com/en/')
  })
})
