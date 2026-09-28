import { describe, expect, it } from 'vitest'
import { existsSync } from 'node:fs'
import { join } from 'node:path'
import { EIDETICS_PROSE, getEideticsProse, writtenEideticsSlugs } from './lessons'
import { EIDETICS_COURSE } from './course'
import { lintDehustle } from '../authoring/dehustle'
import { checkPromises } from './promises'

const SLUGS = EIDETICS_COURSE.lessons.map((l) => l.slug)

describe('eidetics prose', () => {
  it('every prose key matches a real lesson slug', () => {
    for (const key of Object.keys(EIDETICS_PROSE)) expect(SLUGS).toContain(key)
  })

  it('written lessons carry both locales and enough substance', () => {
    for (const slug of writtenEideticsSlugs()) {
      expect(getEideticsProse(slug, 'ru')!.split(/\s+/).length, `${slug} ru`).toBeGreaterThan(200)
      expect(getEideticsProse(slug, 'en')!.split(/\s+/).length, `${slug} en`).toBeGreaterThan(200)
    }
  })

  // Прецедент скорочтения (Rayner 2016 → запрет 1000+ wpm): курс не обещает больше метода.
  // Для эйдетики — «фотографическая память» как навык (доказательств нет, спека § «Чего НЕ обещаем»).
  it('prose is de-hustle clean and never promises photographic memory', () => {
    for (const slug of writtenEideticsSlugs()) {
      for (const locale of ['ru', 'en'] as const) {
        const body = getEideticsProse(slug, locale)!
        expect(lintDehustle(body), `${slug} ${locale}`).toEqual([])
        expect(checkPromises(body), `${slug} ${locale}`).toEqual([])
      }
    }
  })

  it('unwritten lessons resolve to null and never get a page', () => {
    expect(getEideticsProse('definitely-not-a-lesson', 'ru')).toBeNull()
    for (const slug of SLUGS) {
      const bi = EIDETICS_PROSE[slug]
      if (!bi || !bi.ru.trim() || !bi.en.trim()) expect(writtenEideticsSlugs()).not.toContain(slug)
    }
  })

  // Маршрута урока пока нет: под output:'export' пустой generateStaticParams роняет сборку.
  // Как только владелец напишет прозу, этот тест упадёт и напомнит завести
  // app/(en/)trenazhery/eidetika/[slug]/page.tsx по образцу скорочтения и ссылки на странице модуля.
  it('written prose requires a lesson route (no dead links to unwritten pages)', () => {
    const route = join(process.cwd(), 'app', 'trenazhery', 'eidetika', '[slug]', 'page.tsx')
    if (!existsSync(route)) expect(writtenEideticsSlugs()).toEqual([])
  })
})
