import { describe, it, expect } from 'vitest'
import { pkceChallenge, buildAuthorizeUrl, safeRedirectPath } from './oauth-google'

describe('pkceChallenge', () => {
  it('is deterministic base64url (no + / =) and differs from the verifier', async () => {
    const v = 'abc123-verifier_value.longenough.longenough.longenough'
    const a = await pkceChallenge(v)
    const b = await pkceChallenge(v)
    expect(a).toBe(b)
    expect(a).not.toBe(v)
    expect(a).not.toMatch(/[+/=]/)
  })
})

describe('buildAuthorizeUrl', () => {
  it('builds a Google authorize URL with all required params', () => {
    const url = buildAuthorizeUrl({ clientId: 'cid', redirectUri: 'https://ai.synergify.com/api/auth/oauth/google/callback', state: 'st', codeChallenge: 'ch' })
    const u = new URL(url)
    expect(u.origin + u.pathname).toBe('https://accounts.google.com/o/oauth2/v2/auth')
    expect(u.searchParams.get('response_type')).toBe('code')
    expect(u.searchParams.get('client_id')).toBe('cid')
    expect(u.searchParams.get('redirect_uri')).toBe('https://ai.synergify.com/api/auth/oauth/google/callback')
    expect(u.searchParams.get('scope')).toBe('openid email')
    expect(u.searchParams.get('state')).toBe('st')
    expect(u.searchParams.get('code_challenge')).toBe('ch')
    expect(u.searchParams.get('code_challenge_method')).toBe('S256')
  })
})

describe('safeRedirectPath', () => {
  it('allows a same-origin absolute path', () => {
    expect(safeRedirectPath('/course/')).toBe('/course/')
  })
  it('rejects protocol-relative, absolute-url, scheme, backslash, dotdot, and null', () => {
    expect(safeRedirectPath('//evil.com')).toBe('/')
    expect(safeRedirectPath('https://evil.com')).toBe('/')
    expect(safeRedirectPath('javascript:alert(1)')).toBe('/')
    expect(safeRedirectPath('/a\\b')).toBe('/')
    expect(safeRedirectPath('/a/../../b')).toBe('/')
    expect(safeRedirectPath(null)).toBe('/')
  })
})
