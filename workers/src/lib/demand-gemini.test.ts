import { describe, it, expect, vi } from 'vitest'
import { classifyDemand } from './demand-gemini'
import { COURSE_CATALOG } from './course-catalog'

function geminiResponse(jsonText: string) {
  return { ok: true, json: async () => ({ candidates: [{ content: { parts: [{ text: jsonText }] } }] }) }
}

describe('classifyDemand', () => {
  it('parses a JSON array of classifications', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(geminiResponse(JSON.stringify([
      { classification: 'gap', matched_module: null, gap_topic_key: 'telegram-intake-bot',
        gap_topic_label: { ru: 'Телеграм-бот приёма заявок', en: 'Telegram intake bot' },
        feasibility_note: null, value_tier: 'high' },
    ])))
    const out = await classifyDemand([{ source: 'F3', text: 'bot that books my clients' }], COURSE_CATALOG, 'key', fetchImpl as any)
    expect(out).toHaveLength(1)
    expect(out[0].classification).toBe('gap')
    expect(out[0].gap_topic_key).toBe('telegram-intake-bot')
  })

  it('falls back to unclassified markers on failure', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    const out = await classifyDemand(
      [{ source: 'F3', text: 'x' }, { source: 'F2_other', text: 'y' }],
      COURSE_CATALOG, 'key', fetchImpl as any,
    )
    expect(out).toHaveLength(2)
    expect(out.every(c => c.classification === 'unclassified')).toBe(true)
    expect(out.every(c => c.value_tier === 'normal')).toBe(true)
  })
})

import { draftBrief } from './demand-gemini'

describe('draftBrief', () => {
  const label = { ru: 'Телеграм-бот приёма заявок', en: 'Telegram intake bot' }

  it('parses a proposal JSON', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(geminiResponse(JSON.stringify({
      proposed_type: 'unit', title: { ru: 'Бот заявок', en: 'Intake bot' },
      learning_objective: 'Build a Telegram intake bot', slot: 'unit inside 07-tools',
      agentic_approach: 'Use an agent + Telegram MCP', unit_count_estimate: 1,
      source_quotes: ['bot that books my clients'],
    })))
    const p = await draftBrief(label, ['bot that books my clients'], COURSE_CATALOG, 'key', fetchImpl as any)
    expect(p.proposed_type).toBe('unit')
    expect(p.title.en).toBe('Intake bot')
  })

  it('falls back to a template proposal on failure', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({ ok: false, status: 500, json: async () => ({}) })
    const p = await draftBrief(label, ['q1', 'q2'], COURSE_CATALOG, 'key', fetchImpl as any)
    expect(p.proposed_type).toBe('unit')
    expect(p.title.ru).toContain('Телеграм-бот')
    expect(p.source_quotes).toEqual(['q1', 'q2'])
  })
})
