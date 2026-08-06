import { describe, it, expect } from 'vitest'
import { PRODUCTS, findProduct, resolveAssetUrl, type Product } from './products'

const sample: Product = {
  id: 'sample-kit', priceCents: 900,
  name: { ru: 'Набор', en: 'Kit' }, blurb: { ru: 'описание', en: 'blurb' },
  delivery: { kind: 'url', href: 'https://drive.example.com/file' },
}

describe('catalog invariants', () => {
  it('has unique ids and positive integer prices', () => {
    const ids = PRODUCTS.map(p => p.id)
    expect(new Set(ids).size).toBe(ids.length)
    for (const p of PRODUCTS) {
      expect(Number.isInteger(p.priceCents)).toBe(true)
      expect(p.priceCents).toBeGreaterThan(0)
    }
  })
})

describe('findProduct', () => {
  it('returns undefined for an unknown id', () => {
    expect(findProduct('nope')).toBeUndefined()
  })
})

describe('resolveAssetUrl', () => {
  it('returns the href for a url delivery', () => {
    expect(resolveAssetUrl(sample.delivery)).toBe('https://drive.example.com/file')
  })
  it('throws for an r2 delivery (not implemented in Slice 2)', () => {
    expect(() => resolveAssetUrl({ kind: 'r2', key: 'x' })).toThrow(/not implemented/i)
  })
})
