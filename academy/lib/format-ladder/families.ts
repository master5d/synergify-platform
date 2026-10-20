import type { Bi, Family } from './types'

// Известные ссылки на курсы Академии
export const KNOWN_COURSES: Bi[] = [
  {
    ru: 'https://academy.synergify.com/retrit/',
    en: 'https://academy.synergify.com/retrit/en/',
  },
  {
    ru: 'https://academy.synergify.com/odin-na-odin/',
    en: 'https://academy.synergify.com/odin-na-odin/en/',
  },
]

// Семейства форматов в порядке эпиков
export const FAMILIES: Family[] = [
  {
    id: 'retreat',
    epic: 1,
    label: { ru: 'Ретрит', en: 'Retreat' },
    course: KNOWN_COURSES[0],
  },
  {
    id: 'one-to-one',
    epic: 2,
    label: { ru: 'Один на один', en: 'One to one' },
    course: KNOWN_COURSES[1],
  },
  {
    id: 'table',
    epic: 3,
    label: { ru: 'За столом', en: 'At the table' },
    course: null,
  },
  {
    id: 'regular-group',
    epic: 4,
    label: { ru: 'Регулярная группа', en: 'Regular group' },
    course: null,
  },
  {
    id: 'learning',
    epic: 5,
    label: { ru: 'Обучение', en: 'Learning' },
    course: null,
  },
  {
    id: 'online-intensive',
    epic: 6,
    label: { ru: 'Онлайн-интенсив', en: 'Online intensive' },
    course: null,
  },
  {
    id: 'tour',
    epic: 7,
    label: { ru: 'Тур и экспедиция', en: 'Tour and expedition' },
    course: null,
  },
  {
    id: 'big-event',
    epic: 8,
    label: { ru: 'Большое событие', en: 'Big event' },
    course: null,
  },
  {
    id: 'club',
    epic: 9,
    label: { ru: 'Клуб и дом культуры', en: 'Club and house of culture' },
    course: null,
  },
]
