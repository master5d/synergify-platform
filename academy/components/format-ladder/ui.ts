export const UI: Record<'ru' | 'en', {
  eyebrow: string; title: string; lead: string; eventClass: string; all: string
  channel: string; step: string; attention: string; pricePerHead: string; team: string; voice: string; gives: string
  timeToStepUp: string; tooEarly: string; soon: string; course: string; empty: string
  myMap: string; whereNow: string; nextStep: string; ownFormat: string; date: string
  sign: string; copy: string; print: string; localOnly: string; choose: string; copied: string
}> = {
  ru: {
    eyebrow: 'инструменты', title: 'Лесенка форматов',
    lead: 'Форматы стоят на ступенях: от встречи один на один до работы с сотнями людей. Верхняя ступень не лучше нижней — на любой можно работать годами. '
      + 'Найди свою и выбери следующий шаг.',
    eventClass: 'Класс события', all: 'все', channel: 'Канал', step: 'Ступень', attention: 'Внимание каждому', pricePerHead: 'Цена на человека', team: 'Команда',
    voice: 'Голос ведущего', gives: 'Что даёт ступень', timeToStepUp: 'Пора выше, если', tooEarly: 'Рано, если', soon: 'скоро', course: 'Курс', empty: 'здесь пока пусто',
    myMap: 'Моя карта', whereNow: 'Где я сейчас', nextStep: 'Мой следующий шаг', ownFormat: 'свой формат', date: 'Дата',
    sign: 'Признак', copy: 'Скопировать', print: 'Распечатать',
    localOnly: 'Хранится только в этом браузере.', choose: '— не выбрано —', copied: 'Скопировано',
  },
  en: {
    eyebrow: 'tools', title: 'Format ladder',
    lead: 'Formats stand on steps: from a one-to-one meeting to work with hundreds of people. A higher step is not better '
      + 'than a lower one — you can work on any of them for years. Find yours and choose the next step.',
    eventClass: 'Event class', all: 'all', channel: 'Channel', step: 'Step', attention: 'Attention for each person', pricePerHead: 'Price per person', team: 'Team',
    voice: "The leader's voice", gives: 'What the step gives', timeToStepUp: 'Time to step up if', tooEarly: 'Too early if',
    soon: 'soon', course: 'Course', empty: 'nothing here yet',
    myMap: 'My map', whereNow: 'Where I am now', nextStep: 'My next step', ownFormat: 'my own format', date: 'Date',
    sign: 'Sign', copy: 'Copy', print: 'Print',
    localOnly: 'Kept only in this browser.', choose: '— not chosen —', copied: 'Copied',
  },
}

export const LADDER_URL: { ru: string; en: string } = { ru: 'https://academy.synergify.com/instrumenty/lesenka/', en: 'https://academy.synergify.com/en/instrumenty/lesenka/' }
