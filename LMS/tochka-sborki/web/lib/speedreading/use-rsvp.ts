'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  freshRsvp, readRsvp, writeRsvp,
  setWpm as _setWpm, setChunk as _setChunk, logSession as _logSession,
} from './rsvp-store'
import { localDate } from '@/lib/quests/daily-store'
import type { RsvpState } from './rsvp-types'

export function useRsvp() {
  const [state, setState] = useState<RsvpState>(freshRsvp)
  const [ready, setReady] = useState(false)

  useEffect(() => { setState(readRsvp()); setReady(true) }, [])

  const update = useCallback((fn: (s: RsvpState) => RsvpState) => {
    setState(prev => { const next = fn(prev); writeRsvp(next); return next })
  }, [])

  const setWpm = useCallback((wpm: number) => update(s => _setWpm(s, wpm)), [update])
  const setChunk = useCallback((n: number) => update(s => _setChunk(s, n)), [update])
  const logSession = useCallback((wpm: number, words: number) =>
    update(s => _logSession(s, { date: localDate(), wpm, words })), [update])

  return { state, ready, setWpm, setChunk, logSession }
}
