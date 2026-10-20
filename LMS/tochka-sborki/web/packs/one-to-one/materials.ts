// packs/one-to-one/materials.ts
// Манифест материалов курса: шаблоны для практики (public/one-to-one-materials/, владелец — этот pack)
// и инструмент академии. У Material один href без локали — поэтому шаблоны двумя группами по языку.
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
        title: { ru: 'Карта практики', en: 'A map of your practice' },
        description: { ru: 'Клиенты, что каждый получает от метода и от отношений, признаки потолка', en: 'Clients, what each gets from the method and from the relationship, signs of a ceiling' },
        href: '/one-to-one-materials/practice-map.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Граница компетенции', en: 'The edge of your competence' },
        description: { ru: 'Признаки остановиться, как сказать, список «куда передавать»', en: 'Signs to stop, how to say it, a referral list' },
        href: '/one-to-one-materials/competence-boundary.ru.md',
      },
      {
        kind: 'template',
        title: { ru: 'Метод на одной странице', en: 'A method on one page' },
        description: { ru: 'Шаги сессии, минуты, что выдержит двоих', en: 'Session steps, minutes, what holds two people' },
        href: '/one-to-one-materials/one-page-method.ru.md',
      },
      {
        kind: 'template',
        title: { ru: 'Расчёт предела', en: 'The limit, worked out' },
        description: { ru: 'Цена рабочего часа и потолок недели, учебный пример рядом', en: 'The price of a working hour and the weekly ceiling, with a worked example' },
        href: '/one-to-one-materials/limit.ru.csv',
      },
      {
        kind: 'template',
        title: { ru: 'План первого шага', en: 'The plan of the first step' },
        description: { ru: 'Встреча на 2–7 человек: дата, кого позвать, как сказать нынешним', en: 'A meeting for 2–7 people: date, whom to invite, how to tell current clients' },
        href: '/one-to-one-materials/first-step-plan.ru.md',
      },
    ],
  },
  {
    label: { ru: 'Шаблоны на английском', en: 'Templates in English' },
    items: [
      {
        kind: 'template',
        title: { ru: 'Карта практики', en: 'A map of your practice' },
        description: { ru: 'Клиенты, что каждый получает от метода и от отношений, признаки потолка', en: 'Clients, what each gets from the method and from the relationship, signs of a ceiling' },
        href: '/one-to-one-materials/practice-map.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'Граница компетенции', en: 'The edge of your competence' },
        description: { ru: 'Признаки остановиться, как сказать, список «куда передавать»', en: 'Signs to stop, how to say it, a referral list' },
        href: '/one-to-one-materials/competence-boundary.en.md',
      },
      {
        kind: 'template',
        title: { ru: 'Метод на одной странице', en: 'A method on one page' },
        description: { ru: 'Шаги сессии, минуты, что выдержит двоих', en: 'Session steps, minutes, what holds two people' },
        href: '/one-to-one-materials/one-page-method.en.md',
      },
      {
        kind: 'template',
        title: { ru: 'Расчёт предела', en: 'The limit, worked out' },
        description: { ru: 'Цена рабочего часа и потолок недели, учебный пример рядом', en: 'The price of a working hour and the weekly ceiling, with a worked example' },
        href: '/one-to-one-materials/limit.en.csv',
      },
      {
        kind: 'template',
        title: { ru: 'План первого шага', en: 'The plan of the first step' },
        description: { ru: 'Встреча на 2–7 человек: дата, кого позвать, как сказать нынешним', en: 'A meeting for 2–7 people: date, whom to invite, how to tell current clients' },
        href: '/one-to-one-materials/first-step-plan.en.md',
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
    label: { ru: 'Инструменты академии', en: 'Academy tools' },
    items: [
      {
        kind: 'tool',
        title: { ru: 'Лесенка форматов', en: 'Format ladder' },
        description: { ru: 'Ступени от один на один до сотен людей и «Моя карта» для следующего шага', en: 'Steps from one to one up to hundreds of people, and “My map” for the next step' },
        href: 'https://academy.synergify.com/instrumenty/lesenka/',
        external: true,
      },
    ],
  },
]
