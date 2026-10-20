// Двуязычная строка (русский и английский)
export type Bi = { ru: string; en: string }

// Идентификаторы ступеней размера группы
export type RungId = 'one' | 'few' | 'small' | 'medium' | 'large' | 'many'

// Идентификаторы каналов проведения
export type ChannelId = 'offline' | 'online' | 'hybrid'

// Классы частоты и формата событий
export type EventClass = 'one-off' | 'regular' | 'cycle'

// Семейства форматов
export type FamilyId =
  | 'retreat'
  | 'one-to-one'
  | 'table'
  | 'regular-group'
  | 'learning'
  | 'online-intensive'
  | 'tour'
  | 'big-event'
  | 'club'

// Клетка на карте форматов (пересечение осей)
export interface Cell {
  rung: RungId
  channel: ChannelId
  eventClass: EventClass
}

// Формат мероприятия
export interface Format {
  id: string
  name: Bi
  about: Bi
  family: FamilyId
  cells: Cell[]
}

// Семейство форматов и связь с учебным курсом
export interface Family {
  id: FamilyId
  epic: number
  label: Bi
  course: Bi | null
}

// Законы ступени масштаба
export interface RungLaws {
  attention: Bi
  pricePerHead: Bi
  team: Bi
  voice: Bi
  gives: Bi
}

// Ступень масштаба группы
export interface Rung {
  id: RungId
  label: Bi
  size: Bi
  laws: RungLaws
  upSignals: Bi[]
  earlySignals: Bi[]
}
