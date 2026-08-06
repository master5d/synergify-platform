// web/lib/rpg/quest-lines.test.ts
import { describe, it, expect } from 'vitest'
import { QUEST_LINES } from './quest-lines'
import { MODULE_SLUGS } from './modules'

describe('QUEST_LINES', () => {
  const classes = ['artificer','mage','operator','healer','sovereign','wanderer'] as const
  it('defines an order for every class', () => {
    for (const c of classes) expect(QUEST_LINES[c]).toBeDefined()
  })
  it('each order is a full permutation of the 9 module slugs', () => {
    for (const c of classes) {
      expect([...QUEST_LINES[c]].sort()).toEqual([...MODULE_SLUGS].sort())
    }
  })
  it('wanderer is the default ascending order', () => {
    expect(QUEST_LINES.wanderer).toEqual([...MODULE_SLUGS])
  })
})
