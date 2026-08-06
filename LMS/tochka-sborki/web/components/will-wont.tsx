import { getWillWont } from '@/lib/content/will-wont'
import { WillWontBlock } from '@/components/will-wont-block'
import type { Locale } from '@/lib/intake/types'

export function WillWont({ id, locale }: { id: string; locale: Locale }) {
  const vm = getWillWont(id, locale)
  return vm ? <WillWontBlock {...vm} /> : null
}
