// web/lib/lite-pref.ts
// Low-bandwidth "lite mode" preference (on / off / auto). Mirrors theme-pref.ts / os-pref.ts.
// "auto" follows the connection's Save-Data / slow-network signal; an explicit pick overrides it.
export type LitePref = 'on' | 'off' | 'auto'

export const LITE_KEY = 'lite-pref'

const SLOW_TYPES = new Set(['slow-2g', '2g'])

/** True when the browser signals a constrained connection (Save-Data or slow effectiveType). */
export function detectSaveData(): boolean {
  if (typeof navigator === 'undefined') return false
  const c = (navigator as Navigator & {
    connection?: { saveData?: boolean; effectiveType?: string }
  }).connection
  if (!c) return false
  return c.saveData === true || (typeof c.effectiveType === 'string' && SLOW_TYPES.has(c.effectiveType))
}

/** The explicit choice the user saved, or null if they never picked. */
export function readStoredPref(): LitePref | null {
  try {
    const raw = localStorage.getItem(LITE_KEY)
    return raw === 'on' || raw === 'off' || raw === 'auto' ? raw : null
  } catch {
    return null
  }
}

export function storePref(pref: LitePref): void {
  try {
    localStorage.setItem(LITE_KEY, pref)
  } catch {
    /* ignore */
  }
}

/** Collapse a preference + the connection signal into a concrete on/off. */
export function resolveLite(pref: LitePref, saveData: boolean): boolean {
  return pref === 'auto' ? saveData : pref === 'on'
}

/** Whether lite mode should be active right now (default pref = 'auto'). */
export function effectiveLite(): boolean {
  return resolveLite(readStoredPref() ?? 'auto', detectSaveData())
}
