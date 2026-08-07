// lib/speedreading/wpm-test-types.ts
export const WPM_KEY = 'speedreading_wpm'
export interface WpmResult {
  date: string; passageId: string; ms: number; words: number
  wpm: number; correct: number; total: number; effectiveWpm: number
}
export interface WpmTestState { results: WpmResult[] }
