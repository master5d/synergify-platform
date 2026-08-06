import { describe, it, expect } from 'vitest'
import { validateSupportAmount, buildSupportSessionForm, buildProductSessionForm, MIN_CENTS, MAX_CENTS } from './checkout'
import type { Product } from './products'

describe('validateSupportAmount', () => {
  it('accepts an integer amount within bounds', () => {
    expect(validateSupportAmount(700)).toEqual({ ok: true, cents: 700 })
  })
  it('rejects non-numbers / non-integers / non-positive as invalid', () => {
    expect(validateSupportAmount('700')).toEqual({ ok: false, error: 'invalid' })
    expect(validateSupportAmount(12.5)).toEqual({ ok: false, error: 'invalid' })
    expect(validateSupportAmount(0)).toEqual({ ok: false, error: 'invalid' })
    expect(validateSupportAmount(Number.NaN)).toEqual({ ok: false, error: 'invalid' })
  })
  it('enforces min and max', () => {
    expect(validateSupportAmount(MIN_CENTS - 1)).toEqual({ ok: false, error: 'too_small' })
    expect(validateSupportAmount(MAX_CENTS + 1)).toEqual({ ok: false, error: 'too_large' })
  })
})

describe('buildSupportSessionForm', () => {
  it('builds the Stripe form params with locale-correct URLs', () => {
    const ru = buildSupportSessionForm({ cents: 700, locale: 'ru' })
    expect(ru.get('mode')).toBe('payment')
    expect(ru.get('submit_type')).toBe('donate')
    expect(ru.get('line_items[0][price_data][currency]')).toBe('usd')
    expect(ru.get('line_items[0][price_data][unit_amount]')).toBe('700')
    expect(ru.get('success_url')).toBe('https://ai.synergify.com/support/thanks/')
    expect(ru.get('cancel_url')).toBe('https://ai.synergify.com/support/')
    const en = buildSupportSessionForm({ cents: 300, locale: 'en' })
    expect(en.get('success_url')).toBe('https://ai.synergify.com/en/support/thanks/')
  })
})

const product: Product = {
  id: 'agent-starter-kit', priceCents: 1900,
  name: { ru: 'Стартовый набор', en: 'Starter Kit' },
  blurb: { ru: 'b', en: 'b' },
  delivery: { kind: 'url', href: 'https://drive.example.com/kit' },
}

describe('buildProductSessionForm', () => {
  it('prices from the product and carries fulfilment metadata', () => {
    const f = buildProductSessionForm({ product, locale: 'ru' })
    expect(f.get('mode')).toBe('payment')
    expect(f.get('submit_type')).toBe('pay')
    expect(f.get('customer_creation')).toBe('always')
    expect(f.get('line_items[0][price_data][unit_amount]')).toBe('1900')
    expect(f.get('line_items[0][price_data][product_data][name]')).toBe('Стартовый набор')
    expect(f.get('metadata[product_id]')).toBe('agent-starter-kit')
    expect(f.get('metadata[locale]')).toBe('ru')
    expect(f.get('success_url')).toBe('https://mamaev.coach/store/thanks/')
    expect(f.get('cancel_url')).toBe('https://mamaev.coach/store/')
  })
  it('uses the en prefix and en product name', () => {
    const f = buildProductSessionForm({ product, locale: 'en' })
    expect(f.get('success_url')).toBe('https://mamaev.coach/en/store/thanks/')
    expect(f.get('line_items[0][price_data][product_data][name]')).toBe('Starter Kit')
  })
})
