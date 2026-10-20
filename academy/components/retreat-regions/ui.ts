import type { Locale } from '../../lib/dictionaries'

export const REGIONS_UI = {
  ru: {
    eyebrow: 'инструменты', h1: 'Регионы ретритов',
    lead: 'Подходит ли регион вашему ретриту по теме и аудитории. Выберите тему и аудиторию на странице региона — гайд подсветит, где место совпадает, а где спорит. '
      + 'Разрешения, сезон и площадки по условиям — это подготовка ретрита, о ней уроки курса.',
    back: '← к академии', myTheme: 'Моя тема', myAudience: 'Моя аудитория', empty: '— не выбрано —',
    verdict: 'Итог', character: 'Характер места', whoGoes: 'Кто сюда едет', narrative: 'Что о месте рассказывают',
    narrativeNote: 'Это нарратив, не факт.', culture: 'Чьи это земли', themes: 'Темы', audiences: 'Аудитории',
    fits: 'совпадает', clashes: 'спорит', neutral: 'нейтрально', suits: 'Кому да, кому нет',
    venues: 'Площадки', venueChecked: (date: string) => `проверено ${date}`, venueStale: 'давно не проверяли',
    noVenues: 'Площадки появятся после проверки.', technical: 'Техника — следующий шаг', sources: 'Источники',
    accessed: (date: string) => `дата обращения: ${date}`, lesson: 'Урок: выбор региона',
    technicalText: 'Разрешения, сезон, дорога, площадка и цены — подготовка ретрита, а не выбор региона: уроки',
    logistics: '«Логистика»', package: '«Пакет и ставка»', and: 'и', soon: 'скоро', backToRegions: '← к регионам ретритов',
  },
  en: {
    eyebrow: 'tools', h1: 'Retreat regions',
    lead: 'Does a region fit your retreat by theme and audience? Choose a theme and audience on a region page — the guide highlights where the place fits and where it clashes. '
      + 'Permits, season and venue terms are retreat preparation, covered by the course lessons.',
    back: '← back to the academy', myTheme: 'My theme', myAudience: 'My audience', empty: '— not chosen —',
    verdict: 'Result', character: 'The character of the place', whoGoes: 'Who comes here', narrative: 'What people say about the place',
    narrativeNote: 'This is narrative, not fact.', culture: 'Whose land it is', themes: 'Themes', audiences: 'Audiences',
    fits: 'fits', clashes: 'clashes', neutral: 'neutral', suits: 'Who it suits and who it does not',
    venues: 'Venues', venueChecked: (date: string) => `checked ${date}`, venueStale: 'not checked for a long time',
    noVenues: 'Venues will appear once checked.', technical: 'The technical side is the next step', sources: 'Sources',
    accessed: (date: string) => `accessed ${date}`, lesson: 'Lesson: choosing a region',
    technicalText: 'Permits, season, travel, venue, and prices are retreat preparation, not region selection: lessons',
    logistics: '“Logistics”', package: '“Package and rate”', and: 'and', soon: 'soon', backToRegions: '← to retreat regions',
  },
} satisfies Record<Locale, object>

export type RegionsUi = (typeof REGIONS_UI)['ru']
