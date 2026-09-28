// packs/living-practice/course/task-routes.ts
// Форма эталона. Фича у этого курса не подключена — в intake-questions.ts этого пака нет вопросов
// V_ROLE / V_TASK_MODE / V_TASK_ROUTE, каталог русел пуст, шаг никогда не показывается, и русло у профиля
// всегда null (курс идёт по порядку). Файл существует, чтобы @pack-alias резолвился на обе сборки
// (lib/boundary.test.ts: stubs are thin @pack re-exports). Копия — дословно из packs/tochka-sborki (тот же контракт).
import type { Locale } from '../../../lib/intake/types'
import type { ClarifyQuestion, TaskRoute } from '../../../lib/intake/task-route'

type L = Record<Locale, string>

export const TASK_ROUTES: TaskRoute[] = []

export const TASK_ROUTE_CLARIFY: ClarifyQuestion[] = []

export interface TaskRouteCopy {
  eyebrow: L
  lead: L
  yourTask: L
  noText: L
  matchButton: L
  matching: L
  matchedLead: L
  unsureLead: L
  clarifyButton: L
  clarifyTie: L
  unavailableLead: L
  manualLead: L
  manualButton: L
  showAll: L
  chooseButton: L
  changeButton: L
  leaderHint: L
  checkTitle: L
  checkBody: L
  stepsHeading: L
  falseRoadLabel: L
  resultLabel: L
  routeHeading: L
  /** Подпись шага в квест-логе: {n} — номер шага. */
  questStepLabel: L
}

export const TASK_ROUTE_COPY: TaskRouteCopy = {
  eyebrow: { ru: 'Русло задачи', en: 'Your task route' },
  lead: {
    ru: 'Сопоставим твою задачу с руслами, по которым такие задачи реально делаются, — и покажем шаги по модулям курса, ложную дорогу и что будет в конце.',
    en: 'We match your task to the routes such tasks are actually built by — and show the steps through the course modules, the false road and what you end up with.',
  },
  yourTask: { ru: 'Твоя задача:', en: 'Your task:' },
  noText: {
    ru: 'Сначала опиши задачу на прошлом шаге — одной-двумя фразами. Или выбери русло сам.',
    en: 'Describe your task on the previous step first — in a sentence or two. Or pick a route yourself.',
  },
  matchButton: { ru: 'Подобрать русло', en: 'Find my route' },
  matching: { ru: 'Сопоставляю с каталогом…', en: 'Matching against the catalog…' },
  matchedLead: { ru: 'Похоже, твоя задача — это:', en: 'Looks like your task is:' },
  unsureLead: {
    ru: 'Не уверен, какое русло твоё. Три коротких вопроса — и выберем точнее:',
    en: "Not sure which route is yours. Three quick questions and we'll pick more precisely:",
  },
  clarifyButton: { ru: 'Выбрать по ответам', en: 'Pick from my answers' },
  clarifyTie: {
    ru: 'Ответы подходят к нескольким руслам — выбери своё из списка, подходящие отмечены.',
    en: 'Your answers fit several routes — pick yours from the list, the matching ones are marked.',
  },
  unavailableLead: {
    ru: 'Подбор сейчас недоступен — выбери русло сам из списка:',
    en: 'Matching is unavailable right now — pick the route yourself:',
  },
  manualLead: { ru: 'Выбери русло сам:', en: 'Pick the route yourself:' },
  manualButton: { ru: 'Выбрать самому', en: 'Pick it myself' },
  showAll: { ru: 'Показать все русла', en: 'Show all routes' },
  chooseButton: { ru: 'Это моё', en: "That's mine" },
  changeButton: { ru: 'Выбрать другое русло', en: 'Pick another route' },
  leaderHint: { ru: 'подходит по ответам', en: 'fits your answers' },
  checkTitle: { ru: 'Шаг 0. Стоит ли это автоматизировать?', en: 'Step 0. Is it worth automating?' },
  checkBody: {
    ru: 'Прежде чем строить — проверь окупаемость: это следующий шаг анкеты, а карта автоматизации разобрана в юните',
    en: 'Before you build, check the payback: it is the next step of this setup, and the automation map is covered in the unit',
  },
  stepsHeading: { ru: 'Шаги по курсу', en: 'Steps through the course' },
  falseRoadLabel: { ru: 'Ложная дорога:', en: 'The false road:' },
  resultLabel: { ru: 'В конце у тебя:', en: 'What you end up with:' },
  routeHeading: { ru: 'Твоя задача — русло', en: 'Your task — the route' },
  questStepLabel: { ru: 'шаг {n} задачи', en: 'task step {n}' },
}
