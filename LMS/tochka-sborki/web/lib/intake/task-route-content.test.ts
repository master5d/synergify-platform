import { describe, it, expect, vi } from 'vitest'
import { PACK_SLUG } from '@/lib/pack'
import { TASK_ROUTES } from '@/lib/course/task-routes'
import { requestTaskRoute, routeUnitHref, questStepLabel } from './task-route-content'
import { encodeTaskRouteAnswer } from './task-route'
import { buildLearningPlan, profileToLearningPlan, type LearningPlanInput } from './learning-plan'
import { buildDungeon } from '@/lib/dungeon/build-dungeon'
import { dungeonModuleFor } from '@/lib/dungeon/dungeon-module'
import { buildQuestLog } from '@/lib/rpg/quest-log'

const itDefault = it.runIf(PACK_SLUG === 'tochka-sborki')

function res(status: number, body: unknown) {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

describe('requestTaskRoute — деградация', () => {
  itDefault('matched из каталога роли проходит', async () => {
    const f = vi.fn().mockResolvedValue(res(200, { status: 'matched', route: 'content-pipeline' }))
    await expect(requestTaskRoute('контент для ипотеки', 'creator', f as any)).resolves.toEqual({ status: 'matched', route: 'content-pipeline' })
    const init = f.mock.calls[0][1]
    expect(f.mock.calls[0][0]).toBe('/api/intake/task-route')
    expect(JSON.parse(init.body)).toEqual({ text: 'контент для ипотеки', role: 'creator' })
  })
  itDefault('matched вне каталога роли → unavailable (ручной выбор), не выдуманное русло', async () => {
    const f = vi.fn().mockResolvedValue(res(200, { status: 'matched', route: 'support-booking-bot' }))
    await expect(requestTaskRoute('x y z', 'creator', f as any)).resolves.toEqual({ status: 'unavailable' })
  })
  itDefault('unsure фильтрует кандидатов по каталогу', async () => {
    const f = vi.fn().mockResolvedValue(res(200, { status: 'unsure', candidates: ['landing-funnel', 'nope'] }))
    await expect(requestTaskRoute('x y z', 'creator', f as any)).resolves.toEqual({ status: 'unsure', candidates: ['landing-funnel'] })
  })
  it('сеть упала / не-2xx / мусор → unavailable', async () => {
    await expect(requestTaskRoute('abc', null, vi.fn().mockRejectedValue(new Error('offline')) as any)).resolves.toEqual({ status: 'unavailable' })
    await expect(requestTaskRoute('abc', null, vi.fn().mockResolvedValue(res(502, {})) as any)).resolves.toEqual({ status: 'unavailable' })
    await expect(requestTaskRoute('abc', null, vi.fn().mockResolvedValue(res(200, { status: 'unavailable' })) as any)).resolves.toEqual({ status: 'unavailable' })
    await expect(requestTaskRoute('abc', null, vi.fn().mockResolvedValue(res(200, 'garbage')) as any)).resolves.toEqual({ status: 'unavailable' })
  })
})

describe('ссылки и подписи', () => {
  it('юнит русла → урок с локалью', () => {
    expect(routeUnitHref('06-audio-pipeline/u3-build', 'ru')).toMatch(/\/lessons\/06-audio-pipeline\/u3-build\/$/)
    expect(routeUnitHref('06-audio-pipeline/u3-build', 'en')).toMatch(/\/en\/lessons\/06-audio-pipeline\/u3-build\/$/)
  })
  it('подпись шага в квест-логе', () => {
    expect(questStepLabel(2, 'ru')).toMatch(/2/)
    expect(questStepLabel(2, 'en')).toMatch(/2/)
  })
})

describe.runIf(PACK_SLUG === 'tochka-sborki')('сквозная задача на поверхностях курса', () => {
  const route = TASK_ROUTES.find(r => r.key === 'content-pipeline')!
  const answers = {
    V_TASK_MODE: 'task',
    V_OUTCOME: 'контент для mortgage-бизнеса',
    V_TASK_ROUTE: encodeTaskRouteAnswer({ key: 'content-pipeline', source: 'llm', text: 'контент для mortgage-бизнеса' }),
  }

  it('личный план: раздел русла с шагом 0, шагами, ложной дорогой и результатом', () => {
    const base: LearningPlanInput = {
      locale: 'ru', outcome: null, niche: null, level: 1, completedCount: 0, total: 11, steps: [],
      experiential: [], accountability: [], taskRoute: route, taskText: 'контент для mortgage-бизнеса',
    }
    const md = buildLearningPlan(base)
    expect(md).toContain('Контент-пайплайн')
    expect(md).toContain('0. Шаг 0.')
    expect(md).toContain('/lessons/04-prompt-engineering/u2-spec-formula/')
    expect(md).toContain('04 → 05 → 06 → 07')
    expect(md).toContain('«контент для mortgage-бизнеса»')
    expect(buildLearningPlan({ ...base, taskRoute: null })).not.toContain('Контент-пайплайн')
  })

  it('план из профиля: «хочу научиться» — без русла', () => {
    const md = profileToLearningPlan({ answers: JSON.stringify(answers), char_level: 1 }, [], 'ru')
    expect(md).toContain('Контент-пайплайн')
    const learn = profileToLearningPlan({ answers: JSON.stringify({ ...answers, V_TASK_MODE: 'learn' }), char_level: 1 }, [], 'ru')
    expect(learn).not.toContain('Контент-пайплайн')
  })

  it('подземелье: русло заменяет NICHE_MODULE — модуль результата, этапы = шаги, босс = результат', () => {
    expect(dungeonModuleFor('coach', route)).toBe('07-tools')
    expect(dungeonModuleFor('coach', null)).toBe('04-prompt-engineering')
    const v = buildDungeon({ locale: 'ru', skin: 'slavic-myth', niche: 'coach', outcome: null, isModuleCompleted: () => true, route, taskText: 'контент для ипотеки' })
    expect(v.module).toBe('07-tools')
    expect(v.stages.map(s => s.body)).toEqual(route.steps.slice(-3).map(s => `${s.title.ru} — ${s.action.ru}`))
    expect(v.boss.body).toContain('«контент для ипотеки»')
    // Ид этапов по-прежнему в пространстве ниши — учёт пройденного не ломается.
    expect(v.boss.id).toBe('dungeon:coach:boss')
  })

  it('квест-лог: у модулей с шагом русла — подписи шагов, «ниша» — модуль результата', () => {
    const modules = { '04-prompt-engineering': { title: 'Промпт', duration: '' } } as any
    const profile = { char_class: 'healer', world_skin: 'slavic-myth', niche: 'coach', char_level: 1, legendary_title: '', answers: JSON.stringify(answers) } as any
    const vm = buildQuestLog(profile, modules, [], () => 'none', null, 'ru')
    expect(vm.zones.find(z => z.slug === '04-prompt-engineering')?.routeSteps).toEqual([{ index: 1, title: route.steps[0].title.ru }])
    expect(vm.zones.find(z => z.slug === '06-audio-pipeline')?.routeSteps?.map(s => s.index)).toEqual([3, 4])
    expect(vm.zones.find(z => z.slug === '07-tools')?.isNiche).toBe(true)
    expect(vm.zones.find(z => z.slug === '04-prompt-engineering')?.isNiche).toBe(false)
    const learn = buildQuestLog({ ...profile, answers: JSON.stringify({ ...answers, V_TASK_MODE: 'learn' }) }, modules, [], () => 'none', null, 'ru')
    expect(learn.zones.every(z => !z.routeSteps)).toBe(true)
    expect(learn.zones.find(z => z.slug === '04-prompt-engineering')?.isNiche).toBe(true)
  })
})
