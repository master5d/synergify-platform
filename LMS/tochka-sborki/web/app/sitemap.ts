import type { MetadataRoute } from 'next'
import { getAllModules } from '@/lib/content'
import { buildSitemap } from '@/lib/sitemap'
import { COURSE } from '@/lib/course'
import { writtenSpeechSlugs } from '@/lib/speech/lessons'
import { getStarter } from '@/lib/starter/starter'

export const dynamic = 'force-static'

const BASE = COURSE.domain

// Public, indexable pages. Auth-gated / noindex routes (dashboard, character, login,
// quest-intake, admin, dungeon, exercises, offline) are intentionally excluded.
const STATIC_PATHS = [
  '/',
  '/roadmap/',
  '/cheatsheet/',
  // Запись на открытый разбор (AMA) — публичная точка входа, не гейтится.
  '/ama/',
  // Служба заботы — одно окно помощи по курсу (волна 18).
  '/care/',
  // «Попробуй до курса»: открытая страница для тех, кто ещё не решился.
  '/try/',
  // «Пакет тетрадки»: открытая страница промптов и проверки источников.
  '/notebook/',
  // Курс речи: проза написана → хаб индексируется.
  '/speech/',
]

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [...STATIC_PATHS]
  // Стартер студента — только у курса, который его объявил (packs/<pack>/course/starter.ts).
  if (getStarter('ru')) paths.push('/starter/')
  // Уроки изолированных курсов индексируются только когда написаны.
  for (const slug of writtenSpeechSlugs()) paths.push(`/speech/${slug}/`)
  for (const m of getAllModules('ru')) {
    paths.push(`/lessons/${m.slug}/`)
    for (const u of m.units ?? []) paths.push(`/lessons/${m.slug}/${u.slug}/`)
  }
  return buildSitemap(paths, BASE)
}
