import type { Lang } from '../retreat-calc/engine'
import type { SectionId } from './sections'
const ru = ['Обложка', 'Приглашение', 'Для кого и кому не подойдёт', 'Что ты переживёшь', 'Программа по дням', 'Расписание', 'Ведущие', 'Команда', 'О месте', 'Еда',
  'Цены', 'Что включено и что нет', 'Как записаться', 'Подготовка', 'Что взять', 'Как добраться', 'Правила группы', 'Оплата и отмена', 'Отзывы', 'Вопросы и ответы', 'Контакты']
const en = ['Cover', 'Invitation', 'Who it is for and not for', 'What you will experience', 'Days', 'Schedule', 'Leaders', 'Team', 'Place', 'Food', 'Pricing',
  'Inclusions', 'Booking', 'Preparation', 'Packing', 'Travel', 'Group rules', 'Payments and cancellation', 'Testimonials', 'FAQ', 'Contact']
export const sectionLabels = (lang: Lang): Record<SectionId, string> => Object.fromEntries((lang === 'ru' ? ru : en).map((v, i) => [(['cover', 'invitation', 'fit',
  'experiences', 'days', 'schedule', 'leaders', 'team', 'place', 'food', 'pricing', 'inclusions', 'booking', 'preparation', 'packing', 'travel', 'rules', 'payments',
  'testimonials', 'faq', 'contact'] as const)[i], v])) as Record<SectionId, string>
export function issueText(issue: { id: string;
  detail?: string }, lang: Lang): string { const m: Record<string, [string, string]> = { 'required-empty': ['обязательный раздел пуст', 'required section is empty'],
  'no-not-included': ['укажите, что не включено', 'list what is not included'], 'import-passport-mismatch': ['паспорт импорта не совпадает',
  'import passport does not match'], 'experience-without-purpose': ['у опыта нет цели', 'experience has no purpose'], 'holiday-overlap': ['праздник пересекает даты',
  'holiday overlaps the retreat'], 'promise-words': ['обещающие формулировки требуют проверки', 'promise wording needs review'],
  'testimonial-without-consent': ['нет согласия на отзыв', 'testimonial lacks consent'], 'photo-without-rights': ['нет прав на фото', 'photo rights are missing'],
  'booking-without-form': ['добавьте анкету в запись', 'booking should mention a form'] };
  return `${(m[issue.id] ?? [issue.id, issue.id])[lang === 'ru' ? 0 : 1]}${issue.detail ? `: ${issue.detail}` : ''}` }
