import { describe, it, expect } from 'vitest'
import { buildCompanionRolePrompt } from './intake/companion-role-prompt'
import { academyCompanionLayer, PEER_PRINCIPLES } from './academy/companion'

// Minimal profile shape consumed via profileToCharter (world_skin + niche + answers).
const profile = { world_skin: 'cyber_noir', niche: 'coach', outcome: 'первые клиенты', answers: '{}' }

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

  // Поведение, а не подсчёт вызовов в исходнике: раньше тест ждал ровно 4 вызова и падал на
  // рефакторинге без смены поведения (intake LMS#16 свернул ветки ru/en в одну).
  it('all four branches carry the layer (guest+profile × ru+en)', () => {
    for (const locale of ['ru', 'en'] as const) {
      for (const p of [null, profile]) {
        expect(buildCompanionRolePrompt(p, locale), `${p ? 'profile' : 'guest'} × ${locale}`).toContain(academyCompanionLayer(locale))
      }
    }
  })
})
