import { getPromptAnatomy } from '@/lib/content/prompt-anatomy'
import { AnnotatedExample } from '@/components/annotated-example'
import type { Locale } from '@/lib/intake/types'

export function PromptAnatomy({ locale }: { locale: Locale }) {
  const a = getPromptAnatomy(locale)
  return <AnnotatedExample segments={a.segments} caption={a.caption} mono={false} />
}
