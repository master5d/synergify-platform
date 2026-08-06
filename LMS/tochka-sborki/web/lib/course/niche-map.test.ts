// web/lib/rpg/niche-map.test.ts
import { describe, it, expect } from 'vitest'
import { NICHE_MODULE } from './niche-map'
import { MODULE_SLUGS } from '@/lib/rpg/modules'

describe('NICHE_MODULE', () => {
  it('maps every niche to a real module slug', () => {
    for (const slug of Object.values(NICHE_MODULE)) {
      expect(MODULE_SLUGS).toContain(slug)
    }
  })
  it('covers the F2 niche values', () => {
    for (const n of ['coach','massage','astrology','content','ecommerce','service','tech','other']) {
      expect(NICHE_MODULE[n]).toBeTruthy()
    }
  })
})
