import { describe, expect, it } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { GUIDES, SOON } from '../../lib/retreat-regions/regions'
import { SEDONA } from '../../lib/retreat-regions/guides/sedona'
import { REGIONS_UI } from './ui'
import { RegionsPage } from './regions-page'
import { VibeCheck } from './vibe-check'
import { generateStaticParams } from '../../app/instrumenty/regiony/[slug]/page'
import sitemap from '../../app/sitemap'

describe('retreat regions render contract', () => {
  it('P01 список показывает пять типов мест, два гайда ссылками и 11 регионов «скоро» без ссылок', () => {
    const html = renderToStaticMarkup(<RegionsPage locale="ru" />)
    expect(html).toContain('href="/instrumenty/regiony/shasta/"')
    expect(html).toContain('href="/instrumenty/regiony/sedona/"')
    expect(html.match(/— скоро/g)).toHaveLength(11)
    for (const region of SOON) expect(html).not.toContain(`href="/instrumenty/regiony/${region.slug}/"`)
    expect(renderToStaticMarkup(<RegionsPage locale="en" />)).toContain('href="/en/instrumenty/regiony/sedona/"')
  })

  it('P02 гайд: разделы в порядке и пометка нарратива', () => {
    const html = renderToStaticMarkup(<VibeCheck guide={SEDONA} locale="ru" buildDate="2026-10-19" />)
    const headings = [
      'Характер места', 'Кто сюда едет', 'Что о месте рассказывают', 'Чьи это земли', 'Темы',
      'Аудитории', 'Кому да, кому нет', 'Площадки', 'Техника — следующий шаг', 'Источники',
    ]
    const indexes = headings.map((heading) => html.indexOf(`>${heading}</h2>`))
    expect(indexes.every((index, i) => index >= 0 && (i === 0 || index > indexes[i - 1]))).toBe(true)
    expect(html).toContain('Это нарратив, не факт.')
  })

  it('P03 generateStaticParams отдаёт только slug из GUIDES', () => {
    expect(generateStaticParams()).toEqual([{ slug: 'sedona' }, { slug: 'shasta' }])
  })

  it('P04 VibeCheck: выбор темы и аудитории даёт итог и подсветку', () => {
    const guide = {
      ...SEDONA,
      themes: {
        ...SEDONA.themes,
        silence: { mark: 'match' as const, why: SEDONA.themes.silence.why },
        ritual: { mark: 'clash' as const, why: SEDONA.themes.ritual.why },
      },
      audiences: { ...SEDONA.audiences, teams: { mark: 'clash' as const, why: SEDONA.audiences.teams.why } },
    }
    const html = renderToStaticMarkup(<VibeCheck guide={guide} locale="ru" buildDate="2026-10-19" initialTheme="silence" initialAudience="teams" />)
    expect(html).toContain('Тишина и медитация — совпадает')
    expect(html).toContain('Команды компаний — спорит')
    expect(html).toContain('data-fit="silence" data-picked="true"')
    expect(html).toContain('data-fit="teams" data-picked="true"')
    expect(html.match(/data-fit="[a-zA-Z]+" data-picked="true"/g)).toHaveLength(2)
    const status = html.split('role="status">')[1].split('</div>')[0]
    expect(status).toContain('Да, но с оговоркой')
    expect(status).toContain(SEDONA.audiences.teams.why.ru)
    const onlyTheme = renderToStaticMarkup(<VibeCheck guide={guide} locale="ru" buildDate="2026-10-19" initialTheme="ritual" />)
    expect(onlyTheme.split('role="status">')[1].split('</div>')[0]).toContain('Скорее нет')
  })

  it('P05 площадка старше года помечена «давно не проверяли»', () => {
    const guide = { ...SEDONA, venues: [
      { name: 'Площадка A', kind: 'lodge' as const, about: { ru: 'A', en: 'A' }, themes: [], audiences: [],
        url: 'https://a.example/', checked: '2025-01-01' },
      { name: 'Площадка B', kind: 'lodge' as const, about: { ru: 'B', en: 'B' }, themes: [], audiences: [],
        url: 'https://b.example/', checked: '2026-10-01' },
    ] }
    const html = renderToStaticMarkup(<VibeCheck guide={guide} locale="ru" buildDate="2026-10-19" />)
    expect(html.match(/давно не проверяли/g)).toHaveLength(1)
  })

  it('P09 раздел техники: союз и кавычки на своём языке', () => {
    const ru = renderToStaticMarkup(<VibeCheck guide={SEDONA} locale="ru" buildDate="2026-10-19" />)
    const en = renderToStaticMarkup(<VibeCheck guide={SEDONA} locale="en" buildDate="2026-10-19" />)
    expect(ru).toMatch(/«Логистика»<\/a> и <a[^>]*>«Пакет и ставка»<\/a>/)
    expect(en).toMatch(/“Logistics”<\/a> and <a[^>]*>“Package and rate”<\/a>/)
    expect(en).not.toMatch(/<\/a> и <a/)
  })

  it('P06 ссылки площадок с noopener и без utm/ref', () => {
    const guide = { ...SEDONA, venues: [{ name: 'Площадка A', kind: 'lodge' as const,
      about: { ru: 'A', en: 'A' }, themes: [], audiences: [], url: 'https://a.example/', checked: '2026-10-01' }] }
    const html = renderToStaticMarkup(<VibeCheck guide={guide} locale="ru" buildDate="2026-10-19" />)
    const link = html.match(/<a href="https:\/\/a\.example\/"[^>]*>/)?.[0] ?? ''
    expect(link).toContain('target="_blank"')
    expect(link).toContain('rel="noopener"')
    expect(html).not.toContain('utm_')
    expect(html).not.toContain('?ref=')
  })

  it('P07 RU и EN ui.ts — одинаковый набор ключей', () => {
    expect(Object.keys(REGIONS_UI.ru).sort()).toEqual(Object.keys(REGIONS_UI.en).sort())
  })

  it('P08 sitemap содержит список и оба гайда', () => {
    const urls = sitemap().map((entry) => entry.url)
    expect(urls).toContain('https://academy.synergify.com/instrumenty/regiony/')
    expect(urls).toContain('https://academy.synergify.com/instrumenty/regiony/shasta/')
    expect(urls).toContain('https://academy.synergify.com/instrumenty/regiony/sedona/')
  })
})
