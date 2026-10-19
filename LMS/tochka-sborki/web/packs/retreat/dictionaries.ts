// packs/retreat/dictionaries.ts
// Полный интерфейс Dictionary эталона (32 компонента читают его через стаб lib/dictionaries.ts).
// Значения — под курс «Ретрит с двух сторон»: спокойный тон, де-hustle, ноль обещаний дохода
// и полной группы; курс не юридическая консультация, и словарь говорит это вслух.
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
      brand: 'Ретрит с двух сторон',
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
      titleLine1: 'Ретрит',
      titleLine2: 'с двух сторон',
      slogan: 'Одна сделка. Две стороны. Один риск пустого места.',
      subtitle: 'Ретрит обычно считают с одной стороны: ведущий — свою цену, площадка — свою ставку. Здесь одна сделка разобрана глазами обоих: деньги во времени, договор, отмены и недобор группы, программа и гости. Общее ядро, потом твой путь — ведущего или площадки. Цифры проверяются в калькуляторе.',
      stats: [
        ['24', 'урока'],
        ['2', 'пути'],
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
      { title: 'Ты ведущий и собираешь первый ретрит', body: 'Ты ведёшь занятия или выезды на день и хочешь первую неделю с группой. Путь ведущего: модули 01–04 — от цены и кассы до программы, гостей и дня отъезда.' },
      { title: 'Ты уже провёл ретрит и не заработал', body: 'Группа приехала, а денег не осталось: курс валют, соведущий без договора, отмены. Ядро курса показывает, в какой строке сделки утекли деньги.' },
      { title: 'У тебя площадка, и ты хочешь принимать группы', body: 'Гостевой дом, глэмпинг или центр на 10–30 мест. Путь площадки: модули 01, 02, 05, 06 — пакет и ставка, загрузка года, окупаемость, выбор ведущих.' },
      { title: 'Ты только думаешь строить ретрит-центр', body: 'До вложений полезно увидеть, как таблица окупаемости обманывает своего автора. Модуль 05 разбирает восемь таких ошибок на учебной модели.' },
    ],
    forWhoTagline: 'Курс не обещает дохода и полной группы. Он показывает, где сделка теряет деньги, — решение всегда остаётся твоим.',
    chatVsSystem: {
      label: '// одна сторона vs две',
      heading: 'Своя сторона считает цену.\nДве стороны видят риск.',
      hook: 'Ведущий и площадка смотрят на одну группу, но называют её недобор разными словами. Разница видна в тот день, когда гостей оказалось меньше.',
      chatColLabel: 'Счёт с одной стороны',
      systemColLabel: 'Сделка с двух сторон',
      rows: [
        { chat: 'Цена списана у похожих ретритов', system: 'Цена выведена из желаемой прибыли и часов подготовки' },
        { chat: 'Площадка забронирована до первых предоплат', system: 'Платежи гостей приходят раньше платежей площадке' },
        { chat: 'Правила отмены для гостей мягче, чем у площадки', system: 'Два календаря отмен сверены, дыра видна заранее' },
        { chat: 'Пустые места «как-нибудь закроются»', system: 'Заранее ясно, кто несёт каждое пустое место' },
      ],
    },
    beforeAfter: {
      label: '// различие',
      heading: 'Одна сделка — два способа её вести',
      beforeLabel: 'Наугад',
      afterLabel: 'С расчётом',
      items: [
        { before: '«Прибыль» = цена минус ставка, умноженные на гостей.', after: 'Честная прибыль: с эквайрингом, забытыми строками и безубыточностью в гостях.' },
        { before: '«Невозвратный депозит» — значит, оставлю себе всё.', after: 'Удержание соразмерно реальным потерям и привязано к датам площадки.' },
        { before: 'О диетах и рейсах спрашивают на месте.', after: 'Анкета, меню и лист прибытия готовы до заезда.' },
      ],
      roiLine: 'Курс не обещает результата. Он даёт расчёт и вопросы к договору — пользоваться ими или нет, решаешь ты.',
    },
    dreams: {
      label: '// какие бывают сделки',
      heading: 'Модели договора',
      items: [
        { niche: 'Полный кампус', build: 'Ведущий платит за все места кампуса: площадке — гарантированная выручка, ведущему — риск пустых мест.' },
        { niche: 'Оплата за гостя', build: 'Ставка за каждого гостя с минимумом группы: риск недобора делится.' },
        { niche: 'Выкуп', build: 'Фиксированная сумма за площадку на даты: ведущий знает расход заранее.' },
        { niche: 'Бесплатное место', build: 'Площадка даёт ведущему место бесплатно, когда группа набрана до порога.' },
        { niche: 'Пакет с питанием', build: 'Ставка включает полный пансион: меню согласуют до заезда.' },
        { niche: 'Экспедиция', build: 'Группа переезжает между местами: у каждого места свои условия и даты.' },
      ],
    },
    program: {
      sectionLabel: 'Модули курса · ядро, потом твой путь',
    },
    venn: {
      label: '// программа',
      heading: 'О чём\nэтот курс',
      items: [
        'Модели договора ведущего и площадки',
        'Одна сделка в калькуляторе с двух сторон',
        'Касса во времени и кассовый разрыв',
        'Два календаря отмен и недобор группы',
        'Когда ретрит становится пакетным туром',
        'Честная карточка практики и сетка дней',
        'Анкета гостя, меню и логистика прибытия',
        'Загрузка и окупаемость площадки',
      ],
      excluded: [
        'обещаний дохода',
        'гарантии полной группы',
        'юридической консультации',
        'рейтинга площадок и ведущих',
      ],
      inLabel1: 'ТО, ЧТО',
      inLabel2: 'БУДЕТ',
      outLabel1: 'ТО, ЧЕГО',
      outLabel2: 'НЕ БУДЕТ',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// считать, а не обещать.',
      mobileExcludedLabel: '// чего не будет',
    },
    faq: {
      label: 'Вопросы',
      items: [
        { q: 'Это курс о продажах ретритов?', a: 'Нет. Курс разбирает экономику, договор, отмены, программу и гостей. Как найти своего гостя — один юнит, без приёмов давления и без обещаний.' },
        { q: 'Это юридическая консультация?', a: 'Нет. Нормы об отменах и пакетных турах даны с источником и датой «по состоянию на 2026-10». Для своей страны их проверяют у юриста.' },
        { q: 'Сколько времени занимает курс?', a: 'Урок — около десяти минут. Путь ведущего — 20 уроков, путь площадки — 15. Без дедлайнов и без проверяющих.' },
        { q: 'Нужно ли входить, чтобы читать?', a: 'Нет. Курс открыт без входа. Вход нужен только чтобы прогресс сохранился на другом устройстве.' },
        { q: 'Нужна ли финансовая подготовка?', a: 'Нет. Вся арифметика идёт в калькуляторе ретрита академии, а уроки объясняют, что значит каждая строка.' },
        { q: 'Почему бесплатно? Где подвох?', a: 'Подвоха нет: курс бесплатный целиком, без «следующих уровней» и ступеней доступа.' },
      ],
    },
    author: {
      label: 'Об авторе',
      name: 'Александр\nМамаев',
      bio: 'Собираю школу синергемы. Этот курс — разбор ретрита как сделки двух сторон: так, чтобы ведущий и площадка считали один и тот же риск.',
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
      recommendLabel: 'Я бы посоветовал(а) этот курс человеку, который собирает или принимает ретрит',
      impactLabel: 'Этот текст изменил то, как я считаю сделку ретрита',
      applyLabel: 'Я понимаю, какие вопросы задать другой стороне договора',
      unclearLabel: 'Что было непонятно или хотелось бы разобрать подробнее? (опционально)',
      otherLabel: 'Что ещё хочешь сказать? (опционально)',
      submitting: 'Отправляем...',
      submit: 'Отправить фидбек →',
      successMessage: '✓ Спасибо! Фидбек отправлен.',
      errorMessage: 'Что-то пошло не так, попробуй снова.',
      pageTitle: 'Фидбек — Ретрит с двух сторон',
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
      returnHint: 'Уже прошёл? Войди на ai.synergify.com под своим входом и вернись — дверь узнает тебя.',
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
      appliedChallenge: 'Твой шаг по сделке',
    },
    academy: {
      switcherLabel: 'академия',
      catalogTitle: 'Курсы академии',
      comingSoon: 'скоро',
    },
    footer: {
      tagline: 'Ретрит как сделка ведущего и площадки: касса, договор, отмены, программа, гости. Без обещаний дохода; не юридическая консультация.',
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
      rights: 'Открытый курс. Читай, делись, считай свою сделку.',
      builtWith: 'Собрано с Claude Code',
      presentedBy: `Курс представлен ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Ретрит',
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
      pageTitle: 'Вход — Ретрит с двух сторон',
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
      brand: 'A Retreat From Both Sides',
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
      titleLine1: 'A Retreat',
      titleLine2: 'From Both Sides',
      slogan: 'One deal. Two sides. One risk of an empty place.',
      subtitle: 'A retreat is usually counted from one side: the leader counts their price, the venue its rate. Here one deal is taken apart through the eyes of both: money over time, the contract, cancellations and a short group, the program and the guests. A shared core, then your path — the leader or the venue. The numbers are checked in the calculator.',
      stats: [
        ['24', 'lessons'],
        ['2', 'paths'],
        ['0', 'income promises'],
        ['$0', 'cost'],
      ],
      cta: 'See lessons ↓',
      ctaSecondary: '→ Sign in',
      ctaSecondaryAuthed: '→ Continue course',
      ctaTry: '→ Just read it',
    },
    forWhoLabel: 'Who it’s for',
    forWhoHeading: 'This course is for you if...',
    forWho: [
      { title: 'You lead and are putting together a first retreat', body: 'You run classes or day trips and want a first week with a group. The leader path: modules 01–04 — from price and cash to the program, the guests and the day of departure.' },
      { title: 'You have run a retreat and did not earn', body: 'The group came, and no money was left: the exchange rate, a co-leader without a contract, cancellations. The core of the course shows which line of the deal the money leaked from.' },
      { title: 'You have a venue and want to host groups', body: 'A guesthouse, a glamping site or a centre for 10–30 people. The venue path: modules 01, 02, 05, 06 — package and rate, the year’s occupancy, payback, choosing leaders.' },
      { title: 'You are only thinking of building a retreat centre', body: 'Before investing, it helps to see how a payback spreadsheet deceives its author. Module 05 takes eight such mistakes apart on a teaching model.' },
    ],
    forWhoTagline: 'The course promises no income and no full group. It shows where a deal loses money — the decision always stays yours.',
    chatVsSystem: {
      label: '// one side vs two',
      heading: 'One side counts the price.\nTwo sides see the risk.',
      hook: 'The leader and the venue look at the same group but call its shortfall by different names. The difference shows on the day fewer guests turn up.',
      chatColLabel: 'Counting from one side',
      systemColLabel: 'The deal from both sides',
      rows: [
        { chat: 'The price is copied from similar retreats', system: 'The price is derived from the profit you want and the hours of preparation' },
        { chat: 'The venue is booked before the first deposits', system: 'Guest payments arrive before the venue payments' },
        { chat: 'Guest cancellation terms are softer than the venue’s', system: 'The two cancellation calendars are lined up, and the gap shows in advance' },
        { chat: 'Empty places "will sort themselves out somehow"', system: 'It is clear in advance who carries each empty place' },
      ],
    },
    beforeAfter: {
      label: '// the distinction',
      heading: 'One deal — two ways to run it',
      beforeLabel: 'By guesswork',
      afterLabel: 'By the numbers',
      items: [
        { before: '"Profit" = price minus rate, times guests.', after: 'Honest profit: with card fees, forgotten lines and break-even in guests.' },
        { before: '"Non-refundable deposit" means I keep it all.', after: 'What you keep matches your real losses and is tied to the venue’s dates.' },
        { before: 'Diets and flights are asked about on arrival.', after: 'The form, the menu and the arrivals list are ready before check-in.' },
      ],
      roiLine: 'The course promises no outcome. It gives arithmetic and questions for the contract — whether to use them is up to you.',
    },
    dreams: {
      label: '// what deals look like',
      heading: 'Contract models',
      items: [
        { niche: 'Full campus', build: 'The leader pays for every place on the campus: the venue gets guaranteed revenue, the leader carries the empty places.' },
        { niche: 'Per guest', build: 'A rate for each guest with a minimum group: the risk of a short group is shared.' },
        { niche: 'Buyout', build: 'A fixed sum for the venue on the dates: the leader knows the cost in advance.' },
        { niche: 'Free place', build: 'The venue gives the leader a free place once the group reaches a threshold.' },
        { niche: 'Package with meals', build: 'The rate includes full board: the menu is agreed before check-in.' },
        { niche: 'Expedition', build: 'The group moves between places: each place has its own terms and dates.' },
      ],
    },
    program: {
      sectionLabel: 'Course modules · the core, then your path',
    },
    venn: {
      label: '// program',
      heading: 'What this\ncourse is about',
      items: [
        'Contract models between leader and venue',
        'One deal in the calculator from both sides',
        'Cash over time and the cash gap',
        'Two cancellation calendars and a short group',
        'When a retreat becomes a package holiday',
        'An honest practice card and a grid of days',
        'The guest form, the menu and arrivals logistics',
        'Venue occupancy and payback',
      ],
      excluded: [
        'income promises',
        'a guaranteed full group',
        'legal advice',
        'a ranking of venues and leaders',
      ],
      inLabel1: 'WHAT’S',
      inLabel2: 'IN',
      outLabel1: 'WHAT’S',
      outLabel2: 'OUT',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// calculate, don’t promise.',
      mobileExcludedLabel: '// what’s out',
    },
    faq: {
      label: 'Questions',
      items: [
        { q: 'Is this a course on selling retreats?', a: 'No. The course works through economics, the contract, cancellations, the program and the guests. Finding your guest is one lesson, with no pressure tactics and no promises.' },
        { q: 'Is this legal advice?', a: 'No. The rules on cancellations and package holidays come with a source and the date "as of 2026-10". For your country you check them with a lawyer.' },
        { q: 'How much time does it take?', a: 'A lesson takes about ten minutes. The leader path is 20 lessons, the venue path 15. No deadlines and no reviewers.' },
        { q: 'Do I need to sign in to read?', a: 'No. The course is open with no sign-in. Signing in only keeps your progress on another device.' },
        { q: 'Do I need a finance background?', a: 'No. All the arithmetic runs in the academy retreat calculator, and the lessons explain what each line means.' },
        { q: 'Why free? What’s the catch?', a: 'No catch: the course is fully free, with no "next levels" and no tiers of access.' },
      ],
    },
    author: {
      label: 'About the author',
      name: 'Alexander\nMamaev',
      bio: 'I am assembling the Synergema School. This course takes a retreat apart as a deal between two sides, so that the leader and the venue count the same risk.',
      cta: 'Send feedback →',
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
      recommendLabel: 'I would suggest this course to someone putting together or hosting a retreat',
      impactLabel: 'This text changed how I count a retreat deal',
      applyLabel: 'I know what questions to ask the other side of the contract',
      unclearLabel: 'What was unclear or what would you like covered in more depth? (optional)',
      otherLabel: 'Anything else you want to say? (optional)',
      submitting: 'Sending...',
      submit: 'Send feedback →',
      successMessage: '✓ Thanks! Feedback sent.',
      errorMessage: 'Something went wrong, try again.',
      pageTitle: 'Feedback — A Retreat From Both Sides',
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
      appliedChallenge: 'Your step on the deal',
    },
    academy: {
      switcherLabel: 'academy',
      catalogTitle: 'Academy courses',
      comingSoon: 'coming soon',
    },
    footer: {
      tagline: 'A retreat as a deal between the leader and the venue: cash, contract, cancellations, program, guests. No income promises; not legal advice.',
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
      rights: 'An open course. Read it, share it, run the numbers on your deal.',
      builtWith: 'Built with Claude Code',
      presentedBy: `Presented by ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Retreat',
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
      pageTitle: 'Sign in — A Retreat From Both Sides',
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
