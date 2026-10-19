import type { Lang } from '../retreat-calc/engine'
import type { SectionId } from './sections'
const ru = ['Обложка', 'Приглашение', 'Для кого и кому не подойдёт', 'Что ты переживёшь', 'Программа по дням', 'Расписание', 'Ведущие', 'Команда', 'О месте', 'Еда',
  'Цены', 'Что включено и что нет', 'Как записаться', 'Подготовка', 'Что взять', 'Как добраться', 'Правила группы', 'Оплата и отмена', 'Отзывы', 'Вопросы и ответы', 'Контакты']
const en = ['Cover', 'Invitation', 'Who it is for and not for', 'What you will experience', 'Days', 'Schedule', 'Leaders', 'Team', 'Place', 'Food', 'Pricing',
  'Inclusions', 'Booking', 'Preparation', 'Packing', 'Travel', 'Group rules', 'Payments and cancellation', 'Testimonials', 'FAQ', 'Contact']
export const sectionLabels = (lang: Lang): Record<SectionId, string> => Object.fromEntries((lang === 'ru' ? ru : en).map((v, i) => [(['cover', 'invitation', 'fit',
  'experiences', 'days', 'schedule', 'leaders', 'team', 'place', 'food', 'pricing', 'inclusions', 'booking', 'preparation', 'packing', 'travel', 'rules', 'payments',
  'testimonials', 'faq', 'contact'] as const)[i], v])) as Record<SectionId, string>
const TOOL = { ru: { program: 'конструктора программы', menu: 'генератора меню', calc: 'калькулятора', timeline: 'таймлайна' },
  en: { program: 'programme builder', menu: 'menu generator', calc: 'calculator', timeline: 'timeline' } }
const FIELD = { ru: { start: 'дата заезда', nights: 'число ночей', currency: 'валюта' }, en: { start: 'arrival date', nights: 'number of nights', currency: 'currency' } }

/** Текст проверки буклета для человека: раздел — своим названием, расхождение — инструментом и полем. */
export function issueText(issue: { id: string; section?: SectionId; detail?: string }, lang: Lang): string {
  const ru = lang === 'ru'
  const section = issue.section ? sectionLabels(lang)[issue.section] : ''
  switch (issue.id) {
    case 'required-empty':
      return ru ? `Раздел «${section}» обязателен и пока пуст.` : `The “${section}” section is required and still empty.`
    case 'no-not-included':
      return ru ? 'Нет списка «не включено» — без него буклет не работает как договор.'
        : 'There is no “not included” list — without it the booklet does not work as a contract.'
    case 'import-passport-mismatch': {
      const [tool, field] = (issue.detail ?? '').split('.') as [keyof typeof TOOL.ru, keyof typeof FIELD.ru]
      const t = TOOL[lang][tool] ?? tool; const f = FIELD[lang][field] ?? field
      return ru ? `Данные из ${t} расходятся с буклетом: ${f}. Поправьте в одном месте и подтяните ссылку снова.`
        : `Data from the ${t} differs from the booklet: ${f}. Fix it in one place and pull the link in again.`
    }
    case 'experience-without-purpose':
      return ru ? 'У пункта «что ты переживёшь» не написано, чему он служит.' : 'An item in “what you will experience” does not say what it serves.'
    case 'holiday-overlap':
      return ru ? `Даты задевают праздник: ${issue.detail}. Проверьте, удобно ли это гостям.`
        : `The dates touch a holiday: ${issue.detail}. Check that it suits your guests.`
    case 'promise-words':
      return ru ? 'В тексте есть обещание результата («исцелит», «гарантируем», «навсегда»). Перепишите без обещаний.'
        : 'The text promises a result (“heal”, “guaranteed”, “forever”). Rewrite it without promises.'
    case 'testimonial-without-consent':
      return ru ? 'У отзыва нет отметки согласия автора — без неё его лучше не печатать.'
        : 'A testimonial has no author consent mark — better not to print it without one.'
    case 'photo-without-rights':
      return ru ? 'Фото без отметки права на использование — в печать оно не пойдёт.' : 'A photo has no usage-rights mark — it will not be printed.'
    case 'booking-without-form':
      return ru ? 'В программе есть практики с противопоказаниями, а в шагах записи нет анкеты.'
        : 'The programme has practices with contraindications, but the booking steps have no guest form.'
    case 'cta-missing':
      return ru ? 'У кнопки записи не указан адрес.' : 'The booking button has no address.'
    case 'cta-invalid':
      return ru ? 'Адрес кнопки записи должен быть безопасной ссылкой https или mailto.' : 'The booking address must be a safe https or mailto link.'
    case 'video-not-allowed':
      return ru ? 'Видео можно встраивать только с YouTube или Vimeo.' : 'Only YouTube or Vimeo videos can be embedded.'
    case 'file-heavy':
      return ru ? 'HTML лендинга получился слишком тяжёлым.' : 'The landing HTML file is too large.'
    default:
      return issue.detail ? `${issue.id}: ${issue.detail}` : issue.id
  }
}
