import { describe, it, expect } from 'vitest'
import { verifyStripeSignature } from './stripe-webhook'

const SECRET = 'whsec_test'

async function sign(payload: string, t: number, secret = SECRET): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(`${t}.${payload}`))
  const hex = Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
  return `t=${t},v1=${hex}`
}

const NOW = 1_800_000_000
const body = JSON.stringify({ type: 'checkout.session.completed', data: { object: { id: 'cs_1' } } })

describe('verifyStripeSignature', () => {
  it('accepts a valid signature and returns the parsed event', async () => {
    const header = await sign(body, NOW)
    const r = await verifyStripeSignature(body, header, SECRET, { nowSec: NOW })
    expect(r.ok).toBe(true)
    if (r.ok) expect(r.event.type).toBe('checkout.session.completed')
  })
  it('rejects a tampered signature', async () => {
    const header = (await sign(body, NOW)).replace(/v1=./, 'v1=0')
    const r = await verifyStripeSignature(body, header, SECRET, { nowSec: NOW })
    expect(r).toEqual({ ok: false, error: 'bad_signature' })
  })
  it('rejects a stale timestamp', async () => {
    const header = await sign(body, NOW - 1000)
    const r = await verifyStripeSignature(body, header, SECRET, { nowSec: NOW })
    expect(r).toEqual({ ok: false, error: 'too_old' })
  })
  it('rejects a far-future timestamp', async () => {
    const header = await sign(body, NOW + 1000)
    const r = await verifyStripeSignature(body, header, SECRET, { nowSec: NOW })
    expect(r).toEqual({ ok: false, error: 'too_old' })
  })
  it('rejects a garbled header', async () => {
    const r = await verifyStripeSignature(body, 'nonsense', SECRET, { nowSec: NOW })
    expect(r).toEqual({ ok: false, error: 'bad_format' })
  })
  it('rejects a null header', async () => {
    const r = await verifyStripeSignature(body, null, SECRET, { nowSec: NOW })
    expect(r).toEqual({ ok: false, error: 'bad_format' })
  })
})
