export type BotLocale = 'ru' | 'en'

export interface BotCopy {
  greeting: string
  openCourse: string
  continueIntro: string
  continueLabel: string
  openFirst: string
  finished: string
  hint: string
  nudgeIntro: string
  nudgeLabel: string
  stopAck: string
  startResub: string
  askPrompt: string
  askThanks: string
  askButton: string
  supportIntro: string
  supportButton: string
  storeIntro: string
  storeButton: string
  communityInviteLesson: string
  communityInviteAdmission: string
  communityWhere: string
  communityNote: string
  communityButton: string
  communityOffButton: string
  communityOffAck: string
  communityListIntro: string
  communityNone: string
}

const RU: BotCopy = {
  greeting: 'Привет! Это Точка Сборки — курс по agentic AI в потоке.\nНажми кнопку, чтобы открыть курс прямо здесь, в Telegram.',
  openCourse: '▶️ Открыть курс',
  continueIntro: 'Продолжаем с того места, где ты остановился.',
  continueLabel: '▶️ Продолжить',
  openFirst: 'Сначала открой курс — так я свяжу твой прогресс.',
  finished: '🎉 Ты прошёл все модули. Красавчик. Возвращайся за повторением в любой момент.',
  hint: 'Я подскажу, что дальше. Жми кнопку ниже.',
  nudgeIntro: 'Привет! Не теряем темп — у тебя есть незаконченный модуль. Продолжим?',
  nudgeLabel: '▶️ Продолжить',
  stopAck: 'Окей, больше не буду напоминать. Захочешь снова — отправь /start.',
  startResub: 'Снова на связи — буду мягко напоминать продолжить. Выключить в любой момент: /stop.',
  askPrompt: 'Напиши свой вопрос одним сообщением — передам куратору, а пока подскажу, где спросить своего AI.',
  askThanks: 'Спасибо, передал твой вопрос куратору. А пока — открой курс и спроси своего AI прямо в уроке.',
  askButton: '▶️ Открыть курс',
  supportIntro: 'Курс бесплатный и таким останется. Если хочешь поддержать автора — вот здесь:',
  supportButton: '❤️ Поддержать',
  storeIntro: 'Мерч и цифровые наборы проекта. Если что-то пригодится — вот витрина:',
  storeButton: '🛍 Магазин',
  communityInviteLesson: 'Первый урок позади. Учиться легче рядом с другими: там делятся практикой, задают вопросы и выкладывают записи живых встреч.',
  communityInviteAdmission: 'Ты в академии. У неё есть место, где встречаются ученики и мастера, — заходи, когда захочется.',
  communityWhere: 'Где:',
  communityNote: 'Приглашение одно — больше не напомню. Твои данные туда не передаются: вход — по ссылке, сам.',
  communityButton: '👥 Открыть сообщество',
  communityOffButton: 'Не присылать такое',
  communityOffAck: 'Понял — приглашений в сообщество больше не будет. Ссылки всегда здесь: /community.',
  communityListIntro: 'Где встречаются ученики:',
  communityNone: 'Сообщество курса ещё не открыто — как только появится, ссылка будет здесь: /community.',
}

const EN: BotCopy = {
  greeting: 'Hi! This is Tochka Sborki — a course on agentic AI, in flow.\nTap the button to open the course right here in Telegram.',
  openCourse: '▶️ Open course',
  continueIntro: 'Picking up right where you left off.',
  continueLabel: '▶️ Continue',
  openFirst: 'Open the course first — that links your progress.',
  finished: '🎉 You finished every module. Nicely done. Come back for a refresher anytime.',
  hint: "I'll point you to what's next. Tap the button below.",
  nudgeIntro: "Hey! Let's keep the momentum — you've got an unfinished module. Continue?",
  nudgeLabel: '▶️ Continue',
  stopAck: "Got it — I won't remind you anymore. Want them back? Send /start.",
  startResub: "Back on — I'll gently remind you to continue. Turn off anytime: /stop.",
  askPrompt: 'Send your question in one message — I\'ll pass it to the curator, and meanwhile point you to your own AI.',
  askThanks: 'Thanks — I\'ve passed your question to the curator. Meanwhile, open the course and ask your own AI right in the lesson.',
  askButton: '▶️ Open course',
  supportIntro: 'The course is free and stays free. If you’d like to support the creator — here:',
  supportButton: '❤️ Support',
  storeIntro: 'Project merch and digital kits. If something’s useful — here’s the store:',
  storeButton: '🛍 Store',
  communityInviteLesson: 'Your first lesson is done. Learning is easier next to others: people share their practice, ask questions and post recordings of live sessions.',
  communityInviteAdmission: "You're in the academy. It has a place where learners and masters meet — drop in whenever you like.",
  communityWhere: 'Where:',
  communityNote: "This is the only invite — I won't remind you. None of your data goes there: you join by the link yourself.",
  communityButton: '👥 Open the community',
  communityOffButton: "Don't send these",
  communityOffAck: 'Got it — no more community invites. The links are always here: /community.',
  communityListIntro: 'Where learners meet:',
  communityNone: "The course community isn't open yet — once it is, the link will be here: /community.",
}

// The force_reply prompts, locale-free — so the update parser can recognize a reply to "ask".
export const ASK_PROMPTS: string[] = [RU.askPrompt, EN.askPrompt]

export function botCopy(locale: BotLocale): BotCopy {
  return locale === 'en' ? EN : RU
}

// Map a Telegram language_code or stored users.language to a bot locale (RU default).
export function pickLocale(code: string | null | undefined): BotLocale {
  return (code ?? '').toLowerCase().startsWith('en') ? 'en' : 'ru'
}

export const NUDGE_VARIANTS: Record<BotLocale, string[]> = {
  ru: [
    'Привет! Не теряем темп — у тебя есть незаконченный модуль. Продолжим?',
    'Эй, пара минут найдётся? Следующий модуль ждёт — можно продолжить прямо сейчас.',
    'Без давления: когда будет настроение строить — твой курс на том же месте. Продолжим?',
    'Маленький шаг сегодня двигает дело. Открыть следующий модуль?',
    'Ты остановился на интересном. Готов вернуться к сборке?',
  ],
  en: [
    "Hey! Let's keep the momentum — you've got an unfinished module. Continue?",
    'Got a couple of minutes? Your next module is right where you left it — pick it up now?',
    'No pressure: whenever you feel like building, the course is in the same spot. Continue?',
    'A small step today moves the work. Open the next module?',
    'You stopped at a good part. Ready to get back to building?',
  ],
}

/** Deterministic daily rotation. seed = nowSec; the epoch-day index keeps consecutive
 *  daily nudges different and is stable for tests. */
export function pickNudge(locale: BotLocale, seed: number): string {
  const variants = NUDGE_VARIANTS[locale]
  const i = Math.floor(seed / 86400) % variants.length
  return variants[i]
}
