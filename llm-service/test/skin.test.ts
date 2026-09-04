import { describe, it, expect, vi } from 'vitest'
import { classifySkin } from '../src/skin.js'

const ENV = { GATEWAY_URL: 'http://gw.test/v1', GATEWAY_API_KEY: 'k', POOL_SKIN: 'skin-pool' }
function reply(content: string) {
  return { ok: true, status: 200, json: async () => ({ choices: [{ message: { content } }] }) }
}

describe('classifySkin', () => {
  it('возвращает скин из перечня', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"skin":"cyber-noir"}'))
    await expect(classifySkin('Blade Runner', ENV, f as any)).resolves.toBe('cyber-noir')
  })

  it('скин вне перечня = bad_shape, а не выдуманное значение в БД', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"skin":"steampunk"}'))
    await expect(classifySkin('X', ENV, f as any)).rejects.toMatchObject({ code: 'bad_shape' })
  })

  it('берёт пул из POOL_SKIN', async () => {
    const f = vi.fn().mockResolvedValue(reply('{"skin":"wanderer"}'))
    await classifySkin('X', ENV, f as any)
    expect(JSON.parse(f.mock.calls[0][1].body).model).toBe('skin-pool')
  })
})
