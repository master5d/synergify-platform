// lib/interest-example/cache-key.ts
// Ключ кэша пары (юнит × интерес × локаль) — синтетический URL для Cache API воркера.
// Хэш исходника в ключе: правка общего примера сама делает старые записи недостижимыми.
import { interestKey } from './interests'
import type { InterestLocale } from './types'

export const CACHE_KEY_VERSION = 'v1'
export const CACHE_ORIGIN = 'https://interest-example.cache'

/** FNV-1a 32 бит по UTF-16 — синхронно и одинаково в воркере, ноде и браузере. */
export function fnv1a(text: string): string {
  let h = 0x811c9dc5
  for (let i = 0; i < text.length; i++) {
    h ^= text.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h.toString(16).padStart(8, '0')
}

export interface CacheKeyInput {
  module: string; unit: string; id: string; locale: InterestLocale; interest: string; source: string
}

/** null — интерес вне закрытого списка: такой пары в кэше быть не может. */
export function interestCacheKey(k: CacheKeyInput): string | null {
  const interest = interestKey(k.interest)
  if (!interest) return null
  const part = (s: string) => encodeURIComponent(s)
  return `${CACHE_ORIGIN}/${CACHE_KEY_VERSION}/${part(k.module)}/${part(k.unit)}/${part(k.id)}/${k.locale}/${interest}/${fnv1a(k.source)}`
}
