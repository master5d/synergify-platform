export type Delivery =
  | { kind: 'url'; href: string }   // external link (Drive/Dropbox/Notion)
  | { kind: 'r2';  key:  string }   // R2 object key — NOT implemented in Slice 2

export interface Product {
  id: string
  priceCents: number
  name:  { ru: string; en: string }
  blurb: { ru: string; en: string }
  delivery: Delivery
}

// Owner fills this. Empty = the store is dark (coming-soon empty state).
// Keep in sync with web/lib/store/products.data.ts (worker & web don't share imports).
export const PRODUCTS: Product[] = []

export function findProduct(id: string): Product | undefined {
  return PRODUCTS.find(p => p.id === id)
}

export function resolveAssetUrl(d: Delivery): string {
  if (d.kind === 'url') return d.href
  throw new Error('r2 delivery not implemented in Slice 2')
}
