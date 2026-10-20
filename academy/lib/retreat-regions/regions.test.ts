import { describe, expect, it } from 'vitest'
import { checkGuide, venueStale } from './check'
import { SEDONA } from './guides/sedona'
import { SHASTA } from './guides/shasta'
import { GUIDES, REGIONS_PATH, REGION_LESSON_URL, SOON, guideBySlug } from './regions'
import type { RegionGuide, Venue } from './types'
import { vibeVerdict } from './verdict'
import { AUDIENCES, PLACE_TYPES, THEMES, VENUE_KINDS } from './vocab'

// Вспомогательное глубокое клонирование гайда для тестов мутаций
function cloneGuide(guide: RegionGuide): RegionGuide {
  return JSON.parse(JSON.stringify(guide)) as RegionGuide
}

// Вспомогательный шаблон площадки для тестов
function makeVenue(name: string, url: string, checked = '2026-10-19'): Venue {
  return {
    name,
    kind: 'lodge',
    about: { ru: `Лодж ${name}`, en: `Lodge ${name}` },
    themes: ['silence'],
    audiences: ['practitioners'],
    url,
    checked,
  }
}

describe('retreat-regions', () => {
  it('R01 словарь: 10 тем и 10 аудиторий, id уникальны, RU и EN непустые', () => {
    expect(THEMES).toHaveLength(10)
    expect(AUDIENCES).toHaveLength(10)

    const themeIds = new Set(THEMES.map((theme) => theme.id))
    const audienceIds = new Set(AUDIENCES.map((audience) => audience.id))
    expect(themeIds.size).toBe(10)
    expect(audienceIds.size).toBe(10)

    for (const theme of THEMES) {
      expect(theme.label.ru.trim().length).toBeGreaterThan(0)
      expect(theme.label.en.trim().length).toBeGreaterThan(0)
    }

    for (const audience of AUDIENCES) {
      expect(audience.label.ru.trim().length).toBeGreaterThan(0)
      expect(audience.label.en.trim().length).toBeGreaterThan(0)
    }

    expect(PLACE_TYPES).toHaveLength(5)
    for (const place of PLACE_TYPES) {
      expect(place.label.ru.trim().length).toBeGreaterThan(0)
      expect(place.label.en.trim().length).toBeGreaterThan(0)
      expect(place.about.ru.trim().length).toBeGreaterThan(0)
      expect(place.about.en.trim().length).toBeGreaterThan(0)
    }

    const kinds = Object.values(VENUE_KINDS)
    expect(kinds).toHaveLength(5)
    for (const kind of kinds) {
      expect(kind.ru.trim().length).toBeGreaterThan(0)
      expect(kind.en.trim().length).toBeGreaterThan(0)
    }
  })

  it('R02 итог: девять сочетаний совпадает/спорит/нейтрально', () => {
    expect(vibeVerdict('match', 'match')).toBe('yes')
    expect(vibeVerdict('match', 'neutral')).toBe('yes')
    expect(vibeVerdict('neutral', 'match')).toBe('yes')
    expect(vibeVerdict('match', 'clash')).toBe('yes-but')
    expect(vibeVerdict('clash', 'match')).toBe('yes-but')
    expect(vibeVerdict('clash', 'clash')).toBe('rather-no')
    expect(vibeVerdict('clash', 'neutral')).toBe('rather-no')
    expect(vibeVerdict('neutral', 'clash')).toBe('rather-no')
    expect(vibeVerdict('neutral', 'neutral')).toBe('place-neutral')
  })

  it('R03 итог: невыбранное считается нейтральным, оба не выбраны — null', () => {
    expect(vibeVerdict('match', null)).toBe('yes')
    expect(vibeVerdict(null, 'clash')).toBe('rather-no')
    expect(vibeVerdict('neutral', null)).toBe('place-neutral')
    expect(vibeVerdict(null, null)).toBeNull()
  })

  it('R04 образцовый гайд проходит checkGuide без замечаний', () => {
    expect(checkGuide(SHASTA)).toEqual([])
    expect(checkGuide(SEDONA)).toEqual([])
  })

  it('R05 пустое или одноязычное поле — ошибка с путём поля', () => {
    const badEmptyEn = cloneGuide(SHASTA)
    badEmptyEn.character.en = ''
    expect(checkGuide(badEmptyEn)).toContainEqual({ id: 'empty', where: 'character.en' })

    const badWhitespaceRu = cloneGuide(SHASTA)
    badWhitespaceRu.themes.silence.why.ru = ' '
    expect(checkGuide(badWhitespaceRu)).toContainEqual({
      id: 'empty',
      where: 'themes.silence.why.ru',
    })
  })

  it('R06 ссылка площадки: только https и без ref, utm_*, aff', () => {
    const badGuide = cloneGuide(SHASTA)
    badGuide.venues = [
      makeVenue('Площадка 1', 'http://a.example/'),
      makeVenue('Площадка 2', 'https://a.example/?utm_source=x'),
      makeVenue('Площадка 3', 'https://a.example/?ref=x'),
    ]
    const issues = checkGuide(badGuide)
    expect(issues).toContainEqual({ id: 'venue-url', where: 'venues.0.url' })
    expect(issues).toContainEqual({ id: 'venue-url', where: 'venues.1.url' })
    expect(issues).toContainEqual({ id: 'venue-url', where: 'venues.2.url' })

    const cleanGuide = cloneGuide(SHASTA)
    cleanGuide.venues = [makeVenue('Площадка Чистая', 'https://a.example/?page=2')]
    const cleanIssues = checkGuide(cleanGuide).filter((issue) => issue.id === 'venue-url')
    expect(cleanIssues).toEqual([])
  })

  it('R07 площадки по алфавиту и не больше десяти', () => {
    const badOrderGuide = cloneGuide(SHASTA)
    badOrderGuide.venues = [
      makeVenue('Площадка B', 'https://a.example/b'),
      makeVenue('Площадка A', 'https://a.example/a'),
    ]
    expect(checkGuide(badOrderGuide)).toContainEqual({ id: 'venue-order', where: 'venues' })

    const elevenGuide = cloneGuide(SHASTA)
    elevenGuide.venues = Array.from({ length: 11 }, (_, i) => {
      const char = String.fromCharCode(65 + i)
      return makeVenue(`Venue ${char}`, `https://a.example/${char.toLowerCase()}`)
    })
    const elevenIssues = checkGuide(elevenGuide)
    expect(elevenIssues).toContainEqual({ id: 'venue-count', where: 'venues' })
    expect(elevenIssues.some((issue) => issue.id === 'venue-order')).toBe(false)
  })

  it('R08 площадка без даты — ошибка, старше 365 дней — устаревшая', () => {
    expect(venueStale('2025-10-18', '2026-10-19')).toBe(true)
    expect(venueStale('2025-10-20', '2026-10-19')).toBe(false)

    const badDateGuide = cloneGuide(SHASTA)
    badDateGuide.venues = [makeVenue('Площадка Без Даты', 'https://a.example/a', '')]
    expect(checkGuide(badDateGuide)).toContainEqual({
      id: 'venue-date',
      where: 'venues.0.checked',
    })
  })

  it('R09 у источников и ссылок культуры есть дата обращения', () => {
    const badSourceGuide = cloneGuide(SHASTA)
    badSourceGuide.sources[0].accessed = '19.10.2026'
    expect(checkGuide(badSourceGuide)).toContainEqual({
      id: 'source-date',
      where: 'sources.0.accessed',
    })

    const badCultureGuide = cloneGuide(SHASTA)
    badCultureGuide.culture.links[0].accessed = '19.10.2026'
    expect(checkGuide(badCultureGuide)).toContainEqual({
      id: 'source-date',
      where: 'culture.links.0.accessed',
    })
  })

  it('R10 GUIDES и SOON: slug уникальны, не пересекаются, SOON — 11 регионов', () => {
    const guideSlugs = GUIDES.map((guide) => guide.slug)
    const soonSlugs = SOON.map((stub) => stub.slug)

    expect(new Set(guideSlugs).size).toBe(GUIDES.length)
    expect(new Set(soonSlugs).size).toBe(SOON.length)
    expect(SOON).toHaveLength(11)

    const intersection = guideSlugs.filter((slug) => soonSlugs.includes(slug))
    expect(intersection).toEqual([])

    expect(guideBySlug('sedona')).toBe(SEDONA)
    expect(guideBySlug('shasta')).toBe(SHASTA)
    expect(guideBySlug('unknown')).toBeUndefined()

    expect(REGIONS_PATH).toBe('/instrumenty/regiony/')
    expect(REGION_LESSON_URL.ru).toContain('https://academy.synergify.com')
    expect(REGION_LESSON_URL.en).toContain('https://academy.synergify.com')
  })

  it('R11 настоящие гайды проходят checkGuide без замечаний', () => {
    for (const g of GUIDES) {
      expect(checkGuide(g), g.slug).toEqual([])
      expect(g.venues.length, g.slug).toBeGreaterThanOrEqual(4)
      for (const v of g.venues) expect(venueStale(v.checked, '2026-10-19'), v.name).toBe(false)
    }
  })
})
