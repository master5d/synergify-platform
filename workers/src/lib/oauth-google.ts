// workers/src/lib/oauth-google.ts
// Google OAuth helpers (fb_25d8fa04). Pure where possible (PKCE, authorize URL, redirect guard);
// exchangeCode/fetchUserinfo are thin network wrappers. No OAuth libs — WebCrypto + fetch only.
// client_secret is passed in from the handler (env) and used ONLY here in the token exchange.

function b64url(bytes: Uint8Array): string {
  return btoa(String.fromCharCode(...bytes)).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_')
}

/** PKCE S256: base64url(SHA-256(verifier)). */
export async function pkceChallenge(verifier: string): Promise<string> {
  const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier))
  return b64url(new Uint8Array(digest))
}

export function buildAuthorizeUrl(o: {
  clientId: string; redirectUri: string; state: string; codeChallenge: string
}): string {
  const p = new URLSearchParams({
    response_type: 'code',
    client_id: o.clientId,
    redirect_uri: o.redirectUri,
    scope: 'openid email',
    state: o.state,
    code_challenge: o.codeChallenge,
    code_challenge_method: 'S256',
    access_type: 'online',
    prompt: 'select_account',
  })
  return `https://accounts.google.com/o/oauth2/v2/auth?${p.toString()}`
}

export async function exchangeCode(o: {
  code: string; verifier: string; clientId: string; clientSecret: string; redirectUri: string
}): Promise<{ ok: true; accessToken: string } | { ok: false }> {
  try {
    const res = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code: o.code,
        code_verifier: o.verifier,
        client_id: o.clientId,
        client_secret: o.clientSecret,
        redirect_uri: o.redirectUri,
      }).toString(),
    })
    if (!res.ok) return { ok: false }
    const j = (await res.json().catch(() => ({}))) as { access_token?: string }
    if (!j.access_token) return { ok: false }
    return { ok: true, accessToken: j.access_token }
  } catch {
    return { ok: false }
  }
}

export async function fetchUserinfo(accessToken: string):
  Promise<{ ok: true; sub: string; email: string; emailVerified: boolean } | { ok: false }> {
  try {
    const res = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${accessToken}` },
    })
    if (!res.ok) return { ok: false }
    const j = (await res.json().catch(() => ({}))) as { sub?: string; email?: string; email_verified?: boolean }
    if (!j.sub || !j.email) return { ok: false }
    return { ok: true, sub: j.sub, email: j.email.toLowerCase(), emailVerified: j.email_verified === true }
  } catch {
    return { ok: false }
  }
}

/** Open-redirect guard: allow ONLY a same-origin absolute path (single leading slash,
 *  not protocol-relative), with no backslash or '..'. Anything else → '/'. */
export function safeRedirectPath(raw: string | null): string {
  if (!raw) return '/'
  if (!/^\/(?!\/)/.test(raw)) return '/'
  if (raw.includes('\\') || raw.includes('..')) return '/'
  return raw
}
