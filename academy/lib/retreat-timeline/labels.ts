// Тексты вех и предупреждений таймлайна RU/EN — один источник для страницы, CSV и календаря.

import type { Lang } from '../retreat-calc/engine'
import type { Milestone, MilestoneId, Source, TimelineWarning, Who } from './engine'

type Text = (n?: number) => string

const MILESTONES: Record<Lang, Record<MilestoneId, Text>> = {
  ru: {
    'sign': () => 'Подписан договор с площадкой',
    'venue-deposit': () => 'Первый платёж площадке',
    'venue-installment': (n) => `Взнос площадке № ${n}`,
    'venue-final': () => 'Последний платёж площадке',
    'sales-open': () => 'Открыты продажи, первые предоплаты гостей',
    'go-no-go': () => 'Решение: проводим или отменяем. Позже отмена у площадки стоит полной суммы',
    'guest-balance': () => 'Гости доплачивают остаток',
    'guest-refund-deadline': () => 'Последний день отмены гостем с возвратом',
    'form-send': () => 'Анкета уходит гостям',
    'form-answers': () => 'Ответы анкеты собраны',
    'menu-to-chef': () => 'Меню и диеты переданы шефу',
    'arrivals-final': () => 'Лист прибытия сверен с каждым гостем',
    'arrival': () => 'Заезд',
    'departure': () => 'Выезд',
  },
  en: {
    'sign': () => 'Contract with the venue signed',
    'venue-deposit': () => 'First payment to the venue',
    'venue-installment': (n) => `Venue installment no. ${n}`,
    'venue-final': () => 'Final payment to the venue',
    'sales-open': () => 'Sales open; first guest deposits',
    'go-no-go': () => 'Decision: run or cancel. After this, cancelling with the venue costs the full amount',
    'guest-balance': () => 'Guests pay the balance',
    'guest-refund-deadline': () => 'Last day a guest can cancel with a refund',
    'form-send': () => 'Guest form goes out',
    'form-answers': () => 'Guest form answers collected',
    'menu-to-chef': () => 'Menu and diets sent to the chef',
    'arrivals-final': () => 'Arrival list checked with every guest',
    'arrival': () => 'Arrival day',
    'departure': () => 'Departure day',
  },
}

export const WHO_LABELS: Record<Lang, Record<Who, string>> = {
  ru: { leader: 'Ведущий', venue: 'Площадка', both: 'Ведущий и площадка', guests: 'Гости' },
  en: { leader: 'Leader', venue: 'Venue', both: 'Leader and venue', guests: 'Guests' },
}

export const SOURCE_LABELS: Record<Lang, Record<Source, string>> = {
  ru: { 'contract': 'договор', 'sales': 'план продаж', 'course-default': 'курс', 'passport': 'паспорт ретрита' },
  en: { 'contract': 'contract', 'sales': 'sales plan', 'course-default': 'course', 'passport': 'retreat passport' },
}

export function milestoneLabel(m: Pick<Milestone, 'id' | 'n'>, lang: Lang): string {
  return MILESTONES[lang][m.id](m.n)
}

function ruDays(n: number): string {
  const d10 = n % 10
  const d100 = n % 100
  if (d10 === 1 && d100 !== 11) return `${n} день`
  if (d10 >= 2 && d10 <= 4 && (d100 < 12 || d100 > 14)) return `${n} дня`
  return `${n} дней`
}

export function warningText(w: TimelineWarning, lang: Lang): string {
  const ru = lang === 'ru'
  switch (w.id) {
    case 'guest-refund-after-venue-no-return':
      return ru
        ? 'Гость может отменить с возвратом позже, чем вы можете отменить у площадки без потерь. Этот риск ложится на вас.'
        : 'A guest can cancel with a refund later than you can cancel with the venue at no cost. That risk is yours.'
    case 'resale-buffer-short':
      return ru
        ? `Между сроком отмены гостей и точкой невозврата площадки всего ${ruDays(w.days ?? 0)}. На перепродажу места нужно хотя бы 14.`
        : `Only ${w.days ?? 0} days between the guest cancellation deadline and the venue's point of no return. Reselling a place needs at least 14.`
    case 'sign-after-venue-final':
      return ru
        ? 'К подписанию срок последнего платежа площадке уже прошёл: вся сумма уходит в день подписания.'
        : 'By signing day the final venue deadline has passed: the whole amount is due on signing.'
    case 'milestone-in-past': {
      const label = w.milestone ? milestoneLabel({ id: w.milestone, n: w.n }, lang) : ''
      return ru ? `Дата уже прошла: ${label}.` : `This date has passed: ${label}.`
    }
  }
}
