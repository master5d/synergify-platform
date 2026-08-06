'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import {
  type ThemePref,
  type ResolvedTheme,
  readStoredPref,
  storePref,
  detectSystem,
  resolveTheme,
} from '@/lib/theme-pref'

interface ThemeContextValue {
  pref: ThemePref
  resolved: ResolvedTheme
  setPref: (p: ThemePref) => void
}

const ThemeContext = createContext<ThemeContextValue | null>(null)

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  // Init matches the head script's fallback; corrected on mount from storage.
  const [pref, setPrefState] = useState<ThemePref>('system')
  const [resolved, setResolved] = useState<ResolvedTheme>('dark')

  // Hydrate from storage (the head script already painted the right theme).
  useEffect(() => {
    const p = readStoredPref() ?? 'system'
    setPrefState(p)
    setResolved(resolveTheme(p, detectSystem()))
  }, [])

  // Follow the OS live while pref is "system". Keyed on `pref`: the mount effect
  // above may settle `pref` to a stored 'light'/'dark', which re-runs this effect
  // and tears the listener down via the early return — so it only stays attached
  // while we're actually following the system.
  useEffect(() => {
    if (pref !== 'system') return
    const mq = window.matchMedia('(prefers-color-scheme: dark)')
    const onChange = () => {
      const next: ResolvedTheme = mq.matches ? 'dark' : 'light'
      setResolved(next)
      document.documentElement.setAttribute('data-theme', next)
    }
    mq.addEventListener('change', onChange)
    return () => mq.removeEventListener('change', onChange)
  }, [pref])

  const setPref = useCallback((p: ThemePref) => {
    storePref(p)
    setPrefState(p)
    const next = resolveTheme(p, detectSystem())
    setResolved(next)
    document.documentElement.setAttribute('data-theme', next)
  }, [])

  return (
    <ThemeContext.Provider value={{ pref, resolved, setPref }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme(): ThemeContextValue {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
