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

  it('classification вне перечня = bad_shape (индекс в сообщении)', async () => {
    const badItem = { ...ITEM, classification: 'invalid' }
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ items: [badItem] })))
    const e = await classifyDemand(SIGNALS, CATALOG, ENV, f as any).catch((x: any) => x)
    expect(e).toHaveProperty('code', 'bad_shape')
    expect(String(e.message)).toContain('0')
  })

  it('value_tier вне перечня = bad_shape', async () => {
    const badItem = { ...ITEM, value_tier: 'maybe' }
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ items: [badItem] })))
    await expect(classifyDemand(SIGNALS, CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('gap_topic_label без ru = bad_shape', async () => {
    const badItem = { ...ITEM, gap_topic_label: { en: 'Bot' } }
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ items: [badItem] })))
    await expect(classifyDemand(SIGNALS, CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('matched_module как число вместо строки/null = bad_shape', async () => {
    const badItem = { ...ITEM, matched_module: 123 }
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ items: [badItem] })))
    await expect(classifyDemand(SIGNALS, CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
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

  it('proposed_type вне перечня = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, proposed_type: 'invalid' })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('title с пустой ru = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, title: { ru: '', en: 'T' } })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('title без en = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, title: { ru: 'Т' } })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('title как строка вместо объекта = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, title: 'Title' })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('learning_objective пустая строка = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, learning_objective: '' })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('unit_count_estimate как строка = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, unit_count_estimate: '2' })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('source_quotes как строка вместо массива = bad_shape', async () => {
    const f = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...BRIEF, source_quotes: 'quote' })))
    await expect(draftBrief({ ru: 'Т', en: 'T' }, ['q'], CATALOG, ENV, f as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })
})
