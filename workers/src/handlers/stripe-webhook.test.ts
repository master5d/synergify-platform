// workers/src/handlers/stripe-webhook.test.ts
import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { handleStripeWebhook } from './stripe-webhook'
import { PRODUCTS } from '../lib/products'
import { sendEmailSES } from '../lib/ses'
import type { Env } from '../lib/types'

vi.mock('../lib/ses', () => ({ sendEmailSES: vi.fn() }))
const sesMock = vi.mocked(sendEmailSES)

beforeEach(() => {
  sesMock.mockReset()
  sesMock.mockResolvedValue({ ok: true, status: 200 })
})

const SECRET = 'whsec_test'

async function sign(payload: string, t = Math.floor(Date.now() / 1000), secret = SECRET): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `t=${t},v1=${hex}`
}

type DbCall = { sql: string; binds: unknown[] }
function makeEnv(opts: { inserted?: boolean; calls?: DbCall[] } = {}): Env {
  const DB = {
    prepare: (sql: string) => ({
      bind: (...binds: unknown[]) => {
        opts.calls?.push({ sql, binds })
        return {
          run: vi.fn().mockResolvedValue({ success: true, meta: { changes: opts.inserted === false ? 0 : 1 } }),
        }
      },
    }),
  } as unknown as D1Database
  return {
    DB,
    STRIPE_WEBHOOK_SECRET: SECRET,
    SES_ACCESS_KEY_ID: 'AKIATEST',
    SES_SECRET_ACCESS_KEY: 'secret',
  } as Env
}

function evt(over: Record<string, unknown> = {}): string {
  return JSON.stringify({
    type: 'checkout.session.completed',
    data: { object: { id: 'cs_1', amount_total: 1900,
      customer_details: { email: 'b@e.com' }, metadata: { product_id: 'wh-kit', locale: 'ru' }, ...over } },
  })
}

function req(body: string, header: string | null): Request {
  const h: Record<string, string> = { 'Content-Type': 'application/json' }
  if (header) h['Stripe-Signature'] = header
  return new Request('https://ai.synergify.com/api/stripe/webhook', { method: 'POST', body, headers: h })
}

const seeded = { id: 'wh-kit', priceCents: 1900, name: { ru: 'Набор', en: 'Kit' },
  blurb: { ru: 'b', en: 'b' }, delivery: { kind: 'url' as const, href: 'https://dl/file' } }

afterEach(() => vi.restoreAllMocks())

describe('handleStripeWebhook', () => {
  it('records a purchase and emails the asset on a fresh completed session', async () => {
    PRODUCTS.push(seeded)
    try {
      const calls: DbCall[] = []
      const body = evt()
      const res = await handleStripeWebhook(req(body, await sign(body)), makeEnv({ inserted: true, calls }))
      expect(res.status).toBe(200)
      // emailed
      expect(sesMock).toHaveBeenCalled()
      // stamped delivered_at
      expect(calls.find(c => /UPDATE purchases SET delivered_at/.test(c.sql))).toBeDefined()
    } finally { PRODUCTS.splice(PRODUCTS.indexOf(seeded), 1) }
  })

  it('is idempotent: a duplicate session sends no second email', async () => {
    PRODUCTS.push(seeded)
    try {
      const body = evt()
      const res = await handleStripeWebhook(req(body, await sign(body)), makeEnv({ inserted: false }))
      expect(res.status).toBe(200)
      expect(sesMock).not.toHaveBeenCalled()
    } finally { PRODUCTS.splice(PRODUCTS.indexOf(seeded), 1) }
  })

  it('acks (200) and does nothing for a non-matching event type', async () => {
    const body = JSON.stringify({ type: 'payment_intent.created', data: { object: { id: 'pi_1' } } })
    const res = await handleStripeWebhook(req(body, await sign(body)), makeEnv())
    expect(res.status).toBe(200)
    expect(sesMock).not.toHaveBeenCalled()
  })

  it('returns 400 for a bad signature', async () => {
    const body = evt()
    const res = await handleStripeWebhook(req(body, 't=1,v1=deadbeef'), makeEnv())
    expect(res.status).toBe(400)
  })

  it('returns 503 when the webhook secret is unset', async () => {
    const body = evt()
    const res = await handleStripeWebhook(req(body, await sign(body)), { DB: {} as D1Database } as Env)
    expect(res.status).toBe(503)
  })
})
