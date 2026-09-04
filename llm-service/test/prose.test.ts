import { describe, it, expect, vi } from 'vitest'
import { generateProse } from '../src/prose.js'
import { buildProsePrompt, buildBriefPrompt } from '../src/prompts.js'

const ENV = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'k', POOL_PROSE: 'test-pool' }
const INPUT = {
  charClass: 'Архитектор Систем', worldSkin: 'slavic-myth', language: 'ru',
  register: 'warm', niche: 'йога', aspirational: 'Илья Муромец',
  firstWin: 'бот записи', successDef: 'школа без меня',
}
const GOOD = {
  legendaryTitle: 'Зодчий', backstory: 'Словно богатырь…',
  firstQuest: 'Оживить бота', finalBoss: 'Морок надзора',
}
function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}

describe('buildProsePrompt', () => {
  it('несёт язык, скин, класс и фигуру вдохновения', () => {
    const p = buildProsePrompt(INPUT)
    expect(p).toContain('slavic-myth')
    expect(p).toContain('Илья Муромец')
    expect(p).toContain('STRICT JSON')
  })
})

describe('generateProse', () => {
  it('возвращает разобранную прозу', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify(GOOD)))
    await expect(generateProse(INPUT, ENV, fetchImpl as any)).resolves.toEqual(GOOD)
  })

  it('берёт пул из POOL_PROSE, а не из хардкода', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify(GOOD)))
    await generateProse(INPUT, ENV, fetchImpl as any)
    expect(JSON.parse(fetchImpl.mock.calls[0][1].body).model).toBe('test-pool')
  })

  it('пустое поле = bad_shape, а не молчаливая дыра в листе', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify({ ...GOOD, finalBoss: '' })))
    await expect(generateProse(INPUT, ENV, fetchImpl as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('отсутствующее поле = bad_shape', async () => {
    const { backstory, ...rest } = GOOD
    const fetchImpl = vi.fn().mockResolvedValue(reply(JSON.stringify(rest)))
    await expect(generateProse(INPUT, ENV, fetchImpl as any))
      .rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('ответ в ```-заборе разбирается', async () => {
    const fetchImpl = vi.fn().mockResolvedValue(reply('```json\n' + JSON.stringify(GOOD) + '\n```'))
    await expect(generateProse(INPUT, ENV, fetchImpl as any)).resolves.toEqual(GOOD)
  })
})

describe('buildBriefPrompt', () => {
  it('содержит явное упоминание допустимых значений proposed_type', () => {
    const prompt = buildBriefPrompt(
      { ru: 'Тест', en: 'Test' },
      ['quote 1', 'quote 2'],
      [{ slug: '01', topic: { ru: 'Модуль', en: 'Module' } }]
    )
    expect(prompt).toContain('"module"')
    expect(prompt).toContain('"unit"')
    expect(prompt).toContain('lowercase')
  })

  it('содержит условие что unit_count_estimate целое число', () => {
    const prompt = buildBriefPrompt(
      { ru: 'Тест', en: 'Test' },
      ['quote 1'],
      [{ slug: '01', topic: { ru: 'Модуль', en: 'Module' } }]
    )
    expect(prompt).toContain('integer')
    expect(prompt).toMatch(/not.*string|not.*range|not.*decimal/)
  })

  it('содержит условие что source_quotes массив строк из цитат', () => {
    const prompt = buildBriefPrompt(
      { ru: 'Тест', en: 'Test' },
      ['quote 1'],
      [{ slug: '01', topic: { ru: 'Модуль', en: 'Module' } }]
    )
    expect(prompt).toContain('source_quotes')
    expect(prompt).toContain('array of strings')
  })

  it('содержит условие что slot строка (вида "03"), не число', () => {
    const prompt = buildBriefPrompt(
      { ru: 'Тест', en: 'Test' },
      ['quote 1'],
      [{ slug: '01', topic: { ru: 'Модуль', en: 'Module' } }]
    )
    expect(prompt).toContain('slot')
    expect(prompt).toContain('string')
    expect(prompt).toMatch(/not.*numeric|not.*number/)
  })
})

