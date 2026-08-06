import { describe, it, expect, vi, afterEach } from 'vitest'
import { sendMessage, sendForceReply } from './telegram-api'
import type { Env } from './types'

const env = { TELEGRAM_BOT_TOKEN: 'BOTTOKEN' } as Env

afterEach(() => vi.restoreAllMocks())

describe('sendMessage', () => {
  it('POSTs to the Bot API sendMessage endpoint with chat_id and text', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await sendMessage(env, 555, 'hello')
    const [url, init] = spy.mock.calls[0] as [string, RequestInit]
    expect(url).toBe('https://api.telegram.org/botBOTTOKEN/sendMessage')
    const body = JSON.parse(init.body as string)
    expect(body.chat_id).toBe(555)
    expect(body.text).toBe('hello')
    expect(body.reply_markup).toBeUndefined()
  })

  it('attaches a web_app inline button when provided', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await sendMessage(env, 1, 'go', { text: 'Open', url: 'https://ai.synergify.com/' })
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.reply_markup.inline_keyboard[0][0]).toEqual({ text: 'Open', web_app: { url: 'https://ai.synergify.com/' } })
  })
})

describe('sendForceReply', () => {
  it('sends a message with a force_reply markup', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{"ok":true}', { status: 200 }))
    await sendForceReply(env, 7, 'ask me')
    const body = JSON.parse((spy.mock.calls[0][1] as RequestInit).body as string)
    expect(body.chat_id).toBe(7)
    expect(body.reply_markup).toEqual({ force_reply: true })
    spy.mockRestore()
  })
})
