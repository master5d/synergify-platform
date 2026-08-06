import type { Product } from './products'

export const MIN_CENTS = 100        // $1
export const MAX_CENTS = 100_000    // $1000

export type AmountResult =
  | { ok: true; cents: number }
  | { ok: false; error: 'invalid' | 'too_small' | 'too_large' }

export function validateSupportAmount(raw: unknown): AmountResult {
  if (typeof raw !== 'number' || !Number.isInteger(raw) || raw <= 0) return { ok: false, error: 'invalid' }
  if (raw < MIN_CENTS) return { ok: false, error: 'too_small' }
  if (raw > MAX_CENTS) return { ok: false, error: 'too_large' }
  return { ok: true, cents: raw }
}

const BASE = 'https://ai.synergify.com'
// Магазин переехал на личный сайт владельца (mamaev.coach), поддержка осталась
// на курсе — поэтому у product-чекаута своя база возврата.
const STORE_BASE = 'https://mamaev.coach'

export function buildSupportSessionForm(opts: { cents: number; locale: 'ru' | 'en' }): URLSearchParams {
  const prefix = opts.locale === 'en' ? '/en' : ''
  const name = opts.locale === 'en' ? 'Support — Tochka Sborki' : 'Поддержка — Точка Сборки'
  const f = new URLSearchParams()
  f.set('mode', 'payment')
  f.set('submit_type', 'donate')
  f.set('line_items[0][quantity]', '1')
  f.set('line_items[0][price_data][currency]', 'usd')
  f.set('line_items[0][price_data][product_data][name]', name)
  f.set('line_items[0][price_data][unit_amount]', String(opts.cents))
  f.set('success_url', `${BASE}${prefix}/support/thanks/`)
  f.set('cancel_url', `${BASE}${prefix}/support/`)
  return f
}

export function buildProductSessionForm(opts: { product: Product; locale: 'ru' | 'en' }): URLSearchParams {
  const prefix = opts.locale === 'en' ? '/en' : ''
  const f = new URLSearchParams()
  f.set('mode', 'payment')
  f.set('submit_type', 'pay')
  f.set('customer_creation', 'always')
  f.set('line_items[0][quantity]', '1')
  f.set('line_items[0][price_data][currency]', 'usd')
  f.set('line_items[0][price_data][product_data][name]', opts.product.name[opts.locale])
  f.set('line_items[0][price_data][unit_amount]', String(opts.product.priceCents))
  f.set('metadata[product_id]', opts.product.id)
  f.set('metadata[locale]', opts.locale)
  f.set('success_url', `${STORE_BASE}${prefix}/store/thanks/`)
  f.set('cancel_url', `${STORE_BASE}${prefix}/store/`)
  return f
}
