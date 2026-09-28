// Подпись ссылки отписки от учебных писем: HMAC-SHA256(WORKER_JWT_SECRET, "unsub:" + userId), base64url.
// Проверка — crypto.subtle.verify (сравнение в постоянное время делает сам WebCrypto).
import { resolveReturnBase } from './return-base'

const PREFIX = 'unsub:'

function b64url(bytes: Uint8Array): string {
  return btoa(Array.from(bytes, b => String.fromCharCode(b)).join('')).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

function b64urlBytes(s: string): Uint8Array | null {
  if (!/^[A-Za-z0-9_-]{1,128}$/.test(s)) return null
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

export async function signUnsubscribe(userId: string, secret: string): Promise<string> {
  const sig = await crypto.subtle.sign('HMAC', await key(secret, ['sign']), new TextEncoder().encode(PREFIX + userId))
  return b64url(new Uint8Array(sig))
}

export async function verifyUnsubscribe(userId: string, sig: string, secret: string): Promise<boolean> {
  if (!userId || userId.length > 128 || !secret) return false
  const bytes = b64urlBytes(sig)
  if (!bytes) return false
  try {
    return await crypto.subtle.verify('HMAC', await key(secret, ['verify']), bytes, new TextEncoder().encode(PREFIX + userId))
  } catch {
    return false
  }
}

/** Абсолютный адрес отписки на домене курса (маршрут воркера `<курс>/api/*`). */
export async function unsubscribeUrl(userId: string, secret: string): Promise<string> {
  const { base } = resolveReturnBase(null)
  const s = await signUnsubscribe(userId, secret)
  return `${base}/api/email/unsubscribe?u=${encodeURIComponent(userId)}&s=${s}`
}
