export function notionKbFooterLink(
  url: string | null,
  isMirror: boolean,
  locale: 'ru' | 'en',
): { href: string; label: string } | null {
  if (!url || isMirror) return null

  try {
    if (new URL(url).protocol !== 'https:') return null
  } catch {
    return null
  }

  return {
    href: url,
    label: locale === 'en' ? 'Knowledge base in Notion' : 'База знаний в Notion',
  }
}
