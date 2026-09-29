// lib/eidetics/ui.ts
// Все строки интерфейса модуля «Эйдетика» — в одном месте, чтобы ui.test.ts прогнал их через
// lintDehustle и манифест обещаний. Черновик на вычитку владельцем (статус модуля — 'soon').
// Тексты не завязаны на взрослый контекст: детская линия — отдельный ключ потом.
import type { Locale } from '../dictionaries'

export const EIDETICS_UI = {
  ru: {
    eyebrow: 'тренажёры · память',
    lessonsLabel: 'уроки',
    trainersLabel: 'тренажёры',
    progressLabel: 'твой замер',
    badge: 'готовится',
    draftBadge: 'черновик',
    lessonEyebrow: 'эйдетика · урок',
    intro: 'Шесть уроков — по одному приёму — и два тренажёра, чтобы проверить на своих замерах, держится ли запомненное.',
    honestLabel: 'честно',
    honest: [
      'Метод локусов проверен: в исследованиях новички после нескольких недель тренировки запоминали заметно больше, и эффект держался месяцами (Dresler 2017, Wagner 2021).',
      '«Фотографическая память» как навык, который можно натренировать взрослому, доказательств не имеет. Здесь учат приёмам запоминания — и только им.',
      'Приём помогает запоминать то, к чему его применили. Это не лечение: если память резко ухудшилась — это повод к врачу, а не к тренажёру.',
    ],
    backLabel: '← к тренажёрам',
    trainers: [
      { slug: 'ryad', name: 'Запомни ряд', desc: 'Слова или цифры: проверка сразу и через час — держится ли' },
      { slug: 'dvorec', name: 'Свой дворец памяти', desc: 'Свой маршрут из 5–10 точек и прогон по нему' },
    ],
    hubCard: { name: 'Эйдетика', desc: 'Образы, сюжет, дворец памяти — и честный замер, держится ли.' },
    local: 'Результаты и маршрут хранятся только в этом браузере.',
    empty: 'Пройди «Запомни ряд» — здесь появится замер «до» и «после».',
    before: 'до', after: 'после', now: 'сразу', later: 'через время', notYet: 'не проверено',
    palaceRuns: 'прогонов по дворцу',
  },
  en: {
    eyebrow: 'trainers · memory',
    lessonsLabel: 'lessons',
    trainersLabel: 'trainers',
    progressLabel: 'your measurements',
    badge: 'in preparation',
    draftBadge: 'draft',
    lessonEyebrow: 'eidetics · lesson',
    intro: 'Six lessons, one technique each, and two trainers to check against your own measurements whether what you remember lasts.',
    honestLabel: 'honestly',
    honest: [
      'The method of loci is well tested: in studies, newcomers remembered markedly more after a few weeks of training, and the effect held for months (Dresler 2017, Wagner 2021).',
      'There is no evidence that "photographic memory" is a skill an adult can train. What is taught here is memorisation technique, and only that.',
      'A technique helps with what you apply it to. It is not a treatment: if your memory has suddenly got worse, see a doctor, not a trainer.',
    ],
    backLabel: '← back to the trainers',
    trainers: [
      { slug: 'ryad', name: 'Remember the series', desc: 'Words or digits: checked right away and an hour later — does it hold' },
      { slug: 'dvorec', name: 'Your own memory palace', desc: 'Your own route of 5–10 places and a walk along it' },
    ],
    hubCard: { name: 'Eidetics', desc: 'Images, stories, a memory palace — and an honest check of whether it holds.' },
    local: 'Results and your route are stored only in this browser.',
    empty: 'Try "Remember the series" — your before and after will show up here.',
    before: 'before', after: 'after', now: 'right away', later: 'later', notYet: 'not checked yet',
    palaceRuns: 'palace walks',
  },
} as const

export type EideticsUi = (typeof EIDETICS_UI)[Locale]

export const RYAD_UI = {
  ru: {
    title: 'Запомни ряд',
    description: 'Запомни ряд, назови его сразу — и ещё раз через час или завтра, не подглядывая. Вторая проверка и показывает, держится ли память.',
    firstHint: 'Первая попытка — замер «до»: запоминай как обычно, без приёмов.',
    words: 'слова', digits: 'цифры', length: 'длина',
    start: 'Показать ряд', ready: 'Запомнил — скрыть', check: 'Проверить', again: 'Новый ряд',
    recallPrompt: 'Напиши всё, что помнишь, через пробел или запятую.',
    result: 'Названо', inOrder: 'на своём месте', of: 'из',
    delayedLabel: 'отложенная проверка',
    delayedDue: 'Можно проверить ряд от',
    delayedWaiting: 'Ждут своего часа',
    delayedNone: 'Нет рядов, ждущих проверки.',
    delayedHint: 'Отложенная проверка открывается через час после запоминания. Ряд больше не показывается.',
  },
  en: {
    title: 'Remember the series',
    description: 'Memorise a series, recall it right away — and once more an hour later or tomorrow, without peeking. The second check is what shows whether it holds.',
    firstHint: 'Your first try is the "before" measurement: memorise as you normally would, with no technique.',
    words: 'words', digits: 'digits', length: 'length',
    start: 'Show the series', ready: 'Got it — hide', check: 'Check', again: 'New series',
    recallPrompt: 'Write down everything you remember, separated by spaces or commas.',
    result: 'Recalled', inOrder: 'in the right place', of: 'of',
    delayedLabel: 'delayed check',
    delayedDue: 'Ready to check: the series from',
    delayedWaiting: 'Waiting for their hour',
    delayedNone: 'No series waiting for a check.',
    delayedHint: 'The delayed check opens an hour after memorising. The series is not shown again.',
  },
} as const

export const DVOREC_UI = {
  ru: {
    title: 'Свой дворец памяти',
    description: 'Выбери маршрут, который знаешь наизусть — свою квартиру, дорогу, двор. Запиши 5–10 точек по порядку. Потом на каждую точку «положишь» по слову и пройдёшь маршрут в памяти.',
    routeLabel: 'маршрут', routePlaceholder: 'точка', addLocus: '+ точка', saveRoute: 'Сохранить маршрут',
    needMore: 'Нужно хотя бы 5 точек.',
    start: 'Разложить слова', ready: 'Разложил — пройти маршрут', check: 'Проверить', again: 'Ещё прогон',
    recallPrompt: 'Что лежит в этой точке?',
    result: 'Верно', of: 'из',
  },
  en: {
    title: 'Your own memory palace',
    description: 'Pick a route you know by heart — your home, a road, a yard. Write down 5–10 places in order. Then you will "place" one word at each spot and walk the route in your mind.',
    routeLabel: 'route', routePlaceholder: 'place', addLocus: '+ place', saveRoute: 'Save route',
    needMore: 'You need at least 5 places.',
    start: 'Place the words', ready: 'Placed — walk the route', check: 'Check', again: 'Another walk',
    recallPrompt: 'What is waiting at this place?',
    result: 'Correct', of: 'of',
  },
} as const
