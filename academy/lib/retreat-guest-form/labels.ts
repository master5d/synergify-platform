// Тексты сводки анкеты RU/EN — один источник для страницы и CSV.

import type { Lang } from '../retreat-calc/engine'
import type { SummaryIssue } from './answers'
import { QUESTIONS } from './questions'

export const PICKUP_NOTE: Record<Lang, string> = { ru: 'нужна встреча', en: 'needs pickup' }

/** Подпись гостя без имени: номер строки в файле. */
export const guestLabel = (row: number, lang: Lang) => (lang === 'ru' ? `Гость из строки ${row}` : `Guest from row ${row}`)

const questionName = (id: SummaryIssue['question'], lang: Lang) => QUESTIONS.find((q) => q.id === id)?.short[lang] ?? ''

export function summaryIssueText(i: SummaryIssue, lang: Lang): string {
  const ru = lang === 'ru'
  const who = i.guest || (i.row !== undefined ? guestLabel(i.row, lang) : '')
  const q = questionName(i.question, lang)
  switch (i.id) {
    case 'missing-column':
      return ru ? `«${q}»: в файле нет такой колонки. Выберите её в сопоставлении или выключите вопрос выше.` : `“${q}”: no such column in the file. Pick it in the matching table or switch the question off above.`
    case 'duplicate-guest':
      return ru ? `${who}: ответ пришёл дважды. В сводке — нижняя строка файла, строка ${i.row} убрана.` : `${who}: answered twice. The summary keeps the lower row of the file; row ${i.row} is dropped.`
    case 'unknown-choice':
      return ru ? `Строка ${i.row}, «${q}»: ответ не из вариантов анкеты. Проверьте его глазами.` : `Row ${i.row}, “${q}”: the answer is not one of the form options. Check it by eye.`
    case 'no-emergency':
      return ru ? `${who}: нет экстренного контакта. Попросите его до заезда.` : `${who}: no emergency contact. Ask for one before arrival.`
    case 'more-answers-than-guests':
      return ru ? 'Ответов больше, чем гостей в данных ретрита. Проверьте повторы или число гостей.' : 'More answers than guests in the retreat data. Check for repeats or the guest count.'
    case 'severe-allergy':
      return ru ? `${who}: аллергия опасна для жизни. Важно знать шефу и тому, кто отвечает за безопасность.` : `${who}: a life-threatening allergy. The chef and the safety lead need to know.`
    case 'no-name':
      return ru ? `Строка ${i.row}: нет имени. Повторы такой строки сводка не увидит.` : `Row ${i.row}: no name. The summary cannot spot repeats of this row.`
  }
}
