import { describe, it, expect } from 'vitest'
import { HELP_TIPS, INTRO_CARDS } from './help-content'

const TIP_IDS = ['shards', 'character', 'world-map', 'daily', 'dungeon-card', 'vault', 'wizard-phases', 'wizard-modes', 'dungeon-stages']
const PAGE_IDS = ['dashboard', 'unit', 'dungeon']

describe('help-content', () => {
  it('defines all 9 referenced tip ids with both locales', () => {
    for (const id of TIP_IDS) {
      expect(HELP_TIPS[id], `missing tip "${id}"`).toBeTruthy()
      expect(HELP_TIPS[id].title.ru.length).toBeGreaterThan(0)
      expect(HELP_TIPS[id].title.en.length).toBeGreaterThan(0)
      expect(HELP_TIPS[id].body.ru.length).toBeGreaterThan(0)
      expect(HELP_TIPS[id].body.en.length).toBeGreaterThan(0)
    }
  })
  it('defines all 3 intro-card pages with both locales', () => {
    for (const p of PAGE_IDS) {
      expect(INTRO_CARDS[p], `missing intro "${p}"`).toBeTruthy()
      expect(INTRO_CARDS[p].title.ru.length).toBeGreaterThan(0)
      expect(INTRO_CARDS[p].title.en.length).toBeGreaterThan(0)
      expect(INTRO_CARDS[p].body.ru.length).toBeGreaterThan(0)
      expect(INTRO_CARDS[p].body.en.length).toBeGreaterThan(0)
    }
  })
})
