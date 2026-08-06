import { describe, it, expect, vi, beforeEach } from 'vitest'
import { sendEmailSES } from './ses'

const env = { SES_ACCESS_KEY_ID: 'AKIATEST', SES_SECRET_ACCESS_KEY: 'secret', SES_REGION: 'us-east-1' } as any

describe('sendEmailSES', () => {
  beforeEach(() => vi.restoreAllMocks())

  it('POSTs SES v2 Simple with mapped headers and returns ok', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(
      new Response(JSON.stringify({ MessageId: 'm1' }), { status: 200 }))
    const r = await sendEmailSES(env, {
      from: 'Точка Сборки <noreply@mamaev.coach>', to: 'u@x.com',
      subject: 'Subj', text: 'body', html: '<p>body</p>',
      headers: { 'X-Entity-Ref-ID': 'tok123' },
    })
    expect(r.ok).toBe(true)
    // aws4fetch signs input+init into a single Request and calls fetch(request) — one arg, not (url, init)
    const req = spy.mock.calls[0][0] as Request
    expect(req.url).toContain('/v2/email/outbound-emails')
    // SigV4 подпись присутствует
    const auth = req.headers.get('Authorization') || ''
    expect(auth).toContain('AWS4-HMAC-SHA256')
    const sent = JSON.parse(await req.clone().text())
    expect(sent.FromEmailAddress).toBe('Точка Сборки <noreply@mamaev.coach>')
    expect(sent.Destination.ToAddresses).toEqual(['u@x.com'])
    expect(sent.Content.Simple.Subject.Data).toBe('Subj')
    expect(sent.Content.Simple.Body.Text.Data).toBe('body')
    expect(sent.Content.Simple.Body.Html.Data).toBe('<p>body</p>')
    expect(sent.Content.Simple.Headers).toContainEqual({ Name: 'X-Entity-Ref-ID', Value: 'tok123' })
  })

  it('returns non-ok with status/error on SES 4xx', async () => {
    vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('MessageRejected', { status: 400 }))
    const r = await sendEmailSES(env, { from: 'a@mamaev.coach', to: 'u@x.com', subject: 's', text: 't' })
    expect(r.ok).toBe(false); expect(r.status).toBe(400); expect(r.error).toContain('MessageRejected')
  })

  it('omits Html and Headers when not provided', async () => {
    const spy = vi.spyOn(globalThis, 'fetch').mockResolvedValue(new Response('{}', { status: 200 }))
    await sendEmailSES(env, { from: 'a@mamaev.coach', to: 'u@x.com', subject: 's', text: 't' })
    const req = spy.mock.calls[0][0] as Request
    const sent = JSON.parse(await req.clone().text())
    expect(sent.Content.Simple.Body.Html).toBeUndefined()
    expect(sent.Content.Simple.Headers).toBeUndefined()
  })
})
