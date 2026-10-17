// packs/retreat/materials.ts
// Манифест материалов курса: шаблоны для практики (public/retreat-materials/, владелец — этот pack)
// и ссылки на академию. У Material один href без локали — поэтому шаблоны двумя группами по языку.
// Страницы курса (шпаргалка, карта) добавляются, когда появятся их файлы.
import type { Bi } from './course.config'

export type MaterialKind = 'template' | 'link' | 'tool'

export interface Material {
  kind: MaterialKind
  title: Bi
  description?: Bi
  href: string
  /** True for off-site links (open in a new tab). Keep in sync with the href. */
  external?: boolean
}

export interface MaterialGroup {
  label: Bi
  items: Material[]
}

/** http(s):// → external; anything else (relative path) is internal. */
export function isExternalHref(href: string): boolean {
  return /^https?:\/\//.test(href)
}

export const COURSE_MATERIALS: MaterialGroup[] = [
  {
    label: { ru: 'Шаблоны на русском', en: 'Templates in Russian' },
    items: [
      {
        kind: 'template',
        title: { ru: 'Меню на неделю', en: 'Menu for a week' },
        description: { ru: 'Сетка приёмов пищи с заезда до выезда и стоимость на гостя', en: 'Meals from arrival to departure with the cost per guest' },
        href: '/retreat-materials/menu-week.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Анкета гостя', en: 'Guest form' },
        description: { ru: 'Питание, аллергии, рейсы, согласия', en: 'Food, allergies, flights, consents' },
        href: '/retreat-materials/guest-form.ru.md',
      },
      {
        kind: 'template',
        title: { ru: 'Таймлайн от даты старта', en: 'Timeline from the start date' },
        description: { ru: 'Платежи, отмены, анкета, меню и разбор по датам', en: 'Payments, cancellations, form, menu and review by date' },
        href: '/retreat-materials/timeline.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Сетка программы', en: 'Program grid' },
        description: { ru: 'Дни и часы с приёмами пищи и нагрузкой дня', en: 'Days and hours with meals and the load of each day' },
        href: '/retreat-materials/program-grid.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Карточка практики', en: 'Practice card' },
        description: { ru: 'Формат, длительность, нагрузка, противопоказания, касание', en: 'Format, duration, load, contraindications, touch' },
        href: '/retreat-materials/practice-card.ru.md',
      },
      {
        kind: 'template',
        title: { ru: 'Лист прибытия', en: 'Arrivals list' },
        description: { ru: 'Рейсы гостей, кто встречает, где встреча', en: 'Guest flights, who meets them, where' },
        href: '/retreat-materials/arrival-list.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Год площадки', en: 'Venue year' },
        description: { ru: 'Ретритные недели и посуточные ночи по месяцам', en: 'Retreat weeks and nightly lets by month' },
        href: '/retreat-materials/venue-year.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Модель окупаемости с восемью ошибками', en: 'A payback model with eight mistakes' },
        description: { ru: 'Учебная таблица для урока 05/u4', en: 'A teaching spreadsheet for lesson 05/u4' },
        href: '/retreat-materials/payback-model-8-errors.ru.csv',
      },
    ],
  },
  {
    label: { ru: 'Шаблоны на английском', en: 'Templates in English' },
    items: [
      {
        kind: 'template',
        title: { ru: 'Меню на неделю', en: 'Menu for a week' },
        description: { ru: 'Сетка приёмов пищи с заезда до выезда и стоимость на гостя', en: 'Meals from arrival to departure with the cost per guest' },
        href: '/retreat-materials/menu-week.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Анкета гостя', en: 'Guest form' },
        description: { ru: 'Питание, аллергии, рейсы, согласия', en: 'Food, allergies, flights, consents' },
        href: '/retreat-materials/guest-form.en.md',
      },
      {
        kind: 'template',
        title: { ru: 'Таймлайн от даты старта', en: 'Timeline from the start date' },
        description: { ru: 'Платежи, отмены, анкета, меню и разбор по датам', en: 'Payments, cancellations, form, menu and review by date' },
        href: '/retreat-materials/timeline.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Сетка программы', en: 'Program grid' },
        description: { ru: 'Дни и часы с приёмами пищи и нагрузкой дня', en: 'Days and hours with meals and the load of each day' },
        href: '/retreat-materials/program-grid.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Карточка практики', en: 'Practice card' },
        description: { ru: 'Формат, длительность, нагрузка, противопоказания, касание', en: 'Format, duration, load, contraindications, touch' },
        href: '/retreat-materials/practice-card.en.md',
      },
      {
        kind: 'template',
        title: { ru: 'Лист прибытия', en: 'Arrivals list' },
        description: { ru: 'Рейсы гостей, кто встречает, где встреча', en: 'Guest flights, who meets them, where' },
        href: '/retreat-materials/arrival-list.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Год площадки', en: 'Venue year' },
        description: { ru: 'Ретритные недели и посуточные ночи по месяцам', en: 'Retreat weeks and nightly lets by month' },
        href: '/retreat-materials/venue-year.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Модель окупаемости с восемью ошибками', en: 'A payback model with eight mistakes' },
        description: { ru: 'Учебная таблица для урока 05/u4', en: 'A teaching spreadsheet for lesson 05/u4' },
        href: '/retreat-materials/payback-model-8-errors.en.csv',
      },
    ],
  },
  {
    label: { ru: 'Из курса', en: 'From the course' },
    items: [
      { kind: 'link', title: { ru: 'Шпаргалка', en: 'Cheat sheet' }, href: '/cheatsheet/' },
      { kind: 'link', title: { ru: 'Карта курса', en: 'Course map' }, href: '/roadmap/' },
      { kind: 'link', title: { ru: 'Упражнения', en: 'Exercises' }, href: '/exercises/' },
    ],
  },
  {
    label: { ru: 'Ссылки', en: 'Links' },
    items: [
      {
        kind: 'link',
        title: { ru: 'Манифест школы синергемы', en: 'The Synergema School manifesto' },
        description: {
          ru: 'Откуда этот курс и на каких правилах стоит академия',
          en: 'Where this course comes from and the rules the academy stands on',
        },
        href: 'https://academy.synergify.com/',
        external: true,
      },
      {
        kind: 'link',
        title: { ru: 'Правила дома', en: 'House rules' },
        description: {
          ru: 'Правила академии: слова имеют происхождение, выход ничего не стоит',
          en: 'The academy rules: words have origins, the exit costs nothing',
        },
        href: 'https://academy.synergify.com/pravila/',
        external: true,
      },
    ],
  },
]
