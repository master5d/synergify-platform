import { describe, it, expect } from 'vitest'
import {
  TASK_KINDS, WEEK_MAP_MAX_TASK_CHARS, WEEK_MAP_MAX_TASKS, WEEK_MAP_MIN_TASKS,
  addTask, buildWeekRoute, classifyTask, decodeWeekMap, encodeWeekMap, normalizeTaskText, removeTask,
  setTaskBucket, weekMapFromAnswers, type TaskKind, type WeekTask,
} from './week-map'

const MODULES = Object.fromEntries(TASK_KINDS.map(k => [k, `mod-${k}`])) as Record<TaskKind, string>

function tasksOf(...texts: string[]): WeekTask[] {
  let t: WeekTask[] = []
  for (const x of texts) t = addTask(t, x).tasks
  return t
}

describe('normalizeTaskText', () => {
  it('trims and collapses whitespace', () => {
    expect(normalizeTaskText('  отвечать \n на   письма  ')).toBe('отвечать на письма')
  })
  it('rejects non-strings, blanks and inputs with fewer than two letters', () => {
    for (const bad of [undefined, null, 42, ['x'], '', '   ', '!!!', '123', '—', 'a', '5 !']) {
      expect(normalizeTaskText(bad), String(bad)).toBeNull()
    }
  })
  it('caps length and replaces the storage separator', () => {
    expect(normalizeTaskText('я'.repeat(500))!.length).toBe(WEEK_MAP_MAX_TASK_CHARS)
    expect(normalizeTaskText('посты | сторис')).toBe('посты / сторис')
  })
})

describe('classifyTask', () => {
  const cases: [string, TaskKind][] = [
    ['обновлять лендинг', 'building'],
    ['чинить баги в боте', 'building'],
    ['fix bugs in the app', 'building'],
    ['созвон с клиентом по понедельникам', 'meetings'],
    ['transcribe team calls', 'meetings'],
    ['записать клиентов в календарь', 'scheduling'],
    ['book appointments', 'scheduling'],
    ['конспект статей по теме', 'research'],
    ['research competitors', 'research'],
    ['еженедельный отчёт по продажам', 'data'],
    ['update the budget spreadsheet', 'data'],
    ['вести заметки и базу знаний', 'knowledge'],
    ['отвечать на заявки клиентов', 'communication'],
    ['reply to customer emails', 'communication'],
    ['писать посты в телеграм', 'writing'],
    ['draft the newsletter', 'writing'],
    ['медитировать', 'other'],
    ['walk the dog', 'other'],
  ]
  for (const [text, kind] of cases) it(`${text} → ${kind}`, () => expect(classifyTask(text)).toBe(kind))

  it('matches stems only at a word start (работа is not a bot, постоянно is not a post)', () => {
    expect(classifyTask('работа с командой')).toBe('other')
    expect(classifyTask('постоянно думать')).toBe('other')
    expect(classifyTask('apply for grants')).toBe('other')
  })
  it('is case- and ё-insensitive', () => {
    expect(classifyTask('ОТЧЁТ')).toBe('data')
  })
})

describe('addTask / setTaskBucket / removeTask', () => {
  it('adds unsorted tasks and never mutates the input', () => {
    const before: WeekTask[] = []
    const r = addTask(before, ' посты ')
    expect(r.rejected).toBeNull()
    expect(r.tasks).toEqual([{ text: 'посты', bucket: null }])
    expect(before).toEqual([])
  })
  it('rejects garbage and case-insensitive duplicates', () => {
    const t = tasksOf('Посты')
    expect(addTask(t, '???').rejected).toBe('empty')
    expect(addTask(t, 'посты').rejected).toBe('duplicate')
  })
  it(`stops at ${WEEK_MAP_MAX_TASKS} tasks`, () => {
    const t = tasksOf(...Array.from({ length: 10 }, (_, i) => `дело номер ${'абвгдежзик'[i]}`))
    expect(t).toHaveLength(WEEK_MAP_MAX_TASKS)
    expect(addTask(t, 'ещё одно дело').rejected).toBe('limit')
  })
  it('sets a bucket and removes by index; out-of-range is a no-op', () => {
    let t = tasksOf('посты', 'отчёт')
    t = setTaskBucket(t, 1, 'keep')
    expect(t[1].bucket).toBe('keep')
    expect(setTaskBucket(t, 9, 'ai_does')).toBe(t)
    expect(removeTask(t, 0).map(x => x.text)).toEqual(['отчёт'])
    expect(removeTask(t, -1)).toBe(t)
  })
})

describe('encode / decode', () => {
  it('round-trips, including unsorted tasks', () => {
    const t = setTaskBucket(tasksOf('посты', 'отчёт', 'созвоны'), 0, 'ai_helps')
    const enc = encodeWeekMap(t)
    expect(enc).toEqual(['ai_helps|посты', '-|отчёт', '-|созвоны'])
    expect(decodeWeekMap(enc)).toEqual(t)
  })
  it('tolerates garbage: non-arrays, junk entries, unknown buckets, duplicates, overflow', () => {
    expect(decodeWeekMap(undefined)).toEqual([])
    expect(decodeWeekMap('ai_does|посты')).toEqual([])
    expect(decodeWeekMap(7)).toEqual([])
    expect(decodeWeekMap(['без разделителя', 'ai_does|!!', 'boss|отчёт', 'keep|Отчёт', 'keep|созвоны'])).toEqual([
      { text: 'отчёт', bucket: null },
      { text: 'созвоны', bucket: 'keep' },
    ])
    const many = Array.from({ length: 12 }, (_, i) => `keep|задача ${'абвгдежзиклм'[i]}`)
    expect(decodeWeekMap(many)).toHaveLength(WEEK_MAP_MAX_TASKS)
  })
  it('reads from the shared answers dict under V_WEEK_MAP', () => {
    expect(weekMapFromAnswers({ V_WEEK_MAP: ['ai_does|посты'], V_NICHE: 'coach' })).toEqual([{ text: 'посты', bucket: 'ai_does' }])
    expect(weekMapFromAnswers({})).toEqual([])
  })
})

describe('buildWeekRoute', () => {
  it('empty → status empty', () => {
    expect(buildWeekRoute([], MODULES).status).toBe('empty')
  })
  it(`fewer than ${WEEK_MAP_MIN_TASKS} tasks → too_few, even when sorted`, () => {
    const t = setTaskBucket(setTaskBucket(tasksOf('посты', 'отчёт'), 0, 'ai_does'), 1, 'keep')
    expect(buildWeekRoute(t, MODULES).status).toBe('too_few')
  })
  it('enough tasks but one unsorted → unsorted, and it is left out of the items', () => {
    const t = setTaskBucket(setTaskBucket(tasksOf('посты', 'отчёт', 'созвоны'), 0, 'ai_does'), 1, 'ai_helps')
    const r = buildWeekRoute(t, MODULES)
    expect(r.status).toBe('unsorted')
    expect(r.unsortedCount).toBe(1)
    expect(r.items.map(i => i.text)).toEqual(['посты', 'отчёт'])
  })
  it('ready: items grouped by bucket order, each linked to the module of its kind — keep included', () => {
    let t = tasksOf('разговор с мамой', 'писать посты', 'еженедельный отчёт', 'созвон с командой')
    t = setTaskBucket(t, 0, 'keep')
    t = setTaskBucket(t, 1, 'ai_helps')
    t = setTaskBucket(t, 2, 'ai_does')
    t = setTaskBucket(t, 3, 'ai_helps')
    const r = buildWeekRoute(t, MODULES)
    expect(r.status).toBe('ready')
    expect(r.counts).toEqual({ ai_does: 1, ai_helps: 2, keep: 1 })
    expect(r.items).toEqual([
      { text: 'еженедельный отчёт', bucket: 'ai_does', kind: 'data', moduleSlug: 'mod-data' },
      { text: 'писать посты', bucket: 'ai_helps', kind: 'writing', moduleSlug: 'mod-writing' },
      { text: 'созвон с командой', bucket: 'ai_helps', kind: 'meetings', moduleSlug: 'mod-meetings' },
      { text: 'разговор с мамой', bucket: 'keep', kind: 'other', moduleSlug: 'mod-other' },
    ])
  })
  it('all tasks kept for yourself is a valid, ready route', () => {
    let t = tasksOf('посты', 'отчёт', 'созвоны')
    for (let i = 0; i < t.length; i++) t = setTaskBucket(t, i, 'keep')
    const r = buildWeekRoute(t, MODULES)
    expect(r.status).toBe('ready')
    expect(r.counts.keep).toBe(3)
  })
})
