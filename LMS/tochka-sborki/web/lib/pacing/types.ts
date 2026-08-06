import type { Mode } from '@/lib/cs/types'

export interface Completion { unitKey: string; date: string; mode: Mode }
export type CalibrationRating = 'easier' | 'right' | 'harder'

export interface PacingState {
  activeDates: string[]
  lastSeen: string
  completions: Completion[]
  calibration: Record<string, CalibrationRating>
  lastCalibration?: { module: string; rating: CalibrationRating }
  dismissed: Record<string, string>
}

export const PACING_KEY = 'pacing'
