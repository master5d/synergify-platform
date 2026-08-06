// web/lib/intake/questions.v2.ts
// v2 instrument — short sensory core (LINGVÆTICA voice) + adaptive MBTI + optional depth.
// Every question is optional. Value keys for niche/skin/os reuse the canonical v1 enums
// so the RPG layer + companion consume the same fields. New question IDs never collide
// with v1 (A1..G12, OS). Scored by scoring-v2.ts, never by v1 scoring.ts.
import type { Question, ModuleIntro } from '../intake/types'

export const MODULE_INTROS_V2: ModuleIntro[] = [
  {
    id: 'V',
    title: { ru: 'Настройка поля', en: 'Tuning the field' },
    intro: {
      ru: 'Коротко и без экзамена. Несколько вопросов, чтобы собрать твоего напарника по со-мышлению под тебя. Любой можно пропустить — отвечай на то, что откликается.',
      en: "Short, no exam. A few questions to assemble your co-thinking partner around you. Skip any that don't resonate — answer what lands.",
    },
  },
  {
    id: 'VD',
    title: { ru: 'Точнее собрать персонажа', en: 'Sharpen your character' },
    intro: {
      ru: 'Пара минут — и атрибуты персонажа станут острее. Можно пропустить: тогда соберём по тому, что уже есть.',
      en: "A couple of minutes makes your character's attributes sharper. Skippable — we'll derive from what we already have.",
    },
  },
]

export const QUESTIONS_V2: Question[] = [
  {
    id: 'V_WHY', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Зачем тебе это — именно сейчас?', en: 'Why this — and why now?' },
    options: [
      { value: 'money_time', label: { ru: 'Деньги или время — практичный результат', en: 'Money or time — a practical result' } },
      { value: 'project', label: { ru: 'Есть проект, который давно хочу собрать', en: "There's a project I've wanted to build" } },
      { value: 'curiosity', label: { ru: 'Внутренний интерес, тянет разобраться', en: 'Inner pull, I want to get it' } },
      { value: 'community', label: { ru: 'Люди, общение, быть в потоке', en: 'People, connection, being in the flow' } },
      { value: 'edge', label: { ru: 'Не отстать, держать край', en: "To not fall behind, keep my edge" } },
    ],
  },
  {
    id: 'V_HOOK', module: 'V', format: 'multi', required: false,
    prompt: { ru: 'От чего внутри загорается?', en: 'What lights you up most?' },
    options: [
      { value: 'build', label: { ru: 'Собирать, делать вещи', en: 'Building, making things' } },
      { value: 'talk', label: { ru: 'Говорить, объяснять, вести', en: 'Talking, explaining, leading' } },
      { value: 'order', label: { ru: 'Наводить порядок в хаосе', en: 'Bringing order to chaos' } },
      { value: 'create', label: { ru: 'Создавать контент, образы', en: 'Creating content, images' } },
      { value: 'understand', label: { ru: 'Понимать, как всё устроено', en: 'Understanding how things work' } },
    ],
  },
  {
    id: 'V_NICHE', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Где ты себя видишь — твоя сфера?', en: 'Where do you see yourself — your field?' },
    options: [
      { value: 'coach', label: { ru: 'Коучинг, психология, сопровождение', en: 'Coaching, psychology, guidance' } },
      { value: 'massage', label: { ru: 'Тело, практики, массаж', en: 'Body, practices, bodywork' } },
      { value: 'astrology', label: { ru: 'Астрология, духовное', en: 'Astrology, spiritual' } },
      { value: 'content', label: { ru: 'Контент, блог, медиа', en: 'Content, blogging, media' } },
      { value: 'ecommerce', label: { ru: 'Торговля, продукты', en: 'Commerce, products' } },
      { value: 'service', label: { ru: 'Сервис, услуги (другое)', en: 'Service business (other)' } },
      { value: 'tech', label: { ru: 'Технологии, разработка', en: 'Tech, development' } },
      { value: 'other', label: { ru: 'Другое', en: 'Other' } },
    ],
  },
  {
    id: 'V_OUTCOME', module: 'V', format: 'text', required: false,
    prompt: {
      ru: 'Один результат от ИИ, который в ближайшие 60 дней принёс бы деньги или сэкономил время? Если пока не знаешь — пропусти, вернёмся к этому позже.',
      en: "One AI outcome that would make you money or save time in the next 60 days? If you don't know yet, skip it — we'll come back to it.",
    },
    placeholder: {
      ru: 'напр.: собрать лендинг · автоматизировать отчёты · писать посты быстрее',
      en: 'e.g.: build a landing page · automate reports · write posts faster',
    },
  },
  {
    id: 'V_RHYTHM', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Поймай свой ритм.', en: 'Catch your rhythm.' },
    options: [
      { value: 'suave', label: { ru: 'suave · мягко, без нажима', en: 'suave · soft, no pressure' } },
      { value: 'fuego', label: { ru: 'fuego · интенсивно, на огне', en: 'fuego · intense, on fire' } },
      { value: 'libre', label: { ru: 'libre · свободно, как пойдёт', en: 'libre · free, as it flows' } },
      { value: 'ritual', label: { ru: 'ritual · регулярно, по ритму', en: 'ritual · regular, on a beat' } },
    ],
  },
  {
    id: 'V_ERR', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Что с тобой делает ошибка?', en: 'What does a mistake do to you?' },
    options: [
      { value: 'calm', label: { ru: 'Спокойно, ошибка = настройка', en: 'Calmly — a mistake is just tuning' } },
      { value: 'lose_motivation', label: { ru: 'Падает мотивация', en: 'I lose motivation' } },
      { value: 'soft_feedback', label: { ru: 'Нужен мягкий фидбек', en: 'I need gentle feedback' } },
      { value: 'fix_immediately', label: { ru: 'Люблю сразу исправлять', en: 'I like to fix it right away' } },
    ],
  },
  {
    id: 'V_ATTN', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Сколько внимание держит, пока не устанет?', en: 'How long does attention hold before it tires?' },
    options: [
      { value: 'short', label: { ru: '3–5 минут', en: '3–5 minutes' } },
      { value: 'mid', label: { ru: '10–15 минут', en: '10–15 minutes' } },
      { value: 'long', label: { ru: '20+ минут', en: '20+ minutes' } },
    ],
  },
  {
    id: 'V_MODE', module: 'V', format: 'multi', required: false,
    prompt: { ru: 'Через что заходит легче всего?', en: 'What channel lands easiest?' },
    options: [
      { value: 'video', label: { ru: 'Видео', en: 'Video' } },
      { value: 'audio', label: { ru: 'Короткое аудио', en: 'Short audio' } },
      { value: 'visual', label: { ru: 'Визуал, схемы', en: 'Visuals, diagrams' } },
      { value: 'dialogue', label: { ru: 'Диалоги', en: 'Dialogue' } },
      { value: 'game', label: { ru: 'Игра, квесты', en: 'Game, quests' } },
    ],
  },
  {
    id: 'V_ANCHOR', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Что держит, когда хочется бросить?', en: 'What holds you when you want to quit?' },
    options: [
      { value: 'support', label: { ru: 'Поддержка', en: 'Support' } },
      { value: 'topics', label: { ru: 'Интересные темы', en: 'Interesting topics' } },
      { value: 'quick_wins', label: { ru: 'Быстрые победы', en: 'Quick wins' } },
      { value: 'structure', label: { ru: 'Чёткая структура', en: 'Clear structure' } },
      { value: 'freedom', label: { ru: 'Свобода выбора', en: 'Freedom of choice' } },
    ],
  },
  {
    id: 'V_MBTI_SR', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Знаешь свой психотип (MBTI)?', en: 'Do you know your MBTI type?' },
    options: [
      { value: 'INTJ', label: { ru: 'INTJ', en: 'INTJ' } }, { value: 'INTP', label: { ru: 'INTP', en: 'INTP' } },
      { value: 'ENTJ', label: { ru: 'ENTJ', en: 'ENTJ' } }, { value: 'ENTP', label: { ru: 'ENTP', en: 'ENTP' } },
      { value: 'INFJ', label: { ru: 'INFJ', en: 'INFJ' } }, { value: 'INFP', label: { ru: 'INFP', en: 'INFP' } },
      { value: 'ENFJ', label: { ru: 'ENFJ', en: 'ENFJ' } }, { value: 'ENFP', label: { ru: 'ENFP', en: 'ENFP' } },
      { value: 'ISTJ', label: { ru: 'ISTJ', en: 'ISTJ' } }, { value: 'ISFJ', label: { ru: 'ISFJ', en: 'ISFJ' } },
      { value: 'ESTJ', label: { ru: 'ESTJ', en: 'ESTJ' } }, { value: 'ESFJ', label: { ru: 'ESFJ', en: 'ESFJ' } },
      { value: 'ISTP', label: { ru: 'ISTP', en: 'ISTP' } }, { value: 'ISFP', label: { ru: 'ISFP', en: 'ISFP' } },
      { value: 'ESTP', label: { ru: 'ESTP', en: 'ESTP' } }, { value: 'ESFP', label: { ru: 'ESFP', en: 'ESFP' } },
      { value: 'unknown', label: { ru: 'Не знаю / не уверен — подскажите', en: "Don't know / not sure — guide me" } },
    ],
  },
  {
    id: 'V_MBTI_EI', module: 'V', format: 'single', required: false,
    showIf: { questionId: 'V_MBTI_SR', equals: 'unknown' },
    prompt: { ru: 'После плотного дня тебя заряжает…', en: 'After a full day, you recharge by…' },
    options: [
      { value: 'E', label: { ru: 'Быть среди людей', en: 'Being around people' } },
      { value: 'I', label: { ru: 'Побыть одному', en: 'Being on your own' } },
    ],
  },
  {
    id: 'V_MBTI_SN', module: 'V', format: 'single', required: false,
    showIf: { questionId: 'V_MBTI_SR', equals: 'unknown' },
    prompt: { ru: 'Тебе ближе…', en: 'You lean toward…' },
    options: [
      { value: 'S', label: { ru: 'Конкретика и факты', en: 'Concrete facts' } },
      { value: 'N', label: { ru: 'Идеи и возможности', en: 'Ideas and possibilities' } },
    ],
  },
  {
    id: 'V_MBTI_TF', module: 'V', format: 'single', required: false,
    showIf: { questionId: 'V_MBTI_SR', equals: 'unknown' },
    prompt: { ru: 'Решая, ты опираешься на…', en: 'Deciding, you rely on…' },
    options: [
      { value: 'T', label: { ru: 'Логику', en: 'Logic' } },
      { value: 'F', label: { ru: 'Ценности и людей', en: 'Values and people' } },
    ],
  },
  {
    id: 'V_MBTI_JP', module: 'V', format: 'single', required: false,
    showIf: { questionId: 'V_MBTI_SR', equals: 'unknown' },
    prompt: { ru: 'Тебе комфортнее, когда…', en: "You're more comfortable when…" },
    options: [
      { value: 'J', label: { ru: 'Есть план', en: "There's a plan" } },
      { value: 'P', label: { ru: 'Всё открыто', en: 'Things stay open' } },
    ],
  },
  {
    id: 'V_SKIN', module: 'V', format: 'single', required: false,
    prompt: { ru: 'В каком мире тебе дышится?', en: 'Which world do you breathe in?' },
    options: [
      { value: 'slavic-myth', label: { ru: 'Славянский миф', en: 'Slavic Myth' } },
      { value: 'dark-fantasy', label: { ru: 'Тёмное фэнтези', en: 'Dark Fantasy' } },
      { value: 'cyber-noir', label: { ru: 'Кибер-нуар', en: 'Cyber Noir' } },
      { value: 'space-opera', label: { ru: 'Космическая опера', en: 'Space Opera' } },
      { value: 'anime-quest', label: { ru: 'Аниме-квест', en: 'Anime Quest' } },
      { value: 'soviet-heroic', label: { ru: 'Советский героизм', en: 'Soviet Heroic' } },
      { value: 'mystic-arcane', label: { ru: 'Мистическая Аркана', en: 'Mystic Arcane' } },
    ],
  },
  {
    id: 'V_OS', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Твоя основная ОС?', en: 'Your main OS?' },
    options: [
      { value: 'mac', label: { ru: 'macOS', en: 'macOS' } },
      { value: 'windows', label: { ru: 'Windows', en: 'Windows' } },
      { value: 'linux', label: { ru: 'Linux', en: 'Linux' } },
    ],
  },
  {
    id: 'V_DEEPEN', module: 'V', format: 'single', required: false,
    prompt: { ru: 'Хочешь точнее собрать персонажа?', en: 'Want to sharpen your character?' },
    options: [
      { value: 'yes', label: { ru: 'Да, ещё пару минут', en: 'Yes, a couple more minutes' } },
      { value: 'no', label: { ru: 'Нет, достаточно', en: 'No, this is enough' } },
    ],
  },
  // ── Optional depth battery (showIf V_DEEPEN == yes), one per attribute axis ──
  {
    id: 'VD_INT', module: 'VD', format: 'single', required: false,
    showIf: { questionId: 'V_DEEPEN', equals: 'yes' },
    prompt: { ru: 'Насколько ты сейчас на «ты» с ИИ-инструментами?', en: 'How comfortable are you with AI tools today?' },
    options: [
      { value: 'never', label: { ru: 'Почти не трогал', en: 'Barely touched them' } },
      { value: 'basic', label: { ru: 'Базово, по чуть-чуть', en: 'Basics, a little' } },
      { value: 'scripts', label: { ru: 'Уверенно, делаю своё', en: 'Confident, build my own' } },
      { value: 'comfortable', label: { ru: 'Очень свободно', en: 'Very fluent' } },
    ],
  },
  {
    id: 'VD_WIS', module: 'VD', format: 'single', required: false,
    showIf: { questionId: 'V_DEEPEN', equals: 'yes' },
    prompt: { ru: 'Узнав что-то новое, ты…', en: 'After learning something new, you…' },
    options: [
      { value: 'do_now', label: { ru: 'Сразу пробуешь руками', en: 'Try it hands-on right away' } },
      { value: 'teach', label: { ru: 'Объясняешь кому-то', en: 'Explain it to someone' } },
      { value: 'notes', label: { ru: 'Записываешь для себя', en: 'Write it down' } },
      { value: 'review', label: { ru: 'Возвращаешься позже', en: 'Come back to it later' } },
    ],
  },
  {
    id: 'VD_CON', module: 'VD', format: 'single', required: false,
    showIf: { questionId: 'V_DEEPEN', equals: 'yes' },
    prompt: { ru: 'Как долго ты обычно держишь новую привычку?', en: 'How long do you usually keep a new habit?' },
    options: [
      { value: 'lt_week', label: { ru: 'Меньше недели', en: 'Less than a week' } },
      { value: 'w1_4', label: { ru: '1–4 недели', en: '1–4 weeks' } },
      { value: 'm1_3', label: { ru: '1–3 месяца', en: '1–3 months' } },
      { value: 'm6_plus', label: { ru: 'Полгода и дольше', en: 'Six months or more' } },
    ],
  },
  {
    id: 'VD_DEX', module: 'VD', format: 'single', required: false,
    showIf: { questionId: 'V_DEEPEN', equals: 'yes' },
    prompt: { ru: 'Сколько часов в неделю реально есть на это?', en: 'Realistic hours per week for this?' },
    options: [
      { value: 'lt2h', label: { ru: 'Меньше 2', en: 'Under 2' } },
      { value: 'h2_5', label: { ru: '2–5', en: '2–5' } },
      { value: 'h5_plus', label: { ru: '5+', en: '5+' } },
    ],
  },
  {
    id: 'VD_STR', module: 'VD', format: 'single', required: false,
    showIf: { questionId: 'V_DEEPEN', equals: 'yes' },
    prompt: { ru: 'Ты работаешь один или с командой?', en: 'Solo or with a team?' },
    options: [
      { value: 'solo', label: { ru: 'Полностью один', en: 'Fully solo' } },
      { value: 'helpers', label: { ru: '1–2 помощника', en: '1–2 helpers' } },
      { value: 'small', label: { ru: 'Команда 3–10', en: 'Team of 3–10' } },
      { value: 'large', label: { ru: 'Крупная организация', en: 'Larger org' } },
    ],
  },
]