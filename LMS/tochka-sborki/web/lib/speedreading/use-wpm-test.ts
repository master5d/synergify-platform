'use client'

import { useState, useEffect, useCallback } from 'react'
import { freshWpmTest, readWpmTest, writeWpmTest, recordTest as _recordTest } from './wpm-test-store'
import { localDate } from '@/lib/quests/daily-store'
import type { WpmTestState, WpmResult } from './wpm-test-types'

export function useWpmTest() {
  const [state, setState] = useState<WpmTestState>(freshWpmTest)
  const [ready, setReady] = useState(false)

  useEffect(() => { setState(readWpmTest()); setReady(true) }, [])

  const update = useCallback((fn: (s: WpmTestState) => WpmTestState) => {
    setState(prev => { const next = fn(prev); writeWpmTest(next); return next })
  }, [])

  const recordTest = useCallback((result: Omit<WpmResult, 'date'>) =>
    update(s => _recordTest(s, { ...result, date: localDate() })), [update])

  return { state, ready, recordTest }
}
