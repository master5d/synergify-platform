import { REGISTRY } from './academy/registry'

const ORG = REGISTRY.academy.org.name

export type Locale = 'ru' | 'en'

export type Dictionary = {
  nav: {
    brand: string
    syllabus: string
    speedreading: string
    roadmap: string
    cheatsheet: string
    feedback: string
    certificate: string
    questLog: string
    profile: string
    synergems: string
    support: string
    store: string
    login: string
    logout: string
    osTitle: string
    osCurrent: (os: string) => string
    theme: { title: string; light: string; dark: string; system: string }
    rpgMode: { title: string; rpg: string; plain: string }
  }
  hero: {
    tagline: string
    titleLine1: string
    titleLine2: string
    slogan: string
    subtitle: string
    stats: [string, string][]
    cta: string
    ctaSecondary: string
    ctaSecondaryAuthed: string
    /** Для тех, кто ещё не решился: открытая страница /try, без записи и почты. */
    ctaTry: string
  }
  forWhoLabel: string
  forWhoHeading: string
  forWho: { title: string; body: string }[]
  forWhoTagline: string
  chatVsSystem: {
    label: string
    heading: string
    hook: string
    chatColLabel: string
    systemColLabel: string
    rows: { chat: string; system: string }[]
  }
  beforeAfter: {
    label: string
    heading: string
    beforeLabel: string
    afterLabel: string
    items: { before: string; after: string }[]
    roiLine: string
  }
  dreams: {
    label: string
    heading: string
    items: { niche: string; build: string }[]
  }
  program: { sectionLabel: string }
  venn: {
    label: string
    heading: string
    items: string[]
    excluded: string[]
    inLabel1: string
    inLabel2: string
    outLabel1: string
    outLabel2: string
    scope: string
    excludedLegend: string
    provoc: string
    mobileExcludedLabel: string
  }
  faq: { label: string; items: { q: string; a: string }[] }
  author: { label: string; name: string; bio: string; cta: string }
  sidebar: { label: string }
  lesson: { complete: string; completing: string; completed: string }
  mobileGate: {
    title: string
    body: string
    emailAction: string
    emailSending: string
    emailSent: string
    emailFailed: string
    qrAction: string
    qrHint: string
    continueAction: string
    dismissHint: string
    backToHome: string
  }
  langSuggest: {
    message: string
    switchAction: string
    dismissAction: string
  }
  pwa: {
    install: string
    installing: string
    iosHint: string
    dismiss: string
  }
  feedback: {
    pageLabel: string
    pageHeading: string
    pageSubtitle: string
    moduleLabel: string
    modulePlaceholder: string
    likertDisagree: string
    likertAgree: string
    recommendLabel: string
    impactLabel: string
    applyLabel: string
    unclearLabel: string
    otherLabel: string
    submitting: string
    submit: string
    successMessage: string
    errorMessage: string
    pageTitle: string
    pageDescription: string
    surveyHeading: string
    surveySkipHint: string
  }
  capture: {
    nameLabel: string
    emailLabel: string
    phoneLabel: string
    cityLabel: string
    cityPlaceholder: string
    messageLabel: string
    submitting: string
    errorMessage: string
  }
  wizard: {
    unit: (i: number, total: number) => string
    back: string
    next: string
    complete: string
    done: string
    nextUnit: string
    moduleComplete: string
    phases: string[]
    appliedChallenge: string
  }
  academy: {
    switcherLabel: string
    catalogTitle: string
    comingSoon: string
  }
  footer: {
    tagline: string
    topicsLabel: string
    resourcesLabel: string
    authorLabel: string
    courseLabel: string
    authorName: string
    sendFeedback: string
    githubRepo: string
    viewSource: string
    license: string
    licenseFull: string
    rights: string
    builtWith: string
    presentedBy: string
  }
  notFound: {
    code: string
    label: string
    heading: string
    body: string
    ctaHome: string
    ctaProgram: string
  }
  login: {
    label: string
    heading: string
    emailPlaceholder: string
    telegramPlaceholder: string
    submit: string
    sending: string
    sentConfirm: (email: string) => string
    defaultError: string
    networkError: string
    footnote: string
    pageTitle: string
    google: string
    or: string
  }
  onboarding: {
    step: string
    heading: string
    subtitle: string
    radioLabel: string
    start: string
    changeLater: string
  }
  telegram: {
    signingIn: string
  }
}

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    nav: {
      brand: 'Точка Сборки',
      syllabus: 'Программа',
      speedreading: 'Тренажёры',
      roadmap: 'Roadmap',
      cheatsheet: 'Шпаргалка',
      questLog: '⬡ Квест-лог',
      profile: 'Профиль',
      synergems: 'Синергемы',
      support: 'Поддержать',
      store: 'Магазин',
      feedback: 'Фидбек',
      certificate: 'Сертификат',
      login: '→ Войти',
      logout: 'Выйти',
      osTitle: 'Сменить OS',
      osCurrent: (os: string) => `Текущая OS: ${os === 'mac' ? 'macOS' : 'Windows'}. Нажми для смены.`,
      theme: { title: 'Тема', light: 'Светлая', dark: 'Тёмная', system: 'Системная' },
      rpgMode: { title: 'Режим подачи', rpg: 'Игровой режим', plain: 'Простой язык' },
    },
    hero: {
      tagline: '⬡ Открытый курс · Бесплатно',
      titleLine1: 'Точка',
      titleLine2: 'Сборки',
      slogan: 'Начни с клика — выйди с будущим.',
      subtitle: 'Сейчас AI тебе советует — а делаешь ты всё равно руками. Курс научит превращать замыслы в задачи, которые AI доводит до конца. Без кода. На твоём языке.',
      stats: [
        ['9', 'тем'],
        ['~15', 'часов'],
        ['8', 'упражнений'],
        ['$0', 'стоимость'],
      ],
      cta: 'Программа ↓',
      ctaSecondary: '→ Войти',
      ctaSecondaryAuthed: '→ Продолжить курс',
      ctaTry: '→ Сначала попробовать',
    },
    forWhoLabel: 'Для кого',
    forWhoHeading: 'Этот курс для тебя, если...',
    forWho: [
      { title: 'Читаешь про ИИ, но не пробовал', body: 'Подписан на каналы, знаешь слова «агент» и «промпт». Год чтения даёт ориентацию, но не умение: без своих рук уверенность почти не растёт. Начни с одного дела — страница «попробовать» открыта без записи.' },
      { title: 'Понимаешь зачем, не знаешь как', body: 'Самый частый случай. Ты уже видел, что ИИ полезен, но между «читаю про агентов» и «строю агентов» не хватает ступеньки. Этот курс — она и есть.' },
      { title: 'Упираешься не в знания, а в доступ', body: 'Сервис не открывается, оплата не проходит. Это не твоя некомпетентность и не повод бросать: в курсе есть отдельный маршрут — установка через cloud-relay и суверенный стек на своей машине.' },
      { title: 'Уже строишь и ищешь равных', body: 'Гайды для начинающих тебе не нужны. Нужен разговор с теми, кто тоже строит: синергемы, разборы и общий контур вместо очередного обзора нейросетей.' },
    ],
    forWhoTagline: 'Если ты строишь AI во благо, а не чтобы урвать — ты дома. Я учу осознанных людей строить решения, которые делают мир лучше.',
    chatVsSystem: {
      label: '// чат vs система',
      heading: 'Чат отвечает.\nСистема делает.',
      hook: 'Ты пользуешься AI каждый день — и всё равно делаешь руками то, что он мог бы сделать за тебя. С этого разрыва начинается путь.',
      chatColLabel: 'Твой чат сейчас',
      systemColLabel: 'После курса',
      rows: [
        { chat: 'Советует — а делаешь ты руками', system: 'Поручаешь — и получаешь готовый результат' },
        { chat: 'Каждый раз объясняешь всё заново', system: 'Твой проект и контекст он уже знает' },
        { chat: 'Один вопрос — один ответ', system: 'Один замысел — многошаговая работа до конца' },
        { chat: 'Результат живёт во вкладке, копируешь сам', system: 'Результат появляется там, где он нужен: в файлах, письмах, таблицах' },
      ],
    },
    beforeAfter: {
      label: '// что изменится',
      heading: 'Что изменится за курс',
      beforeLabel: 'Было',
      afterLabel: 'Стало',
      items: [
        { before: 'Вечер уходит на отчёт: собираешь данные из пяти источников руками.', after: 'Агент собирает черновик за 10 минут — ты проверяешь и отправляешь.' },
        { before: '30 вкладок исследования, половина теряется.', after: 'Поручил агенту — получил выжимку с источниками одним файлом.' },
        { before: 'Каждую неделю одни и те же рутинные шаги.', after: 'Описал процесс один раз — система повторяет сама.' },
      ],
      roiLine: 'Собери систему один раз — возвращай себе часы каждую неделю.',
    },
    dreams: {
      label: '// о чём можно мечтать',
      heading: 'Люди без кода строят это',
      items: [
        { niche: 'Коуч', build: 'Ассистент готовит саммари сессий и план следующей встречи — клиент получает письмо сам.' },
        { niche: 'Музыкант', build: 'Пайплайн релиза: обложки, описания, рассылка по площадкам — из одной папки с треком.' },
        { niche: 'Нон-профит', build: 'Грантовые заявки: агент собирает черновик из базы проектов под требования фонда.' },
        { niche: 'Рисёрчер', build: 'Обзор литературы за вечер: скрапинг, выжимки, таблица источников.' },
        { niche: 'Предприниматель', build: 'CRM из писем и встреч обновляется сама: ты видишь картину, не вбиваешь данные.' },
        { niche: 'Контент-мейкер', build: 'Из одного длинного видео: посты, сценарии шортсов и рассылка в твоём стиле.' },
      ],
    },
    program: {
      sectionLabel: 'Темы курса · выбирай в любом порядке',
    },
    venn: {
      label: '// программа',
      heading: 'Что войдёт\nв курс',
      items: [
        'Карта местности AI-кодинга для нонкодеров',
        'Software 3.0 — четыре сдвига в разработке',
        'Базовый сетап: Warp, Claude Code, Git, Marp',
        'Выбор стека: Claude / Sovereign / Cloud-OSS / Behind-GFW',
        'Промпт-инжиниринг: магические слова и формулы',
        'CLAUDE.md, контекст и система памяти',
        'Pipeline: URL → скрапинг → анализ → инсайты',
        'MCP-серверы, Hooks, Skills, Superpowers',
        'Агентский инжиниринг и оркестрация систем',
      ],
      excluded: [
        'теории без практики',
        'обзоры 50 нейросетей',
        'ChatGPT-туториалы из 2023',
        'домашки без смысла',
      ],
      inLabel1: 'ТО, ЧТО',
      inLabel2: 'БУДЕТ',
      outLabel1: 'ТО, ЧЕГО',
      outLabel2: 'НЕ БУДЕТ',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// хуйни не будет. и воды тоже.',
      mobileExcludedLabel: '// чего не будет',
    },
    faq: {
      label: 'Вопросы',
      items: [
        { q: 'Нужно ли уметь программировать?', a: 'Нет. Vibe coding — это подход где AI пишет код, а ты управляешь. Мы начинаем с нуля.' },
        { q: 'Что такое vibe coding?', a: 'Разработка в потоке: ты описываешь задачу, AI реализует, ты итерируешь. Скорость ×10.' },
        { q: 'Сколько времени нужно в неделю?', a: '30–60 минут на тему + практика. Курс самостоятельный, без дедлайнов.' },
        { q: 'Чем отличается от других AI-курсов?', a: 'Мы не обзор нейросетей. Мы — практический стек: Claude Code, MCP, агенты, деплой, автоматизация.' },
        { q: 'Почему не нанять фрилансера?', a: 'Фрилансер сделает один раз и уйдёт. Система остаётся у тебя, работает каждый день и переделывается за минуты, а не за новый бюджет.' },
        { q: 'Мой чат и так всё помнит', a: 'Память чата — это заметки о тебе. Система помнит проект целиком: файлы, историю решений, процессы — и действует на их основе.' },
        { q: 'Боюсь, что AI будет писать живым людям от моего имени', a: 'И не должен. Ты в цикле: AI помогает думать и готовить, но голос и отправка остаются твоими. Он не пишет за тебя — переводит твой замысел в форму и усиливает, а не подменяет. Аутентичность — это граница, которую курс защищает, а не стирает.' },
        { q: 'Почему бесплатно? Где подвох?', a: 'Подвоха нет: курс бесплатный целиком. Это открытая часть моей практики — дальше у меня есть коучинг и работа с командами, и курс — лучшее знакомство. Ты ничего не должен.' },
        { q: 'А если я так и не стану «вайб-кодером»?', a: 'Даже если ты им никогда не станешь — навык думать вместе с AI останется с тобой навсегда: превращать замыслы в задачи, которые он исполняет, и наконец видеть, что вообще возможно. Это уже не отнять.' },
      ],
    },
    author: {
      label: 'Об авторе',
      name: 'Александр\nМамаев',
      bio: 'Vibe coder, AI builder, коуч. Строю системы на Claude Code + агентах. Курс — дистилляция того, что работает на практике.',
      cta: 'Оставить фидбек →',
    },
    sidebar: {
      label: 'Темы курса',
    },
    lesson: {
      complete: '○ Отметить как пройденный',
      completing: '...',
      completed: '● Урок завершён',
    },
    langSuggest: {
      // Shown to EN-locale visitors on RU pages — written in English
      message: '🌐 This site is also available in English.',
      switchAction: 'Switch to English →',
      dismissAction: 'Stay in Russian',
    },
    pwa: {
      install: '⬇ Установить приложение',
      installing: 'Установка…',
      iosHint: 'Чтобы установить: нажми «Поделиться» → «На экран „Домой"».',
      dismiss: 'Скрыть',
    },
    feedback: {
      pageLabel: '⬡ Фидбек',
      pageHeading: 'Оцени\nкурс',
      pageSubtitle: 'Твой отзыв помогает курсу самообновляться. 2 минуты — и урок станет лучше для следующего студента.',
      moduleLabel: 'Модуль',
      modulePlaceholder: 'Выбери модуль...',
      likertDisagree: 'Не согласен',
      likertAgree: 'Согласен',
      recommendLabel: 'Я бы порекомендовал(а) этот курс другу или коллеге',
      impactLabel: 'Этот урок изменил то, как я думаю о работе с AI',
      applyLabel: 'Я знаю, как применить это прямо сейчас',
      unclearLabel: 'Что было непонятно или хотелось бы разобрать подробнее? (опционально)',
      otherLabel: 'Что ещё хочешь сказать? (опционально)',
      submitting: 'Отправляем...',
      submit: 'Отправить фидбек →',
      successMessage: '✓ Спасибо! Фидбек отправлен.',
      errorMessage: 'Что-то пошло не так, попробуй снова.',
      pageTitle: 'Фидбек — Точка Сборки',
      pageDescription: 'Обратная связь по курсу',
      surveyHeading: 'Как прошёл модуль?',
      surveySkipHint: 'Любой вопрос можно пропустить — по желанию.',
    },
    capture: {
      nameLabel: 'Имя',
      emailLabel: 'Email',
      phoneLabel: 'Телефон / WhatsApp (по желанию)',
      cityLabel: 'Город',
      cityPlaceholder: 'Выбери город...',
      messageLabel: 'Вопрос или комментарий (по желанию)',
      submitting: 'Отправляем...',
      errorMessage: 'Что-то пошло не так, попробуй снова.',
    },
    mobileGate: {
      title: '💻 Этот урок — для десктопа',
      body: 'Тебе понадобится терминал, чтобы делать практику. Регистрация и обзор работают на мобилке, но уроки лучше открывать с ноута / десктопа.',
      emailAction: '✉️  Прислать ссылку на email',
      emailSending: '⏳ Отправляю…',
      emailSent: '✓ Ссылка отправлена на твой email. Открой её на ноуте.',
      emailFailed: 'Не получилось отправить. Попробуй QR-код или продолжи на мобиле.',
      qrAction: '📱 Показать QR-код',
      qrHint: 'Отсканируй с ноутбука — урок откроется в нём.',
      continueAction: 'Всё равно открыть на мобиле',
      dismissHint: 'Не показывать 7 дней',
      backToHome: '← На главную',
    },
    wizard: {
      unit: (i: number, total: number) => `Unit ${i} из ${total}`,
      back: '← Назад',
      next: 'Далее →',
      complete: 'Отметить пройденным ✓',
      done: '● Пройдено',
      nextUnit: 'Следующий unit →',
      moduleComplete: 'Модуль завершён →',
      phases: ['Активация', 'Рефлексия', 'Концепция', 'Практика'],
      appliedChallenge: 'Твой прикладной вызов',
    },
    academy: {
      switcherLabel: 'академия',
      catalogTitle: 'Курсы академии',
      comingSoon: 'скоро',
    },
    footer: {
      tagline: 'Курс о со-мышлении и со-работе с agentic AI: инструмент — отдельно, твоя роль — отдельно. 9 элективных тем, твой стек на выбор.',
      topicsLabel: '// темы',
      resourcesLabel: '// материалы',
      authorLabel: '// автор',
      courseLabel: '// проект',
      authorName: 'Александр Мамаев',
      sendFeedback: 'Оставить фидбек →',
      githubRepo: 'GitHub @master5d',
      viewSource: 'Посмотреть код →',
      license: 'MIT',
      licenseFull: 'MIT License',
      rights: 'Открытый курс. Используй, форкай, делись.',
      builtWith: 'Собрано с Claude Code',
      presentedBy: `Курс представлен ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Тупик',
      heading: 'Здесь\nпусто',
      body: 'Этой страницы не существует. Как и того проекта, который ты всё откладываешь «на потом». Хватит блуждать по ссылкам — иди и собери что-нибудь.',
      ctaHome: 'На главную',
      ctaProgram: 'К программе →',
    },
    login: {
      label: '⬡ Вход',
      heading: 'Войти\nв курс',
      emailPlaceholder: 'твой@email.com',
      telegramPlaceholder: '@telegram (необязательно)',
      submit: 'Получить ссылку →',
      sending: 'Отправляем...',
      sentConfirm: (email: string) => `✓ Ссылка отправлена на ${email}. Проверь почту.`,
      defaultError: 'Что-то пошло не так. Попробуй снова.',
      networkError: 'Ошибка сети. Проверь подключение.',
      footnote: 'Без паролей. Получишь ссылку на почту — один клик и ты внутри.',
      pageTitle: 'Вход — Точка Сборки',
      google: 'Войти через Google',
      or: 'или',
    },
    onboarding: {
      step: '⬡ Шаг 1 из 1',
      heading: 'На чём\nработаешь?',
      subtitle: 'Покажем правильные команды и настройки для твоей системы',
      radioLabel: 'Операционная система',
      start: 'Начать курс →',
      changeLater: 'Можно изменить позже в настройках',
    },
    telegram: {
      signingIn: 'Входим через Telegram…',
    },
  },
  en: {
    nav: {
      brand: 'Tochka Sborki',
      syllabus: 'Syllabus',
      speedreading: 'Trainers',
      roadmap: 'Roadmap',
      cheatsheet: 'Cheatsheet',
      questLog: '⬡ Quest Log',
      profile: 'Profile',
      synergems: 'Synergems',
      support: 'Support',
      store: 'Store',
      feedback: 'Feedback',
      certificate: 'Certificate',
      login: '→ Sign in',
      logout: 'Sign out',
      osTitle: 'Switch OS',
      osCurrent: (os: string) => `Current OS: ${os === 'mac' ? 'macOS' : 'Windows'}. Click to switch.`,
      theme: { title: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
      rpgMode: { title: 'Presentation', rpg: 'Game mode', plain: 'Plain language' },
    },
    hero: {
      tagline: '⬡ Open course · Free',
      titleLine1: 'Tochka',
      titleLine2: 'Sborki',
      slogan: 'Start with a click. Exit with the future.',
      subtitle: 'Right now AI gives you advice — and you still do everything by hand. This course teaches you to turn your ideas into tasks AI carries to the finish. No code. In your own words.',
      stats: [
        ['9', 'topics'],
        ['~15', 'hours'],
        ['8', 'exercises'],
        ['$0', 'cost'],
      ],
      cta: 'See program ↓',
      ctaSecondary: '→ Sign in',
      ctaSecondaryAuthed: '→ Continue course',
      ctaTry: '→ Try it first',
    },
    forWhoLabel: 'Who it’s for',
    forWhoHeading: 'This course is for you if...',
    forWho: [
      { title: 'You read about AI but never tried it', body: 'You follow the channels and know the words: "agent", "prompt". A year of reading gives orientation, not skill: without your own hands, confidence barely moves. Start with one real task — the try-it page is open, no signup.' },
      { title: 'You know why, not how', body: 'The most common case. You have seen that AI is useful, but between "reading about agents" and "building agents" a step is missing. This course is that step.' },
      { title: 'Your wall is access, not knowledge', body: 'The service will not open, the payment will not go through. That is not incompetence and not a reason to quit: the course has its own route — a cloud relay install and a sovereign stack on your own machine.' },
      { title: 'You already build and want peers', body: 'Beginner guides are not what you need. You need a conversation with people who also build: synergems, teardowns and a shared circuit instead of one more roundup of neural nets.' },
    ],
    forWhoTagline: 'If you build AI for good, not to grab — you’re home. I teach conscious people to build solutions that make the world better.',
    chatVsSystem: {
      label: '// chat vs system',
      heading: 'A chat answers.\nA system gets it done.',
      hook: 'You use AI every day — and still do by hand what it could do for you. That gap is where this course begins.',
      chatColLabel: 'Your chat today',
      systemColLabel: 'After the course',
      rows: [
        { chat: 'Gives advice — you do the work by hand', system: 'You delegate — and get the finished result' },
        { chat: 'You explain everything from scratch every time', system: 'It already knows your project and context' },
        { chat: 'One question — one answer', system: 'One idea — multi-step work carried to the end' },
        { chat: 'Results live in a browser tab, you copy them out', system: 'Results land where they belong: files, emails, spreadsheets' },
      ],
    },
    beforeAfter: {
      label: '// what changes',
      heading: 'What changes after the course',
      beforeLabel: 'Before',
      afterLabel: 'After',
      items: [
        { before: 'An evening goes into a report: you gather data from five sources by hand.', after: 'An agent drafts it in 10 minutes — you review and send.' },
        { before: '30 research tabs, half of them lost.', after: 'Delegate it — get a digest with sources in a single file.' },
        { before: 'The same routine steps every week.', after: 'Describe the process once — the system repeats it on its own.' },
      ],
      roiLine: 'Build the system once — get hours back every week.',
    },
    dreams: {
      label: '// what to dream about',
      heading: 'People with no code background build this',
      items: [
        { niche: 'Coach', build: 'An assistant preps session summaries and next-meeting plans — the client gets the email automatically.' },
        { niche: 'Musician', build: 'A release pipeline: covers, descriptions, distribution to platforms — from one folder with a track.' },
        { niche: 'Non-profit', build: 'Grant applications: an agent drafts them from your project base to fit each fund’s requirements.' },
        { niche: 'Researcher', build: 'A literature review in one evening: scraping, digests, a table of sources.' },
        { niche: 'Founder', build: 'A CRM that updates itself from emails and meetings — you see the picture, not type the data.' },
        { niche: 'Content creator', build: 'From one long video: posts, shorts scripts, and a newsletter in your voice.' },
      ],
    },
    program: {
      sectionLabel: 'Course topics · pick any order',
    },
    venn: {
      label: '// program',
      heading: 'What’s\nincluded',
      items: [
        'Map of AI-coding tools for non-coders',
        'Software 3.0 — four shifts in development',
        'Setup essentials: Warp, Claude Code, Git, Marp',
        'Stack selection: Claude / Sovereign / Cloud-OSS / Behind-GFW',
        'Prompt engineering: magic words and formulas',
        'CLAUDE.md, context, and memory systems',
        'Pipeline: URL → scrape → analyze → insights',
        'MCP servers, Hooks, Skills, Superpowers',
        'Agent engineering and system orchestration',
      ],
      excluded: [
        'theory without practice',
        'reviews of 50 neural nets',
        'ChatGPT tutorials from 2023',
        'pointless homework',
      ],
      inLabel1: 'WHAT’S',
      inLabel2: 'IN',
      outLabel1: 'WHAT’S',
      outLabel2: 'OUT',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// no bullshit. no filler.',
      mobileExcludedLabel: '// what’s out',
    },
    faq: {
      label: 'Questions',
      items: [
        { q: 'Do I need to know how to code?', a: 'No. Vibe coding means AI writes code, you direct. We start from zero.' },
        { q: 'What is vibe coding?', a: 'Development in flow: you describe the task, AI implements, you iterate. 10× speed.' },
        { q: 'How much time per week?', a: '30–60 minutes per topic + practice. Self-paced, no deadlines.' },
        { q: 'How is this different from other AI courses?', a: 'We’re not a tour of neural nets. We’re a practical stack: Claude Code, MCP, agents, deploys, automation.' },
        { q: 'Why not just hire a freelancer?', a: 'A freelancer does it once and leaves. A system stays with you, works every day, and gets reworked in minutes — not for another budget.' },
        { q: 'My chat already remembers everything', a: 'Chat memory is notes about you. A system remembers the whole project — files, decision history, processes — and acts on them.' },
        { q: 'I’m afraid AI will message real people as me', a: 'It shouldn’t. You stay in the loop: AI helps you think and prepare, but the voice and the send stay yours. It doesn’t write for you — it translates your intent into shape and amplifies it, not replaces it. Authenticity is a line this course protects, not erases.' },
        { q: 'Why free? What’s the catch?', a: 'No catch: the course is fully free. It’s the open part of my practice — I also do coaching and work with teams, and the course is the best introduction. You owe nothing.' },
        { q: 'What if I never become a “vibe coder”?', a: 'Even if you never do, the skill of thinking with AI stays with you for good — turning your intentions into tasks it can execute, and finally seeing what’s possible. No one can take that back.' },
      ],
    },
    author: {
      label: 'About the author',
      name: 'Alexander\nMamaev',
      bio: 'Vibe coder, AI builder, coach. I build systems on Claude Code + agents. This course is a distillation of what actually works.',
      cta: 'Send feedback →',
    },
    sidebar: {
      label: 'Course topics',
    },
    lesson: {
      complete: '○ Mark as complete',
      completing: '...',
      completed: '● Lesson complete',
    },
    langSuggest: {
      // Shown to RU-locale visitors on EN pages — written in Russian
      message: '🌐 Этот сайт также доступен на русском.',
      switchAction: 'Переключить на русский →',
      dismissAction: 'Остаться на английском',
    },
    pwa: {
      install: '⬇ Install app',
      installing: 'Installing…',
      iosHint: 'To install: tap Share → "Add to Home Screen".',
      dismiss: 'Hide',
    },
    feedback: {
      pageLabel: '⬡ Feedback',
      pageHeading: 'Rate the\ncourse',
      pageSubtitle: 'Your feedback helps the course self-update. 2 minutes — and the lesson gets better for the next student.',
      moduleLabel: 'Module',
      modulePlaceholder: 'Pick a module...',
      likertDisagree: 'Disagree',
      likertAgree: 'Agree',
      recommendLabel: 'I would recommend this course to a friend or colleague',
      impactLabel: 'This lesson changed how I think about working with AI',
      applyLabel: 'I know how to apply this right now',
      unclearLabel: 'What was unclear or what would you like covered in more depth? (optional)',
      otherLabel: 'Anything else you want to say? (optional)',
      submitting: 'Sending...',
      submit: 'Send feedback →',
      successMessage: '✓ Thanks! Feedback sent.',
      errorMessage: 'Something went wrong, try again.',
      pageTitle: 'Feedback — Tochka Sborki',
      pageDescription: 'Feedback on the course',
      surveyHeading: 'How was this module?',
      surveySkipHint: "You can skip any question — it's optional.",
    },
    capture: {
      nameLabel: 'Name',
      emailLabel: 'Email',
      phoneLabel: 'Phone / WhatsApp (optional)',
      cityLabel: 'City',
      cityPlaceholder: 'Choose a city...',
      messageLabel: 'Question or comment (optional)',
      submitting: 'Sending...',
      errorMessage: 'Something went wrong, please try again.',
    },
    mobileGate: {
      title: '💻 This lesson is for desktop',
      body: 'You’ll need a terminal for the practice. Sign-up and browsing work on mobile, but lessons are best opened on a laptop / desktop.',
      emailAction: '✉️  Email me the link',
      emailSending: '⏳ Sending…',
      emailSent: '✓ Link sent to your email. Open it on your laptop.',
      emailFailed: 'Couldn’t send. Try the QR code or continue on mobile.',
      qrAction: '📱 Show QR code',
      qrHint: 'Scan from your laptop — the lesson will open there.',
      continueAction: 'Open on mobile anyway',
      dismissHint: 'Don’t show for 7 days',
      backToHome: '← Back to home',
    },
    wizard: {
      unit: (i: number, total: number) => `Unit ${i} of ${total}`,
      back: '← Back',
      next: 'Next →',
      complete: 'Mark complete ✓',
      done: '● Done',
      nextUnit: 'Next unit →',
      moduleComplete: 'Topic complete →',
      phases: ['Activation', 'Reflection', 'Concept', 'Practice'],
      appliedChallenge: 'Your applied challenge',
    },
    academy: {
      switcherLabel: 'academy',
      catalogTitle: 'Academy courses',
      comingSoon: 'coming soon',
    },
    footer: {
      tagline: 'A course in co-thinking and co-working with agentic AI — the tool stays separate from your role. 9 elective topics, pick your stack.',
      topicsLabel: '// topics',
      resourcesLabel: '// resources',
      authorLabel: '// author',
      courseLabel: '// project',
      authorName: 'Alexander Mamaev',
      sendFeedback: 'Send feedback →',
      githubRepo: 'GitHub @master5d',
      viewSource: 'View source →',
      license: 'MIT',
      licenseFull: 'MIT License',
      rights: 'Open course. Use it, fork it, share it.',
      builtWith: 'Built with Claude Code',
      presentedBy: `Presented by ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Dead end',
      heading: 'Nothing\nhere',
      body: 'This page does not exist. Neither does that project you keep putting off until "later". Stop wandering through dead links — go build something.',
      ctaHome: 'Home',
      ctaProgram: 'See program →',
    },
    login: {
      label: '⬡ Sign in',
      heading: 'Enter\nthe course',
      emailPlaceholder: 'your@email.com',
      telegramPlaceholder: '@telegram (optional)',
      submit: 'Get the link →',
      sending: 'Sending...',
      sentConfirm: (email: string) => `✓ Link sent to ${email}. Check your inbox.`,
      defaultError: 'Something went wrong. Try again.',
      networkError: 'Network error. Check your connection.',
      footnote: 'No passwords. You get a link in your inbox — one click and you are in.',
      pageTitle: 'Sign in — Tochka Sborki',
      google: 'Continue with Google',
      or: 'or',
    },
    onboarding: {
      step: '⬡ Step 1 of 1',
      heading: 'What do you\nwork on?',
      subtitle: 'We will show the right commands and setup for your system',
      radioLabel: 'Operating system',
      start: 'Start the course →',
      changeLater: 'You can change this later in settings',
    },
    telegram: {
      signingIn: 'Signing in via Telegram…',
    },
  },
}

export function getDictionary(locale: Locale): Dictionary {
  return dictionaries[locale]
}
