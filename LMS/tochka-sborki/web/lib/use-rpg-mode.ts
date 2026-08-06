'use client'
import { useEffect, useState } from 'react'
import type { Locale } from '@/lib/intake/types'
import { effectiveRpgMode, plainLabel, type OverrideKey, type RpgMode } from '@/lib/rpg-mode'

// Client hook for chrome components. `ready` guards against SSR/hydration mismatch (the stored
// mode is read in an effect); render RPG fallbacks until ready, then re-render with the override.
export function useRpgMode(locale: Locale) {
  const [mode, setMode] = useState<RpgMode>('rpg')
  const [ready, setReady] = useState(false)
  useEffect(() => {
    setMode(effectiveRpgMode())
    setReady(true)
  }, [])
  return {
    mode,
    ready,
    plain: (key: OverrideKey, fallback: string) => plainLabel(mode, locale, key, fallback),
  }
}
