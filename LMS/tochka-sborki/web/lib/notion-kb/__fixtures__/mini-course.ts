import type { ModuleMeta } from '../../content'
import { BOUNDARY_AFTER, BOUNDARY_BEFORE } from '../concepts'
import type { Concept, ExtraPage, Locale, SiteInput } from '../types'

const form = (s: string) => new RegExp(`${BOUNDARY_BEFORE}(?:${s})${BOUNDARY_AFTER}`, 'i')

const CONCEPTS: Concept[] = [
  {
    id: 'state-md',
    term: { ru: 'STATE.md', en: 'STATE.md' },
    forms: { ru: form('STATE\\.md'), en: form('STATE\\.md') },
    short: { ru: 'STATE.md — файл, где агент записывает, где остановился.', en: 'STATE.md is the file where the agent writes down where it stopped.' },
    source: { unit: '01-alpha/u2-deep', heading: { ru: 'STATE.md — где остановились', en: 'STATE.md — where you stopped' } },
    related: ['agent'],
  },
  {
    id: 'agent',
    term: { ru: 'агент', en: 'agent' },
    forms: { ru: form('агент(?:а|у|ом|е|ы|ов|ам|ами|ах)?'), en: form('agents?') },
    short: { ru: 'Агент — программа, которая сама выполняет шаги задачи.', en: 'An agent is a program that carries out the steps of a task by itself.' },
    source: { unit: '01-alpha/u1-start', heading: { ru: 'Кто такой агент', en: 'What an agent is' } },
    related: [],
  },
]

const MODULES: Record<Locale, ModuleMeta[]> = {
  ru: [
    {
      slug: '01-alpha', module: 1, title: 'Альфа', description: 'Первый модуль: память агента.', duration: '30 мин', level: 1,
      units: [{ slug: 'u1-start', title: 'Старт' }, { slug: 'u2-deep', title: 'Глубже' }],
      objectives: [{ id: 'o1', text: 'Понять память' }],
      checks: [{ id: 'c1', unit: 'u1-start', objective: 'o1', question: 'Зачем вести журнал?', options: ['Для отчёта', 'Чтобы продолжить с места остановки'], answer: 1, explain: 'Журнал хранит, где остановились.' }],
    },
    { slug: '02-beta', module: 2, title: 'Бета', description: 'Второй модуль.', duration: '20 мин', level: 1, units: [{ slug: 'u1-next', title: 'Дальше' }, { slug: 'u2-spare', title: 'Запас' }] },
  ],
  en: [
    {
      slug: '01-alpha', module: 1, title: 'Alpha', description: 'First module: agent memory.', duration: '30 min', level: 1,
      units: [{ slug: 'u1-start', title: 'Start' }, { slug: 'u2-deep', title: 'Deeper' }],
      objectives: [{ id: 'o1', text: 'Understand memory' }],
      checks: [{ id: 'c1', unit: 'u1-start', objective: 'o1', question: 'Why keep a log?', options: ['For a report', 'To resume where you stopped'], answer: 1, explain: 'The log keeps where you stopped.' }],
    },
    { slug: '02-beta', module: 2, title: 'Beta', description: 'Second module.', duration: '20 min', level: 1, units: [{ slug: 'u1-next', title: 'Next' }, { slug: 'u2-spare', title: 'Spare' }] },
  ],
}

const startUnit = (activation: string, heading: string, short: string, link: string, table: string[]) => [
  '<Phase type="activation">', '', activation, '', '</Phase>', '', '<Phase type="concept">', '', `## ${heading}`, '', short, '', '<SelfCheck id="c1"/>', '', '<OsToggle />', '', '<OsBlock os="mac">', '', '```bash', 'brew install x', '```', '', '</OsBlock>', '', '<OsBlock os="windows">', '', 'winget install x', '', '</OsBlock>', '', '<RolePlay id="r1"/>', '', link, '', ...table, '', '```bash', 'echo hi', '```', '', '</Phase>',
].join('\n')

const deepUnit = (heading: string, short: string) => ['<Phase type="concept">', '', `## ${heading}`, '', short, '', '</Phase>'].join('\n')

const UNITS: Record<Locale, Record<string, string>> = {
  ru: {
    '01-alpha/u1-start': startUnit('Вспомни, как ты продолжаешь вчерашнюю работу. Тут поможет агент.', 'Кто такой агент', 'Агент — программа, которая сама выполняет шаги задачи.', 'Дальше — [юнит «Дальше»](/lessons/02-beta/u1-next/).', ['| Шаг | Что делать |', '|---|---|', '| 1 | Открыть журнал |']),
    '01-alpha/u2-deep': deepUnit('STATE.md — где остановились', 'STATE.md — файл, где агент записывает, где остановился.'),
    '02-beta/u1-next': 'Вспомни [модуль 01](/lessons/01-alpha/u2-deep/): STATE.md',
    '02-beta/u2-spare': 'Запасной юнит: здесь нет понятий словаря.',
  },
  en: {
    '01-alpha/u1-start': startUnit('Recall how you resume work from the day before. An agent helps here.', 'What an agent is', 'An agent is a program that carries out the steps of a task by itself.', 'Next — [the unit “Next”](/en/lessons/02-beta/u1-next/).', ['| Step | What to do |', '|---|---|', '| 1 | Open the log |']),
    '01-alpha/u2-deep': deepUnit('STATE.md — where you stopped', 'STATE.md is the file where the agent writes down where it stopped.'),
    '02-beta/u1-next': 'Recall [module 01](/en/lessons/01-alpha/u2-deep/): STATE.md',
    '02-beta/u2-spare': 'A spare unit: no glossary concepts here.',
  },
}

const CHEATSHEET = ['<OsBlock os="mac">', '', '`brew install x`', '', '</OsBlock>', '', '<OsBlock os="windows">', '', '`winget install x`', '', '</OsBlock>'].join('\n')

const PAGES: Record<Locale, Record<ExtraPage, { title: string; content: string }>> = {
  ru: {
    cheatsheet: { title: 'Шпаргалка', content: CHEATSHEET }, exercises: { title: 'Упражнения', content: 'Сделай три упражнения.' }, roadmap: { title: 'Дорожная карта', content: ['| Модуль | Длительность |', '|---|---|', '| [01 · Альфа](/lessons/01-alpha/) | 30 мин |'].join('\n') },
  },
  en: {
    cheatsheet: { title: 'Cheatsheet', content: CHEATSHEET }, exercises: { title: 'Exercises', content: 'Do three exercises.' }, roadmap: { title: 'Roadmap', content: ['| Module | Duration |', '|---|---|', '| [01 · Alpha](/en/lessons/01-alpha/) | 30 min |'].join('\n') },
  },
}

export const MINI_COURSE: SiteInput = {
  domain: 'https://ai.synergify.com',
  description: { ru: 'Открытый курс по agentic AI.', en: 'An open course on agentic AI.' },
  config: { servicePageId: 'svc', title: { ru: 'Точка Сборки — база знаний', en: 'Tochka Sborki — knowledge base' }, authorLinks: [{ label: 'Telegram', url: 'https://t.me/ku_shaman' }, { label: 'LinkedIn', url: 'https://www.linkedin.com/in/sashamamaev/' }] },
  modules: MODULES,
  unitMdx: (l, m, u) => {
    const src = UNITS[l][`${m}/${u}`]
    if (src === undefined) throw new Error(`MINI_COURSE: нет юнита ${l}/${m}/${u}`)
    return src
  },
  pageMdx: (l, name) => PAGES[l][name],
  concepts: CONCEPTS,
}
