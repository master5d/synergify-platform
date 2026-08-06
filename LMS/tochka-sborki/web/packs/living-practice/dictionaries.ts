// packs/living-practice/dictionaries.ts
// Полный интерфейс Dictionary эталона (32 компонента читают его через стаб lib/dictionaries.ts).
// Значения — под курс «Практика в живой связи»: соборный тон, де-hustle, ноль обещаний
// результата; практика не заменяет терапию, и словарь говорит это вслух.
// Pack может импортировать ПУБЛИЧНЫЕ модули движка (registry, типы); обратное — только стабы.
import { REGISTRY } from '../../lib/academy/registry'

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
      brand: 'Практика в живой связи',
      syllabus: 'Уроки',
      speedreading: 'Тренажёры',
      roadmap: 'Карта курса',
      cheatsheet: 'Памятка',
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
      tagline: '⬡ Курс академии · Бесплатно',
      titleLine1: 'Практика',
      titleLine2: 'в живой связи',
      slogan: 'Внимание — свет. Рядом должны быть люди.',
      subtitle: 'Практики внимания сегодня продаются как приложение: включил запись, подышал, закрыл вкладку. Этот курс — о несущей конструкции, которую такая упаковка убирает: о живом круге, где опыт можно произнести вслух и быть услышанным.',
      stats: [
        ['6', 'уроков'],
        ['~10', 'минут на урок'],
        ['0', 'обещаний'],
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
      { title: 'Практикуешь в одиночку — и что-то не так', body: 'Приложение отмечает дни подряд, дыхание послушное, а внутри тихо копится то, чему некуда деться. Это не твоя ошибка и не «недостаток дисциплины»: одиночному формату просто не хватает несущей детали — других людей.' },
      { title: 'Выбираешь курс или школу практики', body: 'Предложений много, упаковки красивые, и по описанию не отличить живой формат от мёртвого. Курс даёт короткий список вопросов, которые можно задать любой школе до того, как отдать ей своё время.' },
      { title: 'Обжёгся на «осознанности» из маркетплейса', body: 'Проходил программу, где вопросы уходили в пустоту, а всё трудное объявлялось твоей личной неисправностью. То, что тебе было там неуютно, — данные, а не диагноз. Здесь разобрано, как устроена такая упаковка.' },
      { title: 'Ведёшь группы и хочешь сверить конструкцию', body: 'Ты сам собираешь круги, классы или встречи. Пять признаков живого формата из пятого урока — удобная линейка, чтобы проверить собственную практику на властную вертикаль и страх выхода.' },
    ],
    forWhoTagline: 'Курс никого не зовёт «в путь трансформации». Он предлагает различать — а решение всегда остаётся твоим.',
    chatVsSystem: {
      label: '// запись vs круг',
      heading: 'Запись играет.\nКруг слышит.',
      hook: 'Аудио-медитация и живой круг выглядят как одна и та же практика. Разница проявляется в тот момент, когда практика срабатывает — и поднимает то, что было убрано.',
      chatColLabel: 'Одиночная запись',
      systemColLabel: 'Живой круг',
      rows: [
        { chat: 'Голос из наушников не заметит, что тебя качнуло', system: 'Живые люди рядом видят и могут выдержать это вместе с тобой' },
        { chat: 'Вопрос о методе уходит в форму обратной связи', system: 'Вопрос получает ответ по существу — или честное «не знаю»' },
        { chat: 'Дневник читает незнакомый проверяющий', system: 'Опыт произносится вслух и слышится без оценки' },
        { chat: 'Неудобное объявляется твоей неисправностью', system: 'Трудному отведено место — оно часть работы, а не сбой' },
      ],
    },
    beforeAfter: {
      label: '// различие',
      heading: 'Одна практика — две упаковки',
      beforeLabel: 'Мёртвая',
      afterLabel: 'Живая',
      items: [
        { before: 'Участников тысячи, но слова не дают никому: сессии — трансляция.', after: 'Группа малая — за встречу слово успевает взять каждый.' },
        { before: 'Сопровождающие меняются еженедельно, на вопросы приходит вежливая пустота.', after: 'Есть человек, который отвечает по существу и называет происхождение метода.' },
        { before: 'Обещан комфорт; всё трудное — «разбирайся самостоятельно».', after: 'Трудное ожидаемо и разделяемо; граница с терапией названа вслух.' },
      ],
      roiLine: 'Курс не обещает состояния и результата. Он даёт карту различий — пользоваться ею или нет, решаешь ты.',
    },
    dreams: {
      label: '// где живут круги',
      heading: 'Круг собирается где угодно',
      items: [
        { niche: 'Коллеги', build: 'Полчаса тишины и слово по кругу раз в неделю — без начальников и протокола.' },
        { niche: 'Родители', build: 'Круг тех, у кого дети одного возраста: практика и место сказать, что на самом деле трудно.' },
        { niche: 'Читатели', build: 'Книжный клуб, где после чтения не спорят о трактовках, а слушают опыт каждого.' },
        { niche: 'Соседи', build: 'Четыре человека из одного двора, чайник и заранее известный календарь встреч.' },
        { niche: 'Друзья по переписке', build: 'Видеозвонок по расписанию: та же структура круга работает и на расстоянии.' },
        { niche: 'Учебная группа', build: 'ИГИ-ритуал синергемы: карты-категории, четыре шага, слово у каждого.' },
      ],
    },
    program: {
      sectionLabel: 'Уроки курса · читаются подряд',
    },
    venn: {
      label: '// программа',
      heading: 'О чём\nэтот курс',
      items: [
        'Слепое пятно одиночной практики',
        'MBSR и групповой процесс как метод',
        'Чек-лист мёртвой практики: четыре органа',
        'Свидетельствование и граница с терапией',
        'Осознанность против закупорки и «бумерита»',
        'Пять правил живого круга',
        'ИГИ — ритуал группового инсайта',
        'Вопросы для выбора школы',
      ],
      excluded: [
        'обещаний результата',
        'замены психотерапии',
        'сверхспособностей и «уровней»',
        'секретных техник за доплату',
      ],
      inLabel1: 'ТО, ЧТО',
      inLabel2: 'БУДЕТ',
      outLabel1: 'ТО, ЧЕГО',
      outLabel2: 'НЕ БУДЕТ',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// различать, а не обещать.',
      mobileExcludedLabel: '// чего не будет',
    },
    faq: {
      label: 'Вопросы',
      items: [
        { q: 'Это курс медитации?', a: 'Нет. Техник здесь не преподают. Это карта различий: как отличить практику, которая встречает человека, от практики, которая его изолирует.' },
        { q: 'Заменяет ли это психотерапию?', a: 'Нет, и не пытается. Есть состояния, с которыми правильно идти к психотерапевту и врачу, — никакая практика этого похода не отменяет. Курс повторяет эту границу не раз.' },
        { q: 'Сколько времени занимает курс?', a: 'Шесть уроков по ~10 минут чтения. Без дедлайнов, без дневников, без проверяющих.' },
        { q: 'Что если мне не с кем собрать круг?', a: 'Это нормально и никуда не торопит. Курс читается и в одиночку — а пятый урок останется рядом до момента, когда трое-семеро живых людей найдутся.' },
        { q: 'Нужен ли опыт практики?', a: 'Нет. Курс полезен и тому, кто ещё выбирает первую школу, и тому, кто много лет практикует один и хочет понять, чего не хватает.' },
        { q: 'Почему бесплатно? Где подвох?', a: 'Подвоха нет: курс бесплатный целиком, без «следующих уровней» и ступеней доступа. Честная школа строит свою ненужность — этот курс пробует делать то же самое.' },
      ],
    },
    author: {
      label: 'Об авторе',
      name: 'Александр\nМамаев',
      bio: 'Собираю академию S.A.S.H.A. Этот курс — публичная часть разбора одного онлайн-курса осознанности: карта различий, оплаченная собственным временем.',
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
      recommendLabel: 'Я бы посоветовал(а) этот курс человеку, который выбирает школу практики',
      impactLabel: 'Этот текст изменил то, как я смотрю на форматы практики',
      applyLabel: 'Я понимаю, какие вопросы задать школе или кругу',
      unclearLabel: 'Что было непонятно или хотелось бы разобрать подробнее? (опционально)',
      otherLabel: 'Что ещё хочешь сказать? (опционально)',
      submitting: 'Отправляем...',
      submit: 'Отправить фидбек →',
      successMessage: '✓ Спасибо! Фидбек отправлен.',
      errorMessage: 'Что-то пошло не так, попробуй снова.',
      pageTitle: 'Фидбек — Практика в живой связи',
      pageDescription: 'Обратная связь по курсу',
      surveyHeading: 'Как прочитался урок?',
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
    wizard: {
      unit: (i: number, total: number) => `Урок ${i} из ${total}`,
      back: '← Назад',
      next: 'Далее →',
      complete: 'Отметить пройденным ✓',
      done: '● Пройдено',
      nextUnit: 'Следующий урок →',
      moduleComplete: 'Курс прочитан →',
      phases: ['Активация', 'Рефлексия', 'Концепция', 'Практика'],
      appliedChallenge: 'Твой шаг к кругу',
    },
    academy: {
      switcherLabel: 'академия',
      catalogTitle: 'Курсы академии',
      comingSoon: 'скоро',
    },
    footer: {
      tagline: 'Шесть уроков о том, почему честной практике внимания нужны другие люди. Без обещаний результата; практика не заменяет терапию.',
      topicsLabel: '// уроки',
      resourcesLabel: '// материалы',
      authorLabel: '// автор',
      courseLabel: '// проект',
      authorName: 'Александр Мамаев',
      sendFeedback: 'Оставить фидбек →',
      githubRepo: 'GitHub @master5d',
      viewSource: 'Посмотреть код →',
      license: 'MIT',
      licenseFull: 'MIT License',
      rights: 'Открытый курс. Читай, делись, собирай свой круг.',
      builtWith: 'Собрано с Claude Code',
      presentedBy: `Курс представлен ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Тишина',
      heading: 'Здесь\nпусто',
      body: 'Этой страницы не существует. Бывает: не всякая дверь ведёт в комнату. Вернись к урокам — они на месте.',
      ctaHome: 'На главную',
      ctaProgram: 'К урокам →',
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
      pageTitle: 'Вход — Практика в живой связи',
      google: 'Войти через Google',
      or: 'или',
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
      brand: 'Practice in Living Connection',
      syllabus: 'Lessons',
      speedreading: 'Trainers',
      roadmap: 'Course map',
      cheatsheet: 'Pocket list',
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
      tagline: '⬡ Academy course · Free',
      titleLine1: 'Practice in',
      titleLine2: 'Living Connection',
      slogan: 'Attention is light. People should be nearby.',
      subtitle: 'Attention practices are sold like an app these days: play the recording, breathe, close the tab. This course is about the load-bearing structure that packaging strips away — a living circle where experience can be spoken out loud and heard.',
      stats: [
        ['6', 'lessons'],
        ['~10', 'minutes each'],
        ['0', 'promises'],
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
      { title: 'You practice alone — and something is off', body: 'The app counts your streak, the breath is obedient, and yet something quietly piles up inside with nowhere to go. That is not your failure and not a "lack of discipline": the solitary format is simply missing a load-bearing part — other people.' },
      { title: 'You are choosing a course or a school', body: 'There are many offers, the packaging is beautiful, and from a description alone a living format is indistinguishable from a dead one. This course gives you a short list of questions to ask any school before giving it your time.' },
      { title: 'A marketplace "mindfulness" burned you once', body: 'You went through a program where questions fell into a void and everything difficult was declared your personal defect. That you felt uneasy there is data, not a diagnosis. Here the anatomy of that packaging is taken apart.' },
      { title: 'You lead groups and want to check the structure', body: 'You assemble circles, classes, or meetings yourself. The five marks of a living format from lesson five are a handy ruler for checking your own practice for a vertical of power and a frightening exit.' },
    ],
    forWhoTagline: 'The course does not call anyone onto a "transformation journey". It offers distinctions — the decision always stays yours.',
    chatVsSystem: {
      label: '// recording vs circle',
      heading: 'A recording plays.\nA circle hears.',
      hook: 'An audio meditation and a living circle look like the same practice. The difference shows at the moment the practice works — and brings up what had been put away.',
      chatColLabel: 'A solitary recording',
      systemColLabel: 'A living circle',
      rows: [
        { chat: 'The voice in your headphones will not notice you flinched', system: 'Living people nearby see it and can hold it together with you' },
        { chat: 'A question about the method goes into a feedback form', system: 'A question gets an answer in substance — or an honest "I don’t know"' },
        { chat: 'Your diary is read by an unfamiliar reviewer', system: 'Experience is spoken out loud and heard without evaluation' },
        { chat: 'The uncomfortable is declared your personal defect', system: 'The difficult has a place — it is part of the work, not a malfunction' },
      ],
    },
    beforeAfter: {
      label: '// the distinction',
      heading: 'One practice — two packagings',
      beforeLabel: 'Dead',
      afterLabel: 'Living',
      items: [
        { before: 'Thousands of participants, but no one gets the floor: sessions are a broadcast.', after: 'The group is small — everyone gets the floor within one meeting.' },
        { before: 'Facilitators rotate weekly; questions return a polite emptiness.', after: 'There is a person who answers in substance and names where the method comes from.' },
        { before: 'Comfort is promised; the difficult is sent off to "deal with on your own".', after: 'The difficult is expected and shared; the boundary with therapy is said out loud.' },
      ],
      roiLine: 'The course promises no state and no outcome. It gives a map of distinctions — whether to use it is up to you.',
    },
    dreams: {
      label: '// where circles live',
      heading: 'A circle can gather anywhere',
      items: [
        { niche: 'Colleagues', build: 'Half an hour of silence and the floor around the circle once a week — no bosses, no minutes.' },
        { niche: 'Parents', build: 'A circle of people whose kids are the same age: practice, and a place to say what is actually hard.' },
        { niche: 'Readers', build: 'A book club where, after reading, people do not argue interpretations but listen to each other’s experience.' },
        { niche: 'Neighbors', build: 'Four people from one courtyard, a kettle, and a meeting calendar known in advance.' },
        { niche: 'Distant friends', build: 'A scheduled video call: the same circle structure works across distance.' },
        { niche: 'A study group', build: 'The synergema IGI ritual: category cards, four steps, everyone gets the floor.' },
      ],
    },
    program: {
      sectionLabel: 'Course lessons · read in order',
    },
    venn: {
      label: '// program',
      heading: 'What this\ncourse is about',
      items: [
        'The blind spot of solitary practice',
        'MBSR and group process as the method',
        'The dead-practice checklist: four organs',
        'Witnessing and the boundary with therapy',
        'Awareness vs. sealing over and "Boomeritis"',
        'Five rules of a living circle',
        'IGI — the group-insight ritual',
        'Questions for choosing a school',
      ],
      excluded: [
        'promises of outcomes',
        'a substitute for psychotherapy',
        'superpowers and "levels"',
        'secret techniques for an extra fee',
      ],
      inLabel1: 'WHAT’S',
      inLabel2: 'IN',
      outLabel1: 'WHAT’S',
      outLabel2: 'OUT',
      scope: 'SCOPE',
      excludedLegend: 'EXCLUDED',
      provoc: '// distinguish, don’t promise.',
      mobileExcludedLabel: '// what’s out',
    },
    faq: {
      label: 'Questions',
      items: [
        { q: 'Is this a meditation course?', a: 'No. No techniques are taught here. It is a map of distinctions: how to tell a practice that meets a person from a practice that isolates one.' },
        { q: 'Does this replace psychotherapy?', a: 'No, and it does not try to. There are states with which the right move is to see a psychotherapist and a doctor — no practice cancels that visit. The course repeats this boundary more than once.' },
        { q: 'How much time does it take?', a: 'Six lessons of about 10 minutes of reading each. No deadlines, no diaries, no reviewers.' },
        { q: 'What if I have no one to form a circle with?', a: 'That is normal, and nothing hurries you. The course reads fine alone — and lesson five will stay right here until three to seven living people are found.' },
        { q: 'Do I need practice experience?', a: 'No. The course is useful both to someone still choosing a first school and to someone who has practiced alone for years and wants to see what has been missing.' },
        { q: 'Why free? What’s the catch?', a: 'No catch: the course is fully free, with no "next levels" and no tiers of access. An honest school builds its own unnecessity — this course tries to do the same.' },
      ],
    },
    author: {
      label: 'About the author',
      name: 'Alexander\nMamaev',
      bio: 'I am assembling the S.A.S.H.A academy. This course is the public part of a close reading of one online mindfulness course: a map of distinctions paid for with my own time.',
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
      recommendLabel: 'I would suggest this course to someone choosing a school of practice',
      impactLabel: 'This text changed how I look at practice formats',
      applyLabel: 'I know what questions to ask a school or a circle',
      unclearLabel: 'What was unclear or what would you like covered in more depth? (optional)',
      otherLabel: 'Anything else you want to say? (optional)',
      submitting: 'Sending...',
      submit: 'Send feedback →',
      successMessage: '✓ Thanks! Feedback sent.',
      errorMessage: 'Something went wrong, try again.',
      pageTitle: 'Feedback — Practice in Living Connection',
      pageDescription: 'Feedback on the course',
      surveyHeading: 'How did the lesson read?',
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
    wizard: {
      unit: (i: number, total: number) => `Lesson ${i} of ${total}`,
      back: '← Back',
      next: 'Next →',
      complete: 'Mark complete ✓',
      done: '● Done',
      nextUnit: 'Next lesson →',
      moduleComplete: 'Course read →',
      phases: ['Activation', 'Reflection', 'Concept', 'Practice'],
      appliedChallenge: 'Your step toward a circle',
    },
    academy: {
      switcherLabel: 'academy',
      catalogTitle: 'Academy courses',
      comingSoon: 'coming soon',
    },
    footer: {
      tagline: 'Six lessons on why an honest attention practice needs other people. No promised outcomes; practice does not replace therapy.',
      topicsLabel: '// lessons',
      resourcesLabel: '// resources',
      authorLabel: '// author',
      courseLabel: '// project',
      authorName: 'Alexander Mamaev',
      sendFeedback: 'Send feedback →',
      githubRepo: 'GitHub @master5d',
      viewSource: 'View source →',
      license: 'MIT',
      licenseFull: 'MIT License',
      rights: 'An open course. Read it, share it, assemble your circle.',
      builtWith: 'Built with Claude Code',
      presentedBy: `Presented by ${ORG}`,
    },
    notFound: {
      code: '404',
      label: '⬡ Silence',
      heading: 'Nothing\nhere',
      body: 'This page does not exist. It happens: not every door leads to a room. Go back to the lessons — they are in place.',
      ctaHome: 'Home',
      ctaProgram: 'See lessons →',
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
      pageTitle: 'Sign in — Practice in Living Connection',
      google: 'Continue with Google',
      or: 'or',
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
