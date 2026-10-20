import type { Bi, ChannelId, EventClass, RungId } from './types'

// Порядок ступеней масштаба от наименьшего к наибольшему
export const RUNGS_ORDER: RungId[] = ['one', 'few', 'small', 'medium', 'large', 'many']

// Каналы проведения форматов
export const CHANNELS: { id: ChannelId; label: Bi }[] = [
  { id: 'offline', label: { ru: 'Очно', en: 'In person' } },
  { id: 'online', label: { ru: 'Онлайн', en: 'Online' } },
  { id: 'hybrid', label: { ru: 'Смешанно', en: 'Hybrid' } },
]

// Классы событий по регулярности и циклу
export const EVENT_CLASSES: { id: EventClass; label: Bi }[] = [
  { id: 'one-off', label: { ru: 'Разовое', en: 'One-off' } },
  { id: 'regular', label: { ru: 'Регулярное', en: 'Regular' } },
  { id: 'cycle', label: { ru: 'Цикл', en: 'Cycle' } },
]
