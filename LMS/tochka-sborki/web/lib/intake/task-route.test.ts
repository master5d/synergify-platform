import { describe, it, expect } from 'vitest'
import { existsSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { PACK_DIR, PACK_SLUG } from '@/lib/pack'
import { QUESTIONS_V2 } from '@/lib/course/intake-questions'
import { TASK_ROUTES, TASK_ROUTE_CLARIFY, TASK_ROUTE_COPY } from '@/lib/course/task-routes'
import {
  TASK_ROLES, decodeTaskRouteAnswer, encodeTaskRouteAnswer, fillOutcome, normalizeTaskText, profileTaskRoute,
  profileTaskText, resolveClarify, routeFinalModule, routeStepsByModule, routesForRole, taskRouteFromAnswers,
  toRouteMatch, unitModule, type TaskRoute,
} from './task-route'

// Гварды русел (спека docs/superpowers/specs/2026-09-28-onboarding-fork-task-routes.md). Для любого pack'а;
// у pack'а без каталога (living-practice) — проверка, что развилка у него не включена.

const LOCALES = ['ru', 'en'] as const

function unitsOf(locale: string, module: string): string[] | null {
  const p = join(PACK_DIR, 'content', locale, module, '_meta.json')
  if (!existsSync(p)) return null
  return (JSON.parse(readFileSync(p, 'utf8')).units as { slug: string }[]).map(u => u.slug)
}

function moduleOrder(unit: string): number {
  return Number(unitModule(unit).slice(0, 2))
}

describe('каталог русел — гварды данных pack’а', () => {
  it('каждый шаг (и шаг 0) ссылается на существующий юнит — RU и EN', () => {
    const missing: string[] = []
    for (const r of TASK_ROUTES) {
      for (const unit of [r.check.unit, ...r.steps.map(s => s.unit)]) {
        const [module, slug] = unit.split('/')
        for (const l of LOCALES) if (!unitsOf(l, module)?.includes(slug)) missing.push(`${r.key}: ${l}/${unit}`)
      }
    }
    expect(missing, missing.join('\n')).toEqual([])
  })

  it('каждое русло кончается рабочим результатом и называет ложную дорогу (RU+EN)', () => {
    for (const r of TASK_ROUTES) {
      expect(r.steps.length, `${r.key}: меньше двух шагов`).toBeGreaterThanOrEqual(2)
      for (const l of LOCALES) {
        expect(r.result[l].trim(), `${r.key}: нет результата (${l})`).not.toBe('')
        expect(r.falseRoad.title[l].trim(), `${r.key}: нет ложной дороги (${l})`).not.toBe('')
        expect(r.falseRoad.why[l].trim(), `${r.key}: ложная дорога без объяснения (${l})`).not.toBe('')
        expect(r.title[l].trim()).not.toBe('')
        expect(r.summary[l].trim()).not.toBe('')
        for (const s of r.steps) {
          expect(s.title[l].trim(), `${r.key}/${s.unit}`).not.toBe('')
          expect(s.action[l].trim(), `${r.key}/${s.unit}`).not.toBe('')
        }
      }
      expect(r.classifierHint.trim(), `${r.key}: нет подсказки классификатору`).not.toBe('')
    }
  })

  it('шаги идут сквозь курс по модулям без возвратов', () => {
    for (const r of TASK_ROUTES) {
      const orders = r.steps.map(s => moduleOrder(s.unit))
      expect(orders, r.key).toEqual([...orders].sort((a, b) => a - b))
    }
  })

  it('ключи уникальны, kebab-case; роли — из перечня', () => {
    const keys = TASK_ROUTES.map(r => r.key)
    expect(new Set(keys).size).toBe(keys.length)
    for (const r of TASK_ROUTES) {
      expect(r.key).toMatch(/^[a-z0-9]+(-[a-z0-9]+)*$/)
      expect(r.roles.length, r.key).toBeGreaterThan(0)
      for (const role of r.roles) expect(TASK_ROLES).toContain(role)
    }
  })

  it('уточняющие вопросы голосуют только за ключи каталога', () => {
    const keys = new Set(TASK_ROUTES.map(r => r.key))
    for (const q of TASK_ROUTE_CLARIFY) {
      expect(q.weight).toBeGreaterThan(0)
      for (const l of LOCALES) expect(q.prompt[l].trim()).not.toBe('')
      for (const o of q.options) {
        for (const l of LOCALES) expect(o.label[l].trim(), `${q.id}/${o.value}`).not.toBe('')
        for (const k of o.routes) expect(keys.has(k), `${q.id}/${o.value} → ${k}`).toBe(true)
      }
    }
  })

  it('копия шага двуязычная', () => {
    for (const [k, v] of Object.entries(TASK_ROUTE_COPY)) for (const l of LOCALES) expect(v[l].trim(), k).not.toBe('')
  })

  it('развилка в анкете включена тогда и только тогда, когда у pack’а есть каталог', () => {
    const ids = new Set(QUESTIONS_V2.map(q => q.id))
    const on = ['V_ROLE', 'V_TASK_MODE', 'V_TASK_ROUTE'].map(id => ids.has(id))
    expect(on.every(Boolean) || on.every(x => !x), 'вопросы развилки включены частично').toBe(true)
    expect(on[0]).toBe(TASK_ROUTES.length > 0)
    if (on[0]) {
      const route = QUESTIONS_V2.find(q => q.id === 'V_TASK_ROUTE')!
      expect(route.showIf).toEqual({ questionId: 'V_TASK_MODE', equals: 'task' })
      const order = QUESTIONS_V2.map(q => q.id)
      expect(order.indexOf('V_ROLE')).toBeLessThan(order.indexOf('V_NICHE'))
      expect(order.indexOf('V_OUTCOME')).toBeLessThan(order.indexOf('V_TASK_ROUTE'))
      expect(order.indexOf('V_TASK_ROUTE')).toBeLessThan(order.indexOf('V_AUTO_VERDICT'))
      for (const role of TASK_ROLES) expect(routesForRole(role).length, role).toBeGreaterThanOrEqual(3)
    }
  })
})

describe.runIf(PACK_SLUG === 'tochka-sborki')('русла Точки Сборки', () => {
  it('пример владельца: контент для mortgage — пайплайн 04 → 05 → 06 → 07, ложная дорога — оркестрация', () => {
    const r = TASK_ROUTES.find(x => x.key === 'content-pipeline')!
    const modules = [...new Set(r.steps.map(s => unitModule(s.unit).slice(0, 2)))]
    expect(modules).toEqual(['04', '05', '06', '07'])
    expect(r.falseRoad.title.ru).toMatch(/оркестрац/i)
    expect(r.falseRoad.why.ru).toContain('04 → 05 → 06 → 07')
  })

  it('каталог роли сужен, но не пуст; без роли — весь каталог', () => {
    expect(routesForRole(undefined)).toHaveLength(TASK_ROUTES.length)
    expect(routesForRole('creator').length).toBeLessThan(TASK_ROUTES.length)
    expect(routesForRole('creator').map(r => r.key)).not.toContain('support-booking-bot')
    expect(routesForRole('entrepreneur').map(r => r.key)).toContain('support-booking-bot')
  })
})

const A: TaskRoute = {
  key: 'a', roles: ['creator'], title: { ru: 'A', en: 'A' }, summary: { ru: 's', en: 's' }, classifierHint: 'a',
  check: { unit: '06-x/u4' },
  steps: [
    { unit: '04-x/u1', title: { ru: 'один', en: 'one' }, action: { ru: 'д1', en: 'a1' } },
    { unit: '06-x/u2', title: { ru: 'два', en: 'two' }, action: { ru: 'д2', en: 'a2' } },
    { unit: '06-x/u3', title: { ru: 'три', en: 'three' }, action: { ru: 'д3', en: 'a3' } },
  ],
  falseRoad: { title: { ru: 'f', en: 'f' }, why: { ru: 'w', en: 'w' } },
  result: { ru: 'Итог для «{outcome}»', en: 'Result for "{outcome}"' },
}
const B: TaskRoute = { ...A, key: 'b', roles: ['entrepreneur'] }
const C: TaskRoute = { ...A, key: 'c', roles: ['creator', 'entrepreneur'] }
const CAT = [A, B, C]

describe('классификатор не выходит за каталог (toRouteMatch — второй заслон воркера)', () => {
  it('high + ключ каталога → matched', () => {
    expect(toRouteMatch({ route: 'a', confidence: 'high', candidates: [] }, CAT)).toEqual({ status: 'matched', route: 'a' })
  })
  it('ключ вне каталога → не русло, уточнение', () => {
    expect(toRouteMatch({ route: 'made-up', confidence: 'high', candidates: ['zzz', 'b'] }, CAT))
      .toEqual({ status: 'unsure', candidates: ['b'] })
  })
  it('low → уточнение, русло модели идёт первым кандидатом', () => {
    expect(toRouteMatch({ route: 'c', confidence: 'low', candidates: ['a'] }, CAT)).toEqual({ status: 'unsure', candidates: ['c', 'a'] })
  })
  it('мусор → уточнение без кандидатов', () => {
    expect(toRouteMatch(null, CAT)).toEqual({ status: 'unsure', candidates: [] })
    expect(toRouteMatch({ route: 5, candidates: 'a' } as any, CAT)).toEqual({ status: 'unsure', candidates: [] })
  })
  it('каталог роли: ключ другой роли — вне каталога', () => {
    expect(toRouteMatch({ route: 'b', confidence: 'high' }, routesForRole('creator', CAT))).toEqual({ status: 'unsure', candidates: [] })
  })
})

describe('resolveClarify — детерминированное уточнение', () => {
  const Q = [
    { id: 'o', weight: 2, prompt: { ru: '', en: '' }, options: [
      { value: 'x', routes: ['a'], label: { ru: '', en: '' } },
      { value: 'y', routes: ['b'], label: { ru: '', en: '' } },
      { value: 'z', routes: ['zzz'], label: { ru: '', en: '' } },
    ] },
    { id: 't', weight: 1, prompt: { ru: '', en: '' }, options: [
      { value: 'p', routes: ['a', 'c'], label: { ru: '', en: '' } },
      { value: 'q', routes: ['c'], label: { ru: '', en: '' } },
    ] },
  ]
  it('единственный лидер → русло', () => {
    expect(resolveClarify({ o: 'x', t: 'p' }, [], CAT, Q)).toEqual({ route: 'a', leaders: ['a'] })
  })
  it('кандидат модели добавляет голос', () => {
    expect(resolveClarify({ t: 'q' }, ['a'], CAT, Q).leaders).toEqual(['a', 'c'])
    expect(resolveClarify({ t: 'q' }, ['a'], CAT, Q).route).toBeNull()
  })
  it('ничья / пусто → null (ручной список)', () => {
    expect(resolveClarify({}, [], CAT, Q)).toEqual({ route: null, leaders: [] })
  })
  it('ключ вне каталога роли не побеждает', () => {
    expect(resolveClarify({ o: 'z' }, ['zzz'], CAT, Q)).toEqual({ route: null, leaders: [] })
    expect(resolveClarify({ o: 'y' }, [], routesForRole('creator', CAT), Q)).toEqual({ route: null, leaders: [] })
  })
  it('тот же ввод → тот же ответ', () => {
    const a = resolveClarify({ o: 'x', t: 'q' }, ['c'], CAT, Q)
    for (let i = 0; i < 5; i++) expect(resolveClarify({ o: 'x', t: 'q' }, ['c'], CAT, Q)).toEqual(a)
  })
})

describe('ответ анкеты и профиль', () => {
  it('encode/decode — круг; чужой ключ → null', () => {
    const v = encodeTaskRouteAnswer({ key: 'a', source: 'llm', text: 'контент для mortgage' })
    expect(decodeTaskRouteAnswer(v, CAT)).toEqual({ key: 'a', source: 'llm', text: 'контент для mortgage' })
    expect(decodeTaskRouteAnswer(['nope', 'llm', ''], CAT)).toBeNull()
    expect(decodeTaskRouteAnswer('a', CAT)).toBeNull()
    expect(decodeTaskRouteAnswer(['a', 'weird'], CAT)?.source).toBe('manual')
  })
  it('русло только в режиме «есть задача»; «хочу научиться» — курс по порядку', () => {
    const v = encodeTaskRouteAnswer({ key: 'a', source: 'manual', text: '' })
    expect(taskRouteFromAnswers({ V_TASK_MODE: 'task', V_TASK_ROUTE: v }, CAT)?.key).toBe('a')
    expect(taskRouteFromAnswers({ V_TASK_MODE: 'learn', V_TASK_ROUTE: v }, CAT)).toBeNull()
    expect(taskRouteFromAnswers({ V_TASK_ROUTE: v }, CAT)).toBeNull()
    expect(profileTaskRoute({ answers: JSON.stringify({ V_TASK_MODE: 'task', V_TASK_ROUTE: v }) }, CAT)?.key).toBe('a')
    expect(profileTaskRoute({ answers: '{broken' }, CAT)).toBeNull()
    expect(profileTaskRoute(null, CAT)).toBeNull()
  })
  it('текст задачи — V_OUTCOME', () => {
    expect(profileTaskText({ answers: { V_OUTCOME: '  контент   для ипотеки ' } })).toBe('контент для ипотеки')
    expect(profileTaskText({ answers: { V_OUTCOME: '!!' } })).toBeNull()
  })
  it('normalizeTaskText режет длинное и отбрасывает мусор', () => {
    expect(normalizeTaskText('x'.repeat(700))!.length).toBe(600)
    expect(normalizeTaskText('12')).toBeNull()
    expect(normalizeTaskText(5)).toBeNull()
  })
})

describe('сквозная задача по модулям', () => {
  it('шаги группируются по модулю с номерами; модуль босса — у последнего шага', () => {
    expect(routeStepsByModule(A)).toEqual({
      '04-x': [{ index: 1, step: A.steps[0] }],
      '06-x': [{ index: 2, step: A.steps[1] }, { index: 3, step: A.steps[2] }],
    })
    expect(routeFinalModule(A)).toBe('06-x')
  })
  it('fillOutcome подставляет задачу или нейтральную замену', () => {
    expect(fillOutcome(A.result.ru, 'контент', 'ru')).toBe('Итог для «контент»')
    expect(fillOutcome(A.result.en, null, 'en')).toBe('Result for "your task"')
  })
})
