import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { sendPurchaseEmail } from './purchase-email'
import { sendEmailSES } from './ses'
import type { Product } from './products'
import type { Env } from './types'

vi.mock('./ses', () => ({ sendEmailSES: vi.fn() }))
const sesMock = vi.mocked(sendEmailSES)

afterEach(() => vi.restoreAllMocks())
beforeEach(() => sesMock.mockReset())

const product: Product = {
  id: 'kit', priceCents: 1900, name: { ru: 'Набор', en: 'Kit' }, blurb: { ru: 'b', en: 'b' },
  delivery: { kind: 'url', href: 'https://x/y' },
}
const env = { SES_ACCESS_KEY_ID: 'AKIATEST', SES_SECRET_ACCESS_KEY: 'secret' } as Env

describe('sendPurchaseEmail', () => {
  it('sends via SES with the asset link and returns true', async () => {
    sesMock.mockResolvedValue({ ok: true, status: 200 })
    const ok = await sendPurchaseEmail(env, { email: 'b@e.com', product, assetUrl: 'https://dl/file', locale: 'ru' })
    expect(ok).toBe(true)
    const [, msg] = sesMock.mock.calls[0]
    expect(msg.to).toBe('b@e.com')
    expect(msg.text).toContain('https://dl/file')
  })
  it('is a no-op (returns false) when SES_ACCESS_KEY_ID is unset', async () => {
    const ok = await sendPurchaseEmail({} as Env, { email: 'b@e.com', product, assetUrl: 'https://dl/f', locale: 'en' })
    expect(ok).toBe(false)
    expect(sesMock).not.toHaveBeenCalled()
  })
  it('returns false (never throws) when SES responds non-OK', async () => {
    sesMock.mockResolvedValue({ ok: false, status: 422, error: 'err' })
    const ok = await sendPurchaseEmail(env, { email: 'b@e.com', product, assetUrl: 'https://dl/f', locale: 'ru' })
    expect(ok).toBe(false)
  })
})
