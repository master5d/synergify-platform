import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { handleSupportCheckout, handleProductCheckout } from './checkout'
import type { Env } from '../lib/types'
import { PRODUCTS } from '../lib/products'

afterEach(() => vi.restoreAllMocks())

function req(body: unknown): Request {
  return new Request('https://ai.synergify.com/api/checkout/support', {
    method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
  })
}

describe('handleSupportCheckout', () => {
  it('creates a Stripe session and returns its url', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/xyz' }), { status: 200 }))
    const res = await handleSupportCheckout(req({ amount: 700, locale: 'ru' }), { STRIPE_SECRET_KEY: 'sk_test' } as Env)
    expect(res.status).toBe(200)
    expect((await res.json() as { url: string }).url).toBe('https://checkout.stripe.com/c/xyz')
    const [url, init] = spy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.stripe.com/v1/checkout/sessions')
    expect((init.headers as Record<string, string>).Authorization).toBe('Bearer sk_test')
  })

  it('returns 503 when the key is not configured', async () => {
    const res = await handleSupportCheckout(req({ amount: 700 }), {} as Env)
    expect(res.status).toBe(503)
  })

  it('returns 400 for an out-of-bounds amount', async () => {
    const res = await handleSupportCheckout(req({ amount: 50 }), { STRIPE_SECRET_KEY: 'sk' } as Env)
    expect(res.status).toBe(400)
  })

  it('returns 502 when Stripe responds non-OK', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('bad', { status: 400 }))
    const res = await handleSupportCheckout(req({ amount: 700 }), { STRIPE_SECRET_KEY: 'sk' } as Env)
    expect(res.status).toBe(502)
  })
})

function preq(body: unknown): Request {
  return new Request('https://ai.synergify.com/api/checkout/product', {
    method: 'POST', body: JSON.stringify(body), headers: { 'Content-Type': 'application/json' },
  })
}

describe('handleProductCheckout', () => {
  // seed an in-memory product for the duration of these tests
  const seeded = { id: 'test-kit', priceCents: 1900,
    name: { ru: 'Набор', en: 'Kit' }, blurb: { ru: 'b', en: 'b' },
    delivery: { kind: 'url' as const, href: 'https://x/y' } }
  beforeEach(() => { PRODUCTS.push(seeded) })
  afterEach(() => { const i = PRODUCTS.indexOf(seeded); if (i >= 0) PRODUCTS.splice(i, 1) })

  it('creates a Stripe session for a known product and returns its url', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ url: 'https://checkout.stripe.com/c/p' }), { status: 200 }))
    const res = await handleProductCheckout(preq({ productId: 'test-kit', locale: 'ru' }), { STRIPE_SECRET_KEY: 'sk_test' } as Env)
    expect(res.status).toBe(200)
    expect((await res.json() as { url: string }).url).toBe('https://checkout.stripe.com/c/p')
    const body = (spy.mock.calls[0][1] as RequestInit).body as string
    expect(body).toContain('unit_amount%5D=1900')
    expect(body).toContain('metadata%5Bproduct_id%5D=test-kit')
  })

  it('returns 503 when the key is not configured', async () => {
    const res = await handleProductCheckout(preq({ productId: 'test-kit' }), {} as Env)
    expect(res.status).toBe(503)
  })

  it('returns 404 for an unknown product', async () => {
    const res = await handleProductCheckout(preq({ productId: 'ghost' }), { STRIPE_SECRET_KEY: 'sk' } as Env)
    expect(res.status).toBe(404)
  })

  it('returns 502 when Stripe responds non-OK', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('bad', { status: 400 }))
    const res = await handleProductCheckout(preq({ productId: 'test-kit' }), { STRIPE_SECRET_KEY: 'sk' } as Env)
    expect(res.status).toBe(502)
  })
})
