# Учебная связка (цели → «проверь себя» → гвард) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Каждый модуль каждого pack'а объявляет 3–5 целей и вопросы «проверь себя», движок их показывает, гвард constructive alignment держит связку цель ↔ вопрос.

**Architecture:** Данные — в `_meta.json` модуля (`objectives`, `checks`), в MDX урока только метка `<SelfCheck id="…"/>`. Проверка связки — чистая функция `validateModuleAlignment` (`lib/content/alignment.ts`), которую гоняет тест по активному pack'у; раскатка — храповиком `PENDING_ALIGNMENT`. Рендер: сервер (`unit-page.tsx`) подменяет метку компонентом, получившим вопрос из `moduleMeta.checks`; клиентская часть — `components/self-check.tsx`.

**Tech Stack:** Next.js 16 static export, `next-mdx-remote/rsc`, React 19, vitest (environment `node`, без jsdom — компоненты проверяются `renderToStaticMarkup` + чистые функции).

**Spec:** `docs/superpowers/specs/2026-09-14-learning-alignment-design.md`

## Global Constraints

- Все пути ниже — от `LMS/tochka-sborki/web/`, если не сказано иное. Тесты: `npm test` (дефолт pack tochka-sborki) и `$env:COURSE_PACK='living-practice'; npm test` — **только через npm** (pretest материализует `packs/_active`), префиксные сборки — из PowerShell.
- `objectives`: 3–5, `id` уникальны в модуле. `checks[].options`: 2–5, `answer` — 0-based индекс. Заглушки запрещены: `TODO`, `TBD`, `…`, `...`, пустая строка.
- Метка в MDX — строго `<SelfCheck id="cN"/>` (любой другой вид `<SelfCheck` — ошибка гварда).
- Событие аналитики — `window.plausible?.('self_check_answered', { props: { unit, objective, correct } })`, один раз на вопрос за просмотр.
- Подписи: «Проверь себя» / «Check yourself», «Цели модуля» / «Module goals», «Цели» / «Goals», «Проверить» / «Check», «Верно» / «Correct», «Не совсем» / «Not quite».
- В «Тишине» вопросы только на понимание рамки и безопасности курса (решение владельца).
- Тексты целей/вопросов существующих курсов — только утверждённые владельцем через Logos Foundry; движок их не сочиняет.
- Коммиты поимённо (`git commit -- <пути>`), без `git add -A`; `.impeccable/hook.cache.json` не коммитить. Push в `main` = прод-деплой — только по слову владельца.

---

### Task 1: Типы и чистый валидатор связки

**Files:**
- Modify: `lib/content.ts:40-49` (интерфейс `ModuleMeta`)
- Create: `lib/content/alignment.ts`
- Test: `lib/content/alignment.unit.test.ts`

**Interfaces:**
- Produces:
  - `export interface Objective { id: string; text: string }`
  - `export interface SelfCheckItem { id: string; unit: string; objective: string; question: string; options: string[]; answer: number; explain: string }`
  - `ModuleMeta` получает `objectives?: Objective[]; checks?: SelfCheckItem[]`
  - `export function selfCheckMarks(mdx: string): { ids: string[]; malformed: number }`
  - `export function validateModuleAlignment(input: AlignmentInput): string[]` — пустой массив = ок
  - `export interface AlignmentInput { slug: string; ru: AlignmentMeta; en: AlignmentMeta; marks: Record<'ru' | 'en', Record<string, string[]>>; malformed: Record<'ru' | 'en', number> }` где `AlignmentMeta = Pick<ModuleMeta, 'units' | 'objectives' | 'checks'>`, `marks[locale][unitSlug]` = id меток в MDX урока.

- [ ] **Step 1: Добавить типы в `lib/content.ts`**

Вставить перед `export interface ModuleMeta` и расширить его:

```ts
/** Цель модуля — проверяемое действие (intake LMS#9). */
export interface Objective { id: string; text: string }

/** Вопрос «проверь себя» (intake LMS#8): в MDX урока — только метка <SelfCheck id="…"/>. */
export interface SelfCheckItem {
  id: string
  unit: string
  objective: string
  question: string
  options: string[]
  answer: number
  explain: string
}
```

В `ModuleMeta` после `layout?: UnitLayout` добавить:

```ts
  objectives?: Objective[]
  checks?: SelfCheckItem[]
```

- [ ] **Step 2: Написать падающий тест `lib/content/alignment.unit.test.ts`**

```ts
import { describe, it, expect } from 'vitest'
import { validateModuleAlignment, selfCheckMarks, type AlignmentInput } from './alignment'

const units = [{ slug: 'u1', title: 'У1' }, { slug: 'u2', title: 'У2' }]
const objectives = [
  { id: 'o1', text: 'Назвать потолок длительности' },
  { id: 'o2', text: 'Выбрать действие при стоп-сигнале' },
  { id: 'o3', text: 'Отличить собеседника от куратора' },
]
const checks = [
  { id: 'c1', unit: 'u1', objective: 'o1', question: 'Сколько?', options: ['10', '60'], answer: 0, explain: 'Потолок — 10.' },
  { id: 'c2', unit: 'u2', objective: 'o2', question: 'Что делать?', options: ['Остановиться', 'Углубиться'], answer: 0, explain: 'Остановиться.' },
  { id: 'c3', unit: 'u2', objective: 'o3', question: 'Кто он?', options: ['Собеседник', 'Терапевт'], answer: 0, explain: 'Собеседник.' },
]

function ok(): AlignmentInput {
  const meta = () => ({ units, objectives: structuredClone(objectives), checks: structuredClone(checks) })
  const marks = () => ({ u1: ['c1'], u2: ['c2', 'c3'] })
  return { slug: 'm', ru: meta(), en: meta(), marks: { ru: marks(), en: marks() }, malformed: { ru: 0, en: 0 } }
}

const errs = (mut: (i: AlignmentInput) => void) => { const i = ok(); mut(i); return validateModuleAlignment(i) }

describe('selfCheckMarks', () => {
  it('collects strict marks and counts malformed ones', () => {
    const r = selfCheckMarks('a <SelfCheck id="c1"/> b <SelfCheck id="c2" /> c <SelfCheck  question="x"/>')
    expect(r.ids).toEqual(['c1', 'c2'])
    expect(r.malformed).toBe(1)
  })
})

describe('validateModuleAlignment', () => {
  it('a consistent module has no errors', () => {
    expect(validateModuleAlignment(ok())).toEqual([])
  })
  it('rule 1: objective count, duplicate id, placeholder text', () => {
    expect(errs(i => { i.ru.objectives = i.ru.objectives!.slice(0, 2) }).join()).toMatch(/3–5/)
    expect(errs(i => { i.ru.objectives![1].id = 'o1' }).join()).toMatch(/повтор/)
    expect(errs(i => { i.ru.objectives![0].text = 'TODO' }).join()).toMatch(/заглушка/)
    expect(errs(i => { delete i.ru.objectives }).join()).toMatch(/3–5/)
  })
  it('rule 2: check refs, options, answer, placeholders', () => {
    expect(errs(i => { i.ru.checks![0].objective = 'o9' }).join()).toMatch(/цель o9/)
    expect(errs(i => { i.ru.checks![0].unit = 'u9' }).join()).toMatch(/урок u9/)
    expect(errs(i => { i.ru.checks![0].options = ['один'] }).join()).toMatch(/2–5/)
    expect(errs(i => { i.ru.checks![0].answer = 2 }).join()).toMatch(/answer/)
    expect(errs(i => { i.ru.checks![0].explain = '…' }).join()).toMatch(/заглушка/)
    expect(errs(i => { i.ru.checks![1].id = 'c1' }).join()).toMatch(/повтор/)
  })
  it('rule 3: objective without a check', () => {
    expect(errs(i => { i.ru.checks = i.ru.checks!.filter(c => c.objective !== 'o3'); i.marks.ru.u2 = ['c2'] }).join())
      .toMatch(/o3.*нет ни одного вопроса/)
  })
  it('rule 4: marks match checks', () => {
    expect(errs(i => { i.marks.ru.u1 = [] }).join()).toMatch(/c1.*не размечен/)
    expect(errs(i => { i.marks.ru.u1 = ['c1', 'c1'] }).join()).toMatch(/c1.*2 раза/)
    expect(errs(i => { i.marks.ru.u1 = ['c1']; i.marks.ru.u2 = ['c2', 'c3', 'c1'] }).join()).toMatch(/c1.*не в своём уроке/)
    expect(errs(i => { i.marks.ru.u1 = ['c1', 'c7'] }).join()).toMatch(/c7.*неизвестн/)
    expect(errs(i => { i.malformed.ru = 1 }).join()).toMatch(/неверный вид/)
  })
  it('rule 5: RU/EN parity', () => {
    expect(errs(i => { i.en.objectives!.push({ id: 'o4', text: 'Лишняя' }) }).join()).toMatch(/RU и EN.*цел/)
    expect(errs(i => { i.en.checks![0].answer = 1 }).join()).toMatch(/c1.*RU и EN/)
    expect(errs(i => { i.en.checks![0].unit = 'u2'; i.marks.en.u1 = []; i.marks.en.u2 = ['c1', 'c2', 'c3'] }).join()).toMatch(/c1.*RU и EN/)
  })
})
```

- [ ] **Step 3: Запустить — убедиться, что падает**

Run: `npx vitest run lib/content/alignment.unit.test.ts`
Expected: FAIL — `Failed to resolve import "./alignment"`.

- [ ] **Step 4: Реализовать `lib/content/alignment.ts`**

```ts
// Гвард constructive alignment (intake LMS#8/#9, Биггс 1996): у каждой цели модуля — хотя бы
// один вопрос «проверь себя», у каждого вопроса — цель; метки <SelfCheck id/> в MDX совпадают
// с checks в _meta.json; RU и EN — одна и та же связка. Чистая функция: тест читает файлы сам.
import type { ModuleMeta } from '../content'

type Locale = 'ru' | 'en'
export type AlignmentMeta = Pick<ModuleMeta, 'units' | 'objectives' | 'checks'>
export interface AlignmentInput {
  slug: string
  ru: AlignmentMeta
  en: AlignmentMeta
  /** marks[locale][unitSlug] — id меток <SelfCheck/> в MDX урока, в порядке появления. */
  marks: Record<Locale, Record<string, string[]>>
  /** Сколько вхождений `<SelfCheck` не в строгом виде `<SelfCheck id="…"/>`. */
  malformed: Record<Locale, number>
}

const PLACEHOLDER = /^\s*(?:TODO|TBD|…|\.\.\.)?\s*$|\bTODO\b|\bTBD\b/

const MARK_RE = /<SelfCheck\s+id="([^"]+)"\s*\/>/g
const ANY_MARK_RE = /<SelfCheck\b/g

export function selfCheckMarks(mdx: string): { ids: string[]; malformed: number } {
  const ids = [...mdx.matchAll(MARK_RE)].map(m => m[1])
  const all = (mdx.match(ANY_MARK_RE) ?? []).length
  return { ids, malformed: all - ids.length }
}

function localeErrors(slug: string, l: Locale, meta: AlignmentMeta, marks: Record<string, string[]>, malformed: number): string[] {
  const at = `${slug} [${l}]`
  const out: string[] = []
  const objectives = meta.objectives ?? []
  const checks = meta.checks ?? []
  const unitSlugs = new Set(meta.units.map(u => u.slug))

  if (objectives.length < 3 || objectives.length > 5) out.push(`${at}: целей ${objectives.length}, нужно 3–5`)
  const oIds = new Set<string>()
  for (const o of objectives) {
    if (oIds.has(o.id)) out.push(`${at}: повтор id цели ${o.id}`)
    oIds.add(o.id)
    if (PLACEHOLDER.test(o.text ?? '')) out.push(`${at}: цель ${o.id} — пусто или заглушка`)
  }

  const cIds = new Set<string>()
  for (const c of checks) {
    if (cIds.has(c.id)) out.push(`${at}: повтор id вопроса ${c.id}`)
    cIds.add(c.id)
    if (!oIds.has(c.objective)) out.push(`${at}: вопрос ${c.id} ссылается на цель ${c.objective}, которой нет`)
    if (!unitSlugs.has(c.unit)) out.push(`${at}: вопрос ${c.id} ссылается на урок ${c.unit}, которого нет`)
    const opts = c.options ?? []
    if (opts.length < 2 || opts.length > 5) out.push(`${at}: вопрос ${c.id} — вариантов ${opts.length}, нужно 2–5`)
    if (!Number.isInteger(c.answer) || c.answer < 0 || c.answer >= opts.length) out.push(`${at}: вопрос ${c.id} — answer ${c.answer} вне вариантов`)
    for (const [field, v] of [['question', c.question], ['explain', c.explain], ...opts.map((o, i) => [`options[${i}]`, o])] as [string, string][]) {
      if (PLACEHOLDER.test(v ?? '')) out.push(`${at}: вопрос ${c.id} — ${field} пусто или заглушка`)
    }
  }

  for (const o of objectives) {
    if (!checks.some(c => c.objective === o.id)) out.push(`${at}: у цели ${o.id} нет ни одного вопроса`)
  }

  if (malformed > 0) out.push(`${at}: ${malformed} метк(и) <SelfCheck> неверный вид — только <SelfCheck id="…"/>`)
  const seen = new Map<string, string[]>()
  for (const [unit, ids] of Object.entries(marks)) for (const id of ids) seen.set(id, [...(seen.get(id) ?? []), unit])
  for (const c of checks) {
    const where = seen.get(c.id) ?? []
    if (where.length === 0) out.push(`${at}: вопрос ${c.id} не размечен в MDX урока ${c.unit}`)
    else if (where.length > 1) out.push(`${at}: вопрос ${c.id} размечен ${where.length} раза (${where.join(', ')})`)
    else if (where[0] !== c.unit) out.push(`${at}: вопрос ${c.id} размечен в ${where[0]} — не в своём уроке ${c.unit}`)
  }
  for (const id of seen.keys()) if (!cIds.has(id)) out.push(`${at}: метка <SelfCheck id="${id}"/> — неизвестный вопрос`)
  return out
}

export function validateModuleAlignment(i: AlignmentInput): string[] {
  const out = [
    ...localeErrors(i.slug, 'ru', i.ru, i.marks.ru, i.malformed.ru),
    ...localeErrors(i.slug, 'en', i.en, i.marks.en, i.malformed.en),
  ]
  const ids = (m: AlignmentMeta, k: 'objectives' | 'checks') => (m[k] ?? []).map(x => x.id).sort().join(',')
  if (ids(i.ru, 'objectives') !== ids(i.en, 'objectives')) out.push(`${i.slug}: RU и EN — разные наборы целей`)
  if (ids(i.ru, 'checks') !== ids(i.en, 'checks')) out.push(`${i.slug}: RU и EN — разные наборы вопросов`)
  for (const c of i.ru.checks ?? []) {
    const e = (i.en.checks ?? []).find(x => x.id === c.id)
    if (e && (e.unit !== c.unit || e.objective !== c.objective || e.answer !== c.answer)) {
      out.push(`${i.slug}: вопрос ${c.id} — RU и EN расходятся (unit/objective/answer)`)
    }
  }
  return out
}
```

- [ ] **Step 5: Запустить — убедиться, что проходит**

Run: `npx vitest run lib/content/alignment.unit.test.ts`
Expected: PASS (9 tests). Если regex-ожидание не совпало с формулировкой ошибки — править формулировку в `alignment.ts`, не ожидание.

- [ ] **Step 6: Commit**

```bash
git add lib/content/alignment.ts lib/content/alignment.unit.test.ts
git commit -m "feat(lms): типы целей и вопросов модуля + чистый валидатор constructive alignment" -- lib/content.ts lib/content/alignment.ts lib/content/alignment.unit.test.ts
```

---

### Task 2: Гвард по активному pack'у + храповик `PENDING_ALIGNMENT`

**Files:**
- Create: `lib/content/alignment-pending.ts`
- Create: `lib/content/alignment.test.ts`

**Interfaces:**
- Consumes: `validateModuleAlignment`, `selfCheckMarks` (Task 1); `PACK_DIR`, `PACK_SLUG` из `lib/pack`.
- Produces: `export const PENDING_ALIGNMENT: Record<string, readonly string[]>` и `export const PENDING_SNAPSHOT: Record<string, readonly string[]>` (заморожённая копия; список может только сокращаться).

- [ ] **Step 1: Создать `lib/content/alignment-pending.ts`**

```ts
// Храповик раскатки учебной связки (спека 2026-09-14 §2): модули, ещё не получившие утверждённых
// владельцем целей и вопросов. НЕ ослабление гварда: модуль из списка, уже имеющий цели, — красный
// тест (вычеркни), модуль вне списка без целей — красный, а список сверяется со снимком и может
// только сокращаться. Пустой список удаляется вместе с этим файлом.
export const PENDING_SNAPSHOT: Record<string, readonly string[]> = {
  'tochka-sborki': [
    '00-kickstart', '01-introduction', '02-setup-guide', '03-stack-selection', '04-prompt-engineering',
    '05-context-memory', '06-audio-pipeline', '07-tools', '08-agent-engineering', '09-ai-notebook',
  ],
  'living-practice': ['01-living-practice'],
}

export const PENDING_ALIGNMENT: Record<string, readonly string[]> = {
  'tochka-sborki': PENDING_SNAPSHOT['tochka-sborki'],
  'living-practice': PENDING_SNAPSHOT['living-practice'],
}
```

- [ ] **Step 2: Написать тест `lib/content/alignment.test.ts`**

```ts
// Гвард constructive alignment по активному pack'у (крутится в матрице build-packs).
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync, existsSync } from 'node:fs'
import { join } from 'node:path'
import { PACK_DIR, PACK_SLUG } from '../pack'
import { validateModuleAlignment, selfCheckMarks, type AlignmentMeta } from './alignment'
import { PENDING_ALIGNMENT, PENDING_SNAPSHOT } from './alignment-pending'

type Locale = 'ru' | 'en'
const content = (l: Locale) => join(PACK_DIR, 'content', l)

function moduleSlugs(): string[] {
  return readdirSync(content('ru'), { withFileTypes: true })
    .filter(e => e.isDirectory() && /^\d{2}-/.test(e.name) && existsSync(join(content('ru'), e.name, '_meta.json')))
    .map(e => e.name)
}

const meta = (l: Locale, slug: string) => JSON.parse(readFileSync(join(content(l), slug, '_meta.json'), 'utf8')) as AlignmentMeta

function marks(l: Locale, slug: string, m: AlignmentMeta) {
  const out: Record<string, string[]> = {}
  let malformed = 0
  for (const u of m.units) {
    const p = join(content(l), slug, `${u.slug}.mdx`)
    if (!existsSync(p)) continue
    const r = selfCheckMarks(readFileSync(p, 'utf8'))
    out[u.slug] = r.ids
    malformed += r.malformed
  }
  return { out, malformed }
}

const pending = PENDING_ALIGNMENT[PACK_SLUG] ?? []
const hasObjectives = (slug: string) => (meta('ru', slug).objectives ?? []).length > 0

describe(`constructive alignment (${PACK_SLUG})`, () => {
  it('pending list only shrinks: subset of the frozen snapshot', () => {
    const snap = new Set(PENDING_SNAPSHOT[PACK_SLUG] ?? [])
    for (const s of pending) expect(snap.has(s), `${s} нет в PENDING_SNAPSHOT — новый модуль в храповик не прячется`).toBe(true)
  })

  it('a pending module that already has objectives must be removed from the list', () => {
    for (const s of pending) expect(hasObjectives(s), `${s} уже имеет цели — вычеркни из PENDING_ALIGNMENT`).toBe(false)
  })

  it('every non-pending module is aligned (objectives ↔ checks ↔ marks, RU = EN)', () => {
    const errors: string[] = []
    for (const slug of moduleSlugs()) {
      if (pending.includes(slug)) continue
      const ru = meta('ru', slug), en = meta('en', slug)
      const mr = marks('ru', slug, ru), me = marks('en', slug, en)
      errors.push(...validateModuleAlignment({ slug, ru, en, marks: { ru: mr.out, en: me.out }, malformed: { ru: mr.malformed, en: me.malformed } }))
    }
    expect(errors).toEqual([])
  })

  it('SelfCheck marks live only in module lessons (not cheatsheet/exercises/roadmap)', () => {
    for (const l of ['ru', 'en'] as const) {
      for (const f of readdirSync(content(l)).filter(f => f.endsWith('.mdx'))) {
        expect(readFileSync(join(content(l), f), 'utf8'), `${l}/${f}`).not.toMatch(/<SelfCheck\b/)
      }
    }
  })
})
```

- [ ] **Step 3: Прогнать на обоих pack'ах — зелёный (все модули в храповике)**

Run: `npm test -- lib/content/alignment` затем в PowerShell `$env:COURSE_PACK='living-practice'; npm test -- lib/content/alignment; $env:COURSE_PACK=$null`
Expected: PASS на обоих.

- [ ] **Step 4: Мутационная проверка храповика (не коммитить мутации)**

1. Удалить `'01-living-practice'` из `PENDING_ALIGNMENT['living-practice']` → `COURSE_PACK=living-practice` тест «every non-pending module…» КРАСНЫЙ (целей 0). Вернуть.
2. Добавить `'99-fake'` в `PENDING_ALIGNMENT['tochka-sborki']` → «pending list only shrinks» КРАСНЫЙ. Вернуть.
3. Временно добавить в `packs/tochka-sborki/content/ru/cheatsheet.mdx` строку `<SelfCheck id="c1"/>` → последний тест КРАСНЫЙ. Вернуть (`git checkout -- <файл>`).

- [ ] **Step 5: Commit**

```bash
git add lib/content/alignment-pending.ts lib/content/alignment.test.ts
git commit -m "feat(lms): гвард constructive alignment по pack'у + храповик PENDING_ALIGNMENT" -- lib/content/alignment-pending.ts lib/content/alignment.test.ts
```

---

### Task 3: Компонент «Проверь себя» и подмена метки на странице урока

**Files:**
- Create: `lib/self-check.ts`
- Create: `components/self-check.tsx`
- Modify: `components/pages/unit-page.tsx:49-53`
- Test: `lib/self-check.test.ts`, `components/self-check.test.tsx`

**Interfaces:**
- Consumes: `SelfCheckItem` (Task 1).
- Produces:
  - `export function isCorrect(item: Pick<SelfCheckItem, 'answer'>, picked: number | null): boolean`
  - `export function makeTracker(send: (props: { unit: string; objective: string; correct: boolean }) => void): (item: SelfCheckItem, correct: boolean) => void` — шлёт один раз на `item.id`.
  - `export function SelfCheck({ item, locale }: { item: SelfCheckItem; locale: 'ru' | 'en' })` (client)
  - `export function bindSelfCheck(checks: SelfCheckItem[] | undefined, locale: 'ru' | 'en'): ({ id }: { id: string }) => JSX.Element | null`

- [ ] **Step 1: Падающий тест чистой логики `lib/self-check.test.ts`**

```ts
import { describe, it, expect, vi } from 'vitest'
import { isCorrect, makeTracker } from './self-check'

const item = { id: 'c1', unit: 'u1', objective: 'o1', question: 'q', options: ['a', 'b'], answer: 1, explain: 'e' }

describe('self-check logic', () => {
  it('isCorrect compares the picked index with answer', () => {
    expect(isCorrect(item, 1)).toBe(true)
    expect(isCorrect(item, 0)).toBe(false)
    expect(isCorrect(item, null)).toBe(false)
  })
  it('tracker sends once per question id', () => {
    const send = vi.fn()
    const track = makeTracker(send)
    track(item, false)
    track(item, true)
    track({ ...item, id: 'c2' }, true)
    expect(send).toHaveBeenCalledTimes(2)
    expect(send).toHaveBeenNthCalledWith(1, { unit: 'u1', objective: 'o1', correct: false })
  })
})
```

- [ ] **Step 2: Run — FAIL** (`npx vitest run lib/self-check.test.ts`, «Failed to resolve import»).

- [ ] **Step 3: Реализовать `lib/self-check.ts`**

```ts
// Чистая логика «проверь себя» (intake LMS#8): ответ не хранится, наружу — только анонимное
// событие аналитики, один раз на вопрос за просмотр (решение владельца 2026-09-14).
import type { SelfCheckItem } from './content'

export function isCorrect(item: Pick<SelfCheckItem, 'answer'>, picked: number | null): boolean {
  return picked !== null && picked === item.answer
}

export function makeTracker(send: (props: { unit: string; objective: string; correct: boolean }) => void) {
  const sent = new Set<string>()
  return (item: SelfCheckItem, correct: boolean) => {
    if (sent.has(item.id)) return
    sent.add(item.id)
    send({ unit: item.unit, objective: item.objective, correct })
  }
}
```

- [ ] **Step 4: Run — PASS.**

- [ ] **Step 5: Падающий тест рендера `components/self-check.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { SelfCheck, bindSelfCheck } from './self-check'

const item = { id: 'c1', unit: 'u1', objective: 'o1', question: 'Что делать при стоп-сигнале?', options: ['Остановиться', 'Углубиться'], answer: 0, explain: 'Остановиться и вернуться.' }

describe('SelfCheck render', () => {
  it('renders question, options as radios and the label, but not the answer yet', () => {
    const html = renderToStaticMarkup(<SelfCheck item={item} locale="ru" />)
    expect(html).toContain('Проверь себя')
    expect(html).toContain('Что делать при стоп-сигнале?')
    expect(html.match(/type="radio"/g)).toHaveLength(2)
    expect(html).toContain('<fieldset')
    expect(html).toContain('aria-live="polite"')
    expect(html).not.toContain('Остановиться и вернуться.')
  })
  it('EN label', () => {
    expect(renderToStaticMarkup(<SelfCheck item={item} locale="en" />)).toContain('Check yourself')
  })
  it('bindSelfCheck resolves by id and renders nothing for an unknown id', () => {
    const Bound = bindSelfCheck([item], 'ru')
    expect(renderToStaticMarkup(<Bound id="c1" />)).toContain('Что делать при стоп-сигнале?')
    expect(renderToStaticMarkup(<Bound id="c9" />)).toBe('')
  })
})
```

Run: `npx vitest run components/self-check.test.tsx` → FAIL.

- [ ] **Step 6: Реализовать `components/self-check.tsx`**

```tsx
'use client'
import { useId, useState } from 'react'
import type { SelfCheckItem } from '@/lib/content'
import { isCorrect, makeTracker } from '@/lib/self-check'

const T = {
  ru: { label: 'Проверь себя', check: 'Проверить', right: 'Верно', wrong: 'Не совсем' },
  en: { label: 'Check yourself', check: 'Check', right: 'Correct', wrong: 'Not quite' },
}

const track = makeTracker(props => {
  // @ts-expect-error analytics global is optional
  if (typeof window !== 'undefined') window.plausible?.('self_check_answered', { props })
})

/** Вопрос «проверь себя» (intake LMS#8). Данные приходят с сервера из _meta.json модуля. */
export function SelfCheck({ item, locale }: { item: SelfCheckItem; locale: 'ru' | 'en' }) {
  const t = T[locale]
  const name = useId()
  const [picked, setPicked] = useState<number | null>(null)
  const [shown, setShown] = useState(false)
  const correct = isCorrect(item, picked)

  const submit = () => {
    if (picked === null) return
    setShown(true)
    track(item, correct)
  }

  return (
    <section style={{ margin: '2rem 0', padding: '1.25rem 1.5rem', border: '1px solid var(--border-color)', borderRadius: 'var(--radius)', background: 'var(--bg-surface)' }}>
      <fieldset style={{ border: 'none', margin: 0, padding: 0 }}>
        <legend style={{ padding: 0, marginBottom: '0.75rem' }}>
          <span style={{ display: 'block', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>{t.label}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, lineHeight: 1.5 }}>{item.question}</span>
        </legend>
        {item.options.map((o, i) => (
          <label key={i} style={{ display: 'flex', gap: '0.6rem', alignItems: 'baseline', padding: '0.3rem 0', cursor: 'pointer', color: shown && i === item.answer ? 'var(--text-accent)' : 'var(--text-primary)' }}>
            <input type="radio" name={name} value={i} checked={picked === i} onChange={() => { setPicked(i); setShown(false) }} />
            <span>{o}</span>
          </label>
        ))}
      </fieldset>
      <button type="button" onClick={submit} disabled={picked === null} style={{ marginTop: '0.75rem', fontFamily: 'var(--font-mono)', fontSize: '0.85rem', fontWeight: 700, padding: '0.5rem 1rem', borderRadius: 'var(--radius)', cursor: picked === null ? 'not-allowed' : 'pointer', border: '1px solid var(--text-accent)', background: 'var(--text-accent)', color: 'var(--text-on-accent)', opacity: picked === null ? 0.5 : 1 }}>
        {t.check}
      </button>
      <div aria-live="polite" style={{ marginTop: '0.75rem' }}>
        {shown && (
          <p style={{ margin: 0, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            <strong style={{ color: 'var(--text-primary)' }}>{correct ? t.right : t.wrong}.</strong> {item.explain}
          </p>
        )}
      </div>
    </section>
  )
}

/** Серверная привязка: метка <SelfCheck id="…"/> из MDX получает вопрос из moduleMeta.checks. */
export function bindSelfCheck(checks: SelfCheckItem[] | undefined, locale: 'ru' | 'en') {
  return function BoundSelfCheck({ id }: { id: string }) {
    const item = (checks ?? []).find(c => c.id === id)
    return item ? <SelfCheck item={item} locale={locale} /> : null
  }
}
```

Примечание: `bindSelfCheck` экспортируется из client-модуля, но вызывается на сервере только для построения карты компонентов; если Next ругнётся на вызов функции из `'use client'`-модуля в RSC — вынести `bindSelfCheck` в отдельный серверный файл `components/self-check-bound.tsx` (без `'use client'`), импортирующий `SelfCheck`, и поправить импорты теста и шага 7.

- [ ] **Step 7: Подключить в `components/pages/unit-page.tsx`**

Импорт: `import { bindSelfCheck } from '@/components/self-check'`. Заменить `components={mdxComponents}` в `MDXRemote` на:

```tsx
              components={{ ...mdxComponents, SelfCheck: bindSelfCheck(moduleMeta.checks, locale === 'en' ? 'en' : 'ru') }}
```

- [ ] **Step 8: Run — PASS** `npx vitest run components/self-check.test.tsx lib/self-check.test.ts`; затем `npx tsc --noEmit` — чисто.

- [ ] **Step 9: Commit**

```bash
git commit -m "feat(lms): «Проверь себя» — компонент, событие Plausible один раз, подмена метки на странице урока" -- lib/self-check.ts lib/self-check.test.ts components/self-check.tsx components/self-check.test.tsx components/pages/unit-page.tsx
```
(перед коммитом `git add` для новых файлов поимённо)

---

### Task 4: Цели модуля — первый урок и дерево курса

**Files:**
- Create: `components/module-objectives.tsx`
- Modify: `components/pages/unit-page.tsx` (над `<Shell>`), `components/syllabus-tree.tsx:28-32`
- Test: `components/module-objectives.test.tsx`

**Interfaces:**
- Consumes: `Objective` (Task 1).
- Produces: `export function ModuleObjectives({ objectives, locale }: { objectives?: Objective[]; locale: 'ru' | 'en' })` — `null`, если целей нет; `export function ObjectivesDisclosure(...)` с той же сигнатурой для дерева.

- [ ] **Step 1: Падающий тест `components/module-objectives.test.tsx`**

```tsx
import { describe, it, expect } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'
import { ModuleObjectives, ObjectivesDisclosure } from './module-objectives'

const objectives = [{ id: 'o1', text: 'Назвать потолок' }, { id: 'o2', text: 'Выбрать действие' }, { id: 'o3', text: 'Отличить собеседника' }]

describe('ModuleObjectives', () => {
  it('renders heading and all goals as a list', () => {
    const html = renderToStaticMarkup(<ModuleObjectives objectives={objectives} locale="ru" />)
    expect(html).toContain('Цели модуля')
    expect(html.match(/<li/g)).toHaveLength(3)
  })
  it('renders nothing without goals', () => {
    expect(renderToStaticMarkup(<ModuleObjectives locale="ru" />)).toBe('')
  })
  it('disclosure for the syllabus is a collapsed <details> with EN label', () => {
    const html = renderToStaticMarkup(<ObjectivesDisclosure objectives={objectives} locale="en" />)
    expect(html).toContain('<details')
    expect(html).not.toContain('open')
    expect(html).toContain('Goals')
  })
})
```

Run: `npx vitest run components/module-objectives.test.tsx` → FAIL.

- [ ] **Step 2: Реализовать `components/module-objectives.tsx`**

```tsx
import type { Objective } from '@/lib/content'

const T = { ru: { heading: 'Цели модуля', short: 'Цели' }, en: { heading: 'Module goals', short: 'Goals' } }

const list = (objectives: Objective[]) => (
  <ul style={{ margin: 0, paddingLeft: '1.1rem', lineHeight: 1.6 }}>
    {objectives.map(o => <li key={o.id}>{o.text}</li>)}
  </ul>
)

/** Цели модуля в начале первого урока (intake LMS#9). Врезка — как цель урока в lesson-prose. */
export function ModuleObjectives({ objectives, locale }: { objectives?: Objective[]; locale: 'ru' | 'en' }) {
  if (!objectives?.length) return null
  return (
    <aside aria-label={T[locale].heading} style={{ margin: '0 0 1.75rem', fontSize: '.95rem', color: 'var(--text-secondary)', borderLeft: '2px solid var(--border-accent)', paddingLeft: '.9rem' }}>
      <div style={{ fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)', textTransform: 'uppercase', letterSpacing: '0.12em', marginBottom: '0.4rem' }}>{T[locale].heading}</div>
      {list(objectives)}
    </aside>
  )
}

/** Свёрнутые цели модуля в дереве курса. */
export function ObjectivesDisclosure({ objectives, locale }: { objectives?: Objective[]; locale: 'ru' | 'en' }) {
  if (!objectives?.length) return null
  return (
    <details style={{ margin: '0 0 0.9rem', fontSize: '0.88rem', color: 'var(--text-secondary)', maxWidth: '70ch' }}>
      <summary style={{ cursor: 'pointer', fontFamily: 'var(--font-mono)', fontSize: 'var(--text-xs)', color: 'var(--text-accent)' }}>{T[locale].short}</summary>
      <div style={{ marginTop: '0.4rem' }}>{list(objectives)}</div>
    </details>
  )
}
```

- [ ] **Step 3: Подключить**

`components/pages/unit-page.tsx`: импорт `import { ModuleObjectives } from '@/components/module-objectives'`; перед `<Shell` внутри `<main>`:

```tsx
          {unitIndex === 0 && <ModuleObjectives objectives={moduleMeta.objectives} locale={locale === 'en' ? 'en' : 'ru'} />}
```

`components/syllabus-tree.tsx`: импорт `import { ObjectivesDisclosure } from './module-objectives'`; сразу после блока `{m.description && (…)}` (строка 32):

```tsx
          <ObjectivesDisclosure objectives={m.objectives} locale={locale === 'en' ? 'en' : 'ru'} />
```

- [ ] **Step 4: Run — PASS** `npx vitest run components/module-objectives.test.tsx`; `npx tsc --noEmit` — чисто.

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(lms): цели модуля — в начале первого урока и свёрнуто в дереве курса" -- components/module-objectives.tsx components/module-objectives.test.tsx components/pages/unit-page.tsx components/syllabus-tree.tsx
```
(новые файлы — `git add` поимённо)

---

### Task 5: Авторинг — скаффолд, чек-лист, README

**Files:**
- Modify: `lib/authoring/module-scaffold.ts:24-34`
- Modify: `lib/authoring/module-scaffold.test.ts` (добавить кейс)
- Modify: `../../_template/CHECKLIST.md` (§5a)
- Modify: `../../../README.md` (раздел «Контракт pack'а»)

**Interfaces:**
- Consumes: `ModuleOutline` (`units[].objective: Bi`).
- Produces: `_meta.json` скаффолда несёт `objectives` (из целей уроков, до 5) и `checks: []`.

- [ ] **Step 1: Падающий тест — дописать в `lib/authoring/module-scaffold.test.ts`**

```ts
it('meta carries objectives from unit objectives and an empty checks list (alignment guard forces checks)', () => {
  const files = scaffoldModule(outline, '2026-09-14')
  const ru = JSON.parse(files.find(f => f.path.endsWith('ru/' + outline.slug + '/_meta.json'))!.content)
  expect(ru.objectives).toEqual(outline.units.slice(0, 5).map((u, i) => ({ id: `o${i + 1}`, text: u.objective.ru })))
  expect(ru.checks).toEqual([])
})
```
(`outline` — фикстура, уже используемая в этом тест-файле; если имя другое — взять существующее.)

Run: `npx vitest run lib/authoring/module-scaffold.test.ts` → FAIL.

- [ ] **Step 2: Реализовать в `metaJson`**

После `units: …,` добавить:

```ts
    // Учебная связка (спека 2026-09-14): цели уроков — черновик целей модуля; вопросы пишет автор,
    // гвард alignment не пропустит модуль с пустым checks.
    objectives: o.units.slice(0, 5).map((u, i) => ({ id: `o${i + 1}`, text: u.objective[locale] })),
    checks: [],
```

- [ ] **Step 3: Run — PASS**; весь `npm test` зелёный (скаффолд-тесты, сравнивающие JSON целиком, при падении обновить ожидание на новые поля).

- [ ] **Step 4: Документация**

`LMS/_template/CHECKLIST.md`, в конец §5a:

```md
- [ ] Учебная связка — в `_meta.json` каждого модуля (RU и EN): `objectives` (3–5 проверяемых целей) и `checks`
      (вопросы «проверь себя»: урок, цель, 2–5 вариантов, `answer`, объяснение); в MDX урока — метка
      `<SelfCheck id="…"/>` внутри `<Phase type="concept">`. Сверяет `lib/content/alignment.test.ts`.
```

`README.md` (корень lms-engine), в список раздела «Контракт pack'а: что ещё курс объявляет сам»:

```md
- **Учебная связка** — `objectives` и `checks` в `_meta.json` модуля, метка `<SelfCheck id/>` в уроке; гвард
  `lib/content/alignment.test.ts` (у каждой цели вопрос, у вопроса цель, RU = EN), раскатка — храповик
  `lib/content/alignment-pending.ts`. Спека: `docs/superpowers/specs/2026-09-14-learning-alignment-design.md`.
```

- [ ] **Step 5: Commit**

```bash
git commit -m "feat(authoring): скаффолд модуля ставит objectives/checks; чек-лист и README — учебная связка" -- LMS/tochka-sborki/web/lib/authoring/module-scaffold.ts LMS/tochka-sborki/web/lib/authoring/module-scaffold.test.ts LMS/_template/CHECKLIST.md README.md
```
(из корня lms-engine)

---

### Task 6: Тексты «Тишины» (после утверждения владельцем в LF)

**Предусловие:** piece «Цели и проверки: Тишина» в Logos Foundry утверждён владельцем, RU- и EN-версии экспортированы. Без этого задача не начинается.

**Files:**
- Modify: `packs/living-practice/content/{ru,en}/01-living-practice/_meta.json`
- Modify: `packs/living-practice/content/{ru,en}/01-living-practice/u*.mdx` (метки)
- Modify: `lib/content/alignment-pending.ts` (вычеркнуть `01-living-practice`)

- [ ] **Step 1:** Перенести утверждённые цели и вопросы в RU `_meta.json` (поля `objectives`, `checks`) дословно; EN — из LF-перевода, те же id/unit/objective/answer.
- [ ] **Step 2:** В каждый урок `checks[].unit` поставить `<SelfCheck id="cN"/>` отдельной строкой в конце блока `<Phase type="concept">` (RU и EN).
- [ ] **Step 3:** Удалить `'01-living-practice'` из `PENDING_ALIGNMENT['living-practice']` (массив станет `[]`; снимок не трогать).
- [ ] **Step 4:** `$env:COURSE_PACK='living-practice'; npm test; npm run build; $env:COURSE_PACK=$null` — зелёные; `npm test` (ТС) — зелёный; `npx tsc --noEmit` — чисто.
- [ ] **Step 5: Commit**

```bash
git commit -m "content(living-practice): цели модуля и вопросы «проверь себя» (утверждено владельцем, LF piece #N)" -- LMS/tochka-sborki/web/packs/living-practice/content LMS/tochka-sborki/web/lib/content/alignment-pending.ts
```

---

### Task 7: Выкатка и живая проверка (по слову владельца)

- [ ] **Step 1:** С разрешения владельца `git push origin main`; дождаться CI (`deploy-academy`, `deploy-web`, `build-packs` — success).
- [ ] **Step 2:** `https://academy.synergify.com/praktika/lessons/01-living-practice/u1-dogovor/` — в HTML есть «Цели модуля» и все цели; урок с вопросом — «Проверь себя», вопрос, радио; ответ показывает объяснение (проверка браузером — агент browser-operator, incognito).
- [ ] **Step 3:** `https://academy.synergify.com/praktika/syllabus/` — `<details>` «Цели» у модуля.
- [ ] **Step 4:** Отметить строки BACKLOG («Цели модуля», «мини-проверки», «гвард alignment») — сделано для «Тишины», ТС — в храповике; коммит `docs(backlog)`.
