// packs/living-practice/course/showcase.ts
// Форма эталона; данные тёмные: у курса нет ни витринного видео, ни кейсов, ни
// дримов — движок рендерит пустые секции тёмными. Хелперы видео скопированы 1-в-1.
import type { Locale } from '@/lib/intake/types'
import { resolveCaptionTrack, resolveTranscript, type CaptionTrack } from '@/lib/a11y/media'

interface Bi { ru: string; en: string }

export type CategoryKey =
  | 'co-thinking' | 'launch' | 'flow' | 'knowledge' | 'dictation' | 'platform' | 'for-good'

export type CatFilter = 'all' | CategoryKey

interface CategoryDef { key: CategoryKey; label: Bi }

export interface ResolvedCategory { key: CategoryKey; label: string }

// Stable display order. Every key referenced by >=1 case becomes a tab.
const CATEGORIES: CategoryDef[] = [
  { key: 'co-thinking', label: { ru: 'Со-мышление', en: 'Co-thinking' } },
  { key: 'launch',      label: { ru: 'Запуск',       en: 'Launch' } },
  { key: 'flow',        label: { ru: 'Поток',        en: 'Flow' } },
  { key: 'knowledge',   label: { ru: 'Знание',       en: 'Knowledge' } },
  { key: 'dictation',   label: { ru: 'Диктовка',     en: 'Dictation' } },
  { key: 'platform',    label: { ru: 'Платформа',    en: 'Platform' } },
  { key: 'for-good',    label: { ru: 'Во благо',      en: 'For good' } },
]

export const CATEGORY_KEYS: CategoryKey[] = CATEGORIES.map(c => c.key)

export function filterByCategory<T extends { category: CategoryKey }>(
  cases: T[], active: CatFilter,
): T[] {
  return active === 'all' ? cases : cases.filter(c => c.category === active)
}

export interface ShowcaseCase {
  id: string
  icon: string
  title: Bi
  blurb: Bi
  tag: Bi
  category: CategoryKey
  href?: string
}
export interface RealCase {
  id: string; icon: string; title: Bi; blurb: Bi; tag: Bi; category: CategoryKey
  result: Bi
  author: Bi
  deepDive?: string
  href?: string
}

export interface OtherCase {
  id: string
  icon: string
  title: Bi
  blurb: Bi
  source: Bi
  href: string
}

interface ResolvedDream { id: string; icon: string; title: string; blurb: string; tag: string; category: CategoryKey; href?: string }
interface ResolvedReal extends ResolvedDream { result: string; author: string }
export interface ResolvedOther { id: string; icon: string; title: string; blurb: string; source: string; href: string }

export interface ShowcaseVM {
  label: string
  video: { source: VideoSource | null; poster: string | null; caption: string; captionTrack: CaptionTrack | null; transcript: string | null }
  real: { heading: string; cases: ResolvedReal[] }
  dream: { heading: string; cases: ResolvedDream[] }
  others: { heading: string; note: string; cases: ResolvedOther[] }
  categories: ResolvedCategory[]
  cta: string
}

const LABEL: Bi = { ru: 'Возможности', en: 'Possibilities' }
const REAL_HEADING: Bi = { ru: 'Живые круги', en: 'Living circles' }
const DREAM_HEADING: Bi = { ru: 'Где может собраться круг', en: 'Where a circle can gather' }
const OTHERS_HEADING: Bi = { ru: 'Что делают другие', en: 'What others are building' }
const OTHERS_NOTE: Bi = {
  ru: 'Чужие открытые форматы — не наши истории и не реклама. Показываем, чтобы было с чем сравнить свой круг.',
  en: 'Open formats built by other people — not our stories, not an endorsement. They are here so you have something to compare your own circle against.',
}
const CTA: Bi = { ru: 'К урокам →', en: 'To the lessons →' }
const VIDEO: { url: string | null; poster: string | null; caption: Bi; captions: string | null; transcript: Bi | null } = {
  url: null,    // видео у курса нет — секция рендерится тёмной
  poster: null,
  caption: { ru: 'Короткий ролик о сути — возможно, позже', en: 'A short film about the essence — perhaps later' },
  captions: null,
  transcript: null,
}

// Реальных историй и «дримов» у курса пока нет — честно пусто, движок гасит секции.
const DREAM_CASES: ShowcaseCase[] = []

const REAL_CASES: RealCase[] = []

const OTHER_CASES: OtherCase[] = []

export function videoEmbedUrl(url: string | null): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export interface VideoSource { kind: 'embed' | 'file'; src: string }

export function resolveVideoSource(url: string | null): VideoSource | null {
  if (!url) return null
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(url)) return { kind: 'file', src: url }
  const embed = videoEmbedUrl(url)
  return embed ? { kind: 'embed', src: embed } : null
}

export function withAutoplay(embedUrl: string): string {
  return embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1'
}

export function deepDiveUrl(slug: string, locale: Locale): string {
  const prefix = locale === 'en' ? '/en/blog/' : '/blog/'
  return `https://mamaev.coach${prefix}${slug}/`
}

export function getShowcase(locale: Locale): ShowcaseVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  const used = new Set<CategoryKey>([...REAL_CASES, ...DREAM_CASES].map(c => c.category))
  return {
    label: LABEL[L],
    video: (() => {
      const source = resolveVideoSource(VIDEO.url)
      return {
        source, poster: VIDEO.poster, caption: VIDEO.caption[L],
        captionTrack: resolveCaptionTrack(source?.kind ?? 'embed', VIDEO.captions, L),
        transcript: resolveTranscript(VIDEO.transcript, L),
      }
    })(),
    real: {
      heading: REAL_HEADING[L],
      cases: REAL_CASES.map(c => ({ id: c.id, icon: c.icon, title: c.title[L], blurb: c.blurb[L], tag: c.tag[L], category: c.category, result: c.result[L], author: c.author[L], href: c.deepDive ? deepDiveUrl(c.deepDive, L) : c.href })),
    },
    dream: {
      heading: DREAM_HEADING[L],
      cases: DREAM_CASES.map(c => ({ id: c.id, icon: c.icon, title: c.title[L], blurb: c.blurb[L], tag: c.tag[L], category: c.category, href: c.href })),
    },
    others: {
      heading: OTHERS_HEADING[L],
      note: OTHERS_NOTE[L],
      cases: OTHER_CASES.map(c => ({ id: c.id, icon: c.icon, title: c.title[L], blurb: c.blurb[L], source: c.source[L], href: c.href })),
    },
    categories: CATEGORIES.filter(c => used.has(c.key)).map(c => ({ key: c.key, label: c.label[L] })),
    cta: CTA[L],
  }
}
