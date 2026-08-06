// web/lib/theme-pref.ts
// Global theme preference (light / dark / system). Mirrors the os-pref.ts pattern.
// "system" follows the OS prefers-color-scheme; an explicit pick overrides it.
export type ThemePref = 'light' | 'dark' | 'system'
export type ResolvedTheme = 'light' | 'dark'

export const THEME_KEY = 'theme-pref'

/** The OS-reported scheme. Defaults to 'dark' off-browser or when unknown. */
export function detectSystem(): ResolvedTheme {
  if (typeof window === 'undefined' || !window.matchMedia) return 'dark'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

/** The explicit choice the user saved, or null if they never picked. */
export function readStoredPref(): ThemePref | null {
  try {
    const raw = localStorage.getItem(THEME_KEY)
    return raw === 'light' || raw === 'dark' || raw === 'system' ? raw : null
  } catch {
    return null
  }
}

export function storePref(pref: ThemePref): void {
  try {
    localStorage.setItem(THEME_KEY, pref)
  } catch {
    /* ignore */
  }
}

/** Collapse a preference + the current system scheme into a concrete theme. */
export function resolveTheme(pref: ThemePref, system: ResolvedTheme): ResolvedTheme {
  return pref === 'system' ? system : pref
}

/** What the page should actually show right now. */
export function effectiveTheme(): ResolvedTheme {
  return resolveTheme(readStoredPref() ?? 'system', detectSystem())
}
