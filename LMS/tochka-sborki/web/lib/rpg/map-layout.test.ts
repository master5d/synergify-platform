// web/lib/rpg/map-layout.test.ts
import { describe, it, expect } from 'vitest'
import { nodePositions } from './map-layout'

describe('nodePositions', () => {
  it('returns one point per node within the viewBox', () => {
    const pts = nodePositions(9, 100, 100, 3)
    expect(pts).toHaveLength(9)
    for (const p of pts) { expect(p.x).toBeGreaterThanOrEqual(0); expect(p.x).toBeLessThanOrEqual(100) }
  })
  it('snakes: row 0 left→right, row 1 right→left', () => {
    const pts = nodePositions(6, 90, 90, 3) // 2 rows of 3
    expect(pts[0].x).toBeLessThan(pts[2].x)   // row 0 ascending
    expect(pts[3].x).toBeGreaterThan(pts[5].x) // row 1 descending
  })
})
