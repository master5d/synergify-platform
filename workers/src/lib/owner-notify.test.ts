import { describe, it, expect, vi, afterEach, beforeEach } from 'vitest'
import { notifyOwnerQuestion } from './owner-notify'
import { sendEmailSES } from './ses'
import type { Env } from './types'

vi.mock('./ses', () => ({ sendEmailSES: vi.fn() }))
const sesMock = vi.mocked(sendEmailSES)

afterEach(() => vi.restoreAllMocks())
beforeEach(() => sesMock.mockReset())

const fullEnv = { SES_ACCESS_KEY_ID: 'AKIATEST', SES_SECRET_ACCESS_KEY: 'secret', OWNER_EMAIL: 'owner@example.com' } as Env

describe('notifyOwnerQuestion', () => {
  it('emails the owner with the question in the body', async () => {
    sesMock.mockResolvedValue({ ok: true, status: 200 })
    await notifyOwnerQuestion(fullEnv, { question: 'how do I install?', asker: '500', locale: 'ru' })
    const [, msg] = sesMock.mock.calls[0]
    expect(msg.to).toBe('owner@example.com')
    expect(msg.text).toContain('how do I install?')
  })

  it('no-ops (no send, no throw) when SES_ACCESS_KEY_ID is missing', async () => {
    await notifyOwnerQuestion({ OWNER_EMAIL: 'owner@example.com' } as Env, { question: 'q', asker: null, locale: 'ru' })
    expect(sesMock).not.toHaveBeenCalled()
  })
})
