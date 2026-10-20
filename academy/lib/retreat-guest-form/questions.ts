// Каталог вопросов анкеты гостя (spec подпроекта B, §5.2). Академия анкету не хостит: ведущий собирает свой набор,
// копирует текст в Google Forms, Typeform или письмо, а ответы потом загружает CSV в сводку (answers.ts).
// Маршруты — как в курсе (04/u3): еда — шефу, рейсы — в лист прибытия, здоровье и экстренный контакт — ведущему
// и тому, кто отвечает за безопасность на месте.

import type { Lang } from '../retreat-calc/engine'
import { toCsv } from '../retreat-core/csv'

export type SectionId = 'contact' | 'travel' | 'food' | 'health' | 'other'
export type Route = 'chef' | 'arrivals' | 'safety' | 'leader'
export type QuestionId =
  | 'name' | 'phone' | 'emergency'
  | 'flightIn' | 'dateIn' | 'timeIn' | 'airport' | 'flightOut' | 'dateOut' | 'timeOut' | 'pickup'
  | 'diet' | 'allergies' | 'allergySeverity' | 'nonEat'
  | 'loadLimits' | 'breathingLimits' | 'senses' | 'touch'
  | 'insurance' | 'photo' | 'expectations'
export type ChoiceId = string

type Bi = Record<Lang, string>

export interface Question {
  id: QuestionId
  section: SectionId
  routes: Route[]
  kind: 'text' | 'choice'
  choices?: ChoiceId[]
  /** Обязательный вопрос нельзя выключить: без имени сводка не сведёт ответы одного гостя. */
  required: boolean
  text: Bi
  /** Заголовок колонки в шаблоне CSV ответов. */
  short: Bi
  choiceText?: Record<ChoiceId, Bi>
}

const YES_NO: Record<ChoiceId, Bi> = { yes: { ru: 'да', en: 'yes' }, no: { ru: 'нет', en: 'no' } }

export const QUESTIONS: readonly Question[] = [
  {
    id: 'name', section: 'contact', routes: ['chef', 'arrivals', 'safety', 'leader'], kind: 'text', required: true,
    text: { ru: 'Имя и фамилия', en: 'First and last name' },
    short: { ru: 'Гость', en: 'Guest' },
  },
  {
    id: 'phone', section: 'contact', routes: ['arrivals', 'safety'], kind: 'text', required: false,
    text: { ru: 'Телефон или мессенджер для связи в дороге', en: 'Phone or messenger to reach you on the way' },
    short: { ru: 'Телефон в дороге', en: 'Phone on the way' },
  },
  {
    id: 'emergency', section: 'contact', routes: ['safety'], kind: 'text', required: false,
    text: { ru: 'Контакт на экстренный случай: имя и телефон', en: 'Emergency contact: name and phone' },
    short: { ru: 'Экстренный контакт', en: 'Emergency contact' },
  },
  {
    id: 'flightIn', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Рейс прибытия (номер)', en: 'Arrival flight (number)' },
    short: { ru: 'Рейс прибытия', en: 'Arrival flight' },
  },
  {
    id: 'dateIn', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Дата прибытия', en: 'Arrival date' },
    short: { ru: 'Дата прибытия', en: 'Arrival date' },
  },
  {
    id: 'timeIn', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Время прибытия по местному времени', en: 'Arrival time, local time' },
    short: { ru: 'Время прибытия', en: 'Arrival time' },
  },
  {
    id: 'airport', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Аэропорт или вокзал прибытия', en: 'Arrival airport or station' },
    short: { ru: 'Аэропорт', en: 'Airport' },
  },
  {
    id: 'flightOut', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Рейс отъезда (номер)', en: 'Departure flight (number)' },
    short: { ru: 'Рейс отъезда', en: 'Departure flight' },
  },
  {
    id: 'dateOut', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Дата отъезда', en: 'Departure date' },
    short: { ru: 'Дата отъезда', en: 'Departure date' },
  },
  {
    id: 'timeOut', section: 'travel', routes: ['arrivals'], kind: 'text', required: false,
    text: { ru: 'Время вылета или отправления', en: 'Departure time' },
    short: { ru: 'Время отъезда', en: 'Departure time' },
  },
  {
    id: 'pickup', section: 'travel', routes: ['arrivals'], kind: 'choice', choices: ['yes', 'no'], required: false,
    text: { ru: 'Нужна ли встреча по прибытии', en: 'Do you need to be met on arrival' },
    short: { ru: 'Нужна встреча', en: 'Needs pickup' },
    choiceText: YES_NO,
  },
  {
    id: 'diet', section: 'food', routes: ['chef'], kind: 'choice',
    choices: ['standard', 'vegetarian', 'vegan', 'gluten-free', 'vegan-gluten-free', 'other'], required: false,
    text: { ru: 'Как вы едите', en: 'How do you eat' },
    short: { ru: 'Питание', en: 'Diet' },
    choiceText: {
      'standard': { ru: 'всё', en: 'everything' },
      'vegetarian': { ru: 'без мяса и рыбы', en: 'no meat or fish' },
      'vegan': { ru: 'веган', en: 'vegan' },
      'gluten-free': { ru: 'без глютена', en: 'gluten-free' },
      'vegan-gluten-free': { ru: 'веган без глютена', en: 'vegan, gluten-free' },
      'other': { ru: 'другое', en: 'other' },
    },
  },
  {
    id: 'allergies', section: 'food', routes: ['chef', 'safety'], kind: 'text', required: false,
    text: { ru: 'Аллергии на продукты', en: 'Food allergies' },
    short: { ru: 'Аллергии', en: 'Allergies' },
  },
  {
    id: 'allergySeverity', section: 'food', routes: ['chef', 'safety'], kind: 'choice', choices: ['none', 'mild', 'severe'], required: false,
    text: { ru: 'Насколько серьёзна аллергия', en: 'How serious is the allergy' },
    short: { ru: 'Насколько серьёзно', en: 'How serious' },
    choiceText: {
      none: { ru: 'аллергии нет', en: 'no allergy' },
      mild: { ru: 'дискомфорт', en: 'discomfort' },
      severe: { ru: 'опасно для жизни', en: 'life-threatening' },
    },
  },
  {
    id: 'nonEat', section: 'food', routes: ['chef'], kind: 'text', required: false,
    text: { ru: 'Чего вы не едите по другим причинам', en: 'What you do not eat for other reasons' },
    short: { ru: 'Не ест', en: 'Does not eat' },
  },
  {
    id: 'loadLimits', section: 'health', routes: ['safety'], kind: 'text', required: false,
    text: { ru: 'Ограничения по физической нагрузке, о которых стоит знать ведущему', en: 'Limits on physical effort the leader should know about' },
    short: { ru: 'Нагрузка', en: 'Physical effort' },
  },
  {
    id: 'breathingLimits', section: 'health', routes: ['safety'], kind: 'text', required: false,
    text: { ru: 'Ограничения для дыхательных практик', en: 'Limits for breathing practices' },
    short: { ru: 'Дыхательные практики', en: 'Breathing practices' },
  },
  {
    id: 'senses', section: 'health', routes: ['safety'], kind: 'text', required: false,
    text: { ru: 'Чувствительность к запахам, дыму и громким звукам', en: 'Sensitivity to scents, smoke and loud sounds' },
    short: { ru: 'Запахи, дым, звук', en: 'Scents, smoke, sound' },
  },
  {
    id: 'touch', section: 'health', routes: ['safety'], kind: 'choice', choices: ['yes', 'no', 'ask'], required: false,
    text: { ru: 'Касание в практиках', en: 'Touch in practices' },
    short: { ru: 'Касание', en: 'Touch' },
    choiceText: {
      yes: { ru: 'да', en: 'yes' },
      no: { ru: 'нет', en: 'no' },
      ask: { ru: 'спрашивать каждый раз', en: 'ask me each time' },
    },
  },
  {
    id: 'insurance', section: 'other', routes: ['safety'], kind: 'choice', choices: ['yes', 'no'], required: false,
    text: { ru: 'Есть ли у вас туристическая страховка на даты ретрита', en: 'Do you have travel insurance for the retreat dates' },
    short: { ru: 'Страховка', en: 'Insurance' },
    choiceText: YES_NO,
  },
  {
    id: 'photo', section: 'other', routes: ['safety'], kind: 'choice', choices: ['yes', 'no-face', 'no'], required: false,
    text: { ru: 'Согласие на фото и видео', en: 'Consent to photos and video' },
    short: { ru: 'Фото и видео', en: 'Photos and video' },
    choiceText: {
      'yes': { ru: 'да', en: 'yes' },
      'no-face': { ru: 'только без лица', en: 'only without my face' },
      'no': { ru: 'нет', en: 'no' },
    },
  },
  {
    id: 'expectations', section: 'other', routes: ['leader'], kind: 'text', required: false,
    text: { ru: 'Что нам стоит знать, чтобы вам было хорошо', en: 'What should we know so that you feel good here' },
    short: { ru: 'Пожелания', en: 'Wishes' },
  },
]

export const SECTION_TITLE: Record<SectionId, Bi> = {
  contact: { ru: 'Контакты', en: 'Contacts' },
  travel: { ru: 'Дорога', en: 'Travel' },
  food: { ru: 'Питание', en: 'Food' },
  health: { ru: 'Практики и здоровье', en: 'Practices and health' },
  other: { ru: 'Прочее', en: 'Other' },
}

/** Зачем вопрос и кто увидит ответ — стоит рядом с разделом и в тексте анкеты для гостя. */
export const SECTION_WHY: Partial<Record<SectionId, Bi>> = {
  health: {
    ru: 'Ответы видят только ведущий и тот, кто отвечает за безопасность на месте. '
      + 'Они нужны, чтобы подобрать практику под вас. Отвечать можно не на всё. '
      + 'Решение, подходит ли вам практика, остаётся за вами и вашим врачом.',
    en: 'Only the leader and the person in charge of safety on site see these answers. '
      + 'They help us fit practices to you. You may skip any of them. '
      + 'Whether a practice suits you is up to you and your doctor.',
  },
}

const INTRO: Bi = {
  ru: 'Заполните, пожалуйста, до заезда. Ответы о питании увидит кухня, остальное — только команда ретрита.',
  en: 'Please fill this in before arrival. The kitchen sees your food answers; everything else stays with the retreat team.',
}
const DEFAULT_TITLE: Bi = { ru: 'Анкета гостя', en: 'Guest form' }

const IDS = QUESTIONS.map((q) => q.id)
export const DEFAULT_ON: QuestionId[] = [...IDS]

/** Набор включённых вопросов из чужого значения (ссылка, черновик): только известные id, в порядке анкеты, имя всегда. */
export function normalizeOn(on: unknown): QuestionId[] {
  const set = new Set(Array.isArray(on) ? on.filter((x): x is QuestionId => IDS.includes(x as QuestionId)) : [])
  for (const q of QUESTIONS) if (q.required) set.add(q.id)
  return IDS.filter((id) => set.has(id))
}

const SECTIONS: SectionId[] = ['contact', 'travel', 'food', 'health', 'other']

/** Текст анкеты для копирования в чужой сервис или письмо: разделы, сквозная нумерация, варианты в скобках. */
export function formText(on: QuestionId[], lang: Lang, title?: string): string {
  const enabled = new Set(normalizeOn(on))
  const lines = [title?.trim() || DEFAULT_TITLE[lang], '', INTRO[lang]]
  let n = 0
  for (const s of SECTIONS) {
    const qs = QUESTIONS.filter((q) => q.section === s && enabled.has(q.id))
    if (!qs.length) continue
    lines.push('', SECTION_TITLE[s][lang])
    const why = SECTION_WHY[s]
    if (why) lines.push(why[lang])
    for (const q of qs) {
      const choices = q.kind === 'choice' && q.choices ? ` (${q.choices.map((c) => q.choiceText![c][lang]).join(' / ')})` : ''
      lines.push(`${++n}. ${q.text[lang]}${choices}`)
    }
  }
  return lines.join('\n') + '\n'
}

export function answersCsvHeader(on: QuestionId[], lang: Lang): string[] {
  const enabled = new Set(normalizeOn(on))
  return QUESTIONS.filter((q) => enabled.has(q.id)).map((q) => q.short[lang])
}

/** Шаблон таблицы ответов: только строка заголовков (для ведущего, который собирает ответы письмом). */
export function answersTemplateCsv(on: QuestionId[], lang: Lang): string {
  return toCsv([answersCsvHeader(on, lang)], lang)
}
