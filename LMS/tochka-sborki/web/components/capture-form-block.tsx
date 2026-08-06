import { getCaptureForm } from '@/lib/content/capture-forms'
import type { Locale } from '@/lib/dictionaries'
import { CaptureForm } from './capture-form'

/** MDX-safe wrapper: string props only (next-mdx-remote@6 drops inline array/object props). */
export function CaptureFormBlock({ id, locale = 'ru' }: { id: string; locale?: Locale }) {
  const config = getCaptureForm(id, locale)
  if (!config) return null
  return <CaptureForm config={config} locale={locale} />
}
