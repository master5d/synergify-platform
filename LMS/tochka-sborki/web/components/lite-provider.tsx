'use client'
import { createContext, useCallback, useContext, useEffect, useState } from 'react'
import { type LitePref, readStoredPref, storePref, detectSaveData, resolveLite } from '@/lib/lite-pref'

interface LiteContextValue {
  pref: LitePref
  lite: boolean
  setPref: (p: LitePref) => void
}

const LiteContext = createContext<LiteContextValue | null>(null)

export function LiteProvider({ children }: { children: React.ReactNode }) {
  // Init matches the head script's default; corrected on mount from storage.
  const [pref, setPrefState] = useState<LitePref>('auto')
  const [lite, setLite] = useState(false)

  useEffect(() => {
    const p = readStoredPref() ?? 'auto'
    setPrefState(p)
    const next = resolveLite(p, detectSaveData())
    setLite(next)
    document.documentElement.setAttribute('data-lite', next ? 'on' : 'off')
  }, [])

  const setPref = useCallback((p: LitePref) => {
    storePref(p)
    setPrefState(p)
    const next = resolveLite(p, detectSaveData())
    setLite(next)
    document.documentElement.setAttribute('data-lite', next ? 'on' : 'off')
  }, [])

  return (
    <LiteContext.Provider value={{ pref, lite, setPref }}>
      {children}
    </LiteContext.Provider>
  )
}

export function useLite(): LiteContextValue {
  const ctx = useContext(LiteContext)
  if (!ctx) throw new Error('useLite must be used within LiteProvider')
  return ctx
}
