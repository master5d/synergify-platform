import type { AudienceId, Bi, PlaceType, ThemeId, VenueKind } from './types'

// Темы ретритов с двуязычными названиями в порядке определения типа
export const THEMES: { id: ThemeId; label: Bi }[] = [
  { id: 'silence', label: { ru: 'Тишина и медитация', en: 'Silence and meditation' } },
  { id: 'body', label: { ru: 'Телесные практики и йога', en: 'Body practices and yoga' } },
  { id: 'breath', label: { ru: 'Дыхание и работа с телом', en: 'Breath and bodywork' } },
  { id: 'creative', label: { ru: 'Творчество и письмо', en: 'Creativity and writing' } },
  { id: 'nature', label: { ru: 'Природа и походы', en: 'Nature and hiking' } },
  { id: 'ritual', label: { ru: 'Ритуалы и церемонии', en: 'Rituals and ceremonies' } },
  { id: 'burnout', label: { ru: 'Восстановление после выгорания', en: 'Recovery from burnout' } },
  { id: 'couples', label: { ru: 'Отношения и пары', en: 'Relationships and couples' } },
  { id: 'leadership', label: { ru: 'Лидерство и команды', en: 'Leadership and teams' } },
  { id: 'transition', label: { ru: 'Личная перемена и переход', en: 'Personal change and transition' } },
]

// Аудитории участников с двуязычными названиями в порядке определения типа
export const AUDIENCES: { id: AudienceId; label: Bi }[] = [
  { id: 'beginners', label: { ru: 'Новички в практиках', en: 'Newcomers to practice' } },
  { id: 'practitioners', label: { ru: 'Опытные практикующие', en: 'Experienced practitioners' } },
  { id: 'burnedOut', label: { ru: 'Выгоревшие горожане', en: 'Burned-out city dwellers' } },
  { id: 'founders', label: { ru: 'Предприниматели и руководители', en: 'Founders and executives' } },
  { id: 'teams', label: { ru: 'Команды компаний', en: 'Company teams' } },
  { id: 'couples', label: { ru: 'Пары', en: 'Couples' } },
  { id: 'womensCircle', label: { ru: 'Женские круги', en: "Women's circles" } },
  { id: 'mensCircle', label: { ru: 'Мужские круги', en: "Men's circles" } },
  { id: 'creatives', label: { ru: 'Творческие люди', en: 'Creative people' } },
  { id: 'seekers', label: { ru: 'Искатели духовного опыта', en: 'Spiritual seekers' } },
]

// Природные и географические типы мест
export const PLACE_TYPES: { id: PlaceType; label: Bi; about: Bi }[] = [
  {
    id: 'sacred-mountains',
    label: { ru: 'Горы с сакральной славой', en: 'Mountains with a sacred reputation' },
    about: {
      ru: 'Высокогорные пространства с традицией уединения и духовных практик.',
      en: 'High-altitude spaces with a tradition of solitude and spiritual practice.',
    },
  },
  {
    id: 'deserts',
    label: { ru: 'Пустыни и красные скалы', en: 'Deserts and red rocks' },
    about: {
      ru: 'Открытые засушливые пространства с чистым горизонтом и тишиной.',
      en: 'Open arid landscapes with clear horizons and silence.',
    },
  },
  {
    id: 'tropics',
    label: { ru: 'Тропические острова и побережья', en: 'Tropical islands and coasts' },
    about: {
      ru: 'Тёплый океан, пышная природа и круглогодичные центры практик.',
      en: 'Warm ocean, lush nature, and year-round practice centres.',
    },
  },
  {
    id: 'old-lands',
    label: { ru: 'Старые горные и паломнические края', en: 'Old mountain and pilgrimage lands' },
    about: {
      ru: 'Исторические горные пути, монастырские тропы и древние святыни.',
      en: 'Historic mountain routes, monastic trails, and ancient shrines.',
    },
  },
  {
    id: 'edge',
    label: { ru: 'Край света', en: 'The edge of the world' },
    about: {
      ru: 'Удалённые суровые территории вдали от цивилизации и привычной суеты.',
      en: 'Remote rugged lands far from civilization and everyday rush.',
    },
  },
]

// Типы площадок для ретритов
export const VENUE_KINDS: Record<VenueKind, Bi> = {
  'retreat-center': { ru: 'Ретрит-центр', en: 'Retreat centre' },
  lodge: { ru: 'Лодж', en: 'Lodge' },
  monastery: { ru: 'Монастырь или храмовый центр', en: 'Monastery or temple centre' },
  glamping: { ru: 'Глэмпинг', en: 'Glamping' },
  'group-house': { ru: 'Дом под группы', en: 'Group house' },
}
