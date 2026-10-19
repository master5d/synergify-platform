import { describe, expect, it } from 'vitest'
import type { VenueIssueId } from './engine'
import { issueText } from './labels'

const IDS: VenueIssueId[] = [
  'weeks-overflow', 'retreat-in-closed-month', 'closed-months-free', 'season-too-short', 'week-loses-money', 'no-annual-costs',
  'guests-over-beds',
]

describe('тексты проверок года площадки', () => {
  it('у каждой проверки есть текст RU и EN, фразы короче 25 слов', () => {
    for (const lang of ['ru', 'en'] as const) {
      for (const id of IDS) {
        const text = issueText({ id, month: 2 }, lang)
        expect(text.length).toBeGreaterThan(0)
        for (const sentence of text.split(/(?<=[.!?])\s+/)) expect(sentence.split(/\s+/).length).toBeLessThan(25)
      }
    }
  })
})
