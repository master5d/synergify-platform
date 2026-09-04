import { describe, it, expect, vi } from 'vitest'
import { classifyDemand, draftBrief } from '../src/demand.js'

const ENV = {
  GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'k',
  POOL_DEMAND_CLASSIFY: 'c-pool', POOL_DEMAND_BRIEF: 'b-pool',
}
const CATALOG = [{ slug: '00-kickstart', topic: { ru: 'а', en: 'a' } }]
const SIGNALS = [{ source: 'F3', text: 'bot that books my clients' }]
const ITEM = {
  classification: 'gap', matched_module: null, gap_topic_key: 'telegram-intake-bot',
  gap_topic_label: { ru: 'Бот', en: 'Bot' }, feasibility_note: null, value_tier: 'high',
}
function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}

describe('classifyDemand', () => {
  it('возвращает по элементу на сигнал', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ items: [ITEM] })))
    await expect(classifyDemand(SIGNALS, CATALOG, ENV, f as any)).resolves.toEqual([ITEM])
  })

  it('длина не совпала с числом сигналов = bad_shape — иначе ответы разъедутся по строкам', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ items: [ITEM, ITEM] })))
    await expect(classifyDemand(SIGNALS, CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('пустой список сигналов не ходит в гейтвей вовсе', async () => {
    const f = vi.fn()
    await expect(classifyDemand([], CATALOG, ENV, f as any)).resolves.toEqual([])
    expect(f).not.toHaveBeenCalled()
  })
})

describe('draftBrief', () => {
  const BRIEF = {
    proposed_type: 'unit', title: { ru: 'Т', en: 'T' }, learning_objective: 'o',
    slot: '03', agentic_approach: 'a', unit_count_estimate: 2, source_quotes: ['q'],
  }
  it('возвращает разобранный бриф', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify(BRIEF)))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any)).resolves.toEqual(BRIEF)
  })
  it('берёт пул из POOL_DEMAND_BRIEF', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify(BRIEF)))
    await draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any)
    expect(JSON.parse(f.mock.calls[0][1].body).model).toBe('b-pool')
  })
})
