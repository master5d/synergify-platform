export interface TelegramUser {
  id: string
  username: string | null
  first_name: string | null
  language_code: string | null
}

export type InitDataResult =
  | { ok: true; user: TelegramUser; authDate: number }
  | { ok: false; error: 'malformed' | 'bad_hash' | 'stale' | 'future' }

async function hmac(keyBytes: Uint8Array, msg: string): Promise<Uint8Array> {
  const key = await crypto.subtle.importKey(
    'raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']
  )
  const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(msg))
  return new Uint8Array(sig)
}

function toHex(bytes: Uint8Array): string {
  return Array.from(bytes).map(b => b.toString(16).padStart(2, '0')).join('')
}

// constant-time compare of two equal-length hex strings
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let r = 0
  for (let i = 0; i < a.length; i++) r |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return r === 0
}

export async function verifyTelegramInitData(
  initData: string,
  botToken: string,
  opts: { maxAgeSec?: number; nowSec?: number } = {}
): Promise<InitDataResult> {
  const maxAgeSec = opts.maxAgeSec ?? 300
  const nowSec = opts.nowSec ?? Math.floor(Date.now() / 1000)

  const params = new URLSearchParams(initData)
  const hash = params.get('hash')
  const authDateRaw = params.get('auth_date')
  const userRaw = params.get('user')
  if (!hash || !authDateRaw || !userRaw) return { ok: false, error: 'malformed' }

  // data-check-string: every field except hash, key-sorted, "k=v" joined by \n
  const pairs: string[] = []
  for (const [k, v] of params) {
    if (k === 'hash') continue
    pairs.push(`${k}=${v}`)
  }
  pairs.sort()
  const dataCheckString = pairs.join('\n')

  const secretKey = await hmac(new TextEncoder().encode('WebAppData'), botToken)
  const computed = toHex(await hmac(secretKey, dataCheckString))
  if (!timingSafeEqual(computed, hash)) return { ok: false, error: 'bad_hash' }

  const authDate = Number(authDateRaw)
  if (!Number.isFinite(authDate)) return { ok: false, error: 'malformed' }
  if (nowSec - authDate > maxAgeSec) return { ok: false, error: 'stale' }
  if (authDate - nowSec > 60) return { ok: false, error: 'future' }

  // 64-bit-safe id: pull straight from the raw JSON, never via JSON.parse
  const idMatch = userRaw.match(/"id":\s*(\d+)/)
  if (!idMatch) return { ok: false, error: 'malformed' }
  let username: string | null = null
  let firstName: string | null = null
  let languageCode: string | null = null
  try {
    const u = JSON.parse(userRaw) as Record<string, unknown>
    username = typeof u.username === 'string' ? u.username : null
    firstName = typeof u.first_name === 'string' ? u.first_name : null
    languageCode = typeof u.language_code === 'string' ? u.language_code : null
  } catch {
    return { ok: false, error: 'malformed' }
  }

  return {
    ok: true,
    user: { id: idMatch[1], username, first_name: firstName, language_code: languageCode },
    authDate,
  }
}
