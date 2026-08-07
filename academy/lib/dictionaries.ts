import type { Locale } from './registry'

export type { Locale }

export interface AcademyDictionary {
  academy: {
    eyebrow: string
    wordmark: string
    fullName: string
    positioning: string[]
    /** Честный stats-ряд героя: [значение, подпись] */
    heroStats: [string, string][]
    manifestLabel: string
    gate: string
    gateCta: string
    compare: {
      label: string
      heading: string
      leftCol: string
      rightCol: string
      rows: { left: string; right: string }[]
    }
    inside: {
      label: string
      heading: string
      inLabel: string
      outLabel: string
      items: string[]
      excluded: string[]
    }
    footer: {
      tagline: string
      linksLabel: string
      links: { label: string; href: string }[]
      rights: string
    }
    forWhoLabel: string
    forWho: { title: string; body: string }[]
    coursesLabel: string
    comingSoon: string
    trainersCard: { name: string; tagline: string }
    charterSectionLabel: string
    charterBridge: string
    charterLabel: string
    founderLabel: string
    founderName: string
    founderBody: string[]
    founderLink: string
    faqLabel: string
    faq: { q: string; a: string }[]
    metaTitle: string
    metaDescription: string
  }
}

export const dictionaries: Record<Locale, AcademyDictionary> = {
  ru: {
    academy: {
      eyebrow: 'академия',
      wordmark: 'S.A.S.H.A',
      fullName: 'Synergema Authentica Starseed Holon Academy',
      positioning: [
        'Мы строим школу, которую сами искали много лет — и, не находя, называли по-разному: гильдия, тёплое пространство, синергема. Семь лет одна и та же мысль искала имя: людям не хватает не знаний, а живых связей, в которых знание становится силой.',
        'Синергема — наше слово для такой связи: syn + ergon + ema, плод совместной работы. Мы устроены как кристалл: чем больше отражений с другими, тем больше правды о себе. Поэтому здесь не учатся в одиночку — здесь собираются.',
        'Синергема ткётся, а не строится: каждый вплетает свою нить, но узор больше любой из них. Мы делаем свой шаг — и даём узору дозреть; здесь не тянут силой то, что сходится само.',
        'В академию нельзя записаться — в неё можно только войти, пройдя «Точку Сборки». Не потому, что мы любим закрытые двери: система не тратит силу на то, что внутри здания, пока кто-то не пожелает туда войти. Сначала собери свою точку — потом учись её двигать.',
        'Внутри — работа: практики внимания и состояний, групповые ритуалы инсайта, ремесло совместного мышления — с ИИ и без него. Способности здесь куются, а не изучаются. Мы не обещаем сверхспособностей и не продаём тайну. Каждый третий хотя бы раз переживал опыт, который некуда было отнести, — сюда можно.',
        'Школа удалась, когда перестала быть нужной: мы растим самостоятельных, не адептов. Курс бесплатный, вход заслуженный, дверь открыта столько, сколько тебе нужно.',
      ],
      heroStats: [
        ['2', 'курса'],
        ['12', 'правил дома'],
        ['1', 'дверь — Точка Сборки'],
        ['0', 'обещаний'],
      ],
      manifestLabel: 'манифест',
      gate: 'Вход в академию открывается после прохождения «Точки Сборки».',
      gateCta: 'Пройти Точку Сборки →',
      compare: {
        label: 'запись vs круг',
        heading: 'Запись отвечает.\nКруг слышит.',
        leftCol: 'курс-запись',
        rightCol: 'живой круг',
        rows: [
          { left: 'Смотришь в одиночку', right: 'Тебя видят и слышат' },
          { left: 'Вопрос уходит в пустоту', right: 'У вопроса есть адресат' },
          { left: 'Чувствам некуда деться', right: 'У чувств есть свидетель' },
          { left: 'Прогресс — процент просмотра', right: 'Прогресс — то, что можешь передать' },
        ],
      },
      inside: {
        label: 'что внутри',
        heading: 'Способности куются, а не изучаются',
        inLabel: 'внутри',
        outLabel: 'этого здесь нет',
        items: [
          'практики внимания и состояний',
          'групповые ритуалы инсайта',
          'ремесло совместного мышления — с ИИ и без него',
          'передача ремесла в кругу',
        ],
        excluded: [
          'обещаний результата',
          'замены психотерапии',
          'сверхспособностей и «уровней»',
          'секретных техник за доплату',
        ],
      },
      footer: {
        tagline: 'Закрытая школа живых связей. Вход — через открытый курс «Точка Сборки».',
        linksLabel: '// двери',
        links: [
          { label: 'Точка Сборки', href: 'https://ai.synergify.com' },
          { label: 'Практика в живой связи', href: '/praktika/' },
          { label: 'Тренажёры', href: '/trenazhery/' },
          { label: 'Правила дома', href: '/pravila/' },
          { label: 'mamaev.coach', href: 'https://mamaev.coach' },
        ],
        rights: '© 2026 · Synergify Institute for AI',
      },
      forWhoLabel: 'для кого',
      forWho: [
        {
          title: 'Прошёл «Точку Сборки» и хочет глубже',
          body: 'Курс закончился, а работа только началась. Дальше — не новые знания, а ежедневная практика в кругу тех, кто идёт тем же путём.',
        },
        {
          title: 'Ищет живой круг, а не запись',
          body: 'Курсов и записей вокруг достаточно. Не хватает людей, рядом с которыми думается яснее. Здесь собираются ради связи, а не контента.',
        },
        {
          title: 'Несёт своё ремесло и хочет передавать',
          body: 'Есть чем делиться — и хочется делать это не со сцены, а в кругу, где ученик со временем становится соавтором.',
        },
        {
          title: 'Живёт с опытом, которому не нашлось места',
          body: 'Пережил то, что некуда было отнести. Здесь такому опыту не ставят диагноз и не строят вокруг него культ — с ним работают.',
        },
      ],
      coursesLabel: 'Курсы',
      comingSoon: 'скоро',
      trainersCard: {
        name: 'Тренажёры',
        tagline: 'Скорочтение: ритм, периферийное зрение, честный замер скорости. Открыто всем, без входа.',
      },
      charterSectionLabel: 'правила дома',
      charterBridge: 'У дома есть правила — не устав, а то, чем мы отвечаем за это пространство: никакой изоляции, никакой зависимости от школы, уйти можно молча.',
      charterLabel: 'Правила дома — чем мы отвечаем →',
      founderLabel: 'основатель',
      founderName: 'Александр Мамаев',
      founderBody: [
        'Строит школу, которую сам искал много лет — и, не найдя, начал собирать.',
        'Курс «Точка Сборки» — его открытая дверь: всё, чему здесь учат, сначала прожито самим.',
      ],
      founderLink: 'mamaev.coach →',
      faqLabel: 'вопросы',
      faq: [
        {
          q: 'Можно ли записаться в академию?',
          a: 'Нет. В академию не записываются — в неё входят, пройдя «Точку Сборки». Это не фильтр на лояльность, а общий язык: сначала собери свою точку, потом учись её двигать.',
        },
        {
          q: 'Сколько это стоит?',
          a: 'Курс бесплатный. Вход не покупается — он заслуживается пройденной работой. Денег на этой двери нет.',
        },
        {
          q: 'Это религия или секта?',
          a: 'Нет. Смотри правила дома: никакой изоляции, никакой зависимости от школы или наставника, уйти можно в любой момент — молча и без объяснений.',
        },
        {
          q: 'Нужен ли опыт медитации?',
          a: 'Нет. Нужна готовность работать с вниманием и честность к собственному опыту. Остальному учимся вместе.',
        },
        {
          q: 'Что такое синергема?',
          a: 'Наше слово для живой связи: syn + ergon + ema — плод совместной работы. То, что рождается между людьми, когда они думают и практикуют вместе, и что больше любого из них.',
        },
      ],
      metaTitle: 'S.A.S.H.A — школа синергемы',
      metaDescription: 'Закрытая школа живых связей. Вход — через открытый курс «Точка Сборки». Способности куются, а не изучаются.',
    },
  },
  en: {
    academy: {
      eyebrow: 'academy',
      wordmark: 'S.A.S.H.A',
      fullName: 'Synergema Authentica Starseed Holon Academy',
      positioning: [
        'We are building the school we spent years looking for — and, never finding it, kept naming differently: a guild, a warm space, a synergema. For seven years one thought kept searching for its name: what people lack is not knowledge, but living connections in which knowledge becomes strength.',
        'Synergema is our word for such a connection: syn + ergon + ema — the fruit of working together. We are built like a crystal: the more reflections we share with others, the more truth we see about ourselves. So no one studies here alone — here, we assemble.',
        'A synergema is woven, not built: each of us weaves in a thread, yet the pattern is larger than any single one. We take our step — and let the pattern ripen; no one here forces what comes together on its own.',
        'You cannot sign up for the academy — you can only enter it, by completing Tochka Sborki. Not because we like closed doors: a system spends no strength on what is inside a building until someone wishes to walk in. First assemble your point of assembly — then learn to move it.',
        'Inside is work: practices of attention and state, group insight rituals, the craft of thinking together — with AI and without it. Powers here are forged rather than studied. We promise no superpowers and sell no secrets. One person in three has lived through an experience they had nowhere to bring — here, you can bring it.',
        'The school has succeeded when it is no longer needed: we raise the independent, not adepts. The course is free, admission is earned, and the door stays open for as long as you need it.',
      ],
      heroStats: [
        ['2', 'courses'],
        ['12', 'house rules'],
        ['1', 'door — Tochka Sborki'],
        ['0', 'promises'],
      ],
      manifestLabel: 'manifesto',
      gate: 'Admission opens after completing Tochka Sborki.',
      gateCta: 'Take Tochka Sborki →',
      compare: {
        label: 'recording vs circle',
        heading: 'A recording answers.\nA circle hears.',
        leftCol: 'recorded course',
        rightCol: 'living circle',
        rows: [
          { left: 'You watch alone', right: 'You are seen and heard' },
          { left: 'Questions go into a void', right: 'A question has an addressee' },
          { left: 'Feelings have nowhere to go', right: 'Feelings have a witness' },
          { left: 'Progress is a watch percentage', right: 'Progress is what you can pass on' },
        ],
      },
      inside: {
        label: 'what is inside',
        heading: 'Powers are forged, not studied',
        inLabel: 'inside',
        outLabel: 'not here',
        items: [
          'practices of attention and state',
          'group insight rituals',
          'the craft of thinking together — with AI and without it',
          'passing the craft on, in a circle',
        ],
        excluded: [
          'promises of results',
          'a substitute for psychotherapy',
          'superpowers and “levels”',
          'secret techniques at extra cost',
        ],
      },
      footer: {
        tagline: 'A gated school of living connections. The way in is the open course Tochka Sborki.',
        linksLabel: '// doors',
        links: [
          { label: 'Tochka Sborki', href: 'https://ai.synergify.com' },
          { label: 'Practice in Living Connection', href: '/en/praktika/' },
          { label: 'Trainers', href: '/en/trenazhery/' },
          { label: 'House rules', href: '/en/pravila/' },
          { label: 'mamaev.coach', href: 'https://mamaev.coach' },
        ],
        rights: '© 2026 · Synergify Institute for AI',
      },
      forWhoLabel: 'for whom',
      forWho: [
        {
          title: 'Finished Tochka Sborki and wants to go deeper',
          body: 'The course ended, but the work has only begun. What follows is not new knowledge — it is daily practice among people walking the same road.',
        },
        {
          title: 'Looking for a living circle, not a recording',
          body: 'There are plenty of courses and recordings around. What is missing is people you think more clearly next to. Here we gather for connection, not content.',
        },
        {
          title: 'Carries a craft and wants to pass it on',
          body: 'You have something to share — and want to do it not from a stage, but in a circle where a student becomes, in time, a co-author.',
        },
        {
          title: 'Lives with an experience that had no place to go',
          body: 'You have been through something there was nowhere to bring. Here such experience is neither diagnosed nor turned into a cult — it is worked with.',
        },
      ],
      coursesLabel: 'Courses',
      comingSoon: 'coming soon',
      trainersCard: {
        name: 'Trainers',
        tagline: 'Speed reading: rhythm, side vision, an honest speed measure. Open to everyone, no admission needed.',
      },
      charterSectionLabel: 'house rules',
      charterBridge: 'This house has rules — not a statute, but what we answer for in this space: no isolation, no dependence on the school, and you may leave in silence.',
      charterLabel: 'House rules — what we answer for →',
      founderLabel: 'founder',
      founderName: 'Alexander Mamaev',
      founderBody: [
        'Building the school he spent years looking for — and, never finding it, began to assemble.',
        'The course Tochka Sborki is his open door: everything taught here was lived through first.',
      ],
      founderLink: 'mamaev.coach →',
      faqLabel: 'questions',
      faq: [
        {
          q: 'Can I sign up for the academy?',
          a: 'No. You do not sign up — you enter, by completing Tochka Sborki. Not a loyalty filter, but a shared language: first assemble your point of assembly, then learn to move it.',
        },
        {
          q: 'How much does it cost?',
          a: 'The course is free. Admission is not bought — it is earned by the work you have done. There is no money on this door.',
        },
        {
          q: 'Is this a religion or a cult?',
          a: 'No. See the house rules: no isolation, no dependence on the school or a teacher, and you may leave at any moment — in silence, with no explanations owed.',
        },
        {
          q: 'Do I need meditation experience?',
          a: 'No. What you need is a willingness to work with attention and honesty toward your own experience. The rest we learn together.',
        },
        {
          q: 'What is a synergema?',
          a: 'Our word for a living connection: syn + ergon + ema — the fruit of working together. What arises between people who think and practise together, and what is larger than any one of them.',
        },
      ],
      metaTitle: 'S.A.S.H.A — the synergema school',
      metaDescription: 'A gated school of living connections. The way in is the open course Tochka Sborki. Powers are forged rather than studied.',
    },
  },
}

export function getDictionary(locale: Locale): AcademyDictionary {
  return dictionaries[locale]
}
