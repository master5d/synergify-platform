import { describe, it, expect } from 'vitest'
import { createHmac } from 'node:crypto'
import { verifyTelegramInitData } from './telegram-initdata'

const BOT = 'test-bot-token'

// Independent (node crypto) generator of a VALID initData string, so the test
// does not depend on the Worker's own subtle-crypto implementation.
function buildInitData(opts: {
  botToken?: string
  authDate?: number
  user?: Record<string, unknown>
  tamper?: boolean
  dropUser?: boolean
  dropHash?: boolean
} = {}): string {
  const botToken = opts.botToken ?? BOT
  const authDate = opts.authDate ?? Math.floor(Date.now() / 1000)
  const params: Record<string, string> = {
    auth_date: String(authDate),
    query_id: 'AAA',
  }
  if (!opts.dropUser) {
    params.user = JSON.stringify(
      opts.user ?? { id: 12345, username: 'sasha', first_name: 'A', language_code: 'ru' }
    )
  }
  const dcs = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('\n')
  const secret = createHmac('sha256', 'WebAppData').update(botToken).digest()
  let hash = createHmac('sha256', secret).update(dcs).digest('hex')
  if (opts.tamper) hash = hash.slice(0, -1) + (hash.endsWith('0') ? '1' : '0')
  const usp = new URLSearchParams(params)
  if (!opts.dropHash) usp.set('hash', hash)
  return usp.toString()
}

describe('verifyTelegramInitData', () => {
  it('accepts a valid initData and parses the user', async () => {
    const res = await verifyTelegramInitData(buildInitData(), BOT)
    expect(res.ok).toBe(true)
    if (res.ok) {
      expect(res.user.id).toBe('12345')
      expect(res.user.username).toBe('sasha')
      expect(res.user.language_code).toBe('ru')
    }
  })

  it('rejects a tampered hash', async () => {
    const res = await verifyTelegramInitData(buildInitData({ tamper: true }), BOT)
    expect(res).toEqual({ ok: false, error: 'bad_hash' })
  })

  it('rejects a stale auth_date (older than maxAgeSec)', async () => {
    const old = Math.floor(Date.now() / 1000) - 1000
    const res = await verifyTelegramInitData(buildInitData({ authDate: old }), BOT, { maxAgeSec: 300 })
    expect(res).toEqual({ ok: false, error: 'stale' })
  })

  it('rejects an auth_date far in the future', async () => {
    const future = Math.floor(Date.now() / 1000) + 1000
    const res = await verifyTelegramInitData(buildInitData({ authDate: future }), BOT)
    expect(res).toEqual({ ok: false, error: 'future' })
  })

  it('rejects missing user', async () => {
    const res = await verifyTelegramInitData(buildInitData({ dropUser: true }), BOT)
    expect(res).toEqual({ ok: false, error: 'malformed' })
  })

  it('rejects missing hash', async () => {
    const res = await verifyTelegramInitData(buildInitData({ dropHash: true }), BOT)
    expect(res).toEqual({ ok: false, error: 'malformed' })
  })

  it('rejects when signed with a different bot token', async () => {
    const res = await verifyTelegramInitData(buildInitData({ botToken: 'other-token' }), BOT)
    expect(res).toEqual({ ok: false, error: 'bad_hash' })
  })

  it('preserves a 64-bit id beyond 2^53 as an exact string', async () => {
    const bigId = '7203685452345678901'
    // Build the raw user manually — JSON.stringify(Number(bigId)) would lose precision.
    const authDate = Math.floor(Date.now() / 1000)
    const userRaw = `{"id":${bigId},"username":"big"}`
    const params: Record<string, string> = { auth_date: String(authDate), user: userRaw }
    const dcs = Object.keys(params).sort().map(k => `${k}=${params[k]}`).join('\n')
    const secret = createHmac('sha256', 'WebAppData').update(BOT).digest()
    const hash = createHmac('sha256', secret).update(dcs).digest('hex')
    const usp = new URLSearchParams(params); usp.set('hash', hash)
    const res = await verifyTelegramInitData(usp.toString(), BOT)
    expect(res.ok).toBe(true)
    if (res.ok) expect(res.user.id).toBe(bigId)
  })
})
