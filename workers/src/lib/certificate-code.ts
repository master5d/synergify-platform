// Публичный код проверки сертификата: `<userId>.<sig>`, sig = HMAC-SHA256(WORKER_JWT_SECRET,
// "cert:" + userId) в base64url. Без email и без миграции: код выводится из userId и секрета,
// хранить нечего. Префикс `cert:` отделяет эту подпись от ссылки отписки (`unsub:`), хотя ключ
// общий. Проверка — crypto.subtle.verify (сравнение в постоянное время делает сам WebCrypto).
import { resolveReturnBase } from './return-base'

const PREFIX = 'cert:'
const USER_ID = /^[A-Za-z0-9-]{1,64}$/
const SIG = /^[A-Za-z0-9_-]{43}$/ // 32 байта HMAC-SHA256 в base64url без '='

function b64url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function b64urlBytes(s: string): Uint8Array | null {
  try {
    const std = s.replace(/-/g, '+').replace(/_/g, '/')
    return Uint8Array.from(atob(std.padEnd(std.length + (4 - std.length % 4) % 4, '=')), c => c.charCodeAt(0))
  } catch {
    return null
  }
}

function key(secret: string, usage: string[]): Promise<CryptoKey> {
  return crypto.subtle.importKey('raw', new TextEncoder().encode(secret), { name: 'HMAC', hash: 'SHA-256' }, false, usage)
}

export async function signCertificateCode(userId: string, secret: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), new TextEncoder().encode(PREFIX + userId))
  return `${userId}.${b64url(new Uint8Array(sig))}`
}

/** Разбор формы кода без проверки подписи; мусор → null. */
export function parseCertificateCode(code: string | null | undefined): { userId: string; sig: string } | null {
  if (typeof code !== 'string' || code.length > 120) return null
  const dot = code.lastIndexOf('.')
  if (dot <= 0) return null
  const userId = code.slice(0, dot)
  const sig = code.slice(dot + 1)
  if (!USER_ID.test(userId) || !SIG.test(sig)) return null
  return { userId, sig }
}

/** userId из кода, если подпись верна; иначе null. */
export async function verifyCertificateCode(code: string | null | undefined, secret: string): Promise<string | null> {
  const parsed = parseCertificateCode(code)
  if (!parsed || !secret) return null
  const bytes = b64urlBytes(parsed.sig)
  if (!bytes) return null
  try {
    const ok = await crypto.subtle.verify('HMAC', await key(secret, ['verify']), bytes, new TextEncoder().encode(PREFIX + parsed.userId))
    return ok ? parsed.userId : null
  } catch {
    return null
  }
}

/** Абсолютный адрес страницы проверки на домене курса (статическая страница web). */
export function certificateVerifyUrl(code: string, locale: 'ru' | 'en' = 'ru'): string {
  const { base } = resolveReturnBase(null)
  return `${base}${locale === 'en' ? '/en' : ''}/certificate/verify/?c=${encodeURIComponent(code)}`
}
