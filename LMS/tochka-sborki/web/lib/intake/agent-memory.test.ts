import { describe, it, expect } from 'vitest'
import { AGENT_MEMORY } from './agent-memory'

describe('AGENT_MEMORY', () => {
  it('covers the four external agents', () => {
    expect(AGENT_MEMORY).toHaveLength(4)
    expect(AGENT_MEMORY.map(a => a.key)).toEqual(['chatgpt', 'claude', 'gemini', 'copilot'])
  })

  it('gives a non-empty "where to paste" instruction in both locales for every agent', () => {
    for (const a of AGENT_MEMORY) {
      expect(a.label.length).toBeGreaterThan(0)
      expect(a.where.ru.length).toBeGreaterThan(0)
      expect(a.where.en.length).toBeGreaterThan(0)
    }
  })
})
