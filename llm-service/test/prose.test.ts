import { describe, it, expect, vi } from 'vitest'
import { generateProse } from '../src/prose.js'
import { buildProsePrompt } from '../src/prompts.js'

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
