// web/lib/intake/week-map.ts
//
// «Карта недели» — следующий под-шаг после «Стоит ли это вообще автоматизировать?»
// (BACKLOG.md, intake LMS#17, одобрено владельцем 2026-09-28). Тот шаг судит ОДНУ задачу
// по окупаемости; здесь ученик перечисляет 3–7 повторяющихся задач своей недели и сам
// раскладывает каждую по трём корзинам: «ИИ делает» / «ИИ помогает» / «оставляю себе».
// Каждая задача детерминированно (словарь основ, без LLM) относится к типу работы, тип —
// к модулю курса, где такую работу разбирают. Итог — «личный маршрут» по курсу.
//
// «Оставляю себе» — полноправный вердикт, а не провал: такие задачи тоже попадают в маршрут
// (со своим модулем — на случай, если однажды захочется отдать часть).
//
// Хранение — тот же `answers` анкеты (PATCH /api/intake/progress → intake_profiles.answers),
// один ключ V_WEEK_MAP со значением string[] (AnswerValue уже его допускает): каждая строка —
// `<корзина>|<текст задачи>`, корзина `-` — ещё не разложена. Новой таблицы/канала не заводим.
import type { AnswerValue, Answers } from './types'

export const WEEK_MAP_ANSWER_KEY = 'V_WEEK_MAP'
export const WEEK_MAP_MIN_TASKS = 3
export const WEEK_MAP_MAX_TASKS = 7
export const WEEK_MAP_MAX_TASK_CHARS = 120

export const WEEK_BUCKETS = ['ai_does', 'ai_helps', 'keep'] as const
export type WeekBucket = (typeof WEEK_BUCKETS)[number]

/** Тип работы — промежуточное звено «задача → модуль». Сам модуль выбирает pack. */
export const TASK_KINDS = [
  'building', 'meetings', 'scheduling', 'research', 'data', 'knowledge', 'communication', 'writing', 'other',
] as const
export type TaskKind = (typeof TASK_KINDS)[number]

export interface WeekTask {
  text: string
  /** null — задача добавлена, но ещё не разложена по корзинам. */
  bucket: WeekBucket | null
}

const BUCKET_SET = new Set<string>(WEEK_BUCKETS)
const UNSORTED_CODE = '-'
const SEP = '|'

/**
 * Основы слов по типам работы, в порядке приоритета: первый совпавший тип побеждает.
 * Порядок не случаен: «созвон с клиентом» — встречи, а не переписка; «конспект статьи» —
 * исследование, а не письмо; «отчёт» — данные, а не текст; «бот для ответов» — сборка.
 * Основа матчится только с начала слова (перед ней не буква) — иначе «бот» ловил бы «работу».
 * Основа с `=` на конце — целое слово (после неё тоже не буква): «app» не должен ловить
 * «appointment», «пост» — «постоянно».
 */
const KIND_STEMS: [TaskKind, string[]][] = [
  ['building', [
    'сайт', 'лендинг', 'код', 'программ', 'скрипт', 'бот', 'приложени', 'баг', 'верстк', 'деплой',
    'website', 'site=', 'sites=', 'landing', 'code=', 'coding', 'script', 'bot=', 'bots=', 'app=', 'apps=',
    'bug', 'deploy', 'program',
  ]],
  ['meetings', [
    'созвон', 'встреч', 'звонк', 'звонок', 'звонить', 'совещан', 'планерк', 'расшифр', 'транскри', 'аудио',
    'голосов', 'подкаст', 'протокол',
    'meeting', 'call=', 'calls=', 'transcri', 'audio', 'voice', 'podcast', 'minutes',
  ]],
  ['scheduling', [
    'календар', 'расписани', 'бронир', 'напомина', 'напомн', 'срм', 'crm', 'запись клиент', 'записать клиент',
    'calendar', 'schedul', 'booking', 'reminder', 'appointment',
  ]],
  ['research', [
    'исследова', 'поиск', 'найти', 'искать', 'изуч', 'прочит', 'читать', 'конспект', 'обзор', 'конкурент',
    'источник', 'мониторинг',
    'research', 'read=', 'reading', 'study', 'summar', 'competitor', 'source', 'monitor', 'literature',
  ]],
  ['data', [
    'отчет', 'таблиц', 'excel', 'эксел', 'цифр', 'данн', 'аналитик', 'статистик', 'бюджет', 'счет', 'учет',
    'бухгалт', 'метрик', 'выгрузк',
    'report', 'spreadsheet', 'sheet', 'data=', 'metric', 'analytics', 'invoice', 'budget', 'accounting',
    'numbers',
  ]],
  ['knowledge', [
    'заметк', 'база знаний', 'базу знаний', 'документац', 'инструкц', 'регламент', 'вики', 'wiki', 'notion',
    'obsidian',
    'note=', 'notes=', 'knowledge', 'documentation', 'docs=', 'sop=', 'sops=', 'manual',
  ]],
  ['communication', [
    'ответ', 'отвеч', 'переписк', 'сообщени', 'клиент', 'заявк', 'коммент', 'отзыв', 'чат', 'директ', 'почт',
    'письм', 'мейл', 'имейл',
    'reply', 'replies', 'respond', 'message', 'inbox', 'email', 'mail=', 'dm=', 'dms=', 'support', 'customer',
    'client', 'comment', 'review', 'chat',
  ]],
  ['writing', [
    'текст', 'пост=', 'посты=', 'постов=', 'поста=', 'посту=', 'постом=', 'посте=', 'стать', 'стате', 'рассылк',
    'описани', 'контент', 'копирайт', 'сценари', 'презентац', 'перевод', 'перевест', 'редакт', 'писать', 'написа',
    'post=', 'posts=', 'article', 'newsletter', 'copy=', 'copywriting', 'blog', 'write', 'writing', 'draft',
    'content', 'caption', 'presentation', 'translat', 'edit=', 'editing',
  ]],
]

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function stemRe(stem: string): string {
  return stem.endsWith('=') ? `${escapeRe(stem.slice(0, -1))}(?!\\p{L})` : escapeRe(stem)
}

const KIND_RES: [TaskKind, RegExp][] = KIND_STEMS.map(([kind, stems]) => [
  kind,
  new RegExp(`(?<!\\p{L})(?:${stems.map(stemRe).join('|')})`, 'u'),
])

/** Приводит ввод к виду для классификации: нижний регистр, ё → е, пробелы схлопнуты. */
function foldForMatch(text: string): string {
  return text.toLowerCase().replaceAll('ё', 'е').replace(/\s+/g, ' ')
}

/**
 * Чистит текст задачи. null — мусор: не строка, пусто, или меньше двух букв
 * («!!!», «123», «—»). Длинное обрезается до WEEK_MAP_MAX_TASK_CHARS.
 * Разделитель хранения `|` заменяется на `/`, чтобы кодирование было однозначным.
 */
export function normalizeTaskText(raw: unknown): string | null {
  if (typeof raw !== 'string') return null
  const text = raw.replace(/\s+/g, ' ').replaceAll(SEP, '/').trim().slice(0, WEEK_MAP_MAX_TASK_CHARS).trim()
  const letters = text.match(/\p{L}/gu)
  if (!letters || letters.length < 2) return null
  return text
}

/** Детерминированно относит задачу к типу работы; ничего не совпало — 'other'. */
export function classifyTask(text: string): TaskKind {
  const folded = foldForMatch(text)
  for (const [kind, re] of KIND_RES) if (re.test(folded)) return kind
  return 'other'
}

export type AddTaskRejection = 'empty' | 'duplicate' | 'limit'

function sameTask(a: string, b: string): boolean {
  return foldForMatch(a) === foldForMatch(b)
}

/** Добавляет задачу (без корзины). Не меняет входной массив. */
export function addTask(tasks: WeekTask[], raw: unknown): { tasks: WeekTask[]; rejected: AddTaskRejection | null } {
  if (tasks.length >= WEEK_MAP_MAX_TASKS) return { tasks, rejected: 'limit' }
  const text = normalizeTaskText(raw)
  if (text === null) return { tasks, rejected: 'empty' }
  if (tasks.some(t => sameTask(t.text, text))) return { tasks, rejected: 'duplicate' }
  return { tasks: [...tasks, { text, bucket: null }], rejected: null }
}

export function setTaskBucket(tasks: WeekTask[], index: number, bucket: WeekBucket): WeekTask[] {
  if (index < 0 || index >= tasks.length) return tasks
  return tasks.map((t, i) => (i === index ? { ...t, bucket } : t))
}

export function removeTask(tasks: WeekTask[], index: number): WeekTask[] {
  if (index < 0 || index >= tasks.length) return tasks
  return tasks.filter((_, i) => i !== index)
}

export function encodeWeekMap(tasks: WeekTask[]): string[] {
  return tasks.map(t => `${t.bucket ?? UNSORTED_CODE}${SEP}${t.text}`)
}

/**
 * Читает сохранённое значение обратно. Всё, что не похоже на наш формат (не массив, строка без
 * разделителя, мусорный текст, повтор), молча отбрасывается; неизвестная корзина → «не разложена»;
 * больше WEEK_MAP_MAX_TASKS — обрезается. Так ручная правка/старый формат не роняют шаг.
 */
export function decodeWeekMap(value: AnswerValue | undefined): WeekTask[] {
  if (!Array.isArray(value)) return []
  const out: WeekTask[] = []
  for (const entry of value) {
    if (out.length >= WEEK_MAP_MAX_TASKS) break
    if (typeof entry !== 'string') continue
    const at = entry.indexOf(SEP)
    if (at < 0) continue
    const code = entry.slice(0, at)
    const text = normalizeTaskText(entry.slice(at + 1))
    if (text === null || out.some(t => sameTask(t.text, text))) continue
    out.push({ text, bucket: BUCKET_SET.has(code) ? (code as WeekBucket) : null })
  }
  return out
}

export function weekMapFromAnswers(answers: Answers): WeekTask[] {
  return decodeWeekMap(answers[WEEK_MAP_ANSWER_KEY])
}

export interface WeekRouteItem {
  text: string
  bucket: WeekBucket
  kind: TaskKind
  moduleSlug: string
}

/**
 * empty    — задач нет (шаг необязательный, можно пропустить);
 * too_few  — меньше WEEK_MAP_MIN_TASKS: маршрут по одной-двум задачам — это не «неделя»;
 * unsorted — задач хватает, но не все разложены по корзинам;
 * ready    — маршрут готов.
 */
export type WeekRouteStatus = 'empty' | 'too_few' | 'unsorted' | 'ready'

export interface WeekRoute {
  status: WeekRouteStatus
  /** Только разложенные задачи, по корзинам (ai_does → ai_helps → keep), внутри — в порядке ввода. */
  items: WeekRouteItem[]
  unsortedCount: number
  counts: Record<WeekBucket, number>
}

export function buildWeekRoute(tasks: WeekTask[], moduleByKind: Record<TaskKind, string>): WeekRoute {
  const counts: Record<WeekBucket, number> = { ai_does: 0, ai_helps: 0, keep: 0 }
  const items: WeekRouteItem[] = []
  for (const bucket of WEEK_BUCKETS) {
    for (const t of tasks) {
      if (t.bucket !== bucket) continue
      const kind = classifyTask(t.text)
      items.push({ text: t.text, bucket, kind, moduleSlug: moduleByKind[kind] })
      counts[bucket]++
    }
  }
  const unsortedCount = tasks.filter(t => t.bucket === null).length
  const status: WeekRouteStatus =
    tasks.length === 0 ? 'empty'
      : tasks.length < WEEK_MAP_MIN_TASKS ? 'too_few'
        : unsortedCount > 0 ? 'unsorted'
          : 'ready'
  return { status, items, unsortedCount, counts }
}

/**
 * Маршрут для «Личного плана обучения» (страница персонажа): null — показывать нечего.
 * Блок есть, только если задач хотя бы WEEK_MAP_MIN_TASKS и хоть одна разложена; частично
 * разложенная карта даёт маршрут по разложенным (unsortedCount говорит, сколько осталось).
 */
export function planWeekRoute(tasks: WeekTask[], moduleByKind: Record<TaskKind, string>): WeekRoute | null {
  if (tasks.length < WEEK_MAP_MIN_TASKS) return null
  const route = buildWeekRoute(tasks, moduleByKind)
  return route.items.length > 0 ? route : null
}
