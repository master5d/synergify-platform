import { SEDONA } from './guides/sedona'
import { SHASTA } from './guides/shasta'
import type { Bi, RegionGuide, RegionStub } from './types'

// Опубликованные полные гайды по регионам
export const GUIDES: RegionGuide[] = [SEDONA, SHASTA]

// Регионы в разработке («скоро»)
export const SOON: RegionStub[] = [
  { slug: 'bali', name: { ru: 'Бали', en: 'Bali' }, placeType: 'tropics' },
  { slug: 'phangan', name: { ru: 'Панган', en: 'Koh Phangan' }, placeType: 'tropics' },
  { slug: 'sri-lanka', name: { ru: 'Шри-Ланка', en: 'Sri Lanka' }, placeType: 'tropics' },
  { slug: 'tulum', name: { ru: 'Тулум', en: 'Tulum' }, placeType: 'tropics' },
  { slug: 'baja-california', name: { ru: 'Нижняя Калифорния', en: 'Baja California' }, placeType: 'deserts' },
  { slug: 'antarctica', name: { ru: 'Антарктида', en: 'Antarctica' }, placeType: 'edge' },
  {
    slug: 'sacred-valley',
    name: { ru: 'Священная долина инков', en: 'Sacred Valley of the Incas' },
    placeType: 'sacred-mountains',
  },
  { slug: 'altai', name: { ru: 'Алтай', en: 'Altai' }, placeType: 'sacred-mountains' },
  { slug: 'dagestan', name: { ru: 'Дагестан', en: 'Dagestan' }, placeType: 'old-lands' },
  { slug: 'crimea', name: { ru: 'Крым', en: 'Crimea' }, placeType: 'old-lands' },
  { slug: 'carpathians', name: { ru: 'Карпаты', en: 'Carpathians' }, placeType: 'old-lands' },
]

// Поиск опубликованного гайда по уникальному слагу
export function guideBySlug(slug: string): RegionGuide | undefined {
  return GUIDES.find((guide) => guide.slug === slug)
}

// Базовый путь страниц инструмента «Регионы ретритов»
export const REGIONS_PATH = '/instrumenty/regiony/'

// Ссылка на методический урок курса ретритов
export const REGION_LESSON_URL: Bi = {
  ru: 'https://academy.synergify.com/retrit/lessons/03-vedushchiy-zamysel/u7-region/',
  en: 'https://academy.synergify.com/retrit/en/lessons/03-vedushchiy-zamysel/u7-region/',
}
