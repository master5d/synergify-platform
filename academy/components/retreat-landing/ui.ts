import type { Locale } from '../../lib/dictionaries'

// до 100 КБ размер в мегабайтах читается как «0,0 МБ» — показываем килобайты
const fileSize = (bytes: number, kb: string, mb: string, comma: string) => bytes < 100_000
  ? `${Math.max(1, Math.round(bytes / 1024))} ${kb}`
  : `${(bytes / 1024 / 1024).toFixed(1).replace('.', comma)} ${mb}`

export const LANDING_UI = {
  ru: {
    eyebrow: 'инструменты', h1: 'Лендинг ретрита',
    lead: 'Страница записи на ретрит из данных вашего буклета: один файл, который открывается на телефоне и выкладывается на любой хостинг. '
      + 'Без трекеров и скриптов. Всё остаётся в этом браузере.',
    back: '← к академии', loaded: 'Лендинг открыт из ссылки.', draftRestored: 'Восстановлен черновик из этого браузера.',
    linkBroken: 'Ссылка на лендинг повреждена — открыт черновик из этого браузера.', subtitle: 'Подзаголовок', ctaLabel: 'Подпись кнопки', ctaUrl: 'Адрес кнопки записи',
    ctaHint: 'Адрес анкеты, Telegram или WhatsApp (https://…) или почта (mailto:…)', numbers: 'Цифры', value: 'Цифра', numberLabel: 'Подпись', add: '+ добавить', remove: 'убрать',
    video: 'Ссылка на видео', videoHint: 'YouTube или Vimeo', price: 'Заметка о цене', footer: 'Подпись академии внизу страницы',
    bookletNote: 'Тексты, цены и программа правятся в буклете', openBooklet: 'Открыть буклет', download: 'Скачать страницу (.html)',
    size: (bytes: number) => `Размер файла: ${fileSize(bytes, 'КБ', 'МБ', ',')}`, errors: 'Исправьте ошибки', warnings: 'Замечания',
    allGood: 'Ошибок нет — страницу можно скачать.', downloadBlocked: 'Сначала исправьте ошибки — без них страница не работает как договор',
    phone: 'Телефон', computer: 'Компьютер', preview: 'Предпросмотр лендинга',
  },
  en: {
    eyebrow: 'tools', h1: 'Retreat landing page',
    lead: 'A sign-up page for your retreat built from your booklet: one file that opens on a phone and can go on any hosting. '
      + 'No trackers or scripts. Everything stays in this browser.',
    back: '← to the academy', loaded: 'The landing page was opened from a link.', draftRestored: 'Restored the draft from this browser.',
    linkBroken: 'The landing page link is damaged — opened the draft from this browser.', subtitle: 'Subtitle', ctaLabel: 'Button label', ctaUrl: 'Booking button address',
    ctaHint: 'Your form, Telegram or WhatsApp address (https://…) or email (mailto:…)', numbers: 'Numbers', value: 'Number', numberLabel: 'Label', add: '+ add', remove: 'remove',
    video: 'Video link', videoHint: 'YouTube or Vimeo', price: 'Price note', footer: 'Academy signature at the bottom of the page',
    bookletNote: 'Texts, prices and programme are edited in the booklet', openBooklet: 'Open booklet', download: 'Download page (.html)',
    size: (bytes: number) => `File size: ${fileSize(bytes, 'KB', 'MB', '.')}`, errors: 'Fix these first', warnings: 'Worth a look',
    allGood: 'No errors — the page is ready to download.', downloadBlocked: 'Fix the errors first — without them the page does not work as agreed',
    phone: 'Phone', computer: 'Computer', preview: 'Retreat landing preview',
  },
} satisfies Record<Locale, object>

export type LandingUi = (typeof LANDING_UI)['ru']
export const landingUi = (locale: Locale): LandingUi => LANDING_UI[locale] as LandingUi
