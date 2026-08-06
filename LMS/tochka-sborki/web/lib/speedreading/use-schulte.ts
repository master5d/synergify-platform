'use client'

import { useState, useEffect, useCallback } from 'react'
import { freshSchulte, readSchulte, writeSchulte, setSize as _setSize, recordResult as _recordResult } from './schulte-store'
import { localDate } from '@/lib/quests/daily-store'
import type { SchulteState } from './schulte-types'

export function useSchulte() {
  const [state, setState] = useState<SchulteState>(freshSchulte)
  const [ready, setReady] = useState(false)

  useEffect(() => { setState(readSchulte()); setReady(true) }, [])

  const update = useCallback((fn: (s: SchulteState) => SchulteState) => {
    setState(prev => { const next = fn(prev); writeSchulte(next); return next })
  }, [])

  const setSize = useCallback((n: number) => update(s => _setSize(s, n)), [update])
  const recordResult = useCallback((size: number, ms: number, errors: number) =>
    update(s => _recordResult(s, size, ms, errors, localDate())), [update])

  return { state, ready, setSize, recordResult }
}
