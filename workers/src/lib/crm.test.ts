import { describe, it, expect, vi, afterEach } from 'vitest'
import { addCrmContact } from './crm'

const baseEnv = {
  LISTMONK_URL: 'https://listmonk.mamaev.coach',
  LISTMONK_API_USER: 'user',
  LISTMONK_API_TOKEN: 'tok',
  CF_ACCESS_CLIENT_ID: 'cf-id',
  CF_ACCESS_CLIENT_SECRET: 'cf-secret',
  LISTMONK_CRM_LIST_ID: '3',
} as any

afterEach(() => vi.restoreAllMocks())

describe('addCrmContact', () => {
  it('POSTs to listmonk /api/subscribers with the single-opt-in body + CF Access headers', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    await addCrmContact(baseEnv, { email: 'a@b.com', language: 'ru', source: 'site' })
    expect(fetchMock).toHaveBeenCalledTimes(1)
    const [url, init] = fetchMock.mock.calls[0]
    expect(url).toBe('https://listmonk.mamaev.coach/api/subscribers')
    expect((init as any).method).toBe('POST')
    expect((init as any).headers.Authorization).toBe('token user:tok')
    expect((init as any).headers['CF-Access-Client-Id']).toBe('cf-id')
    expect((init as any).headers['CF-Access-Client-Secret']).toBe('cf-secret')
    expect(JSON.parse((init as any).body)).toMatchObject({
      email: 'a@b.com',
      lists: [3],
      status: 'enabled',
      preconfirm_subscriptions: false,
    })
  })

  it('no-ops when LISTMONK_URL is missing', async () => {
    const fetchMock = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    await addCrmContact({ ...baseEnv, LISTMONK_URL: '' }, { email: 'a@b.com' })
    expect(fetchMock).not.toHaveBeenCalled()
  })

  it('treats a 409 (already exists) as a noop, not an error', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('conflict', { status: 409 }))
    await expect(addCrmContact(baseEnv, { email: 'a@b.com' })).resolves.toBeUndefined()
  })

  it('does not throw when fetch rejects', async () => {
    vi.spyOn(globalThis, 'fetch').mockRejectedValue(new Error('network'))
    await expect(addCrmContact(baseEnv, { email: 'a@b.com' })).resolves.toBeUndefined()
  })
})
