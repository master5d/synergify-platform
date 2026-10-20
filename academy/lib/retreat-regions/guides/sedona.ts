import type { RegionGuide } from '../types'

// Образцовый гайд для региона Седона
export const SEDONA: RegionGuide = {
  slug: 'sedona',
  name: {
    ru: 'Седона',
    en: 'Sedona',
  },
  placeType: 'deserts',
  character: {
    ru: 'Красные песчаные скалы Аризоны, глубокие каньоны и открытые пустынные горизонты с мягким солнцем.',
    en: 'Arizona red sandstone formations, deep canyons, and open desert horizons with warm sun.',
  },
  whoGoes: {
    ru: 'Искатели ясности, практикующие йогу и созерцание, творческие группы и авторы.',
    en: 'Seekers of clarity, yoga and contemplation practitioners, creative groups, and writers.',
  },
  narrative: [
    {
      ru: 'Красные скалы Седоны десятилетиями служат пространством для созерцания и вдохновения.',
      en: 'Sedona red rocks have served as a realm for contemplation and inspiration for decades.',
    },
    {
      ru: 'Контраст сухого пустынного воздуха и тенистых каньонов настраивает на внутренний баланс.',
      en: 'The contrast of dry desert air and shaded canyons fosters inner balance.',
    },
  ],
  culture: {
    lands: {
      ru: 'Традиционные земли коренных народов явапай-апачи и хопи.',
      en: 'Traditional homelands of the Yavapai-Apache and Hopi nations.',
    },
    asks: {
      ru: 'Оставайтесь на обозначенных тропах для сохранения хрупкого слоя биологической почвы.',
      en: 'Remain on marked trails to protect delicate cryptobiotic desert crusts.',
    },
    links: [
      {
        title: 'Coconino National Forest — Red Rock Ranger District',
        url: 'https://www.fs.usda.gov/coconino',
        accessed: '2026-10-19',
      },
    ],
  },
  themes: {
    silence: {
      mark: 'neutral',
      why: {
        ru: 'В каньонах легко найти тишину, однако в черте поселения ощутим поток туристов.',
        en: 'Canyons offer quiet pockets, though tourist activity is noticeable in town.',
      },
    },
    body: {
      mark: 'match',
      why: {
        ru: 'Сухой тёплый климат идеален для регулярных занятий йогой и соматическими практиками.',
        en: 'Dry warm climate is ideal for consistent yoga and somatic movement practices.',
      },
    },
    breath: {
      mark: 'match',
      why: {
        ru: 'Прогретый пустынный воздух и открытые площадки с круговым обзором.',
        en: 'Warm desert air and panoramic outdoor decks support deep breath sessions.',
      },
    },
    creative: {
      mark: 'match',
      why: {
        ru: 'Выразительный свет и контрастный рельеф привлекают художников и авторов текстов.',
        en: 'Expressive light and striking terrain draw visual artists and creative writers.',
      },
    },
    nature: {
      mark: 'match',
      why: {
        ru: 'Множество оборудованных троп разного уровня сложности через каньоны и плато.',
        en: 'Numerous well-maintained trails of varying difficulty across canyons and mesas.',
      },
    },
    ritual: {
      mark: 'match',
      why: {
        ru: 'Устойчивая культура круговых церемоний, звуковых ванн и медитаций.',
        en: 'An established tradition of circular gatherings, sound baths, and ceremonies.',
      },
    },
    burnout: {
      mark: 'match',
      why: {
        ru: 'Солнце, простор и неспешный распорядок дня ускоряют возвращение жизненных сил.',
        en: 'Sunlight, vast open spaces, and an unhurried daily cadence restore vitality.',
      },
    },
    couples: {
      mark: 'match',
      why: {
        ru: 'Живописные закаты и развитая сеть комфортных уединённых лоджей.',
        en: 'Stunning sunsets and an array of comfortable, private lodge settings.',
      },
    },
    leadership: {
      mark: 'neutral',
      why: {
        ru: 'Подходит для компактных стратегических ретритов в обособленных пространствах.',
        en: 'Suitable for compact executive retreats housed in private standalone venues.',
      },
    },
    transition: {
      mark: 'match',
      why: {
        ru: 'Широкий пустынный горизонт помогает обрести перспективу и принять решение.',
        en: 'Expansive desert horizon helps gain clear perspective on personal next steps.',
      },
    },
  },
  audiences: {
    beginners: {
      mark: 'match',
      why: {
        ru: 'Бережная и комфортная среда облегчает первое погружение в формат ретрита.',
        en: 'A welcoming and well-equipped environment eases entry into retreat formats.',
      },
    },
    practitioners: {
      mark: 'match',
      why: {
        ru: 'Множество изолированных локаций в каньонах для углублённой работы.',
        en: 'Abundant secluded canyon locations for focused inward work.',
      },
    },
    burnedOut: {
      mark: 'match',
      why: {
        ru: 'Сухое тепло, спокойные прогулки и визуальная разгрузка от ритма мегаполиса.',
        en: 'Dry warmth, relaxed hikes, and visual respite from metropolitan rush.',
      },
    },
    founders: {
      mark: 'neutral',
      why: {
        ru: 'Хорошо для сольной перезагрузки и стратегических пауз небольших команд.',
        en: 'Well suited for solitary reset and compact leadership offsites.',
      },
    },
    teams: {
      mark: 'neutral',
      why: {
        ru: 'Возможно при предварительном бронировании частных закрытых пространств.',
        en: 'Workable when booking private buyout venues in advance.',
      },
    },
    couples: {
      mark: 'match',
      why: {
        ru: 'Тёплая эстетика ландшафта и высокий уровень уюта создают доверительную атмосферу.',
        en: 'Warm natural aesthetics and high comfort support emotional intimacy.',
      },
    },
    womensCircle: {
      mark: 'match',
      why: {
        ru: 'Мягкий климат и уединённые площадки на открытом воздухе для практик в кругу.',
        en: 'Gentle climate and private open-air terraces for circle work.',
      },
    },
    mensCircle: {
      mark: 'match',
      why: {
        ru: 'Дневные выходы по каньонам и вечерние костровые встречи на стоянках.',
        en: 'Day hikes across rugged terrain and evening campfire conversations.',
      },
    },
    creatives: {
      mark: 'match',
      why: {
        ru: 'Богатая цветовая палитра песчаников и давнее сообщество художников.',
        en: 'Rich sandstone color palette and an established community of artists.',
      },
    },
    seekers: {
      mark: 'match',
      why: {
        ru: 'Широко известное направление для поиска душевного равновесия и инсайтов.',
        en: 'A prominent destination for seeking balance, insight, and renewal.',
      },
    },
  },
  verdict: {
    yes: {
      ru: 'Идеально для йоги, творческих лабораторий, восстановительных программ и парных ретритов.',
      en: 'Ideal for yoga, creative workshops, restorative programs, and couples retreats.',
    },
    no: {
      ru: 'Менее пригодно для абсолютной социальной изоляции из-за сезонного наплыва гостей.',
      en: 'Less suitable for complete isolation due to steady seasonal visitor volume.',
    },
  },
  venues: [],
  sources: [
    {
      title: 'City of Sedona Official Portal',
      url: 'https://www.sedonaaz.gov',
      accessed: '2026-10-19',
    },
  ],
}
