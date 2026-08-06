'use client'

import { useState, useEffect, useCallback } from 'react'
import {
  freshPacing, readPacing, writePacing,
  logCompletion as _log, touch as _touch,
  recordCalibration as _cal, dismissNudge as _dismiss,
} from './store'
import { localDate } from '@/lib/quests/daily-store'
import type { PacingState, CalibrationRating } from './types'
import type { Mode } from '@/lib/cs/types'

export function usePacing() {
  const [state, setState] = useState<PacingState>(freshPacing)
  const [ready, setReady] = useState(false)

  useEffect(() => { setState(readPacing()); setReady(true) }, [])

  const update = useCallback((fn: (s: PacingState) => PacingState) => {
    setState(prev => { const next = fn(prev); writePacing(next); return next })
  }, [])

  const logCompletion = useCallback((unitKey: string, mode: Mode) =>
    update(s => _log(s, unitKey, mode, localDate())), [update])
  const touch = useCallback(() => update(s => _touch(s, localDate())), [update])
  const recordCalibration = useCallback((m: string, r: CalibrationRating) =>
    update(s => _cal(s, m, r)), [update])
  const dismissNudge = useCallback((k: string) =>
    update(s => _dismiss(s, k, localDate())), [update])

  return { state, ready, logCompletion, touch, recordCalibration, dismissNudge }
}
