import { describe, it, expect } from 'vitest'
import { readFileSync } from 'fs'
import { dirname, join } from 'path'
import { fileURLToPath } from 'url'
import { buildCompanionRolePrompt } from './intake/companion-role-prompt'
import { academyCompanionLayer, PEER_PRINCIPLES } from './academy/companion'

const HERE = dirname(fileURLToPath(import.meta.url))
const src = readFileSync(join(HERE, 'intake', 'companion-role-prompt.ts'), 'utf8')

describe('academyCompanionLayer threads into the standing companion role (no drift)', () => {
  for (const locale of ['ru', 'en'] as const) {
    it(`guest branch carries the academy layer (${locale})`, () => {
      const out = buildCompanionRolePrompt(null, locale)
      expect(out).toContain(academyCompanionLayer(locale))
      for (const p of PEER_PRINCIPLES) {
        expect(out).toContain(locale === 'en' ? p.directive.en : p.directive.ru)
      }
    })
  }

  it('all four branches call the layer (guest+profile × ru+en)', () => {
    const calls = src.match(/academyCompanionLayer\(locale\)/g) ?? []
    expect(calls.length).toBe(4)
  })
})
