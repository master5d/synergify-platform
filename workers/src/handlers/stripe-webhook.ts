// workers/src/handlers/stripe-webhook.ts
import type { Env } from '../lib/types'
import { verifyStripeSignature } from '../lib/stripe-webhook'
import { findProduct, resolveAssetUrl } from '../lib/products'
import { sendPurchaseEmail } from '../lib/purchase-email'

export async function handleStripeWebhook(request: Request, env: Env): Promise<Response> {
  if (!env.STRIPE_WEBHOOK_SECRET) return new Response('stripe_webhook_not_configured', { status: 503 })

  const rawBody = await request.text()
  const verified = await verifyStripeSignature(rawBody, request.headers.get('Stripe-Signature'), env.STRIPE_WEBHOOK_SECRET)
  if (!verified.ok) return new Response(verified.error, { status: 400 })

  const event = verified.event
  if (event.type !== 'checkout.session.completed') return new Response('ignored', { status: 200 })

  const s = event.data.object
  const productId = s.metadata?.product_id
  const email = s.customer_details?.email ?? undefined
  const locale: 'ru' | 'en' = s.metadata?.locale === 'en' ? 'en' : 'ru'
  if (!productId || !email) { console.error('webhook missing product_id/email', s.id); return new Response('ok', { status: 200 }) }

  // Idempotent insert — duplicate Stripe retries hit the UNIQUE(stripe_session_id) and write nothing.
  const now = Math.floor(Date.now() / 1000)
  const ins = await env.DB.prepare(
    `INSERT INTO purchases (id, stripe_session_id, product_id, email, amount_cents, locale, created_at)
     VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(stripe_session_id) DO NOTHING`
  ).bind(crypto.randomUUID(), s.id, productId, email, s.amount_total ?? 0, locale, now).run()
  if (!ins.meta || ins.meta.changes === 0) return new Response('duplicate', { status: 200 })

  const product = findProduct(productId)
  if (!product) { console.error('webhook unknown product', productId); return new Response('ok', { status: 200 }) }

  let assetUrl: string
  try { assetUrl = resolveAssetUrl(product.delivery) } catch (e) { console.error('asset resolve failed', e); return new Response('ok', { status: 200 }) }

  const sent = await sendPurchaseEmail(env, { email, product, assetUrl, locale })
  if (sent) await env.DB.prepare('UPDATE purchases SET delivered_at = ? WHERE stripe_session_id = ?').bind(now, s.id).run()
  return new Response('ok', { status: 200 })
}
