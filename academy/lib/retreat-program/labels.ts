// Тексты конструктора программы RU/EN — один источник для страницы и CSV: виды блоков, нагрузка, формат,
// проблемы карточек и сетки. Проза контроллера; правки — только вместе с тестом длины фраз.

import type { Lang } from '../retreat-calc/engine'
import type { BlockKind, GridIssue } from './grid'
import type { CardIssue, Format, Load } from './practices'

export const KIND: Record<Lang, Record<BlockKind, string>> = {
  ru: { practice: 'Практика', meal: 'Еда', free: 'Свободное время', transfer: 'Трансфер', other: 'Другое' },
  en: { practice: 'Practice', meal: 'Meal', free: 'Free time', transfer: 'Transfer', other: 'Other' },
}
export const LOAD: Record<Lang, Record<Load, string>> = {
  ru: { low: 'низкая', medium: 'средняя', high: 'высокая' },
  en: { low: 'low', medium: 'medium', high: 'high' },
}
export const FORMAT: Record<Lang, Record<Format, string>> = {
  ru: { group: 'группа', pair: 'пары', solo: 'каждый сам' },
  en: { group: 'group', pair: 'pairs', solo: 'on their own' },
}
/** Строки под сеткой в CSV — как у шаблона курса program-grid.<lang>.csv. */
export const CSV_FOOTER: Record<Lang, { load: string; free: string }> = {
  ru: { load: 'Нагрузка дня (низкая / средняя / высокая)', free: 'Свободное время, часов' },
  en: { load: 'Day load (low / medium / high)', free: 'Free time, hours' },
}
/** Ячейка под началом блока в CSV: блок продолжается. */
export const CONTINUES = '↓'

export function cardIssueText(i: CardIssue, name: string, lang: Lang): string {
  const ru = lang === 'ru'
  switch (i.id) {
    case 'pair-duration':
      return ru ? `«${name}»: длительность указана на пару. Впишите, сколько минут займёт вся группа.` : `“${name}”: the duration is per pair. Enter how many minutes the whole group needs.`
    case 'no-duration':
      return ru ? `«${name}»: нет длительности.` : `“${name}”: no duration.`
    case 'touch-without-consent':
      return ru ? `«${name}»: есть касание, но не написано, как спрашиваете согласие и как отказаться.` : `“${name}”: involves touch, but says nothing about asking consent or opting out.`
    case 'high-load-without-contraindications':
      return ru ? `«${name}»: высокая нагрузка без противопоказаний.` : `“${name}”: high load with no contraindications.`
    case 'promise-in-text':
      return ru ? `«${name}»: обещание в тексте — «${i.match}». Опишите, что делает гость.` : `“${name}”: a promise in the text — “${i.match}”. Describe what the guest does.`
  }
}

export function gridIssueText(i: GridIssue, name: string, lang: Lang): string {
  const ru = lang === 'ru'
  const at = i.day !== undefined ? (ru ? `День ${i.day}` : `Day ${i.day}`) + (i.start ? `, ${i.start}` : '') : ''
  switch (i.id) {
    case 'overlap':
      return ru ? `${at}: блок накладывается на соседний.` : `${at}: the block overlaps the next one.`
    case 'outside-day':
      return ru ? `${at}: блок выходит за границы дня.` : `${at}: the block runs outside the day.`
    case 'off-step':
      return ru ? `${at}: время не на сетке 30 минут.` : `${at}: the time is off the 30-minute grid.`
    case 'block-outside-retreat':
      return ru ? `${at}: такого дня в ретрите нет. Блок не потерян — перенесите или удалите его.` : `${at}: the retreat has no such day. The block is kept — move or delete it.`
    case 'two-high-in-a-row':
      return ru ? `${at}: две практики с высокой нагрузкой подряд. Поставьте между ними отдых или еду.` : `${at}: two high-load practices in a row. Put rest or a meal between them.`
    case 'no-free-time':
      return ru ? `${at}: нет свободного времени.` : `${at}: no free time.`
    case 'no-buffer':
      return ru ? `${at}: занятие начинается сразу после предыдущего. Оставьте 15–30 минут на переход и сборы.` : `${at}: a session starts right after the previous one. Leave 15–30 minutes to move and get ready.`
    case 'pair-duration':
      return ru ? `«${name}»: длительность на пару, а в сетке нужна на группу.` : `“${name}”: the duration is per pair; the grid needs it per group.`
    case 'high-load-without-contraindications':
      return ru ? `«${name}»: высокая нагрузка без противопоказаний в карточке.` : `“${name}”: high load with no contraindications on the card.`
    case 'touch-check-form':
      return ru ? `«${name}»: в практике есть касание. Проверьте, что в анкете гостя есть вопрос о согласии.` : `“${name}”: the practice involves touch. Check the guest form asks about consent.`
    case 'practice-missing':
      return ru ? `${at}: практики нет в реестре. Название взято из блока.` : `${at}: the practice is not in the registry. The name comes from the block.`
  }
}
