import type { Locale } from '../../lib/dictionaries'

const common = { remove: 'remove', included: 'include', required: 'required', save: 'Save PDF', pdfHint: 'In the print window choose “Save as PDF”.',
  copy: 'Copy link', download: 'Download draft (.json)', upload: 'Upload draft', photoHint: 'Photos stay in this browser.',
  empty: 'Nothing yet', imported: 'pulled in', add: 'add', delete: 'remove', up: 'up', down: 'down', rights: 'I have the right to use it',
  cover: 'cover', paper: 'Paper', a4: 'A4', letter: 'Letter', accent: 'Accent', notice: 'Note' }
export const BK_UI = {
  ru: { ...common, eyebrow: 'Инструменты академии', h1: 'Буклет ретрита',
    lead: 'Буклет, который продаёт неделю и честно говорит, что в неё входит. Даты, цены и сроки подтягиваются из других инструментов, тексты и фото — ваши.',
    back: '← ко всем инструментам', build: 'Собрать буклет', importLabel: 'Подтянуть из ссылки', importButton: 'Подтянуть',
    remove: 'убрать', included: 'включить', required: 'обязательный', save: 'Сохранить PDF', pdfHint: 'В окне печати выберите «Сохранить как PDF».',
    copy: 'Скопировать ссылку', download: 'Скачать черновик (.json)', upload: 'Загрузить черновик', photoHint: 'Фото остаются в этом браузере.',
    empty: 'Пока пусто', imported: 'подтянуто', add: 'добавить', delete: 'убрать', up: 'вверх', down: 'вниз', rights: 'есть право использовать',
    cover: 'на обложку', paper: 'Бумага', a4: 'A4', letter: 'Letter', accent: 'Акцент', notice: 'Заметка' },
  en: { ...common, eyebrow: 'Academy tools', h1: 'Retreat booklet',
    lead: 'A booklet that sells the week and says honestly what it includes. Dates, prices and deadlines come from the other tools; the texts and photos are yours.',
    back: '← all tools', build: 'Build a booklet', importLabel: 'Pull from a link', importButton: 'Pull in' },
} satisfies Record<Locale, Record<string, string>>

export const bk = (locale: Locale) => BK_UI[locale]

export const FIELD_LABELS = {
  ru: { place: 'Место', invitation: 'Приглашение', contact: 'Контакты', fitFor: 'Для кого', notFor: 'Кому не подойдёт',
    experiences: 'Что ты переживёшь', days: 'День программы', placeText: 'О месте', foodText: 'О еде', included: 'Включено',
    notIncluded: 'Не включено', bookingSteps: 'Как записаться', preparation: 'Подготовка', packing: 'Что взять', rules: 'Правила группы',
    paymentsText: 'Оплата и отмена', cover: 'Название и место', leaders: 'Ведущие', team: 'Команда', travel: 'Как добраться',
    testimonials: 'Отзывы', faq: 'Вопросы и ответы' },
  en: { place: 'Place', invitation: 'Invitation', contact: 'Contact', fitFor: 'Who it is for', notFor: 'Who it is not for',
    experiences: 'What you will experience', days: 'Day of the programme', placeText: 'About the place', foodText: 'About food',
    included: 'Included', notIncluded: 'Not included', bookingSteps: 'How to book', preparation: 'Preparation', packing: 'What to bring',
    rules: 'Group rules', paymentsText: 'Payment and cancellation', cover: 'Title and place', leaders: 'Leaders', team: 'Team',
    travel: 'How to get there', testimonials: 'Testimonials', faq: 'FAQ' },
} as const
