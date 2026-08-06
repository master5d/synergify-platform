import type { Locale } from '@/lib/intake/types'
import { resolveCaptionTrack, resolveTranscript, type CaptionTrack } from '@/lib/a11y/media'

interface Bi { ru: string; en: string }

export type CategoryKey =
  | 'co-thinking' | 'launch' | 'flow' | 'knowledge' | 'dictation' | 'platform' | 'for-good'

export type CatFilter = 'all' | CategoryKey

interface CategoryDef { key: CategoryKey; label: Bi }

export interface ResolvedCategory { key: CategoryKey; label: string }

// Stable display order. Every key referenced by >=1 case becomes a tab.
const CATEGORIES: CategoryDef[] = [
  { key: 'co-thinking', label: { ru: 'Со-мышление', en: 'Co-thinking' } },
  { key: 'launch',      label: { ru: 'Запуск',       en: 'Launch' } },
  { key: 'flow',        label: { ru: 'Поток',        en: 'Flow' } },
  { key: 'knowledge',   label: { ru: 'Знание',       en: 'Knowledge' } },
  { key: 'dictation',   label: { ru: 'Диктовка',     en: 'Dictation' } },
  { key: 'platform',    label: { ru: 'Платформа',    en: 'Platform' } },
  { key: 'for-good',    label: { ru: 'Во благо',      en: 'For good' } },
]

export const CATEGORY_KEYS: CategoryKey[] = CATEGORIES.map(c => c.key)

export function filterByCategory<T extends { category: CategoryKey }>(
  cases: T[], active: CatFilter,
): T[] {
  return active === 'all' ? cases : cases.filter(c => c.category === active)
}

export interface ShowcaseCase {
  id: string
  icon: string
  title: Bi
  blurb: Bi
  tag: Bi
  category: CategoryKey
  href?: string
}
export interface RealCase {
  id: string; icon: string; title: Bi; blurb: Bi; tag: Bi; category: CategoryKey
  result: Bi      // the "обернул во благо" payoff line
  author: Bi      // attribution
  deepDive?: string // blog slug → resolved to a locale-correct deep-dive URL in getShowcase
  href?: string   // escape hatch / legacy; deepDive takes precedence
}

/**
 * Чужие открытые проекты. Отдельный тип и отдельная секция — НЕ RealCase:
 * реальные истории принадлежат людям курса, и смешивать их с чужой работой
 * нельзя даже визуально. Поэтому здесь обязательны `source` (кто автор и под
 * какой лицензией) и внешняя ссылка, а категорий и фильтра нет.
 */
export interface OtherCase {
  id: string
  icon: string
  title: Bi
  blurb: Bi
  source: Bi
  href: string
}

interface ResolvedDream { id: string; icon: string; title: string; blurb: string; tag: string; category: CategoryKey; href?: string }
interface ResolvedReal extends ResolvedDream { result: string; author: string }
export interface ResolvedOther { id: string; icon: string; title: string; blurb: string; source: string; href: string }

export interface ShowcaseVM {
  label: string
  video: { source: VideoSource | null; poster: string | null; caption: string; captionTrack: CaptionTrack | null; transcript: string | null }
  real: { heading: string; cases: ResolvedReal[] }
  dream: { heading: string; cases: ResolvedDream[] }
  others: { heading: string; note: string; cases: ResolvedOther[] }
  categories: ResolvedCategory[]
  cta: string
}

const LABEL: Bi = { ru: 'Возможности', en: 'Possibilities' }
const REAL_HEADING: Bi = { ru: 'Реальные истории', en: 'Real stories' }
const DREAM_HEADING: Bi = { ru: 'О чём можно мечтать', en: 'What you can dream about' }
const OTHERS_HEADING: Bi = { ru: 'Что делают другие', en: 'What others are building' }
const OTHERS_NOTE: Bi = {
  ru: 'Чужие проекты с открытым кодом — не наши истории и не реклама. Показываем, чтобы было с чем сравнить свой замысел: открой, посмотри на устройство, забери подход.',
  en: 'Open-source projects built by other people — not our stories, not an endorsement. They are here so you have something to compare your own idea against: open one, look at how it is built, take the approach.',
}
const CTA: Bi = { ru: 'Начать свой путь →', en: 'Start your path →' }
const VIDEO: { url: string | null; poster: string | null; caption: Bi; captions: string | null; transcript: Bi | null } = {
  url: null,    // впиши YouTube/Vimeo watch-URL или путь к .mp4 — встроится автоматически
  poster: null, // путь к постеру в /public, например '/showcase-poster.jpg'
  caption: { ru: 'Короткий ролик о сути — скоро', en: 'A short film about the essence — coming soon' },
  captions: null,   // путь к .vtt в /public для self-hosted .mp4 (для embed субтитры — на стороне платформы)
  transcript: null, // { ru, en } полная расшифровка ролика — показывается раскрывающимся блоком
}

const DREAM_CASES: ShowcaseCase[] = [
  { id: 'partner', icon: '🤝',
    title: { ru: 'AI-напарник под твою нишу', en: 'An AI partner for your niche' },
    blurb: { ru: 'Не «сделай за меня», а со-мыслящий компаньон, который держит контекст твоего дела и двигает тебя думать.', en: 'Not a "do-it-for-me", but a co-thinking companion that holds the context of your work and moves you to think.' },
    tag: { ru: 'Со-мышление', en: 'Co-thinking' },
    category: 'co-thinking' },
  { id: 'weekend', icon: '🚀',
    title: { ru: 'Продукт за выходные', en: 'A product in a weekend' },
    blurb: { ru: 'От идеи до работающего прототипа — лендинг, бот, мини-сервис, — собранного с агентом за пару вечеров.', en: 'From idea to a working prototype — a landing page, a bot, a mini-service — built with an agent in a couple of evenings.' },
    tag: { ru: 'Запуск', en: 'Launch' },
    category: 'launch' },
  { id: 'routine', icon: '⚙️',
    title: { ru: 'Автоматизация рутины', en: 'Routine on autopilot' },
    blurb: { ru: 'Повторяющиеся задачи — отчёты, разборы, рассылки — уходят в пайплайн, который работает без тебя.', en: 'Repetitive tasks — reports, breakdowns, mailings — move into a pipeline that runs without you.' },
    tag: { ru: 'Поток', en: 'Flow' },
    category: 'flow' },
  { id: 'brain', icon: '🧠',
    title: { ru: 'Второй мозг', en: 'A second brain' },
    blurb: { ru: 'Твои заметки, источники и опыт — в граф знаний, который отвечает на вопросы и находит связи.', en: 'Your notes, sources, and experience — in a knowledge graph that answers questions and finds connections.' },
    tag: { ru: 'Знание', en: 'Knowledge' },
    category: 'knowledge' },
  { id: 'dictate', icon: '🎙️',
    title: { ru: 'Голос вместо клавиатуры', en: 'Voice instead of keyboard' },
    blurb: { ru: 'Наговори мысли — агент превратит их в текст, заметки, черновик.', en: 'Speak your thoughts — the agent turns them into text, notes, a draft.' },
    tag: { ru: 'Диктовка', en: 'Dictation' },
    category: 'dictation' },
  { id: 'tool', icon: '🧰',
    title: { ru: 'Свой маленький инструмент', en: 'Your own little tool' },
    blurb: { ru: 'Собери приложение под свою задачу, которым пользуешься каждый день.', en: 'Build an app for your own task that you use every day.' },
    tag: { ru: 'Платформа', en: 'Platform' },
    category: 'platform' },
  { id: 'orient', icon: '🔎',
    title: { ru: 'Разобраться в новой теме', en: 'Get oriented in a new field' },
    blurb: { ru: 'Из нуля до ориентации в незнакомой области через ИИ-исследование.', en: 'From zero to oriented in an unfamiliar area through AI research.' },
    tag: { ru: 'Знание', en: 'Knowledge' },
    category: 'knowledge' },
  { id: 'untangle', icon: '🧭',
    title: { ru: 'Распутать сложное', en: 'Untangle the hard stuff' },
    blurb: { ru: 'Продумать трудное решение вслух с напарником, который задаёт правильные вопросы.', en: 'Think through a tough decision out loud with a partner that asks the right questions.' },
    tag: { ru: 'Со-мышление', en: 'Co-thinking' },
    category: 'co-thinking' },
  { id: 'gift', icon: '🎁',
    title: { ru: 'Поделись своим даром', en: 'Share your gift' },
    blurb: { ru: 'Упакуй то, что умеешь, в гайд или мини-курс, который реально кому-то поможет.', en: 'Package what you know into a guide or mini-course that genuinely helps someone.' },
    tag: { ru: 'Запуск', en: 'Launch' },
    category: 'launch' },
  { id: 'conveyor', icon: '🌊',
    title: { ru: 'Конвейер инсайтов', en: 'An insight conveyor' },
    blurb: { ru: 'Источники, которые ты читаешь, сами приносят тебе суть — без ручного перелопачивания.', en: 'The sources you read bring you the essence themselves — no manual digging.' },
    tag: { ru: 'Поток', en: 'Flow' },
    category: 'flow' },
  { id: 'eco', icon: '🌱',
    title: { ru: 'Эко-дозор своего места', en: 'An eco-watch for your place' },
    blurb: { ru: 'Собери данные о среде вокруг — воздух, вода, свалки — в живую картину, которая двигает соседей к действию.', en: 'Gather data about your surroundings — air, water, dumping — into a living picture that moves your neighbours to act.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
  { id: 'rescue', icon: '🐾',
    title: { ru: 'Сеть спасения животных', en: 'An animal-rescue network' },
    blurb: { ru: 'В морозы координируй волонтёров: карта точек, быстрые оповещения, никто не потерян.', en: 'In a cold snap, coordinate volunteers: a map of spots, fast alerts, no one lost.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
  { id: 'pattern-shield', icon: '🛡️',
    title: { ru: 'Увидеть паттерн — назвать его', en: 'See the pattern — name it' },
    blurb: { ru: 'Помощник, который помогает человеку распознать разрушительный паттерн в отношениях и увидеть его со стороны.', en: 'A helper that lets a person recognize a destructive pattern in a relationship and see it from the outside.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
  { id: 'safe-path', icon: '🕊️',
    title: { ru: 'Навигатор помощи', en: 'A help navigator' },
    blurb: { ru: 'Для того, кто в трудной ситуации: куда обратиться рядом с домом, шаг за шагом, без осуждения.', en: 'For someone in a hard situation: where to turn near home, step by step, without judgment.' },
    tag: { ru: 'Во благо', en: 'For good' },
    category: 'for-good' },
]

const REAL_CASES: RealCase[] = [
  { id: 'echo', icon: '🎙️',
    title: { ru: 'Echo — голос вместо клавиатуры', en: 'Echo — voice instead of keyboard' },
    blurb: { ru: 'Десктоп-приложение локальной диктовки: говоришь — появляется текст, офлайн, RU/EN. Собрано vibe-кодингом: Tauri и Rust, распознавание локальными моделями.', en: 'A desktop dictation app: you speak, text appears — offline, RU/EN. Built by vibe-coding: Tauri and Rust, recognition by local models.' },
    tag: { ru: 'Диктовка', en: 'Dictation' },
    category: 'dictation',
    result: { ru: 'Письма, заметки и код теперь надиктовываю — печать ушла на второй план.', en: 'I now dictate emails, notes and code — typing took a back seat.' },
    author: { ru: 'Александр', en: 'Alexander' },
    deepDive: 'echo' },
  { id: 'lms', icon: '🧭',
    title: { ru: 'Точка Сборки — этот самый сайт', en: 'Tochka Sborki — this very site' },
    blurb: { ru: 'RPG-платформа курса с AI-ментором, картой мира и квестами — собрана тем же vibe-кодингом, которому учит.', en: 'The course RPG platform with an AI mentor, world map and quests — built with the same vibe-coding it teaches.' },
    tag: { ru: 'Платформа', en: 'Platform' },
    category: 'platform',
    result: { ru: 'Целый обучающий продукт собран в одиночку, без классической команды разработки.', en: 'A whole learning product built solo, without a classic dev team.' },
    author: { ru: 'Александр', en: 'Alexander' },
    deepDive: 'the-site-itself' },
  { id: 'canvas', icon: '🗺️',
    title: { ru: 'Канвас AI-диаграмм', en: 'AI diagramming canvas' },
    blurb: { ru: 'Один холст, где идея превращается в схему: генераторы работают в фоне, ты двигаешь смысл, а не рисуешь прямоугольники.', en: 'One canvas where an idea becomes a diagram: generators run in the background, you move meaning instead of drawing rectangles.' },
    tag: { ru: 'Запуск', en: 'Launch' },
    category: 'launch',
    result: { ru: 'Схемы, на которые уходил час в редакторе, рождаются за минуты.', en: 'Diagrams that took an hour in an editor now appear in minutes.' },
    author: { ru: 'Александр', en: 'Alexander' },
    deepDive: 'diagram-canvas' },
  { id: 'brain', icon: '🧠',
    title: { ru: 'Граф знаний — второй мозг', en: 'Knowledge graph — a second brain' },
    blurb: { ru: 'Заметки, источники и опыт собраны в граф, который отвечает на вопросы и находит связи между ними.', en: 'Notes, sources and experience gathered into a graph that answers questions and finds connections between them.' },
    tag: { ru: 'Знание', en: 'Knowledge' },
    category: 'knowledge',
    result: { ru: 'Перестал терять идеи — спрашиваю собственный архив как живого собеседника.', en: 'Stopped losing ideas — I query my own archive like a living interlocutor.' },
    author: { ru: 'Александр', en: 'Alexander' },
    deepDive: 'second-brain' },
]

/**
 * Живые подкаталоги awesome-llm-apps (Apache-2.0) — счётчики проверены по GitHub API
 * 2026-08-03. Числа стареют: при правке сверяйся с репозиторием, а не с этой строкой.
 */
const OTHER_CASES: OtherCase[] = [
  { id: 'starter-agents', icon: '🌱',
    title: { ru: 'Агенты-одиночки, с которых начинают', en: 'Starter single agents' },
    blurb: { ru: '16 небольших агентов целиком: разбор данных, чтение блога вслух, анализ резюме. Хороший масштаб для первого повторения своими руками.', en: '16 small complete agents: data analysis, reading a blog aloud, CV review. A good size to reproduce yourself first.' },
    source: { ru: 'awesome-llm-apps · Apache-2.0', en: 'awesome-llm-apps · Apache-2.0' },
    href: 'https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/starter_ai_agents' },
  { id: 'mcp-agents', icon: '🔌',
    title: { ru: 'Агенты поверх MCP', en: 'Agents built on MCP' },
    blurb: { ru: 'Тот самый протокол из модуля 7, но в чужих руках: агент в браузере, агент над GitHub, маршрутизатор между несколькими MCP-серверами.', en: 'The protocol from module 7 in other hands: a browser agent, a GitHub agent, a router across several MCP servers.' },
    source: { ru: 'awesome-llm-apps · Apache-2.0', en: 'awesome-llm-apps · Apache-2.0' },
    href: 'https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/mcp_ai_agents' },
  { id: 'rag-tutorials', icon: '📚',
    title: { ru: 'Поиск по своим данным', en: 'Retrieval over your own data' },
    blurb: { ru: '24 разбора агентного RAG на разных моделях и подходах — если строишь второй мозг, здесь видно, где у него обычно ломается точность.', en: '24 walkthroughs of agentic RAG across models and approaches — if you are building a second brain, this is where its accuracy usually breaks.' },
    source: { ru: 'awesome-llm-apps · Apache-2.0', en: 'awesome-llm-apps · Apache-2.0' },
    href: 'https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/rag_tutorials' },
  { id: 'voice-agents', icon: '🎧',
    title: { ru: 'Голосовые агенты', en: 'Voice agents' },
    blurb: { ru: 'Аудиогид, поддержка по телефону, разбор страхового случая живым разговором. Соседняя ветка к нашему модулю 6.', en: 'An audio tour guide, phone support, an insurance claim handled in live conversation. A neighbour to our module 6.' },
    source: { ru: 'awesome-llm-apps · Apache-2.0', en: 'awesome-llm-apps · Apache-2.0' },
    href: 'https://github.com/Shubhamsaboo/awesome-llm-apps/tree/main/voice_ai_agents' },
  { id: 'recipes', icon: '🧰',
    title: { ru: 'Каталог рецептов и руководств', en: 'A catalogue of recipes and guides' },
    blurb: { ru: 'Второй большой сборник — от простых чат-ботов до продвинутых агентов, с пошаговыми руководствами.', en: 'The second large collection — from simple chatbots to advanced agents, with step-by-step guides.' },
    source: { ru: 'awesome-ai-apps · MIT', en: 'awesome-ai-apps · MIT' },
    href: 'https://github.com/Arindam200/awesome-ai-apps' },
]

export function videoEmbedUrl(url: string | null): string | null {
  if (!url) return null
  const yt = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([\w-]+)/)
  if (yt) return `https://www.youtube-nocookie.com/embed/${yt[1]}`
  const vm = url.match(/vimeo\.com\/(\d+)/)
  if (vm) return `https://player.vimeo.com/video/${vm[1]}`
  return url
}

export interface VideoSource { kind: 'embed' | 'file'; src: string }

export function resolveVideoSource(url: string | null): VideoSource | null {
  if (!url) return null
  if (/\.(mp4|webm|ogg)(\?|#|$)/i.test(url)) return { kind: 'file', src: url }
  const embed = videoEmbedUrl(url)
  return embed ? { kind: 'embed', src: embed } : null
}

export function withAutoplay(embedUrl: string): string {
  return embedUrl + (embedUrl.includes('?') ? '&' : '?') + 'autoplay=1'
}

export function deepDiveUrl(slug: string, locale: Locale): string {
  const prefix = locale === 'en' ? '/en/blog/' : '/blog/'
  return `https://mamaev.coach${prefix}${slug}/`
}

export function getShowcase(locale: Locale): ShowcaseVM {
  const L: 'ru' | 'en' = locale === 'en' ? 'en' : 'ru'
  const used = new Set<CategoryKey>([...REAL_CASES, ...DREAM_CASES].map(c => c.category))
  return {
    label: LABEL[L],
    video: (() => {
      const source = resolveVideoSource(VIDEO.url)
      return {
        source, poster: VIDEO.poster, caption: VIDEO.caption[L],
        captionTrack: resolveCaptionTrack(source?.kind ?? 'embed', VIDEO.captions, L),
        transcript: resolveTranscript(VIDEO.transcript, L),
      }
    })(),
    real: {
      heading: REAL_HEADING[L],
      cases: REAL_CASES.map(c => ({ id: c.id, icon: c.icon, title: c.title[L], blurb: c.blurb[L], tag: c.tag[L], category: c.category, result: c.result[L], author: c.author[L], href: c.deepDive ? deepDiveUrl(c.deepDive, L) : c.href })),
    },
    dream: {
      heading: DREAM_HEADING[L],
      cases: DREAM_CASES.map(c => ({ id: c.id, icon: c.icon, title: c.title[L], blurb: c.blurb[L], tag: c.tag[L], category: c.category, href: c.href })),
    },
    others: {
      heading: OTHERS_HEADING[L],
      note: OTHERS_NOTE[L],
      cases: OTHER_CASES.map(c => ({ id: c.id, icon: c.icon, title: c.title[L], blurb: c.blurb[L], source: c.source[L], href: c.href })),
    },
    categories: CATEGORIES.filter(c => used.has(c.key)).map(c => ({ key: c.key, label: c.label[L] })),
    cta: CTA[L],
  }
}
