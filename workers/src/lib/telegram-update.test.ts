import { describe, it, expect } from 'vitest'
import { parseUpdate } from './telegram-update'

describe('parseUpdate', () => {
  it('parses /start', () => {
    const r = parseUpdate({ message: { text: '/start', from: { id: 42, language_code: 'ru' }, chat: { id: 42 } } })
    expect(r).toEqual({ kind: 'start', fromId: '42', chatId: 42, languageCode: 'ru', text: null })
  })

  it('parses /start@botname', () => {
    const r = parseUpdate({ message: { text: '/start@tochka_sborki_lms_bot', from: { id: 7 }, chat: { id: 7 } } })
    expect(r.kind).toBe('start')
  })

  it('parses /continue', () => {
    const r = parseUpdate({ message: { text: '/continue', from: { id: 5, language_code: 'en' }, chat: { id: 5 } } })
    expect(r).toEqual({ kind: 'continue', fromId: '5', chatId: 5, languageCode: 'en', text: null })
  })

  it('parses a continue callback_query', () => {
    const r = parseUpdate({ callback_query: { data: 'continue', from: { id: 9, language_code: 'ru' }, message: { chat: { id: 9 } } } })
    expect(r).toEqual({ kind: 'continue', fromId: '9', chatId: 9, languageCode: 'ru', text: null })
  })

  it('treats plain text as other', () => {
    const r = parseUpdate({ message: { text: 'hello', from: { id: 1 }, chat: { id: 1 } } })
    expect(r.kind).toBe('other')
  })

  it('does not match /startfoo as start', () => {
    const r = parseUpdate({ message: { text: '/startfoo', from: { id: 1 }, chat: { id: 1 } } })
    expect(r.kind).toBe('other')
  })

  it('returns nulls for an empty update', () => {
    expect(parseUpdate({})).toEqual({ kind: 'other', fromId: null, chatId: null, languageCode: null, text: null })
  })

  it('parses /stop', () => {
    const r = parseUpdate({ message: { text: '/stop', from: { id: 8 }, chat: { id: 8 } } })
    expect(r.kind).toBe('stop')
  })

  it('parses /ask with an inline question', () => {
    const r = parseUpdate({ message: { text: '/ask how do I install?', from: { id: 3 }, chat: { id: 3 } } })
    expect(r.kind).toBe('ask')
    expect(r.text).toBe('how do I install?')
  })

  it('parses bare /ask as an empty-payload ask', () => {
    const r = parseUpdate({ message: { text: '/ask', from: { id: 3 }, chat: { id: 3 } } })
    expect(r.kind).toBe('ask')
    expect(r.text).toBeNull()
  })

  it('treats a reply to the RU ask-prompt as an ask carrying the reply text', async () => {
    const { botCopy } = await import('./bot-copy')
    const prompt = botCopy('ru').askPrompt
    const r = parseUpdate({ message: { text: 'как поставить Claude Code?', reply_to_message: { text: prompt }, from: { id: 3 }, chat: { id: 3 } } })
    expect(r.kind).toBe('ask')
    expect(r.text).toBe('как поставить Claude Code?')
  })

  it('parses /support', () => {
    const r = parseUpdate({ message: { text: '/support', from: { id: 4 }, chat: { id: 4 } } })
    expect(r.kind).toBe('support')
  })

  it('parses /store', () => {
    const r = parseUpdate({ message: { text: '/store', from: { id: 4 }, chat: { id: 4 } } })
    expect(r.kind).toBe('store')
  })

  it('parses /store@botname', () => {
    const r = parseUpdate({ message: { text: '/store@tochka_sborki_lms_bot', from: { id: 4 }, chat: { id: 4 } } })
    expect(r.kind).toBe('store')
  })
})
