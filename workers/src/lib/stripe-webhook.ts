export interface StripeEvent {
  type: string
  data: {
    object: {
      id: string
      customer_details?: { email?: string | null } | null
      metadata?: { product_id?: string; locale?: string } | null
      amount_total?: number | null
    }
  }
}

export type WebhookResult =
  | { ok: true;  event: StripeEvent }
  | { ok: false; error: 'bad_format' | 'bad_signature' | 'too_old' }

async function hmacHex(secret: string, msg: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
}

function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export async function verifyStripeSignature(
  rawBody: string,
  sigHeader: string | null,
  secret: string,
  opts: { nowSec?: number; toleranceSec?: number } = {},
): Promise<WebhookResult> {
  const nowSec = opts.nowSec ?? Math.floor(Date.now() / 1000)
  const toleranceSec = opts.toleranceSec ?? 300

  if (!sigHeader) return { ok: false, error: 'bad_format' }
  let t: string | undefined
  let v1: string | undefined
  for (const part of sigHeader.split(',')) {
    const [k, val] = part.split('=')
    if (k === 't') t = val
    else if (k === 'v1') v1 = val
  }
  if (!t || !v1) return { ok: false, error: 'bad_format' }
  const ts = Number(t)
  if (!Number.isFinite(ts)) return { ok: false, error: 'bad_format' }

  const expected = await hmacHex(secret, `${ts}.${rawBody}`)
  if (!timingSafeEqual(expected, v1)) return { ok: false, error: 'bad_signature' }

  if (Math.abs(nowSec - ts) > toleranceSec) return { ok: false, error: 'too_old' }

  let event: StripeEvent
  try { event = JSON.parse(rawBody) as StripeEvent } catch { return { ok: false, error: 'bad_format' } }
  return { ok: true, event }
}
