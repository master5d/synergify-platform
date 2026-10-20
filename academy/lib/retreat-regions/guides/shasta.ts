import type { RegionGuide } from '../types'

// Образцовый гайд для региона Маунт-Шаста
export const SHASTA: RegionGuide = {
  slug: 'shasta',
  name: {
    ru: 'Маунт-Шаста',
    en: 'Mount Shasta',
  },
  placeType: 'sacred-mountains',
  character: {
    ru: 'Потухший стратовулкан в северной Калифорнии с чистыми горными источниками и вековыми лесами.',
    en: 'A dormant stratovolcano in Northern California with pure mountain springs and ancient forests.',
  },
  whoGoes: {
    ru: 'Практикующие глубокую медитацию, искатели уединения и ведущие ретритов тишины.',
    en: 'Deep meditation practitioners, seekers of solitude, and silence retreat leaders.',
  },
  narrative: [
    {
      ru: 'Маунт-Шаста притягивает практиков медитации и уединения уже более века.',
      en: 'Mount Shasta has attracted meditation and solitude practitioners for over a century.',
    },
    {
      ru: 'Высокогорные тропы и хвойные массивы создают пространство естественной сосредоточенности.',
      en: 'High-altitude trails and pine groves create a space for natural focus.',
    },
  ],
  culture: {
    lands: {
      ru: 'Традиционные земли коренных народов шаста, винту, пит-ривер и модок.',
      en: 'Traditional lands of the Shasta, Wintu, Pit River, and Modoc peoples.',
    },
    asks: {
      ru: 'Бережно относитесь к источникам воды и соблюдайте правила пребывания на дикой природе.',
      en: 'Respect natural water springs and follow wilderness leave-no-trace principles.',
    },
    links: [
      {
        title: 'USDA Forest Service — Shasta-Trinity National Forest',
        url: 'https://www.fs.usda.gov/stnf',
        accessed: '2026-10-19',
      },
    ],
  },
  themes: {
    silence: {
      mark: 'match',
      why: {
        ru: 'Природная изоляция и разреженный горный воздух располагают к молчанию.',
        en: 'Natural seclusion and crisp mountain air encourage silent contemplation.',
      },
    },
    body: {
      mark: 'neutral',
      why: {
        ru: 'Телесные практики возможны в помещениях и на лесных полянах в тёплые месяцы.',
        en: 'Body practices work well indoors and in forest clearings during warm months.',
      },
    },
    breath: {
      mark: 'match',
      why: {
        ru: 'Чистый горный воздух и хвойные фитонциды усиливают дыхательные циклы.',
        en: 'Clean mountain air and pine phytoncides enhance breathwork sessions.',
      },
    },
    creative: {
      mark: 'neutral',
      why: {
        ru: 'Спокойная обстановка подходит для письма и размышлений в узком кругу.',
        en: 'A peaceful environment suitable for writing and small-group reflection.',
      },
    },
    nature: {
      mark: 'match',
      why: {
        ru: 'Разветвлённая сеть горных троп и панорамные виды на сотни километров.',
        en: 'Extensive mountain trail network with panoramic vistas for miles around.',
      },
    },
    ritual: {
      mark: 'match',
      why: {
        ru: 'Многолетнее место притяжения для медитативных и символических церемоний.',
        en: 'A longstanding destination for meditative and symbolic ceremonies.',
      },
    },
    burnout: {
      mark: 'match',
      why: {
        ru: 'Удалённость от крупных городов помогает снять сенсорную перегрузку.',
        en: 'Distance from major cities helps dissolve chronic sensory overload.',
      },
    },
    couples: {
      mark: 'neutral',
      why: {
        ru: 'Подходит для камерных ретритов пар при наличии обособленного комфортного жилья.',
        en: 'Works for intimate couples retreats when comfortable private housing is secured.',
      },
    },
    leadership: {
      mark: 'clash',
      why: {
        ru: 'Специфика места не подходит для интенсивных деловых сессий и переговоров.',
        en: 'The contemplative character is ill-suited for fast-paced business sessions.',
      },
    },
    transition: {
      mark: 'match',
      why: {
        ru: 'Мощный природный ландшафт поддерживает переосмысление жизненных этапов.',
        en: 'A striking mountain landscape that supports re-evaluating life milestones.',
      },
    },
  },
  audiences: {
    beginners: {
      mark: 'neutral',
      why: {
        ru: 'Необходима предварительная адаптация к климату и перепадам высот.',
        en: 'Requires basic adaptation to mountain climate and elevation changes.',
      },
    },
    practitioners: {
      mark: 'match',
      why: {
        ru: 'Оптимальная среда для углубления регулярной личной практики.',
        en: 'An optimal environment for deepening consistent personal practice.',
      },
    },
    burnedOut: {
      mark: 'match',
      why: {
        ru: 'Тишина и неспешный ритм природы возвращают контакт с собой.',
        en: 'Silence and nature gentle rhythm help restore contact with oneself.',
      },
    },
    founders: {
      mark: 'neutral',
      why: {
        ru: 'Эффективно для одиночного восстановления, но не для командной рутины.',
        en: 'Effective for solo restorative pauses rather than standard team work.',
      },
    },
    teams: {
      mark: 'clash',
      why: {
        ru: 'Ограниченная инфраструктура для крупных групп и корпоративной логистики.',
        en: 'Limited infrastructure for large corporate groups and event logistics.',
      },
    },
    couples: {
      mark: 'neutral',
      why: {
        ru: 'Возможно при тщательном отборе уединённой и тёплой площадки.',
        en: 'Feasible with careful selection of a secluded and warm venue.',
      },
    },
    womensCircle: {
      mark: 'match',
      why: {
        ru: 'Безопасное природное пространство для доверительных кругов.',
        en: 'A safe natural sanctuary for honest and supportive circle work.',
      },
    },
    mensCircle: {
      mark: 'match',
      why: {
        ru: 'Горные вызовы и уединённые стоянки для практик преодоления.',
        en: 'Mountain terrain and quiet basecamps well suited for men gatherings.',
      },
    },
    creatives: {
      mark: 'neutral',
      why: {
        ru: 'Вдохновляющая панорама, но скромная среда для активного продакшна.',
        en: 'Inspiring scenery, though modest facilities for active production.',
      },
    },
    seekers: {
      mark: 'match',
      why: {
        ru: 'Всемирно признанная точка притяжения исследователей сознания.',
        en: 'A globally acknowledged beacon for seekers exploring consciousness.',
      },
    },
  },
  verdict: {
    yes: {
      ru: 'Место раскрывается наилучшим образом для глубокой тишины и уединённой перезагрузки.',
      en: 'The place reveals itself best for deep silence and solitary reset.',
    },
    no: {
      ru: 'Не рекомендуется для шумных корпоративных интенсивов и развлекательных форматов.',
      en: 'Not recommended for noisy corporate intensives or entertainment-focused formats.',
    },
  },
  venues: [],
  sources: [
    {
      title: 'USGS Volcano Hazards Program — Mount Shasta',
      url: 'https://www.usgs.gov/volcanoes/mount-shasta',
      accessed: '2026-10-19',
    },
  ],
}
