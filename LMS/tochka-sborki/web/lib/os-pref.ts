// web/lib/os-pref.ts
// Shared OS preference for the cheatsheet OsToggle / OsBlock.
// Effective OS = explicit stored choice if present, else auto-detected from the browser.
export type Os = 'mac' | 'windows'

const KEY = 'os'

/** Detect the visitor's OS from the browser. Defaults to 'windows' off-browser or when unknown. */
export function detectOs(): Os {
  if (typeof navigator === 'undefined') return 'windows'
  // userAgentData.platform is the modern signal; fall back to platform / userAgent.
  const ua = navigator as Navigator & { userAgentData?: { platform?: string } }
  const hint = ua.userAgentData?.platform || navigator.platform || navigator.userAgent || ''
  return /mac|iphone|ipad|ipod/i.test(hint) ? 'mac' : 'windows'
}

/** The explicit choice the user saved, or null if they never picked. */
export function readStoredOs(): Os | null {
  try {
    const raw = localStorage.getItem(KEY)
    return raw === 'mac' || raw === 'windows' ? raw : null
  } catch {
    return null
  }
}

/** What the page should actually show: the saved choice, or the auto-detected OS. */
export function effectiveOs(): Os {
  return readStoredOs() ?? detectOs()
}

export function storeOs(os: Os): void {
  try {
    localStorage.setItem(KEY, os)
  } catch {
    /* ignore */
  }
}
