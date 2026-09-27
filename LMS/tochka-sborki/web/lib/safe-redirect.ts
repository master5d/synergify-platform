// Open-redirect guard for the `?redirect=` read directly off the URL on the client
// (login-form). Same rule as the worker's own guard for OAuth
// (workers/src/lib/oauth-google.ts:safeRedirectPath) and the courses that a returned
// magic-link may point to (workers/src/lib/return-base.ts): only a same-origin
// absolute path — single leading slash (not protocol-relative "//"), no backslash,
// no "..". Anything else is untrusted and must not be used for navigation or copy.
export function isSafeRedirect(raw: string | null | undefined): raw is string {
  if (!raw) return false
  if (!/^\/(?!\/)/.test(raw)) return false
  if (raw.includes('\\') || raw.includes('..')) return false
  return true
}
