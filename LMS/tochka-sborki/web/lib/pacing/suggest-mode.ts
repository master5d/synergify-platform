import type { Mode } from '@/lib/cs/types'
import type { CalibrationRating } from './types'

export function suggestModeFromCalibration(rating: CalibrationRating | undefined): Mode | null {
  if (rating === 'harder') return 'commander'
  if (rating === 'easier') return 'archmage'
  return null
}
