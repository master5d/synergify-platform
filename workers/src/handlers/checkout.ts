import type { Env } from '../lib/types'
import { validateSupportAmount, buildSupportSessionForm, buildProductSessionForm } from '../lib/checkout'
import { findProduct } from '../lib/products'

export async function handleSupportCheckout(request: Request, env: Env): Promise<Response> {
  let body: { amount?: unknown; locale?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'stripe_not_configured' }, { status: 503 })

  const amt = validateSupportAmount(body.amount)
  if (!amt.ok) return Response.json({ error: amt.error }, { status: 400 })

  const locale: 'ru' | 'en' = body.locale === 'en' ? 'en' : 'ru'
  const form = buildSupportSessionForm({ cents: amt.cents, locale })

  let res: Response
  try {
    res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
  } catch (e) {
    console.error('stripe session create threw', e)
    return Response.json({ error: 'stripe_error' }, { status: 502 })
  }
  if (!res.ok) {
    console.error('stripe session non-OK', res.status, await res.text())
    return Response.json({ error: 'stripe_error' }, { status: 502 })
  }
  const session = (await res.json().catch(() => ({}))) as { url?: string }
  if (!session.url) return Response.json({ error: 'stripe_error' }, { status: 502 })
  return Response.json({ url: session.url })
}

export async function handleProductCheckout(request: Request, env: Env): Promise<Response> {
  let body: { productId?: unknown; locale?: string }
  try { body = await request.json() } catch { return Response.json({ error: 'Invalid JSON' }, { status: 400 }) }

  if (!env.STRIPE_SECRET_KEY) return Response.json({ error: 'stripe_not_configured' }, { status: 503 })

  const product = typeof body.productId === 'string' ? findProduct(body.productId) : undefined
  if (!product) return Response.json({ error: 'unknown_product' }, { status: 404 })

  const locale: 'ru' | 'en' = body.locale === 'en' ? 'en' : 'ru'
  const form = buildProductSessionForm({ product, locale })

  let res: Response
  try {
    res = await fetch('https://api.stripe.com/v1/checkout/sessions', {
      method: 'POST',
      headers: { Authorization: `Bearer ${env.STRIPE_SECRET_KEY}`, 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    })
  } catch (e) {
    console.error('stripe product session threw', e)
    return Response.json({ error: 'stripe_error' }, { status: 502 })
  }
  if (!res.ok) {
    console.error('stripe product session non-OK', res.status, await res.text())
    return Response.json({ error: 'stripe_error' }, { status: 502 })
  }
  const session = (await res.json().catch(() => ({}))) as { url?: string }
  if (!session.url) return Response.json({ error: 'stripe_error' }, { status: 502 })
  return Response.json({ url: session.url })
}
