# Сквозная картина курса — план реализации

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.
>
> **Исполнение (решение владельца 2026-10-12): Codex.** Задачи 1–5 и 7 — пакеты делегации
> (`secops/delegation/brief-template.md` NAUTILUS → `garage/delegates/Invoke-Delegate.ps1 -Tier codex`), приёмка —
> `nautilus-lab:delegation-acceptor`, коммитит контроллер. Задачи 6 и 8 — контроллер сам (гейты безопасности, push).

**Goal:** на страницах юнитов Точки Сборки — одна сквозная изометрическая машина (агентский стек ученика), в которой подсвечен узел модуля и деталь юнита, пройденное собрано, будущее — контуром.

**Architecture:** движок (`lib/assembly/`, `components/assembly/`) знает контракт машины и считает состояния; pack (`packs/<pack>/course/assembly-map.ts`, `assembly-machine.tsx`) даёт соответствие юнит→деталь и геометрию. Сначала черновая машина, построенная из соответствия автоматически, потом настоящая — скиллом Anatomy по тем же id. Флаг `COURSE.features.assemblyMap`.

**Tech Stack:** Next.js 16 static export, React 19 client components, SVG, Vitest (node-окружение, `renderToStaticMarkup`), TypeScript.

**Spec:** `docs/superpowers/specs/2026-10-12-assembly-map-design.md`

## Global Constraints

- Рабочий каталог кода — `LMS/tochka-sborki/web/` (пути ниже — от него, если не сказано иное).
- Новых npm-зависимостей нет.
- Кодировка UTF-8 без BOM; `.mjs` без шебанга (CRLF после `#!` ломает импорт в vitest на Windows).
- Код движка не называет pack'и по имени (`tochka-sborki`, `living-practice`) — флаги, а не слаги.
- Подписи — RU и EN в одном коммите; термины по глоссарию курса: pipeline, Hook, Skill, MCP, субагент, агент.
- Бюджет: разметка картины на странице ≤ 200 КБ без сжатия (`200 * 1024` байт).
- Движение — только пульсация текущей детали; глобальные правила `prefers-reduced-motion` и `[data-lite="on"]` в `app/globals.css` уже гасят анимации — не дублировать.
- Проверка каждой задачи: `node scripts/select-pack.mjs tochka-sborki && npx vitest run && npx tsc --noEmit`, затем `node scripts/select-pack.mjs living-practice && COURSE_PACK=living-practice npx vitest run && COURSE_PACK=living-practice npx tsc --noEmit`, в конце вернуть `node scripts/select-pack.mjs tochka-sborki`. Известные флейки по таймауту 5 с — `lib/boundary.test.ts`, `lib/raw-navigation.test.ts`: при падении только их — перезапуск отдельно, должны пройти.
- Делегат не коммитит; коммит делает контроллер по поимённому списку файлов задачи.

## Поправки к спеке (найдены при чтении кода, внесены в спеку тем же коммитом)

1. URL модуля (`/lessons/<модуль>/`) не страница, а `ModuleRedirect` на первый непройденный юнит. «Большая картина на странице модуля» → **на первом юните модуля** (там, где уже стоит `ModuleObjectives`); на остальных юнитах — миниатюра.
2. Картина живёт внутри `UnitGates` вместе со всей страницей: за дверью её не видно (в спеке было «видна до двери»).
3. Копия библиотеки Anatomy нужна только настоящей машине: черновая обходится своим проектором `lib/assembly/iso.ts`. Копия `kit/` — в задаче 6, после гейтов, перед задачей 7.

## Review Focus

1. Новый посетитель или первый заход в зеркало (пустой `unit_progress`): машина целиком контуром, текущая деталь подсвечена, без ошибок — тест «пустой прогресс» в задаче 1 и рендер в задаче 3.
2. В localStorage мусор и чужие модули (другой курс, старые слаги): игнорируются, состояние не ломается — тест в задаче 1.
3. Новый юнит в `_meta.json` без записи соответствия: красный тест, а не молча пропавшая деталь — задача 2.
4. Страница EN: подписи EN, подпись «You're building», переход на `/en/lessons/<модуль>/` — тесты `moduleHref` и рендера EN в задачах 3 и 4.
5. Курс без картины (living-practice под `/praktika`): компонентов нет в разметке, ошибок нет — `describe.runIf(!COURSE.features.assemblyMap)` в задачах 2–4.

---

### Task 1: флаг, контракт и расчёт состояний

**Files:**
- Modify: `packs/tochka-sborki/course.config.ts` (блок `features`), `packs/living-practice/course.config.ts` (блок `features`), `../../_template/course.config.template.ts` (блок `features`)
- Modify: `lib/course-features.test.ts`
- Modify: `lib/unit-progress.ts` (функция `useUnitProgress`)
- Create: `lib/assembly/types.ts`, `lib/assembly/state.ts`
- Test: `lib/assembly/state.test.ts`

**Interfaces:**
- Produces: `COURSE.features.assemblyMap: boolean`; типы `Bi`, `AssemblyNode`, `AssemblyPart`, `AssemblyMap`, `PartState`, `AssemblyState`, `ElementAttrs`, `MachineProps`, `MachineDef`, константа `NODE_TARGET = 'node'`; функции `assemblyState(map, progress, current?)`, `assemblyLabels(map, locale)`, `assemblySummary(map, state, locale)`, `assemblyCaption(map, current, locale)`, `moduleHref(module, locale)`; `useUnitProgress()` дополнительно возвращает `progress: UnitProgressMap`.

- [ ] **Step 1: флаг в трёх конфигах.** В `features` каждого файла добавить строку последней в блоке:

`packs/tochka-sborki/course.config.ts`:
```ts
    /** Сквозная картина: машина, которую собирает ученик (components/assembly, спека 2026-10-12-assembly-map). */
    assemblyMap: true,
```
`packs/living-practice/course.config.ts` и `LMS/_template/course.config.template.ts`:
```ts
    /** Сквозная картина: машина, которую собирает ученик (components/assembly, спека 2026-10-12-assembly-map). */
    assemblyMap: false,
```

- [ ] **Step 2: тест флага.** В `lib/course-features.test.ts`, в первом `it` после строки про `graduateRetro`:
```ts
    expect(typeof COURSE.features.assemblyMap).toBe('boolean')
```
и во втором `it` после строки про `graduateRetro`:
```ts
      expect(cfg, `${p.name}: нет флага assemblyMap`).toMatch(/assemblyMap:\s*(true|false)/)
```

- [ ] **Step 3: контракт `lib/assembly/types.ts`.**
```ts
// Контракт сквозной картины (спека docs/superpowers/specs/2026-10-12-assembly-map-design.md).
// Движок считает состояния и красит; pack даёт соответствие юнит→деталь и геометрию машины.
import type { KeyboardEvent, ReactElement, SVGProps } from 'react'

export interface Bi { ru: string; en: string }

/** Узел машины — один на модуль курса. */
export interface AssemblyNode { id: string; module: string; label: Bi; optional: boolean }

/** Деталь узла — один на юнит (кроме юнитов-фаз). */
export interface AssemblyPart { id: string; node: string; label: Bi }

/** Юнит-фаза (activation, reflect…) отвечает за корпус узла целиком. */
export const NODE_TARGET = 'node'

export interface AssemblyMap {
  nodes: readonly AssemblyNode[]
  parts: readonly AssemblyPart[]
  /** Ключ — `<модуль>/<юнит>`, значение — id детали или NODE_TARGET. */
  units: Readonly<Record<string, string>>
}

export type PartState = 'built' | 'ghost'

export interface NodeProgress { built: number; total: number; shell: PartState }

export interface AssemblyState {
  parts: Record<string, PartState>
  nodes: Record<string, NodeProgress>
  /** Узел и деталь текущего юнита; part = null — текущий юнит-фаза (подсвечен корпус). */
  current: { node: string; part: string | null } | null
}

export type ElementAttrs = SVGProps<SVGGElement> & {
  [key: `data-${string}`]: string | undefined
  onKeyDown?: (e: KeyboardEvent<SVGGElement>) => void
}

/**
 * Пропсы геометрии. Автор машины раскладывает `{...node(id)}` на группу узла и `{...part(id)}` на группу детали,
 * кладёт `<title>{title(id)}</title>` первым потомком группы. Закрашиваемые фигуры (polygon, path, rect, ellipse,
 * circle, polyline) — прямые потомки своей группы: стили состояния действуют через `>` и не протекают во вложенные детали.
 */
export interface MachineProps {
  part: (id: string) => ElementAttrs
  node: (id: string) => ElementAttrs
  title: (id: string) => string
}

export interface MachineDef {
  viewBox: string
  nodeIds: readonly string[]
  partIds: readonly string[]
  Art: (props: MachineProps) => ReactElement
}
```

- [ ] **Step 4: падающий тест `lib/assembly/state.test.ts`.**
```ts
import { describe, it, expect } from 'vitest'
import { markUnit, type UnitProgressMap } from '@/lib/unit-progress'
import { NODE_TARGET, type AssemblyMap } from './types'
import { assemblyCaption, assemblyLabels, assemblyState, assemblySummary, moduleHref } from './state'

const MAP: AssemblyMap = {
  nodes: [
    { id: 'conveyor', module: '06-pipe', label: { ru: 'Конвейер', en: 'Conveyor' }, optional: false },
    { id: 'archive', module: '11-brain', label: { ru: 'Архив', en: 'Archive' }, optional: true },
  ],
  parts: [
    { id: 'conveyor.gate', node: 'conveyor', label: { ru: 'Ворота-датчик', en: 'Sensor gate' } },
    { id: 'conveyor.timer', node: 'conveyor', label: { ru: 'Таймер', en: 'Timer' } },
    { id: 'archive.vault', node: 'archive', label: { ru: 'Шкаф', en: 'Cabinet' } },
  ],
  units: {
    '06-pipe/u1-activation': NODE_TARGET,
    '06-pipe/u2-theory': 'conveyor.gate',
    '06-pipe/u5-schedule': 'conveyor.timer',
    '11-brain/u1-own': 'archive.vault',
  },
}

const done = (...keys: string[]): UnitProgressMap =>
  keys.reduce<UnitProgressMap>((m, k) => { const [mod, unit] = k.split('/'); return markUnit(m, mod, unit) }, {})

describe('assemblyState', () => {
  it('пустой прогресс — всё контуром, текущей детали нет', () => {
    const st = assemblyState(MAP, {})
    expect(st.parts).toEqual({ 'conveyor.gate': 'ghost', 'conveyor.timer': 'ghost', 'archive.vault': 'ghost' })
    expect(st.nodes.conveyor).toEqual({ built: 0, total: 3, shell: 'ghost' })
    expect(st.nodes.archive).toEqual({ built: 0, total: 1, shell: 'ghost' })
    expect(st.current).toBeNull()
  })

  it('пройденный юнит собирает свою деталь; юнит-фаза — корпус узла', () => {
    const st = assemblyState(MAP, done('06-pipe/u2-theory', '06-pipe/u1-activation'))
    expect(st.parts['conveyor.gate']).toBe('built')
    expect(st.parts['conveyor.timer']).toBe('ghost')
    expect(st.nodes.conveyor).toEqual({ built: 2, total: 3, shell: 'built' })
  })

  it('узел без юнитов-фаз: корпус собран, как только собрана первая деталь', () => {
    expect(assemblyState(MAP, done('11-brain/u1-own')).nodes.archive).toEqual({ built: 1, total: 1, shell: 'built' })
  })

  it('узел с юнитом-фазой: корпус ждёт фазу, даже если детали собраны', () => {
    const st = assemblyState(MAP, done('06-pipe/u2-theory', '06-pipe/u5-schedule'))
    expect(st.nodes.conveyor.shell).toBe('ghost')
    expect(st.nodes.conveyor.built).toBe(2)
  })

  it('текущий юнит: деталь или корпус; неизвестный юнит — null', () => {
    expect(assemblyState(MAP, {}, { module: '06-pipe', unit: 'u5-schedule' }).current).toEqual({ node: 'conveyor', part: 'conveyor.timer' })
    expect(assemblyState(MAP, {}, { module: '06-pipe', unit: 'u1-activation' }).current).toEqual({ node: 'conveyor', part: null })
    expect(assemblyState(MAP, {}, { module: '06-pipe', unit: 'u9-nope' }).current).toBeNull()
  })

  it('мусор и чужие модули в прогрессе игнорируются', () => {
    const junk = { ...done('03-other/u1', '06-pipe/u7-old'), 'living-practice': { x: true } } as UnitProgressMap
    const st = assemblyState(MAP, junk)
    expect(Object.values(st.parts).every((s) => s === 'ghost')).toBe(true)
    expect(st.nodes.conveyor.built).toBe(0)
  })
})

describe('подписи и ссылки', () => {
  it('assemblyLabels отдаёт подписи узлов и деталей на языке страницы', () => {
    expect(assemblyLabels(MAP, 'en')).toMatchObject({ conveyor: 'Conveyor', 'conveyor.timer': 'Timer' })
    expect(assemblyLabels(MAP, 'ru')['archive.vault']).toBe('Шкаф')
  })

  it('assemblyCaption: узел → деталь; для юнита-фазы — только узел', () => {
    expect(assemblyCaption(MAP, { module: '06-pipe', unit: 'u5-schedule' }, 'ru')).toBe('Ты собираешь: Конвейер → Таймер')
    expect(assemblyCaption(MAP, { module: '06-pipe', unit: 'u1-activation' }, 'en')).toBe("You're building: Conveyor")
    expect(assemblyCaption(MAP, { module: 'xx', unit: 'yy' }, 'ru')).toBe('')
  })

  it('assemblySummary: счёт собранных узлов и текущий узел', () => {
    const st = assemblyState(MAP, done('11-brain/u1-own'), { module: '06-pipe', unit: 'u2-theory' })
    const s = assemblySummary(MAP, st, 'ru')
    expect(s.title).toBe('Машина, которую ты собираешь')
    expect(s.desc).toBe('Собрано узлов: 1 из 2. Сейчас — Конвейер → Ворота-датчик.')
    expect(s.items).toEqual(['Конвейер: 0/3 — сейчас', 'Архив: 1/1'])
    expect(assemblySummary(MAP, assemblyState(MAP, {}), 'en').desc).toBe('Nodes assembled: 0 of 2.')
  })

  it('moduleHref — путь модуля с языковым префиксом (basePath добавляет роутер)', () => {
    expect(moduleHref('06-pipe', 'ru')).toBe('/lessons/06-pipe/')
    expect(moduleHref('06-pipe', 'en')).toBe('/en/lessons/06-pipe/')
  })
})
```

- [ ] **Step 5: прогнать — падает.** Run: `npx vitest run lib/assembly/state.test.ts` — Expected: FAIL (`Failed to resolve import "./state"`).

- [ ] **Step 6: реализация `lib/assembly/state.ts`.**
```ts
// Состояние сквозной картины из прогресса ученика (спека 2026-10-12-assembly-map, §2).
import { isUnitCompleted, type UnitProgressMap } from '@/lib/unit-progress'
import { NODE_TARGET, type AssemblyMap, type AssemblyState, type PartState } from './types'

type Locale = 'ru' | 'en'

const COPY = {
  ru: { building: 'Ты собираешь', title: 'Машина, которую ты собираешь', assembled: 'Собрано узлов', of: 'из', now: 'Сейчас', current: 'сейчас' },
  en: { building: "You're building", title: 'The machine you are building', assembled: 'Nodes assembled', of: 'of', now: 'Now', current: 'now' },
} as const

export function assemblyState(
  map: AssemblyMap,
  progress: UnitProgressMap,
  current: { module: string; unit: string } | null = null,
): AssemblyState {
  const nodeOf = new Map(map.nodes.map((n) => [n.module, n.id]))
  const parts: Record<string, PartState> = Object.fromEntries(map.parts.map((p) => [p.id, 'ghost' as PartState]))
  const phases: Record<string, { done: number; total: number }> = {}
  for (const [key, target] of Object.entries(map.units)) {
    const [mod, unit] = key.split('/')
    const node = nodeOf.get(mod)
    if (!node) continue
    const finished = isUnitCompleted(progress, mod, unit)
    if (target === NODE_TARGET) {
      const ph = (phases[node] ??= { done: 0, total: 0 })
      ph.total += 1
      if (finished) ph.done += 1
    } else if (target in parts && finished) {
      parts[target] = 'built'
    }
  }
  const nodes: AssemblyState['nodes'] = {}
  for (const n of map.nodes) {
    const own = map.parts.filter((p) => p.node === n.id)
    const builtParts = own.filter((p) => parts[p.id] === 'built').length
    const ph = phases[n.id] ?? { done: 0, total: 0 }
    const shell: PartState = ph.total > 0 ? (ph.done === ph.total ? 'built' : 'ghost') : (builtParts > 0 ? 'built' : 'ghost')
    nodes[n.id] = { built: builtParts + ph.done, total: own.length + ph.total, shell }
  }
  let cur: AssemblyState['current'] = null
  if (current) {
    const target = map.units[`${current.module}/${current.unit}`]
    const node = nodeOf.get(current.module)
    if (target !== undefined && node) cur = { node, part: target === NODE_TARGET ? null : target }
  }
  return { parts, nodes, current: cur }
}

export function assemblyLabels(map: AssemblyMap, locale: Locale): Record<string, string> {
  return Object.fromEntries([...map.nodes, ...map.parts].map((x) => [x.id, x.label[locale]]))
}

function currentLabel(map: AssemblyMap, cur: AssemblyState['current'], locale: Locale): string {
  if (!cur) return ''
  const labels = assemblyLabels(map, locale)
  return cur.part ? `${labels[cur.node]} → ${labels[cur.part]}` : labels[cur.node]
}

export function assemblyCaption(map: AssemblyMap, current: { module: string; unit: string }, locale: Locale): string {
  const cur = assemblyState(map, {}, current).current
  return cur ? `${COPY[locale].building}: ${currentLabel(map, cur, locale)}` : ''
}

export function assemblySummary(map: AssemblyMap, st: AssemblyState, locale: Locale): { title: string; desc: string; items: string[] } {
  const c = COPY[locale]
  const labels = assemblyLabels(map, locale)
  const assembled = map.nodes.filter((n) => st.nodes[n.id].total > 0 && st.nodes[n.id].built === st.nodes[n.id].total).length
  const now = currentLabel(map, st.current, locale)
  const desc = `${c.assembled}: ${assembled} ${c.of} ${map.nodes.length}.` + (now ? ` ${c.now} — ${now}.` : '')
  const items = map.nodes.map((n) =>
    `${labels[n.id]}: ${st.nodes[n.id].built}/${st.nodes[n.id].total}` + (st.current?.node === n.id ? ` — ${c.current}` : ''))
  return { title: c.title, desc, items }
}

export function moduleHref(module: string, locale: Locale): string {
  return `${locale === 'en' ? '/en' : ''}/lessons/${module}/`
}
```

- [ ] **Step 7: `useUnitProgress` отдаёт карту.** В `lib/unit-progress.ts` последнюю строку функции `useUnitProgress`
```ts
  return { isCompleted, markCompleted, ready }
```
заменить на
```ts
  return { progress, isCompleted, markCompleted, ready }
```

- [ ] **Step 8: прогнать — зелёное.** Run: `npx vitest run lib/assembly/state.test.ts lib/course-features.test.ts` — Expected: PASS. Затем полная проверка из Global Constraints под оба pack'а.

- [ ] **Step 9: коммит (контроллер).**
```bash
git add LMS/tochka-sborki/web/packs/tochka-sborki/course.config.ts LMS/tochka-sborki/web/packs/living-practice/course.config.ts LMS/_template/course.config.template.ts LMS/tochka-sborki/web/lib/course-features.test.ts LMS/tochka-sborki/web/lib/unit-progress.ts LMS/tochka-sborki/web/lib/assembly/types.ts LMS/tochka-sborki/web/lib/assembly/state.ts LMS/tochka-sborki/web/lib/assembly/state.test.ts
git commit -m "feat(assembly): флаг assemblyMap, контракт машины и расчёт состояний (spec 2026-10-12)"
```

---

### Task 2: соответствие юнит → деталь и тест целостности

**Files:**
- Create: `packs/tochka-sborki/course/assembly-map.ts`, `packs/living-practice/course/assembly-map.ts`, `lib/course/assembly-map.ts`
- Test: `lib/content/assembly-integrity.test.ts`

**Interfaces:**
- Consumes: `AssemblyMap`, `NODE_TARGET` из `@/lib/assembly/types` (Task 1); `CONTENT_ROOT` из `lib/pack.ts`; `OPTIONAL_MODULE_SLUGS` из `lib/rpg/modules.ts`.
- Produces: `ASSEMBLY_MAP: AssemblyMap` из `@/lib/course/assembly-map`.

- [ ] **Step 1: падающий тест `lib/content/assembly-integrity.test.ts`.**
```ts
// Соответствие юнит → деталь сквозной картины (спека 2026-10-12-assembly-map, §2). Новый юнит без детали — красный тест,
// а не молча пропавшая деталь: страницы уроков строятся из _meta.json, картина — из этого соответствия.
import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'fs'
import { join } from 'path'
import { CONTENT_ROOT } from '../pack'
import { COURSE } from '../course'
import { ASSEMBLY_MAP } from '../course/assembly-map'
import { NODE_TARGET } from '../assembly/types'
import { OPTIONAL_MODULE_SLUGS } from '../rpg/modules'

const LOCALES = ['ru', 'en'] as const

function modules(locale: string): string[] {
  return readdirSync(join(CONTENT_ROOT, locale), { withFileTypes: true })
    .filter((e) => e.isDirectory() && /^\d{2}-/.test(e.name))
    .map((e) => e.name)
    .sort()
}

function unitKeys(locale: string): string[] {
  return modules(locale).flatMap((m) =>
    (JSON.parse(readFileSync(join(CONTENT_ROOT, locale, m, '_meta.json'), 'utf8')).units as { slug: string }[])
      .map((u) => `${m}/${u.slug}`))
}

describe.runIf(COURSE.features.assemblyMap)('сквозная картина ↔ контент', () => {
  it.each(LOCALES)('у каждого юнита (%s) есть запись соответствия, лишних записей нет', (locale) => {
    expect(Object.keys(ASSEMBLY_MAP.units).sort()).toEqual(unitKeys(locale).sort())
  })

  it('у каждого модуля ровно один узел', () => {
    const byModule = ASSEMBLY_MAP.nodes.map((n) => n.module).sort()
    expect(byModule).toEqual(modules('ru'))
  })

  it('id узлов и деталей уникальны', () => {
    const ids = [...ASSEMBLY_MAP.nodes.map((n) => n.id), ...ASSEMBLY_MAP.parts.map((p) => p.id)]
    expect(new Set(ids).size).toBe(ids.length)
  })

  it('запись юнита ведёт на деталь узла своего модуля или на корпус', () => {
    const nodeOfModule = new Map(ASSEMBLY_MAP.nodes.map((n) => [n.module, n.id]))
    const partNode = new Map(ASSEMBLY_MAP.parts.map((p) => [p.id, p.node]))
    for (const [key, target] of Object.entries(ASSEMBLY_MAP.units)) {
      if (target === NODE_TARGET) continue
      expect(partNode.get(target), `${key} → ${target}: детали нет`).toBeDefined()
      expect(partNode.get(target), `${key} → ${target}: деталь чужого узла`).toBe(nodeOfModule.get(key.split('/')[0]))
    }
  })

  it('каждая деталь принадлежит ровно одному юниту (сирот нет)', () => {
    const used = Object.values(ASSEMBLY_MAP.units).filter((t) => t !== NODE_TARGET)
    expect([...used].sort()).toEqual(ASSEMBLY_MAP.parts.map((p) => p.id).sort())
  })

  it('опциональные узлы совпадают с каноном OPTIONAL_MODULE_SLUGS', () => {
    const optional = ASSEMBLY_MAP.nodes.filter((n) => n.optional).map((n) => n.module).sort()
    expect(optional).toEqual([...OPTIONAL_MODULE_SLUGS].sort())
  })

  it('у каждого узла и детали есть подписи RU и EN', () => {
    for (const x of [...ASSEMBLY_MAP.nodes, ...ASSEMBLY_MAP.parts]) {
      expect(x.label.ru.trim(), `${x.id}: нет RU`).not.toBe('')
      expect(x.label.en.trim(), `${x.id}: нет EN`).not.toBe('')
    }
  })
})

describe.runIf(!COURSE.features.assemblyMap)('курс без картины', () => {
  it('соответствие пустое', () => {
    expect(ASSEMBLY_MAP.nodes).toHaveLength(0)
    expect(ASSEMBLY_MAP.parts).toHaveLength(0)
    expect(Object.keys(ASSEMBLY_MAP.units)).toHaveLength(0)
  })
})
```

- [ ] **Step 2: прогнать — падает.** Run: `npx vitest run lib/content/assembly-integrity.test.ts` — Expected: FAIL (`Failed to resolve import "../course/assembly-map"`).

- [ ] **Step 3: стаб движка `lib/course/assembly-map.ts`.**
```ts
// Стаб course-pack: соответствие юнит → деталь сквозной картины живёт в packs/<pack>/course/assembly-map.ts.
export * from '@pack/course/assembly-map'
```

- [ ] **Step 4: пустое соответствие `packs/living-practice/course/assembly-map.ts`.**
```ts
// Сквозной картины у курса нет (features.assemblyMap = false); пустое соответствие — чтобы стаб движка резолвился.
import type { AssemblyMap } from '@/lib/assembly/types'

export const ASSEMBLY_MAP: AssemblyMap = { nodes: [], parts: [], units: {} }
```

- [ ] **Step 5: соответствие Точки Сборки `packs/tochka-sborki/course/assembly-map.ts`.** Полный файл (узлы — спека §1; детали — черновые имена, настоящая машина в задаче 7 обязана сохранить id):
```ts
// Сквозная картина Точки Сборки: агент = модель + обвязка (спека docs/superpowers/specs/2026-10-12-assembly-map-design.md).
// Узел — модуль, деталь — юнит; юниты-фазы (activation, reflect) — корпус узла (NODE_TARGET).
// Id — контракт с геометрией (assembly-machine.tsx): переименование id = правка обоих файлов, тест целостности следит.
import { NODE_TARGET, type AssemblyMap } from '@/lib/assembly/types'

const N = NODE_TARGET

export const ASSEMBLY_MAP: AssemblyMap = {
  nodes: [
    { id: 'start', module: '00-kickstart', optional: false, label: { ru: 'Пульт: кнопка пуска', en: 'Console: start button' } },
    { id: 'frame', module: '01-introduction', optional: false, label: { ru: 'Станина: модель + обвязка', en: 'Frame: model + harness' } },
    { id: 'bench', module: '02-setup-guide', optional: false, label: { ru: 'Рабочее место', en: 'Workbench' } },
    { id: 'engine', module: '03-stack-selection', optional: false, label: { ru: 'Двигательный отсек: шлюз к моделям', en: 'Engine bay: model gateway' } },
    { id: 'intake', module: '04-prompt-engineering', optional: false, label: { ru: 'Приёмник заданий', en: 'Job intake' } },
    { id: 'cards', module: '05-context-memory', optional: false, label: { ru: 'Картотека: контекст и память', en: 'Card index: context and memory' } },
    { id: 'conveyor', module: '06-audio-pipeline', optional: false, label: { ru: 'Конвейер: pipeline', en: 'Conveyor: pipeline' } },
    { id: 'turret', module: '07-tools', optional: false, label: { ru: 'Головка насадок: MCP, Hooks, Skills', en: 'Tool turret: MCP, Hooks, Skills' } },
    { id: 'dispatch', module: '08-agent-engineering', optional: false, label: { ru: 'Диспетчер: субагенты и оркестрация', en: 'Dispatcher: subagents and orchestration' } },
    { id: 'reading', module: '09-ai-notebook', optional: true, label: { ru: 'Читальный стол: AI-тетрадка', en: 'Reading desk: AI notebook' } },
    { id: 'tuning', module: '10-model-training', optional: true, label: { ru: 'Стенд доводки двигателя', en: 'Engine tuning stand' } },
    { id: 'archive', module: '11-second-brain', optional: true, label: { ru: 'Архив: второй мозг', en: 'Archive: second brain' } },
  ],
  parts: [
    { id: 'start.glossary-plate', node: 'start', label: { ru: 'Табличка шести слов', en: 'Six-word plate' } },
    { id: 'start.idea-lamp', node: 'start', label: { ru: 'Лампа идеи', en: 'Idea lamp' } },
    { id: 'start.tool-rack', node: 'start', label: { ru: 'Стойка инструментов', en: 'Tool rack' } },
    { id: 'start.go-button', node: 'start', label: { ru: 'Кнопка пуска', en: 'Start button' } },
    { id: 'start.source-tag', node: 'start', label: { ru: 'Бирка первоисточника', en: 'Source tag' } },
    { id: 'frame.shift-gears', node: 'frame', label: { ru: 'Четыре шестерни сдвигов', en: 'Four shift gears' } },
    { id: 'frame.clone-plate', node: 'frame', label: { ru: 'Шильдик типов клонов', en: 'Clone-type plate' } },
    { id: 'frame.first-slip', node: 'frame', label: { ru: 'Первый бланк задания', en: 'First job slip' } },
    { id: 'bench.gauge', node: 'bench', label: { ru: 'Прибор проверки окружения', en: 'Environment gauge' } },
    { id: 'bench.terminal', node: 'bench', label: { ru: 'Терминал с агентом', en: 'Terminal with the agent' } },
    { id: 'bench.workpiece', node: 'bench', label: { ru: 'Первая заготовка', en: 'First workpiece' } },
    { id: 'engine.selector', node: 'engine', label: { ru: 'Переключатель четырёх стеков', en: 'Four-stack selector' } },
    { id: 'engine.bypass', node: 'engine', label: { ru: 'Обходной канал', en: 'Bypass duct' } },
    { id: 'engine.local-engine', node: 'engine', label: { ru: 'Свой двигатель', en: 'Your own engine' } },
    { id: 'engine.adapter', node: 'engine', label: { ru: 'Переходник миграции', en: 'Migration adapter' } },
    { id: 'intake.spec-form', node: 'intake', label: { ru: 'Бланк спецификации', en: 'Spec form' } },
    { id: 'intake.keys', node: 'intake', label: { ru: 'Клавиши-усилители', en: 'Booster keys' } },
    { id: 'intake.reject-tray', node: 'intake', label: { ru: 'Лоток брака', en: 'Reject tray' } },
    { id: 'intake.stamped-job', node: 'intake', label: { ru: 'Заверенное задание', en: 'Stamped job' } },
    { id: 'cards.desk-drawer', node: 'cards', label: { ru: 'Стол и ящик: контекст и промпт', en: 'Desk and drawer: context vs prompt' } },
    { id: 'cards.memory-drawer', node: 'cards', label: { ru: 'Ящик памяти', en: 'Memory drawer' } },
    { id: 'cards.agents-card', node: 'cards', label: { ru: 'Карточка AGENTS.md', en: 'AGENTS.md card' } },
    { id: 'conveyor.sensor-gate', node: 'conveyor', label: { ru: 'Ворота-датчик', en: 'Sensor gate' } },
    { id: 'conveyor.belt', node: 'conveyor', label: { ru: 'Лента с исполнителями', en: 'Belt with actuators' } },
    { id: 'conveyor.timer', node: 'conveyor', label: { ru: 'Таймер запуска', en: 'Start timer' } },
    { id: 'turret.mcp-socket', node: 'turret', label: { ru: 'Разъём MCP', en: 'MCP socket' } },
    { id: 'turret.hook-trip', node: 'turret', label: { ru: 'Концевик Hook', en: 'Hook trip switch' } },
    { id: 'turret.skill-bits', node: 'turret', label: { ru: 'Насадки Skills', en: 'Skill bits' } },
    { id: 'turret.test-jig', node: 'turret', label: { ru: 'Проверочная оснастка', en: 'Test jig' } },
    { id: 'turret.inspector', node: 'turret', label: { ru: 'Щуп-проверяльщик', en: 'Inspection probe' } },
    { id: 'dispatch.load-chart', node: 'dispatch', label: { ru: 'Таблица допустимой нагрузки', en: 'Load chart' } },
    { id: 'dispatch.arms', node: 'dispatch', label: { ru: 'Манипуляторы-субагенты', en: 'Subagent arms' } },
    { id: 'dispatch.housing', node: 'dispatch', label: { ru: 'Производственный кожух', en: 'Production housing' } },
    { id: 'dispatch.blueprint', node: 'dispatch', label: { ru: 'Чертёж своего клона', en: "Your clone's blueprint" } },
    { id: 'dispatch.sdk-module', node: 'dispatch', label: { ru: 'Модуль Agent SDK', en: 'Agent SDK module' } },
    { id: 'reading.notebook', node: 'reading', label: { ru: 'Тетрадка', en: 'Notebook' } },
    { id: 'reading.lens', node: 'reading', label: { ru: 'Увеличительное стекло', en: 'Magnifier' } },
    { id: 'reading.check-marks', node: 'reading', label: { ru: 'Отметки сверки', en: 'Verification marks' } },
    { id: 'reading.output-tray', node: 'reading', label: { ru: 'Лоток форматов', en: 'Output tray' } },
    { id: 'reading.citation-stamp', node: 'reading', label: { ru: 'Штамп цитаты', en: 'Citation stamp' } },
    { id: 'tuning.cutaway', node: 'tuning', label: { ru: 'Разрез двигателя', en: 'Engine cutaway' } },
    { id: 'tuning.data-hopper', node: 'tuning', label: { ru: 'Бункер данных', en: 'Data hopper' } },
    { id: 'tuning.tuning-screws', node: 'tuning', label: { ru: 'Регулировочные винты', en: 'Tuning screws' } },
    { id: 'tuning.dyno-gauge', node: 'tuning', label: { ru: 'Стрелка стенда', en: 'Dyno gauge' } },
    { id: 'tuning.small-engine', node: 'tuning', label: { ru: 'Малый двигатель', en: 'Small engine' } },
    { id: 'archive.vault', node: 'archive', label: { ru: 'Шкаф-архив', en: 'Archive cabinet' } },
    { id: 'archive.antenna', node: 'archive', label: { ru: 'Антенна связи', en: 'Comms antenna' } },
    { id: 'archive.skill-shuttle', node: 'archive', label: { ru: 'Челнок Skills', en: 'Skill shuttle' } },
    { id: 'archive.airlock', node: 'archive', label: { ru: 'Шлюз проверки входящего', en: 'Inbound airlock' } },
    { id: 'archive.assembled', node: 'archive', label: { ru: 'Собранный второй мозг', en: 'Assembled second brain' } },
  ],
  units: {
    '00-kickstart/u0-azbuka': 'start.glossary-plate',
    '00-kickstart/u1-map': 'start.idea-lamp',
    '00-kickstart/u2-tools': 'start.tool-rack',
    '00-kickstart/u3-first-steps': 'start.go-button',
    '00-kickstart/u4-sources': 'start.source-tag',
    '01-introduction/u1-activation': N,
    '01-introduction/u2-four-shifts': 'frame.shift-gears',
    '01-introduction/u3-clones': 'frame.clone-plate',
    '01-introduction/u4-practice': 'frame.first-slip',
    '02-setup-guide/u1-env-check': 'bench.gauge',
    '02-setup-guide/u2-install': 'bench.terminal',
    '02-setup-guide/u3-first-project': 'bench.workpiece',
    '03-stack-selection/u1-activation': N,
    '03-stack-selection/u2-stack-matrix': 'engine.selector',
    '03-stack-selection/u3-behind-gfw': 'engine.bypass',
    '03-stack-selection/u4-hermes-sovereign': 'engine.local-engine',
    '03-stack-selection/u5-migrate': 'engine.adapter',
    '04-prompt-engineering/u1-activation': N,
    '04-prompt-engineering/u2-spec-formula': 'intake.spec-form',
    '04-prompt-engineering/u3-magic-words': 'intake.keys',
    '04-prompt-engineering/u4-sins': 'intake.reject-tray',
    '04-prompt-engineering/u5-practice': 'intake.stamped-job',
    '05-context-memory/u1-activation': N,
    '05-context-memory/u2-context-vs-prompt': 'cards.desk-drawer',
    '05-context-memory/u3-memory': 'cards.memory-drawer',
    '05-context-memory/u4-practice': 'cards.agents-card',
    '06-audio-pipeline/u1-activation': N,
    '06-audio-pipeline/u2-pipeline-theory': 'conveyor.sensor-gate',
    '06-audio-pipeline/u3-build': 'conveyor.belt',
    '06-audio-pipeline/u4-reflect': N,
    '06-audio-pipeline/u5-schedule': 'conveyor.timer',
    '07-tools/u1-activation': N,
    '07-tools/u2-mcp': 'turret.mcp-socket',
    '07-tools/u3-hooks': 'turret.hook-trip',
    '07-tools/u4-skills': 'turret.skill-bits',
    '07-tools/u5-practice': 'turret.test-jig',
    '07-tools/u6-pendel': 'turret.inspector',
    '08-agent-engineering/u1-activation': N,
    '08-agent-engineering/u2-jagged-intelligence': 'dispatch.load-chart',
    '08-agent-engineering/u3-orchestration': 'dispatch.arms',
    '08-agent-engineering/u4-production-infra': 'dispatch.housing',
    '08-agent-engineering/u5-practice': 'dispatch.blueprint',
    '08-agent-engineering/u6-agent-sdk': 'dispatch.sdk-module',
    '09-ai-notebook/u1-first-notebook': 'reading.notebook',
    '09-ai-notebook/u2-how-it-works': 'reading.lens',
    '09-ai-notebook/u3-where-it-lies': 'reading.check-marks',
    '09-ai-notebook/u4-formats': 'reading.output-tray',
    '09-ai-notebook/u5-practice': 'reading.citation-stamp',
    '10-model-training/u1-inside-the-model': 'tuning.cutaway',
    '10-model-training/u2-data-is-the-work': 'tuning.data-hopper',
    '10-model-training/u3-fine-tuning': 'tuning.tuning-screws',
    '10-model-training/u4-evaluation': 'tuning.dyno-gauge',
    '10-model-training/u5-practice': 'tuning.small-engine',
    '11-second-brain/u1-your-own-brain': 'archive.vault',
    '11-second-brain/u2-channel': 'archive.antenna',
    '11-second-brain/u3-skills-travel': 'archive.skill-shuttle',
    '11-second-brain/u4-untrusted-input': 'archive.airlock',
    '11-second-brain/u5-practice': 'archive.assembled',
  },
}
```

- [ ] **Step 6: прогнать — зелёное.** Run: `npx vitest run lib/content/assembly-integrity.test.ts` — Expected: PASS (7 тестов под tochka-sborki). Затем полная проверка под оба pack'а (у living-practice — блок «курс без картины»).

- [ ] **Step 7: коммит (контроллер).**
```bash
git add LMS/tochka-sborki/web/lib/course/assembly-map.ts LMS/tochka-sborki/web/packs/tochka-sborki/course/assembly-map.ts LMS/tochka-sborki/web/packs/living-practice/course/assembly-map.ts LMS/tochka-sborki/web/lib/content/assembly-integrity.test.ts
git commit -m "feat(assembly): соответствие 58 юнитов деталям машины + тест целостности"
```

---

### Task 3: черновая машина и компонент картины

**Files:**
- Create: `lib/assembly/iso.ts`, `components/assembly/draft-machine.tsx`, `components/assembly/assembly-figure.tsx`
- Create: `packs/tochka-sborki/course/assembly-machine.tsx`, `packs/living-practice/course/assembly-machine.tsx`, `lib/course/assembly-machine.ts`
- Modify: `app/globals.css` (дописать блок в конец), `lib/content/assembly-integrity.test.ts` (дописать тест)
- Test: `lib/assembly/iso.test.ts`, `components/assembly/assembly-figure.test.tsx`

**Interfaces:**
- Consumes: Task 1 — `MachineDef`, `MachineProps`, `ElementAttrs`, `AssemblyMap`, `assemblyState`, `assemblyLabels`, `assemblySummary`, `moduleHref`, `useUnitProgress().progress`; Task 2 — `ASSEMBLY_MAP`.
- Produces: `isoPoint(x, y, z, scale?)`, `boxFaces(x, y, z, w, d, h, scale?)`; `draftMachine(map): MachineDef | null`; `MACHINE: MachineDef | null` из `@/lib/course/assembly-machine`; компонент `AssemblyFigure({ locale, current?, interactive? })`, корень разметки — `<svg data-am-figure …>`.

- [ ] **Step 1: падающий тест `lib/assembly/iso.test.ts`.**
```ts
import { describe, it, expect } from 'vitest'
import { boxFaces, isoPoint } from './iso'

describe('изометрия', () => {
  it('ось x уходит вправо-вниз, ось z — вверх', () => {
    const [x, y] = isoPoint(1, 0, 0)
    expect(x).toBeCloseTo(0.866, 3)
    expect(y).toBeCloseTo(0.5, 3)
    expect(isoPoint(0, 0, 1)).toEqual([0, -1])
    expect(isoPoint(1, 1, 0, 10)[0]).toBeCloseTo(0, 6)
  })

  it('boxFaces — три видимые грани по четыре точки', () => {
    const f = boxFaces(0, 0, 0, 2, 2, 1, 10)
    for (const face of [f.top, f.left, f.right]) expect(face.split(' ')).toHaveLength(4)
    expect(f.top.split(' ')[0]).toBe('0,-10')
  })
})
```

- [ ] **Step 2: прогнать — падает.** Run: `npx vitest run lib/assembly/iso.test.ts` — Expected: FAIL (`Failed to resolve import "./iso"`).

- [ ] **Step 3: `lib/assembly/iso.ts`.**
```ts
// Изометрический проектор черновой машины: x — вправо-вниз, y — влево-вниз, z — вверх, угол 30°.
const COS30 = Math.cos(Math.PI / 6)

export function isoPoint(x: number, y: number, z: number, scale = 1): [number, number] {
  return [(x - y) * COS30 * scale, ((x + y) * 0.5 - z) * scale]
}

export interface BoxFaces { top: string; left: string; right: string }

/** Видимые грани бруска [x, x+w] × [y, y+d] × [z, z+h]: верх, грань y+d (левая), грань x+w (правая). */
export function boxFaces(x: number, y: number, z: number, w: number, d: number, h: number, scale = 1): BoxFaces {
  const p = (a: number, b: number, c: number) => isoPoint(a, b, c, scale).map((v) => +v.toFixed(2)).join(',')
  return {
    top: [p(x, y, z + h), p(x + w, y, z + h), p(x + w, y + d, z + h), p(x, y + d, z + h)].join(' '),
    left: [p(x, y + d, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x, y + d, z + h)].join(' '),
    right: [p(x + w, y, z), p(x + w, y + d, z), p(x + w, y + d, z + h), p(x + w, y, z + h)].join(' '),
  }
}
```

- [ ] **Step 4: прогнать — зелёное.** Run: `npx vitest run lib/assembly/iso.test.ts` — Expected: PASS.

- [ ] **Step 5: `components/assembly/draft-machine.tsx`.**
```tsx
// Черновая машина: брусок на узел, кубики на детали, раскладка из соответствия. Нужна, чтобы механика картины
// (состояния, подсветка, переходы, доступность) жила до настоящей машины скиллом Anatomy (спека §4, шаг 2).
import type { AssemblyMap, MachineDef, MachineProps } from '@/lib/assembly/types'
import { boxFaces, isoPoint, type BoxFaces } from '@/lib/assembly/iso'

const S = 10
const NODE = 8
const GAP = 4
const BASE_H = 1
const PART = 1.6
const PART_STEP = 2.4
const PART_H = 1.2
const PAD = 12

interface Placed { id: string; x: number; y: number; parts: { id: string; x: number; y: number }[] }

function Box({ f }: { f: BoxFaces }) {
  return (
    <>
      <polygon className="am-left" points={f.left} />
      <polygon className="am-right" points={f.right} />
      <polygon className="am-top" points={f.top} />
    </>
  )
}

export function draftMachine(map: AssemblyMap): MachineDef | null {
  if (map.nodes.length === 0) return null
  const step = NODE + GAP
  const core = map.nodes.filter((n) => !n.optional)
  const extra = map.nodes.filter((n) => n.optional)
  const spots = [
    ...core.map((n, i) => ({ id: n.id, x: (i % 3) * step, y: Math.floor(i / 3) * step })),
    ...extra.map((n, i) => ({ id: n.id, x: 3 * step, y: i * step })),
  ]
  const placed: Placed[] = spots
    .map((s) => ({
      ...s,
      parts: map.parts
        .filter((p) => p.node === s.id)
        .map((p, i) => ({ id: p.id, x: s.x + 1 + (i % 3) * PART_STEP, y: s.y + 1 + Math.floor(i / 3) * PART_STEP }))
        .sort((a, b) => a.x + a.y - (b.x + b.y)),
    }))
    .sort((a, b) => a.x + a.y - (b.x + b.y))

  const corners = placed.flatMap((n) =>
    [[n.x, n.y], [n.x + NODE, n.y], [n.x, n.y + NODE], [n.x + NODE, n.y + NODE]].flatMap(([x, y]) =>
      [isoPoint(x, y, 0, S), isoPoint(x, y, BASE_H + PART_H, S)]))
  const xs = corners.map((c) => c[0])
  const ys = corners.map((c) => c[1])
  const minX = Math.min(...xs) - PAD
  const minY = Math.min(...ys) - PAD
  const viewBox = [minX, minY, Math.max(...xs) + PAD - minX, Math.max(...ys) + PAD - minY].map((v) => +v.toFixed(2)).join(' ')

  function Art({ part, node, title }: MachineProps) {
    return (
      <g>
        {placed.map((n) => (
          <g key={n.id} {...node(n.id)}>
            <title>{title(n.id)}</title>
            <Box f={boxFaces(n.x, n.y, 0, NODE, NODE, BASE_H, S)} />
            {n.parts.map((p) => (
              <g key={p.id} {...part(p.id)}>
                <title>{title(p.id)}</title>
                <Box f={boxFaces(p.x, p.y, BASE_H, PART, PART, PART_H, S)} />
              </g>
            ))}
          </g>
        ))}
      </g>
    )
  }

  return {
    viewBox,
    nodeIds: placed.map((n) => n.id),
    partIds: placed.flatMap((n) => n.parts.map((p) => p.id)),
    Art,
  }
}
```

- [ ] **Step 6: машины pack'ов и стаб.**

`packs/tochka-sborki/course/assembly-machine.tsx`:
```tsx
// Геометрия сквозной картины. Пока — черновая машина из соответствия; настоящую строит скилл Anatomy (план, задача 7)
// с теми же id узлов и деталей (контракт MachineDef / MachineProps в lib/assembly/types.ts).
import { draftMachine } from '@/components/assembly/draft-machine'
import type { MachineDef } from '@/lib/assembly/types'
import { ASSEMBLY_MAP } from './assembly-map'

export const MACHINE: MachineDef | null = draftMachine(ASSEMBLY_MAP)
```
`packs/living-practice/course/assembly-machine.tsx`:
```tsx
// Сквозной картины у курса нет (features.assemblyMap = false).
import type { MachineDef } from '@/lib/assembly/types'

export const MACHINE: MachineDef | null = null
```
`lib/course/assembly-machine.ts`:
```ts
// Стаб course-pack: геометрия сквозной картины живёт в packs/<pack>/course/assembly-machine.tsx.
export * from '@pack/course/assembly-machine'
```

- [ ] **Step 7: тест целостности машины.** В конец блока `describe.runIf(COURSE.features.assemblyMap)` файла `lib/content/assembly-integrity.test.ts` добавить тест и импорт `import { MACHINE } from '../course/assembly-machine'` в шапку:
```ts
  it('геометрия машины несёт ровно те узлы и детали, что в соответствии', () => {
    expect(MACHINE, 'нет геометрии машины').not.toBeNull()
    expect([...MACHINE!.nodeIds].sort()).toEqual(ASSEMBLY_MAP.nodes.map((n) => n.id).sort())
    expect([...MACHINE!.partIds].sort()).toEqual(ASSEMBLY_MAP.parts.map((p) => p.id).sort())
  })
```

- [ ] **Step 8: падающий тест `components/assembly/assembly-figure.test.tsx`.**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { AssemblyFigure } from './assembly-figure'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'

describe.runIf(COURSE.features.assemblyMap)('AssemblyFigure', () => {
  const unit = { module: '06-audio-pipeline', unit: 'u5-schedule' }

  it('рисует все узлы и детали; без прогресса всё контуром, текущая деталь подсвечена', () => {
    const html = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(html).toContain('data-am-figure')
    for (const n of ASSEMBLY_MAP.nodes) expect(html).toContain(`data-am-node="${n.id}"`)
    expect(html.match(/data-am-part="/g)).toHaveLength(ASSEMBLY_MAP.parts.length)
    expect(html).not.toContain('data-am-state="built"')
    expect(html).toMatch(/data-am-part="conveyor\.timer"[^>]*data-am-current="true"/)
  })

  it('без interactive — role="img", узлы не фокусируются; с interactive — role="group" и узлы-ссылки', () => {
    const still = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(still).toContain('role="img"')
    expect(still).not.toContain('tabindex="0"')
    const live = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} interactive />)
    expect(live).toContain('role="group"')
    expect(live.match(/role="link"/g)).toHaveLength(ASSEMBLY_MAP.nodes.length)
  })

  it('заголовок, описание и скрытый список на языке страницы', () => {
    const ru = renderToStaticMarkup(<AssemblyFigure locale="ru" current={unit} />)
    expect(ru).toContain('Машина, которую ты собираешь')
    expect(ru).toContain('Сейчас — Конвейер: pipeline → Таймер запуска.')
    expect(ru).toContain('class="am-sr"')
    const en = renderToStaticMarkup(<AssemblyFigure locale="en" current={unit} />)
    expect(en).toContain('The machine you are building')
    expect(en).toContain('Now — Conveyor: pipeline → Start timer.')
  })

  it('юнит-фаза подсвечивает корпус узла', () => {
    const html = renderToStaticMarkup(<AssemblyFigure locale="ru" current={{ module: '06-audio-pipeline', unit: 'u1-activation' }} />)
    expect(html).toMatch(/data-am-node="conveyor"[^>]*data-am-current="true"/)
  })
})

describe.runIf(!COURSE.features.assemblyMap)('AssemblyFigure у курса без картины', () => {
  it('ничего не рисует', () => {
    expect(renderToStaticMarkup(<AssemblyFigure locale="ru" current={null} />)).toBe('')
  })
})
```

- [ ] **Step 9: прогнать — падает.** Run: `npx vitest run components/assembly/assembly-figure.test.tsx` — Expected: FAIL (`Failed to resolve import "./assembly-figure"`).

- [ ] **Step 10: `components/assembly/assembly-figure.tsx`.**
```tsx
'use client'

// Сквозная картина курса (спека 2026-10-12-assembly-map): машина из pack'а, состояние — из прогресса ученика.
// При сборке рендерится с пустым прогрессом (всё контуром, текущая деталь подсвечена), в браузере дособирается.
import { useId } from 'react'
import { useRouter } from 'next/navigation'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'
import { MACHINE } from '@/lib/course/assembly-machine'
import { assemblyLabels, assemblyState, assemblySummary, moduleHref } from '@/lib/assembly/state'
import type { ElementAttrs } from '@/lib/assembly/types'
import { useUnitProgress } from '@/lib/unit-progress'

interface Props {
  locale: 'ru' | 'en'
  current?: { module: string; unit: string } | null
  /** Узлы — ссылки на свой модуль (полная картина); без него — неподвижная иллюстрация (миниатюра). */
  interactive?: boolean
}

export function AssemblyFigure({ locale, current = null, interactive = false }: Props) {
  const { progress } = useUnitProgress()
  const router = useRouter()
  const uid = useId()
  if (!COURSE.features.assemblyMap || !MACHINE) return null

  const st = assemblyState(ASSEMBLY_MAP, progress, current)
  const sum = assemblySummary(ASSEMBLY_MAP, st, locale)
  const labels = assemblyLabels(ASSEMBLY_MAP, locale)
  const moduleOf = new Map(ASSEMBLY_MAP.nodes.map((n) => [n.id, n.module]))

  const part = (id: string): ElementAttrs => ({
    'data-am-part': id,
    'data-am-state': st.parts[id] ?? 'ghost',
    'data-am-current': st.current?.part === id ? 'true' : undefined,
  })
  const node = (id: string): ElementAttrs => {
    const base: ElementAttrs = {
      'data-am-node': id,
      'data-am-state': st.nodes[id]?.shell ?? 'ghost',
      'data-am-current': st.current?.node === id && st.current.part === null ? 'true' : undefined,
    }
    if (!interactive) return base
    const go = () => router.push(moduleHref(moduleOf.get(id) ?? '', locale))
    return {
      ...base,
      role: 'link',
      tabIndex: 0,
      'aria-label': labels[id],
      onClick: go,
      onKeyDown: (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go() } },
    }
  }
  const title = (id: string) => labels[id] ?? id
  const Art = MACHINE.Art

  return (
    <figure className="am-figure-wrap">
      <svg
        data-am-figure=""
        className="am-figure"
        viewBox={MACHINE.viewBox}
        role={interactive ? 'group' : 'img'}
        aria-labelledby={`${uid}-t`}
        aria-describedby={`${uid}-d`}
      >
        <title id={`${uid}-t`}>{sum.title}</title>
        <desc id={`${uid}-d`}>{sum.desc}</desc>
        <Art part={part} node={node} title={title} />
      </svg>
      <ul className="am-sr">
        {sum.items.map((item) => <li key={item}>{item}</li>)}
      </ul>
    </figure>
  )
}
```

- [ ] **Step 11: стили — дописать в конец `app/globals.css`.**
```css
/* Сквозная картина курса (components/assembly, спека 2026-10-12-assembly-map). Анимацию гасят общие правила
   prefers-reduced-motion и [data-lite="on"] выше. */
.am-figure-wrap { margin: 0; }
.am-figure {
  --am-top: #ece7dd; --am-left: #cfc7b8; --am-right: #b8af9f; --am-edge: #6b6558;
  display: block; width: 100%; height: auto;
}
[data-theme="dark"] .am-figure { --am-top: #3b3934; --am-left: #2c2a26; --am-right: #23211f; --am-edge: #a7a093; }
.am-figure .am-top { fill: var(--am-top); }
.am-figure .am-left { fill: var(--am-left); }
.am-figure .am-right { fill: var(--am-right); }
.am-figure :is(polygon, path, rect, ellipse, circle, polyline) { stroke: var(--am-edge); stroke-width: 0.6; stroke-linejoin: round; }
.am-figure [data-am-state="ghost"] > :is(polygon, path, rect, ellipse, circle, polyline) { fill: none; stroke-dasharray: 2 2; opacity: 0.55; }
.am-figure [data-am-current="true"] > :is(polygon, path, rect, ellipse, circle, polyline) {
  stroke: var(--text-accent); stroke-width: 1.4; stroke-dasharray: none; opacity: 1;
  animation: am-pulse 2.4s ease-in-out infinite;
}
.am-figure [data-am-node][role="link"] { cursor: pointer; }
.am-figure [data-am-node][role="link"]:focus-visible { outline: 2px solid var(--text-accent); outline-offset: 2px; }
@keyframes am-pulse { 0%, 100% { stroke-opacity: 1; } 50% { stroke-opacity: 0.35; } }
.am-sr { position: absolute; width: 1px; height: 1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; margin: 0; padding: 0; }
```

- [ ] **Step 12: прогнать — зелёное.** Run: `npx vitest run components/assembly lib/assembly lib/content/assembly-integrity.test.ts` — Expected: PASS. Затем полная проверка под оба pack'а.

- [ ] **Step 13: коммит (контроллер).**
```bash
git add LMS/tochka-sborki/web/lib/assembly/iso.ts LMS/tochka-sborki/web/lib/assembly/iso.test.ts LMS/tochka-sborki/web/components/assembly/draft-machine.tsx LMS/tochka-sborki/web/components/assembly/assembly-figure.tsx LMS/tochka-sborki/web/components/assembly/assembly-figure.test.tsx LMS/tochka-sborki/web/packs/tochka-sborki/course/assembly-machine.tsx LMS/tochka-sborki/web/packs/living-practice/course/assembly-machine.tsx LMS/tochka-sborki/web/lib/course/assembly-machine.ts LMS/tochka-sborki/web/app/globals.css LMS/tochka-sborki/web/lib/content/assembly-integrity.test.ts
git commit -m "feat(assembly): черновая машина и компонент картины (состояния, подсветка, доступность)"
```

---

### Task 4: картина на страницах юнитов

**Files:**
- Create: `components/assembly/unit-assembly.tsx`
- Modify: `components/pages/unit-page.tsx` (импорт + одна строка после `ModuleObjectives`), `app/globals.css` (дописать блок)
- Test: `components/assembly/unit-assembly.test.tsx`

**Interfaces:**
- Consumes: Task 3 — `AssemblyFigure`; Task 1 — `assemblyCaption`; Task 2 — `ASSEMBLY_MAP`.
- Produces: компонент `UnitAssembly({ moduleSlug, unitSlug, unitIndex, locale })`.

- [ ] **Step 1: падающий тест `components/assembly/unit-assembly.test.tsx`.**
```tsx
import { describe, it, expect, vi } from 'vitest'
import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { renderToStaticMarkup } from 'react-dom/server'

vi.mock('next/navigation', () => ({ useRouter: () => ({ push: () => {} }) }))

import { UnitAssembly } from './unit-assembly'
import { COURSE } from '@/lib/course'

describe.runIf(COURSE.features.assemblyMap)('UnitAssembly', () => {
  it('первый юнит модуля — полная интерактивная картина с подписью', () => {
    const html = renderToStaticMarkup(<UnitAssembly moduleSlug="06-audio-pipeline" unitSlug="u1-activation" unitIndex={0} locale="ru" />)
    expect(html).toContain('am-unit--full')
    expect(html).toContain('role="group"')
    expect(html).toContain('Ты собираешь: Конвейер: pipeline')
    expect(html).not.toContain('<dialog')
  })

  it('остальные юниты — миниатюра-кнопка с подписью; полная картина не смонтирована до открытия', () => {
    const html = renderToStaticMarkup(<UnitAssembly moduleSlug="06-audio-pipeline" unitSlug="u5-schedule" unitIndex={4} locale="en" />)
    expect(html).toContain('aria-haspopup="dialog"')
    expect(html).toContain("You&#x27;re building: Conveyor: pipeline → Start timer")
    expect(html).toContain('<dialog')
    expect(html.match(/data-am-figure/g)).toHaveLength(1)
    expect(html).toContain('role="img"')
  })
})

describe.runIf(!COURSE.features.assemblyMap)('UnitAssembly у курса без картины', () => {
  it('ничего не рисует', () => {
    expect(renderToStaticMarkup(<UnitAssembly moduleSlug="m" unitSlug="u" unitIndex={0} locale="ru" />)).toBe('')
  })
})

describe('страница юнита', () => {
  it('ставит UnitAssembly за флагом курса, а не за именем pack\'а', () => {
    const src = readFileSync(join(process.cwd(), 'components/pages/unit-page.tsx'), 'utf8')
    expect(src).toMatch(/COURSE\.features\.assemblyMap && <UnitAssembly/)
  })
})
```

- [ ] **Step 2: прогнать — падает.** Run: `npx vitest run components/assembly/unit-assembly.test.tsx` — Expected: FAIL (`Failed to resolve import "./unit-assembly"`).

- [ ] **Step 3: `components/assembly/unit-assembly.tsx`.**
```tsx
'use client'

// Место картины на странице юнита (спека §3 с поправкой плана): первый юнит модуля — полная картина,
// остальные — миниатюра, по клику полная картина в <dialog> (Esc и возврат фокуса — нативные).
import { useRef, useState } from 'react'
import { COURSE } from '@/lib/course'
import { ASSEMBLY_MAP } from '@/lib/course/assembly-map'
import { assemblyCaption } from '@/lib/assembly/state'
import { AssemblyFigure } from './assembly-figure'

const COPY = {
  ru: { title: 'Машина, которую ты собираешь', open: 'Открыть всю машину', close: 'Закрыть' },
  en: { title: 'The machine you are building', open: 'Open the whole machine', close: 'Close' },
} as const

interface Props { moduleSlug: string; unitSlug: string; unitIndex: number; locale: 'ru' | 'en' }

export function UnitAssembly({ moduleSlug, unitSlug, unitIndex, locale }: Props) {
  const dialog = useRef<HTMLDialogElement>(null)
  const [open, setOpen] = useState(false)
  if (!COURSE.features.assemblyMap) return null

  const current = { module: moduleSlug, unit: unitSlug }
  const caption = assemblyCaption(ASSEMBLY_MAP, current, locale)
  const t = COPY[locale]

  if (unitIndex === 0) {
    return (
      <section className="am-unit am-unit--full" aria-label={t.title}>
        <AssemblyFigure locale={locale} current={current} interactive />
        <p className="am-caption">{caption}</p>
      </section>
    )
  }

  return (
    <div className="am-unit am-unit--mini">
      <button
        type="button"
        className="am-mini"
        aria-haspopup="dialog"
        aria-label={`${caption}. ${t.open}`}
        onClick={() => { setOpen(true); dialog.current?.showModal() }}
      >
        <AssemblyFigure locale={locale} current={current} />
        <span className="am-mini-text">
          <span className="am-caption">{caption}</span>
          <span className="am-open">{t.open}</span>
        </span>
      </button>
      <dialog ref={dialog} className="am-dialog" aria-label={t.title} onClose={() => setOpen(false)}>
        <button type="button" className="am-close" onClick={() => dialog.current?.close()}>{t.close}</button>
        {open && <AssemblyFigure locale={locale} current={current} interactive />}
      </dialog>
    </div>
  )
}
```

- [ ] **Step 4: встроить в `components/pages/unit-page.tsx`.** Импорт рядом с `ModuleObjectives`:
```tsx
import { UnitAssembly } from '@/components/assembly/unit-assembly'
```
и сразу после строки `{unitIndex === 0 && <ModuleObjectives … />}`:
```tsx
          {COURSE.features.assemblyMap && <UnitAssembly moduleSlug={moduleSlug} unitSlug={unitSlug} unitIndex={unitIndex} locale={lc} />}
```

- [ ] **Step 5: стили — дописать в конец `app/globals.css`.**
```css
.am-unit { margin: 0 0 1.5rem; }
.am-caption { font-family: var(--font-mono); font-size: var(--text-xs); color: var(--text-secondary); margin: 0.5rem 0 0; }
.am-mini {
  display: flex; gap: 0.75rem; align-items: center; width: 100%; padding: 0.5rem 0.75rem;
  border: 1px solid var(--border-color); border-radius: var(--radius); background: var(--bg-surface);
  color: var(--text-primary); font: inherit; text-align: left; cursor: pointer;
}
.am-mini .am-figure-wrap { flex: 0 0 160px; width: 160px; }
.am-mini-text { display: flex; flex-direction: column; gap: 0.25rem; }
.am-mini .am-caption { margin: 0; }
.am-open { font-size: var(--text-xs); color: var(--text-accent); }
@media (max-width: 640px) {
  .am-mini { flex-direction: column; align-items: stretch; }
  .am-mini .am-figure-wrap { flex-basis: auto; width: 100%; }
  .am-mini .am-figure { max-height: 140px; }
}
.am-dialog {
  width: min(960px, 94vw); padding: 1rem; border: 1px solid var(--border-color); border-radius: var(--radius);
  background: var(--bg-surface); color: var(--text-primary);
}
.am-dialog::backdrop { background: rgb(0 0 0 / 0.55); }
.am-close { display: block; margin: 0 0 0.75rem auto; font: inherit; cursor: pointer; }
```

- [ ] **Step 6: прогнать — зелёное.** Run: `npx vitest run components/assembly` — Expected: PASS. Затем полная проверка под оба pack'а.

- [ ] **Step 7: коммит (контроллер).**
```bash
git add LMS/tochka-sborki/web/components/assembly/unit-assembly.tsx LMS/tochka-sborki/web/components/assembly/unit-assembly.test.tsx LMS/tochka-sborki/web/components/pages/unit-page.tsx LMS/tochka-sborki/web/app/globals.css
git commit -m "feat(assembly): картина на юнитах — полная на первом юните модуля, миниатюра с окном на остальных"
```

---

### Task 5: бюджет веса в сборке

**Files:**
- Create: `scripts/check-assembly-weight.mjs`
- Modify: `package.json` (скрипт `postbuild`)
- Test: `lib/assembly-weight.test.ts`

**Interfaces:**
- Consumes: разметка `<svg data-am-figure …>` из Task 3.
- Produces: `figureBytes(html): number`, `checkAssemblyWeight(outDir, budget?)`, `figureExpected(webRoot): boolean`, `BUDGET_BYTES = 204800`.

- [ ] **Step 1: падающий тест `lib/assembly-weight.test.ts`.**
```ts
import { describe, it, expect } from 'vitest'
import { mkdtempSync, mkdirSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { tmpdir } from 'node:os'
import { BUDGET_BYTES, checkAssemblyWeight, figureBytes, figureExpected } from '../scripts/check-assembly-weight.mjs'

const svg = (inner: string) => `<svg data-am-figure="" class="am-figure" viewBox="0 0 1 1">${inner}</svg>`

function out(pages: Record<string, string>): string {
  const dir = mkdtempSync(join(tmpdir(), 'am-weight-'))
  for (const [p, html] of Object.entries(pages)) {
    mkdirSync(join(dir, p), { recursive: true })
    writeFileSync(join(dir, p, 'index.html'), html)
  }
  return dir
}

describe('бюджет веса картины', () => {
  it('figureBytes меряет самую тяжёлую картину страницы в байтах UTF-8; нет картины — 0', () => {
    expect(figureBytes('<p>нет</p>')).toBe(0)
    const a = svg('<g/>')
    expect(figureBytes(`<div>${a}</div>`)).toBe(Buffer.byteLength(a))
    expect(figureBytes(`${svg('я')}${svg('<g/><g/>')}`)).toBe(Buffer.byteLength(svg('<g/><g/>')))
  })

  it('checkAssemblyWeight смотрит только страницы уроков и находит превышение', () => {
    const dir = out({
      'lessons/06/u1': `<html>${svg('x'.repeat(10))}</html>`,
      'en/lessons/06/u2': `<html>${svg('x'.repeat(BUDGET_BYTES))}</html>`,
      'cheatsheet': `<html>${svg('x'.repeat(BUDGET_BYTES * 2))}</html>`,
    })
    const r = checkAssemblyWeight(dir)
    expect(r.withFigure).toBe(2)
    expect(r.over).toHaveLength(1)
    expect(r.over[0].page).toMatch(/en[\\/]lessons[\\/]06[\\/]u2/)
  })

  it('figureExpected читает флаг активного pack\'а', () => {
    const root = mkdtempSync(join(tmpdir(), 'am-pack-'))
    mkdirSync(join(root, 'packs', '_active'), { recursive: true })
    writeFileSync(join(root, 'packs', '_active', 'course.config.ts'), 'features: { assemblyMap: true }')
    expect(figureExpected(root)).toBe(true)
    writeFileSync(join(root, 'packs', '_active', 'course.config.ts'), 'features: { assemblyMap: false }')
    expect(figureExpected(root)).toBe(false)
  })
})
```

- [ ] **Step 2: прогнать — падает.** Run: `npx vitest run lib/assembly-weight.test.ts` — Expected: FAIL (`Failed to resolve import "../scripts/check-assembly-weight.mjs"`).

- [ ] **Step 3: `scripts/check-assembly-weight.mjs`.**
```js
// Бюджет веса сквозной картины (спека 2026-10-12-assembly-map, §3): разметка <svg data-am-figure> на странице урока
// ≤ 200 КБ без сжатия. postbuild: превышение — код 1; курс включает картину, а её нет ни на одной странице — тоже код 1.
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'

export const BUDGET_BYTES = 200 * 1024

export function figureBytes(html) {
  let max = 0
  let from = 0
  for (;;) {
    const mark = html.indexOf('data-am-figure', from)
    if (mark < 0) return max
    const start = html.lastIndexOf('<svg', mark)
    const end = html.indexOf('</svg>', mark)
    if (start < 0 || end < 0) return max
    max = Math.max(max, Buffer.byteLength(html.slice(start, end + 6), 'utf8'))
    from = end + 6
  }
}

function pagesUnder(dir) {
  const out = []
  for (const name of readdirSync(dir)) {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) out.push(...pagesUnder(p))
    else if (name === 'index.html') out.push(p)
  }
  return out
}

export function checkAssemblyWeight(outDir, budget = BUDGET_BYTES) {
  const pages = pagesUnder(outDir).filter((p) => /[\\/]lessons[\\/]/.test(p))
  let withFigure = 0
  let worst = { page: null, bytes: 0 }
  const over = []
  for (const page of pages) {
    const bytes = figureBytes(readFileSync(page, 'utf8'))
    if (!bytes) continue
    withFigure += 1
    if (bytes > worst.bytes) worst = { page, bytes }
    if (bytes > budget) over.push({ page, bytes })
  }
  return { pages: pages.length, withFigure, worst, over }
}

export function figureExpected(webRoot) {
  const cfg = join(webRoot, 'packs', '_active', 'course.config.ts')
  return existsSync(cfg) && /assemblyMap:\s*true/.test(readFileSync(cfg, 'utf8'))
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  const outDir = process.argv[2] ?? 'out'
  const expected = figureExpected(process.cwd())
  const r = checkAssemblyWeight(outDir)
  if (expected && r.withFigure === 0) {
    console.error(`check-assembly-weight: FAIL — курс включает картину, но ни на одной из ${r.pages} страниц уроков её нет`)
    process.exit(1)
  }
  if (r.over.length) {
    console.error(`check-assembly-weight: FAIL — ${r.over.length} страниц тяжелее ${BUDGET_BYTES / 1024} КБ`)
    for (const o of r.over.slice(0, 20)) console.error(`  ${o.page}: ${(o.bytes / 1024).toFixed(1)} КБ`)
    process.exit(1)
  }
  if (!expected && r.withFigure === 0) {
    console.log('check-assembly-weight: картина у курса выключена — проверять нечего')
  } else {
    console.log(`check-assembly-weight: ${r.withFigure} страниц с картиной, тяжелейшая ${(r.worst.bytes / 1024).toFixed(1)} КБ из ${BUDGET_BYTES / 1024}`)
  }
}
```

- [ ] **Step 4: postbuild.** В `package.json` строку
```json
    "postbuild": "node scripts/stamp-sw.mjs && node scripts/prune-public.mjs && node scripts/finalize-mirror.mjs",
```
заменить на
```json
    "postbuild": "node scripts/stamp-sw.mjs && node scripts/prune-public.mjs && node scripts/finalize-mirror.mjs && node scripts/check-assembly-weight.mjs out",
```

- [ ] **Step 5: прогнать — зелёное.** Run: `npx vitest run lib/assembly-weight.test.ts` — Expected: PASS. Затем полная проверка под оба pack'а и сборка: `node scripts/select-pack.mjs tochka-sborki && npm run prebuild && npx next build --webpack && node scripts/check-assembly-weight.mjs out` — Expected: строка `check-assembly-weight: 116 страниц с картиной, тяжелейшая N КБ из 200` (58 юнитов × 2 языка), код 0. В worktree Turbopack не работает с junction-`node_modules` — поэтому `--webpack`.

- [ ] **Step 6: коммит (контроллер).**
```bash
git add LMS/tochka-sborki/web/scripts/check-assembly-weight.mjs LMS/tochka-sborki/web/lib/assembly-weight.test.ts LMS/tochka-sborki/web/package.json
git commit -m "feat(assembly): бюджет веса картины в postbuild (≤ 200 КБ на страницу урока)"
```

---

### Task 6 (контроллер): гейты скилла Anatomy и копия библиотеки

**Files:**
- Create: `lib/iso-kit/` (файлы из `kit/` на закреплённом коммите), `lib/iso-kit/LICENSE`, `lib/iso-kit/README.md`

- [ ] **Step 1: закрепить коммит.** `git ls-remote https://github.com/wheresryan22/anatomy.git HEAD` → записать SHA в `lib/iso-kit/README.md` и в ledger. Клон по SHA во временный каталог (`--depth 1` + `git fetch origin <sha>`).
- [ ] **Step 2: SecOps-ревью.** Прочитать целиком `SKILL.md`, `references/*.md`, `scripts/*.mjs` (без тестов), `kit/*.mjs|ts`. Ищем: сетевые вызовы кроме CDP к своему Chrome, запись вне каталога фигуры, `child_process` кроме Chrome и `publish.mjs`, указания агенту что-либо публиковать или ставить. Итог — строка в ledger «ревью: что прочитано, находки».
- [ ] **Step 3: отключить публикацию.** В копии для установки удалить `scripts/publish.mjs` и абзац о публикации в галерею из `SKILL.md` (раздел «publish … community gallery» и строку в `description`).
- [ ] **Step 4: установить для Codex.** Каталог скиллов Codex лаборатории (`~/.agents/skills/anatomy` или путь из конфигурации Codex лаборатории — сверить с `codex` до копирования). Проверка: делегатский смоук `Invoke-Delegate.ps1 -Tier codex -NoGate` с вопросом «перечисли доступные скиллы» — `anatomy` в ответе.
- [ ] **Step 5: смоук на Windows.** В копии: `node examples/dial-indicator/build.mjs --light` (Expected: пишет HTML рядом), `node scripts/capture.mjs` по этой странице (Expected: PNG; при отказе Chrome — issue #50, запуск из обычного, не повышенного терминала). Прочитать PNG глазами.
- [ ] **Step 6: копия библиотеки.** В `LMS/tochka-sborki/web/lib/iso-kit/`: `kit/iso-kit.ts`, `kit/iso.css`, `kit/react/draw.tsx`, `kit/react/live.tsx`, `kit/lathe.mjs`, `kit/tube.mjs`, `kit/audit.mjs`, `LICENSE`; `README.md` — источник, SHA, дата, «правки только переносом новой версии». Проверка: `npx tsc --noEmit` под оба pack'а; если файлы kit не проходят строгий tsconfig курса — исключить `lib/iso-kit/**` из `include` tsconfig и записать это в README.
- [ ] **Step 7: коммит.**
```bash
git add LMS/tochka-sborki/web/lib/iso-kit
git commit -m "chore(assembly): копия kit/ Anatomy на закреплённом коммите (MIT) для настоящей машины"
```
Стоп: ревью нашло сетевые вызовы или установки, которые нельзя отключить, — задача 7 не начинается, черновая машина остаётся; вопрос владельцу.

---

### Task 7: настоящая машина скиллом Anatomy

**Files:**
- Modify: `packs/tochka-sborki/course/assembly-machine.tsx` (замена черновика), при необходимости `app/globals.css` (только переменные цвета `.am-figure`)

**Interfaces:**
- Consumes: контракт `MachineDef` / `MachineProps` (Task 1), `ASSEMBLY_MAP` (Task 2), `lib/iso-kit/` (Task 6), классы и атрибуты состояний `.am-figure`, `data-am-state`, `data-am-current` (Task 3).
- Produces: `MACHINE: MachineDef` с теми же `nodeIds`/`partIds`, что в соответствии.

Это работа скилла, а не транскрипция кода: геометрию придумывает и строит `$anatomy` (размер — Epic, ~12 узлов, 50 деталей + корпуса). Бриф делегату:

- [ ] **Step 1: бриф.** ЦЕЛЬ — изометрическая машина «агент = модель + обвязка» по таблице узлов спеки §1 и деталям из `assembly-map.ts`; двигатель в центре, опциональные узлы (reading, tuning, archive) — навесное оборудование с краю. Контракт: `export const MACHINE: MachineDef`, на группы — `{...node(id)}` / `{...part(id)}`, `<title>{title(id)}</title>` первым потомком, закрашиваемые фигуры — прямые потомки группы; без текста в рисунке (подписи даёт обёртка), без WebGL и 3D, без своих анимаций. Цвета — через переменные `.am-figure` (`--am-top/left/right/edge`) или свои классы с обеими темами.
- [ ] **Step 2: проверки скилла.** `audit.mjs` (ничто не проходит сквозь, концы на опорах, порядок глубины) и `lines.mjs` по собранной странице; снимки обеих тем, крупные планы узлов — PNG в отчёт.
- [ ] **Step 3: проверки курса.** `npx vitest run lib/content/assembly-integrity.test.ts components/assembly` и полная проверка под оба pack'а; сборка + `node scripts/check-assembly-weight.mjs out` — тяжелейшая страница ≤ 200 КБ.
- [ ] **Step 4: приёмка контроллером.** Прочитать все PNG сам; затем показать владельцу снимки в обеих темах (и страницу 06/u5 локально).
- [ ] **Step 5: стоп-критерий.** Не проходит `audit.mjs`/`lines.mjs`, или три рабочие сессии без приёмки, или владелец не видит, что машина объясняет лучше текста — откатить файл к черновику (`git checkout <коммит задачи 3> -- packs/tochka-sborki/course/assembly-machine.tsx`); решение владельца — оставить черновик или выключить флаг.
- [ ] **Step 6: коммит (контроллер).**
```bash
git add LMS/tochka-sborki/web/packs/tochka-sborki/course/assembly-machine.tsx LMS/tochka-sborki/web/app/globals.css
git commit -m "feat(assembly): настоящая машина скиллом Anatomy вместо черновика"
```

---

### Task 8 (контроллер): выкладка и живая проверка

- [ ] **Step 1:** вопрос владельцу «пушить в main?» — push только по «да» (push деплоит прод и зеркало). Выкладка возможна дважды: после задачи 5 (черновая машина) и после задачи 7.
- [ ] **Step 2:** CI «Deploy to Cloudflare» зелёный по всем задачам; в логе `deploy-web` строка `check-assembly-weight: 116 страниц с картиной…`.
- [ ] **Step 3:** браузер: `https://ai.synergify.com/lessons/06-audio-pipeline/u1-activation/` (полная картина, корпус конвейера подсвечен), `…/u5-schedule/` (миниатюра, окно открывается, Esc закрывает, фокус возвращается), то же на `/en/`, то же в зеркале `https://master5d.github.io/ts-gitbook/…`; отметить юнит пройденным — деталь становится собранной; `https://academy.synergify.com/praktika/` — картины нет.
- [ ] **Step 4:** BACKLOG lms-engine — пункт LMS#36 закрыть (или отметить «черновик на проде, машина — задача 7»); NAUTILUS BACKLOG — пункт «фигуры для лаборатории» остаётся до своей спеки.
