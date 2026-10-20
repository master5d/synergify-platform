// packs/one-to-one/dictionaries.ts
// Полный интерфейс Dictionary эталона (32 компонента читают его через стаб lib/dictionaries.ts).
// Значения — под курс «Один на один и дальше»: спокойный тон, де-hustle, ноль обещаний дохода
// и клиентов; курс не терапия и не консультация, и словарь говорит это вслух.
// Pack может импортировать ПУБЛИЧНЫЕ модули движка (registry, типы); обратное — только стабы.
import { REGISTRY } from '../../lib/academy/registry'

const ORG = REGISTRY.academy.org.name

export type Locale = 'ru' | 'en'

export type Dictionary = {
  nav: {
    brand: string
    syllabus: string
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
    /** Доступное имя кнопки-бургера мобильного меню и заголовок его панели (≤720px). */
    menu: string
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
  retro: {
    heading: string
    subtitle: string
    beforeLabel: string
    afterLabel: string
    promptLabel: string
    planLabel: string
    reviewLabel: string
    requiredError: string
    submitting: string
    submit: string
    successMessage: string
    errorMessage: string
    downloadAction: string
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
  admission: {
    eyebrow: string
    checking: string
    heading: string
    body: string[]
    cta: string
    ctaHref: string
    returnHint: string
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
    emailLabel: string
    telegramLabel: string
    telegramHint: string
    emailPlaceholder: string
    telegramPlaceholder: string
    submit: string
    sending: string
    resend: string
    changeEmail: string
    sentConfirm: (email: string) => string
    defaultError: string
    networkError: string
    invalidEmail: string
    sendFailed: string
    rateLimited: string
    redirectHint: string
    footnote: string
    pageTitle: string
    google: string
    or: string
  }
  authGuard: {
    checking: string
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
  /** Рамка входа (intake LMS#1 + LMS#10): обещание «бесплатно, без встроенных продаж»
   *  и одна фраза позиционирования через свойства курса. Опционально: pack без поля —
   *  блока нет. Обещающая форма — гейтится манифестом pack'а (packs/<slug>/manifest.ts). */
  entryFrame?: {
    label: string
    promise: string
    positioning: string
  }
}

export const dictionaries: Record<Locale, Dictionary> = {
  ru: {
    nav: {
      brand: 'Один на один и дальше',
      syllabus: 'Уроки',
      roadmap: 'Карта курса',
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
      menu: 'Меню',
      osTitle: 'Сменить OS',
      osCurrent: (os: string) => `Текущая OS: ${os === 'mac' ? 'macOS' : 'Windows'}. Нажми для смены.`,
      theme: { title: 'Тема', light: 'Светлая', dark: 'Тёмная', system: 'Системная' },
      rpgMode: { title: 'Режим подачи', rpg: 'Игровой режим', plain: 'Простой язык' },
    },
    hero: {
      tagline: '⬡ Курс академии · Бесплатно · Без входа',
      titleLine1: 'Один на один',
      titleLine2: 'и дальше',
      slogan: 'Нижняя ступень — не потолок.',
      subtitle: 'Работа один на один — первая ступень лесенки форматов. Она становится потолком, когда клиенты держатся на личной привязке, а часы в неделе кончились. Курс помогает увидеть свою практику картой, отделить метод от себя, посчитать предел часов и цены и сделать первый шаг к встрече на 2–7 человек.',
      stats: [
        ['14', 'уроков'],
        ['4', 'артефакта'],
        ['0', 'обещаний дохода'],
        ['$0', 'стоимость'],
      ],
      cta: 'К урокам ↓',
      ctaSecondary: '→ Войти',
      ctaSecondaryAuthed: '→ Продолжить курс',
      ctaTry: '→ Просто почитать',
    },
    forWhoLabel: 'Для кого',
    forWhoHeading: 'Этот курс для тебя, если...',
    forWho: [
      { title: 'Ты только начинаешь работать один на один', body: 'Модуль академии позади, и ты берёшь первых клиентов. Курс помогает с первой встречи строить ступень, а не потолок.' },
      { title: 'Свободных часов почти не осталось', body: 'Неделя заполнена сессиями, а рост остановился. Модуль 03 считает, где кончается работа один на один по деньгам и силам.' },
      { title: 'Клиенты ходят «к тебе лично»', body: 'Сессии хорошие, но без тебя ничего не происходит. Модули 01 и 02 отделяют метод от личной привязки.' },
      { title: 'Ты думаешь о первой мини-группе', body: 'Хочется собрать несколько человек, но страшно потерять тех, кому нужен разговор один на один. Модуль 04 — про первый шаг и про тех, кто остаётся.' },
    ],
    forWhoTagline: 'Курс не обещает дохода и потока клиентов. Он показывает, где практика упирается в потолок, — решение остаётся твоим.',
    chatVsSystem: {
      label: '// привязка vs метод',
      heading: 'Привязка держит клиента.\nМетод держит практику.',
      hook: 'Клиент приходит за вниманием ведущего — это сила ступени. Потолок начинается, когда кроме внимания назвать нечего.',
      chatColLabel: 'Практика держится на тебе',
      systemColLabel: 'Практика держится на методе',
      rows: [
        { chat: 'Клиент говорит «с тобой просто хорошо»', system: 'Клиент может назвать, что он получает от метода' },
        { chat: 'Сессию нельзя описать — «она живая»', system: 'Сессия описана шагами на одной странице' },
        { chat: 'Цена — за сессию, часы вне сессий не видны', system: 'Посчитана цена всего рабочего часа и предел недели' },
        { chat: 'Группа — «когда-нибудь потом»', system: 'Первая встреча на 2–7 человек стоит в плане с датой' },
      ],
    },
    beforeAfter: {
      label: '// различие',
      heading: 'Одна практика — два способа её вести',
      beforeLabel: 'Наугад',
      afterLabel: 'С картой',
      items: [
        { before: 'Больше клиентов — значит рост.', after: 'Рост внутри ступени — только цена или часы; выше потолка — только формат.' },
        { before: 'Передать клиента — признать слабость.', after: 'Граница компетенции названа, список «куда передавать» готов заранее.' },
        { before: 'Сказать о группе всем разом.', after: 'Каждому клиенту — свой разговор, и ясно, кто остаётся один на один.' },
      ],
      roiLine: 'Курс не обещает результата. Он даёт карту, расчёт и план — пользоваться ими или нет, решаешь ты.',
    },
    dreams: {
      label: '// какой бывает следующий шаг',
      heading: 'Встречи на 2–7 человек',
      items: [
        { niche: 'Мини-группа своих клиентов', build: 'Несколько клиентов с похожим запросом на одной встрече по твоему методу.' },
        { niche: 'Пара или семья', build: 'Двое или трое близких людей на одной сессии: общий запрос, у каждого свой голос.' },
        { niche: 'Ученичество', build: 'Небольшой цикл для тех, кто хочет освоить метод сам; на лесенке — ступень «несколько».' },
        { niche: 'Остаться один на один', build: 'Тем, кому нужна приватность и своя скорость, — работа один на один без перемен.' },
      ],
    },
    program: {
      sectionLabel: 'Модули курса · четыре артефакта',
    },
    venn: {
      label: '// программа',
      heading: 'О чём\nэтот курс',
      items: [
        'Где практика стоит на лесенке форматов',
        'Признаки потолка и признаки «рано»',
        'Что клиент получает от метода, а что от отношений',
        'Граница компетенции и куда передавать клиента',
        'Метод на одной странице',
        'Цена рабочего часа и предел недели',
        'Цикл, переносы и отмены',
        'Первая встреча на 2–7 человек',
      ],
      excluded: [
        'обучения самой практике',
        'терапии и супервизии',
        'обещаний дохода и клиентов',
        'медицинской и юридической консультации',
      ],
      inLabel1: 'ТО, ЧТО',
      inLabel2: 'БУДЕТ',
      outLabel1: 'ТО, ЧЕГО',
      outLabel2: 'НЕ БУДЕТ',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// ступень, а не потолок.',
      mobileExcludedLabel: '// чего не будет',
    },
    faq: {
      label: 'Вопросы',
      items: [
        { q: 'Курс учит вести сессии?', a: 'Нет. Мастерство ведущего растят другие модули академии. Этот курс — про сам формат один на один и выход из него.' },
        { q: 'Значит, работать один на один хуже, чем с группой?', a: 'Нет. Верхняя ступень не лучше нижней, и часть клиентов остаётся один на один. Курс помогает выбрать, а не уйти.' },
        { q: 'Сколько времени занимает курс?', a: 'Урок — около десяти минут, всего 14 уроков. Без дедлайнов и без проверяющих.' },
        { q: 'Нужно ли входить, чтобы читать?', a: 'Нет. Курс открыт без входа. Вход нужен только чтобы прогресс сохранился на другом устройстве.' },
        { q: 'Это медицинская или юридическая консультация?', a: 'Нет. Урок о границе компетенции опирается на кодексы профессиональных ассоциаций с датой «по состоянию на 2026-10». Для своей страны их проверяют отдельно.' },
        { q: 'Почему бесплатно? Где подвох?', a: 'Подвоха нет: курс бесплатный целиком, без «следующих уровней» и ступеней доступа.' },
      ],
    },
    author: {
      label: 'Об авторе',
      name: 'Александр\nМамаев',
      bio: 'Собираю школу синергемы. Этот курс — нижняя ступень лесенки форматов: так, чтобы работа один на один была началом пути, а не его пределом.',
      cta: 'Оставить фидбек →',
    },
    sidebar: {
      label: 'Уроки курса',
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
      pageHeading: 'Отзыв\nо курсе',
      pageSubtitle: 'Твой отзыв помогает курсу становиться точнее. Пара минут — и текст станет яснее для следующего читателя.',
      moduleLabel: 'Урок',
      modulePlaceholder: 'Выбери урок...',
      likertDisagree: 'Не согласен',
      likertAgree: 'Согласен',
      recommendLabel: 'Я бы посоветовал(а) этот курс человеку, который работает с клиентами один на один',
      impactLabel: 'Этот текст изменил то, как я смотрю на свою практику',
      applyLabel: 'Я понимаю, какой первый шаг сделать к мини-группе',
      unclearLabel: 'Что было непонятно или хотелось бы разобрать подробнее? (опционально)',
      otherLabel: 'Что ещё хочешь сказать? (опционально)',
      submitting: 'Отправляем...',
      submit: 'Отправить фидбек →',
      successMessage: '✓ Спасибо! Фидбек отправлен.',
      errorMessage: 'Что-то пошло не так, попробуй снова.',
      pageTitle: 'Фидбек — Один на один и дальше',
      pageDescription: 'Обратная связь по курсу',
      surveyHeading: 'Как прочитался урок?',
      surveySkipHint: 'Любой вопрос можно пропустить — по желанию.',
    },
    retro: {
      heading: 'Ретро выпускника',
      subtitle: 'Четыре вопроса, которые стоит задать себе на финале. Ответы уходят нам как отзыв — «план на месяц» и «до/после» можно сразу скачать себе.',
      beforeLabel: 'Что ты умел(а) до курса?',
      afterLabel: 'Что ты умеешь теперь?',
      promptLabel: 'Лучший промпт курса — тот, который выстрелил сильнее всего',
      planLabel: 'План на месяц: что применишь в первую очередь',
      reviewLabel: 'Отзыв о курсе',
      requiredError: 'Заполни это поле',
      submitting: 'Отправляем…',
      submit: 'Отправить ретро →',
      successMessage: '✓ Спасибо! Ретро сохранено.',
      errorMessage: 'Что-то пошло не так, попробуй снова.',
      downloadAction: '↓ Скачать план и до/после (.md)',
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
      title: '💻 Этот урок удобнее на большом экране',
      body: 'Уроки — длинная проза: с ноутбука или десктопа читать спокойнее. Но и на мобиле всё работает.',
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
    admission: {
      eyebrow: 'вход',
      checking: 'дверь узнаёт тебя…',
      heading: 'Курс открывается после «Точки Сборки»',
      body: [
        'В академию нельзя записаться — в неё можно только войти. Не потому, что мы любим закрытые двери: сначала собери свою точку — потом учись её двигать.',
        'Этот курс открыт без входа и без допуска: ворота допуска у него выключены. Текст остаётся на случай, если их включат.',
      ],
      cta: 'Пройти Точку Сборки →',
      ctaHref: 'https://ai.synergify.com',
      returnHint: 'Курс уже пройден? Войди на ai.synergify.com под своим входом и вернись — дверь узнает тебя.',
    },
    wizard: {
      unit: (i: number, total: number) => `Урок ${i} из ${total}`,
      back: '← Назад',
      next: 'Далее →',
      complete: 'Отметить пройденным ✓',
      done: '● Пройдено',
      nextUnit: 'Следующий урок →',
      moduleComplete: 'Модуль пройден →',
      phases: ['Активация', 'Рефлексия', 'Концепция', 'Практика'],
      appliedChallenge: 'Твой шаг в практике',
    },
    academy: {
      switcherLabel: 'академия',
      catalogTitle: 'Курсы академии',
      comingSoon: 'скоро',
    },
    footer: {
      tagline: 'Работа один на один как первая ступень: карта практики, метод, предел часов и цены, первый шаг к мини-группе. Без обещаний дохода; не терапия и не консультация.',
      topicsLabel: '// модули',
      resourcesLabel: '// материалы',
      authorLabel: '// автор',
      courseLabel: '// проект',
      authorName: 'Александр Мамаев',
      sendFeedback: 'Оставить фидбек →',
      githubRepo: 'GitHub @master5d',
      viewSource: 'Посмотреть код →',
      license: 'MIT',
      licenseFull: 'MIT License',
      rights: 'Открытый курс. Читай, делись, рисуй карту своей практики.',
      builtWith: 'Собрано с Claude Code',
      presentedBy: `Курс представлен ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Один на один',
      heading: 'Здесь\nпусто',
      body: 'Этой страницы не существует. Вернись к урокам — они на месте.',
      ctaHome: 'На главную',
      ctaProgram: 'К урокам →',
    },
    login: {
      label: '⬡ Вход',
      heading: 'Войти\nв курс',
      emailLabel: 'Email',
      telegramLabel: 'Telegram (необязательно)',
      telegramHint: 'Бот напомнит про курс в Telegram, если пропустишь урок.',
      emailPlaceholder: 'твой@email.com',
      telegramPlaceholder: '@telegram',
      submit: 'Получить ссылку →',
      sending: 'Отправляем...',
      resend: 'Отправить ещё раз',
      changeEmail: '← Изменить email',
      sentConfirm: (email: string) => `✓ Ссылка отправлена на ${email}. Проверь почту.`,
      defaultError: 'Что-то пошло не так. Попробуй снова.',
      networkError: 'Ошибка сети. Проверь подключение.',
      invalidEmail: 'Введи настоящий email.',
      sendFailed: 'Не получилось отправить письмо. Попробуй ещё раз через минуту.',
      rateLimited: 'Слишком много попыток. Подожди немного и попробуй снова.',
      redirectHint: 'Войди, и урок откроется.',
      footnote: 'Без паролей. Получишь ссылку на почту — один клик и ты внутри.',
      pageTitle: 'Вход — Один на один и дальше',
      google: 'Войти через Google',
      or: 'или',
    },
    authGuard: {
      checking: 'Проверяем вход…',
    },
    onboarding: {
      step: '⬡ Шаг 1 из 1',
      heading: 'Как тебе\nудобнее?',
      subtitle: 'Небольшая настройка отображения — можно поменять в любой момент',
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
      brand: 'One to One and Beyond',
      syllabus: 'Lessons',
      roadmap: 'Course map',
      cheatsheet: 'Cheat sheet',
      questLog: '⬡ Quest Log',
      profile: 'Profile',
      synergems: 'Synergems',
      support: 'Support',
      store: 'Store',
      feedback: 'Feedback',
      certificate: 'Certificate',
      login: '→ Sign in',
      logout: 'Sign out',
      menu: 'Menu',
      osTitle: 'Switch OS',
      osCurrent: (os: string) => `Current OS: ${os === 'mac' ? 'macOS' : 'Windows'}. Click to switch.`,
      theme: { title: 'Theme', light: 'Light', dark: 'Dark', system: 'System' },
      rpgMode: { title: 'Presentation', rpg: 'Game mode', plain: 'Plain language' },
    },
    hero: {
      tagline: '⬡ Academy course · Free · No sign-in',
      titleLine1: 'One to One',
      titleLine2: 'and Beyond',
      slogan: 'The bottom step is not a ceiling.',
      subtitle: 'One-to-one work is the first step of the format ladder. It becomes a ceiling when clients stay because of a personal bond and the hours in the week run out. The course helps you see your practice as a map, separate the method from yourself, work out the limit of hours and price, and take the first step to a meeting for 2–7 people.',
      stats: [
        ['14', 'lessons'],
        ['4', 'outputs'],
        ['0', 'income promises'],
        ['$0', 'cost'],
      ],
      cta: 'To the lessons ↓',
      ctaSecondary: '→ Sign in',
      ctaSecondaryAuthed: '→ Continue the course',
      ctaTry: '→ Just read',
    },
    forWhoLabel: 'Who it is for',
    forWhoHeading: 'This course is for you if...',
    forWho: [
      { title: 'You are just starting to work one to one', body: 'You finished an academy module and are taking your first clients. The course helps you build a step, not a ceiling, from the first meeting.' },
      { title: 'You have almost no free hours left', body: 'Your week is full of sessions, and growth has stopped. Module 03 works out where one-to-one work ends in money and strength.' },
      { title: 'Clients come “to you personally”', body: 'The sessions are good, but nothing happens without you. Modules 01 and 02 separate the method from the personal bond.' },
      { title: 'You are thinking of a first small group', body: 'You want to bring a few people together but fear losing those who need a one-to-one conversation. Module 04 is about the first step and about those who stay.' },
    ],
    forWhoTagline: 'The course promises no income and no stream of clients. It shows where a practice hits its ceiling — the decision stays yours.',
    chatVsSystem: {
      label: '// bond vs method',
      heading: 'A bond keeps a client.\nA method keeps a practice.',
      hook: 'A client comes for the practitioner’s attention — that is the strength of this step. The ceiling begins when there is nothing else to name.',
      chatColLabel: 'The practice rests on you',
      systemColLabel: 'The practice rests on the method',
      rows: [
        { chat: 'The client says “it just feels good with you”', system: 'The client can name what they get from the method' },
        { chat: 'The session cannot be described — “it is alive”', system: 'The session is described in steps on one page' },
        { chat: 'The price is per session; hours outside sessions are invisible', system: 'The price of every working hour and the weekly limit are worked out' },
        { chat: 'A group is for “some day later”', system: 'The first meeting for 2–7 people is in the plan with a date' },
      ],
    },
    beforeAfter: {
      label: '// the difference',
      heading: 'One practice — two ways to run it',
      beforeLabel: 'By guesswork',
      afterLabel: 'With a map',
      items: [
        { before: 'More clients means growth.', after: 'Growth within the step is only price or hours; above the ceiling, only the format.' },
        { before: 'Referring a client means admitting weakness.', after: 'The edge of your competence is named, and the referral list is ready in advance.' },
        { before: 'Tell everyone about the group at once.', after: 'Each client gets their own conversation, and it is clear who stays one to one.' },
      ],
      roiLine: 'The course promises no outcome. It gives a map, arithmetic and a plan — whether to use them is up to you.',
    },
    dreams: {
      label: '// what the next step can be',
      heading: 'Meetings for 2–7 people',
      items: [
        { niche: 'A mini-group of your clients', build: 'A few clients with a similar request at one meeting run by your method.' },
        { niche: 'A couple or a family', build: 'Two or three close people in one session: a shared request, a voice for each.' },
        { niche: 'Apprenticeship', build: 'A small cycle for those who want to learn the method themselves; on the ladder, the “few” step.' },
        { niche: 'Staying one to one', build: 'For those who need privacy and their own pace — one-to-one work without changes.' },
      ],
    },
    program: {
      sectionLabel: 'Course modules · four outputs',
    },
    venn: {
      label: '// the program',
      heading: 'What this\ncourse is about',
      items: [
        'Where your practice stands on the format ladder',
        'Signs of a ceiling and signs of “too early”',
        'What the client gets from the method and from the relationship',
        'The edge of competence and where to refer a client',
        'A method on one page',
        'The price of a working hour and the weekly limit',
        'The cycle, rescheduling and cancellations',
        'A first meeting for 2–7 people',
      ],
      excluded: [
        'teaching the practice itself',
        'therapy and supervision',
        'promises of income and clients',
        'medical and legal advice',
      ],
      inLabel1: 'WHAT',
      inLabel2: 'IS IN',
      outLabel1: 'WHAT',
      outLabel2: 'IS NOT',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// a step, not a ceiling.',
      mobileExcludedLabel: '// what is not in',
    },
    faq: {
      label: 'Questions',
      items: [
        { q: 'Does the course teach how to run sessions?', a: 'No. Other academy modules grow the practitioner’s craft. This course is about the one-to-one format itself and the way out of it.' },
        { q: 'So is working one to one worse than working with a group?', a: 'No. A higher step is not better than a lower one, and some clients stay one to one. The course helps you choose, not leave.' },
        { q: 'How much time does it take?', a: 'A lesson takes about ten minutes, 14 lessons in all. No deadlines and no reviewers.' },
        { q: 'Do I need to sign in to read?', a: 'No. The course is open without signing in. Sign in only so that your progress is saved on another device.' },
        { q: 'Is this medical or legal advice?', a: 'No. The lesson on the edge of competence draws on the codes of professional associations, dated “as of 2026-10”. Check them separately for your country.' },
        { q: 'Why is it free? What is the catch?', a: 'There is no catch: the whole course is free, with no “next levels” and no access tiers.' },
      ],
    },
    author: {
      label: 'About the author',
      name: 'Alexander\nMamaev',
      bio: 'I am assembling the Synergema School. This course is the bottom step of the format ladder: so that one-to-one work is the beginning of the path, not its limit.',
      cta: 'Leave feedback →',
    },
    sidebar: {
      label: 'Course lessons',
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
      pageHeading: 'Thoughts on\nthe course',
      pageSubtitle: 'Your feedback helps the course get more precise. A couple of minutes — and the text gets clearer for the next reader.',
      moduleLabel: 'Lesson',
      modulePlaceholder: 'Pick a lesson...',
      likertDisagree: 'Disagree',
      likertAgree: 'Agree',
      recommendLabel: 'I would suggest this course to someone who works with clients one to one',
      impactLabel: 'This text changed how I look at my practice',
      applyLabel: 'I know what first step to take toward a mini-group',
      unclearLabel: 'What was unclear or what would you like covered in more depth? (optional)',
      otherLabel: 'Anything else you want to say? (optional)',
      submitting: 'Sending...',
      submit: 'Send feedback →',
      successMessage: '✓ Thanks! Feedback sent.',
      errorMessage: 'Something went wrong, try again.',
      pageTitle: 'Feedback — One to One and Beyond',
      pageDescription: 'Feedback on the course',
      surveyHeading: 'How did the lesson read?',
      surveySkipHint: "You can skip any question — it's optional.",
    },
    retro: {
      heading: 'Graduate retro',
      subtitle: 'Four questions worth asking yourself at the finish line. Your answers go to us as feedback — you can download the "plan" and "before/after" for yourself right away.',
      beforeLabel: 'What could you do before the course?',
      afterLabel: 'What can you do now?',
      promptLabel: 'Best prompt of the course — the one that landed hardest',
      planLabel: 'Plan for the month: what you’ll apply first',
      reviewLabel: 'Course review',
      requiredError: 'Fill in this field',
      submitting: 'Sending…',
      submit: 'Send retro →',
      successMessage: '✓ Thanks! Retro saved.',
      errorMessage: 'Something went wrong, try again.',
      downloadAction: '↓ Download plan and before/after (.md)',
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
      title: '💻 This lesson is easier on a big screen',
      body: 'Lessons are long-form prose: a laptop or desktop makes for calmer reading. Everything works on mobile too.',
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
    admission: {
      eyebrow: 'entrance',
      checking: 'the door is recognizing you…',
      heading: 'This course opens after Tochka Sborki',
      body: [
        'You cannot sign up for the academy — you can only enter it. Not because we like closed doors: first assemble your point of assembly, then learn to move it.',
        'This course is open with no sign-in and no admission: its admission gate is switched off. The text stays in case it is switched on.',
      ],
      cta: 'Take Tochka Sborki →',
      ctaHref: 'https://ai.synergify.com/en/',
      returnHint: 'Already completed it? Sign in at ai.synergify.com and come back — the door will recognize you.',
    },
    wizard: {
      unit: (i: number, total: number) => `Lesson ${i} of ${total}`,
      back: '← Back',
      next: 'Next →',
      complete: 'Mark complete ✓',
      done: '● Done',
      nextUnit: 'Next lesson →',
      moduleComplete: 'Module done →',
      phases: ['Activation', 'Reflection', 'Concept', 'Practice'],
      appliedChallenge: 'Your step in your practice',
    },
    academy: {
      switcherLabel: 'academy',
      catalogTitle: 'Academy courses',
      comingSoon: 'coming soon',
    },
    footer: {
      tagline: 'One-to-one work as the first step: a map of your practice, a method, the limit of hours and price, a first step to a mini-group. No income promises; not therapy or advice.',
      topicsLabel: '// modules',
      resourcesLabel: '// resources',
      authorLabel: '// author',
      courseLabel: '// project',
      authorName: 'Alexander Mamaev',
      sendFeedback: 'Send feedback →',
      githubRepo: 'GitHub @master5d',
      viewSource: 'View source →',
      license: 'MIT',
      licenseFull: 'MIT License',
      rights: 'An open course. Read it, share it, map your own practice.',
      builtWith: 'Built with Claude Code',
      presentedBy: `Presented by ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ One to one',
      heading: 'Nothing\nhere',
      body: 'This page does not exist. Go back to the lessons — they are in place.',
      ctaHome: 'Home',
      ctaProgram: 'See lessons →',
    },
    login: {
      label: '⬡ Sign in',
      heading: 'Enter\nthe course',
      emailLabel: 'Email',
      telegramLabel: 'Telegram (optional)',
      telegramHint: "The bot will nudge you on Telegram if you fall behind on a lesson.",
      emailPlaceholder: 'your@email.com',
      telegramPlaceholder: '@telegram',
      submit: 'Get the link →',
      sending: 'Sending...',
      resend: 'Resend',
      changeEmail: '← Change email',
      sentConfirm: (email: string) => `✓ Link sent to ${email}. Check your inbox.`,
      defaultError: 'Something went wrong. Try again.',
      networkError: 'Network error. Check your connection.',
      invalidEmail: 'Enter a valid email address.',
      sendFailed: "Couldn't send the email. Try again in a minute.",
      rateLimited: 'Too many attempts. Wait a bit and try again.',
      redirectHint: 'Sign in, and the lesson will open.',
      footnote: 'No passwords. You get a link in your inbox — one click and you are in.',
      pageTitle: 'Sign in — One to One and Beyond',
      google: 'Continue with Google',
      or: 'or',
    },
    authGuard: {
      checking: 'Checking your sign-in…',
    },
    onboarding: {
      step: '⬡ Step 1 of 1',
      heading: 'How do you\nread best?',
      subtitle: 'A small display preference — you can change it at any time',
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
