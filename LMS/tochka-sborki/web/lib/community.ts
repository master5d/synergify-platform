// Слой сообщества: чистые резолверы данных pack'а в то, что рисуют поверхности
// (главная курса, /alumni, конец модуля, записи встреч в уроке). Пустые данные гасят поверхность.
import { COMMUNITY } from '@/lib/course/community'
import type { CommunityData } from '@/lib/community-types'

type Loc = 'ru' | 'en'

export interface CommunityEntryVM { heading: string; intro: string; cta: string; url: string; note: string }
export interface CommunityShareVM { heading: string; body: string; cta: string; url: string }
export interface CommunityRecordingVM { title: string; url: string; date: string }
export interface CommunityUnitVM {
  share: CommunityShareVM | null
  recordings: { heading: string; items: CommunityRecordingVM[] } | null
}

const isHttps = (u: string) => /^https:\/\/\S+$/.test(u)

/** Куда ведёт общая ссылка: тема курса, иначе группа. null — вести некуда. */
export function communityUrl(data: CommunityData): string | null {
  if (!data.enabled) return null
  const url = data.courseTopicUrl || data.groupUrl
  return isHttps(url) ? url : null
}

export function resolveCommunityEntry(data: CommunityData, locale: Loc): CommunityEntryVM | null {
  const url = communityUrl(data)
  if (!url) return null
  const c = data.copy
  return { heading: c.heading[locale], intro: c.intro[locale], cta: c.cta[locale], url, note: c.note[locale] }
}

export function resolveCommunityUnit(
  data: CommunityData, moduleSlug: string, unitSlug: string, isLastUnit: boolean, locale: Loc,
): CommunityUnitVM | null {
  if (!data.enabled) return null
  const c = data.copy
  const topic = data.moduleTopics[moduleSlug] ?? ''
  const share = isLastUnit && isHttps(topic) && c.shareBody[locale]
    ? { heading: c.shareHeading[locale], body: c.shareBody[locale], cta: c.shareCta[locale], url: topic }
    : null
  const items = (data.recordings[`${moduleSlug}/${unitSlug}`] ?? [])
    .filter(r => isHttps(r.url))
    .map(r => ({ title: r.title[locale], url: r.url, date: r.date }))
  const recordings = items.length ? { heading: c.recordingsHeading[locale], items } : null
  return share || recordings ? { share, recordings } : null
}

export function getCommunityEntry(locale: Loc): CommunityEntryVM | null {
  return resolveCommunityEntry(COMMUNITY, locale)
}

export function getCommunityUnit(moduleSlug: string, unitSlug: string, isLastUnit: boolean, locale: Loc): CommunityUnitVM | null {
  return resolveCommunityUnit(COMMUNITY, moduleSlug, unitSlug, isLastUnit, locale)
}
