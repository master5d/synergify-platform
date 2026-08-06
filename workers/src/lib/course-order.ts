// Canonical module order — mirrors content/{ru,en}/ directory order. Engine config:
// the Worker can't import web content, so the ordered slug list lives here.
export const MODULE_ORDER = [
  '00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection',
  '04-prompt-engineering', '05-context-memory', '06-audio-pipeline', '07-tools',
  '08-agent-engineering',
] as const

export interface NextLesson { slug: string; resume: boolean }

// Earliest module not completed. resume = it was viewed but not completed.
// null when every module is completed.
export function nextLesson(completed: Set<string>, viewed: Set<string>): NextLesson | null {
  for (const slug of MODULE_ORDER) {
    if (!completed.has(slug)) return { slug, resume: viewed.has(slug) }
  }
  return null
}

export function lessonUrl(slug: string, locale: 'ru' | 'en'): string {
  const base = locale === 'en' ? 'https://ai.synergify.com/en' : 'https://ai.synergify.com'
  return `${base}/lessons/${slug}/`
}

export function homeUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://ai.synergify.com/en/' : 'https://ai.synergify.com/'
}

export function supportUrl(locale: 'ru' | 'en'): string {
  return locale === 'en' ? 'https://ai.synergify.com/en/support/' : 'https://ai.synergify.com/support/'
}

export function storeUrl(locale: 'ru' | 'en'): string {
  // Магазин живёт на личном сайте владельца, не на домене курса.
  return locale === 'en' ? 'https://mamaev.coach/en/store/' : 'https://mamaev.coach/store/'
}
