// Двуязычная строка (русский и английский)
export type Bi = { ru: string; en: string }

// Отметка совпадения темы или аудитории
export type Mark = 'match' | 'clash' | 'neutral'

// Темы ретритов
export type ThemeId =
  | 'silence'
  | 'body'
  | 'breath'
  | 'creative'
  | 'nature'
  | 'ritual'
  | 'burnout'
  | 'couples'
  | 'leadership'
  | 'transition'

// Аудитории участников
export type AudienceId =
  | 'beginners'
  | 'practitioners'
  | 'burnedOut'
  | 'founders'
  | 'teams'
  | 'couples'
  | 'womensCircle'
  | 'mensCircle'
  | 'creatives'
  | 'seekers'

// Тип природного или географического пространства
export type PlaceType = 'sacred-mountains' | 'deserts' | 'tropics' | 'old-lands' | 'edge'

// Тип площадки
export type VenueKind = 'retreat-center' | 'lodge' | 'monastery' | 'glamping' | 'group-house'

// Итог проверки вайба
export type Verdict = 'yes' | 'yes-but' | 'rather-no' | 'place-neutral'

// Оценка совпадения темы или аудитории с пояснением
export interface Fit {
  mark: Mark
  why: Bi
}

// Источник данных или ссылка на культуру места
export interface Source {
  title: string
  url: string
  accessed: string
}

// Площадка для проведения ретрита
export interface Venue {
  name: string
  kind: VenueKind
  about: Bi
  themes: ThemeId[]
  audiences: AudienceId[]
  url: string
  checked: string
}

// Полный гайд по региону
export interface RegionGuide {
  slug: string
  name: Bi
  placeType: PlaceType
  character: Bi
  whoGoes: Bi
  narrative: Bi[]
  culture: { lands: Bi; asks: Bi; links: Source[] }
  themes: Record<ThemeId, Fit>
  audiences: Record<AudienceId, Fit>
  verdict: { yes: Bi; no: Bi }
  venues: Venue[]
  sources: Source[]
}

// Заглушка региона в списке «скоро»
export interface RegionStub {
  slug: string
  name: Bi
  placeType: PlaceType
}
