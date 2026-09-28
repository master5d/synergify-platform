import { describe, it, expect } from 'vitest'
import { buildLearningPlan, profileToLearningPlan, profileWeekRoute, type LearningPlanInput } from './learning-plan'
import { buildWeekMapContent } from './week-map-content'
import type { ZoneVM } from '@/lib/rpg/types'

const base: LearningPlanInput = {
  locale: 'ru', outcome: 'запустить свой продукт', niche: 'коуч', level: 3,
  completedCount: 2, total: 9,
  steps: [{ name: 'Промпт-инжиниринг', transform: { from: 'прошу не то', to: 'формулирую точно' } }],
  experiential: ['Упражнения 1–8 — закрепи навыки (/exercises)'],
  accountability: ['напарник — ИИ для со-мышления'],
}

describe('buildLearningPlan', () => {
  it('renders the title, all 6 sections, and the variable content (ru)', () => {
    const md = buildLearningPlan(base)
    expect(md).toContain('# Личный план обучения')
    expect(md).toContain('## 🎯 Цель')
    expect(md).toContain('запустить свой продукт')
    expect(md).toContain('Дедлайн: ___ (поставь свой)')
    expect(md).toContain('## 📍 Где я сейчас')
    expect(md).toContain('пройдено 2 из 9 модулей')
    expect(md).toContain('## 📚 Шаги обучения (следующие)')
    expect(md).toContain('- Промпт-инжиниринг: из прошу не то → в формулирую точно')
    expect(md).toContain('## 🛠 Шаги через опыт')
    expect(md).toContain('- Упражнения 1–8 — закрепи навыки (/exercises)')
    expect(md).toContain('## 🤝 Кто может помочь')
    expect(md).toContain('- напарник — ИИ для со-мышления')
    expect(md).toContain('## 🔁 Ревью')
    expect(md).toContain('> Этот план — твой.')
  })

  it('uses the goal fallback when outcome is null and the all-done line when steps is empty', () => {
    const md = buildLearningPlan({ ...base, outcome: null, steps: [] })
    expect(md).toContain('— (впиши свой результат)')
    expect(md).toContain('Все модули пройдены — выбери, что углубить.')
  })

  it('renders English headers and connectives', () => {
    const md = buildLearningPlan({ ...base, locale: 'en' })
    expect(md).toContain('# Personal Learning Plan')
    expect(md).toContain('## 🎯 Goal')
    expect(md).toContain('## 🔁 Review')
    expect(md).toContain('from прошу не то → to формулирую точно')
  })
})

describe('profileToLearningPlan', () => {
  const zones: ZoneVM[] = [
    { slug: '00', order: 0, zoneName: 'Старт', questTitle: '', moduleTitle: '', durationLabel: '', status: 'completed', isNiche: false, href: '#' },
    { slug: '01', order: 1, zoneName: 'Знакомство', questTitle: '', moduleTitle: '', durationLabel: '', status: 'current', isNiche: false, href: '#', transform: { from: 'ИИ это код', to: 'четыре сдвига' } },
    { slug: '02', order: 2, zoneName: 'Сетап', questTitle: '', moduleTitle: '', durationLabel: '', status: 'todo', isNiche: false, href: '#' },
  ]
  const profile = { answers: JSON.stringify({ F3: 'стать AI-generalist' }), char_level: 4, niche: 'предприниматель', world_skin: 'wanderer' }

  it('composes outcome, status, and the current step from the profile + zones', () => {
    const md = profileToLearningPlan(profile, zones, 'ru')
    expect(md).toContain('стать AI-generalist')         // outcome from F3
    expect(md).toContain('предприниматель')              // niche
    expect(md).toContain('пройдено 1 из 3 модулей')      // 1 completed of 3 zones
    expect(md).toContain('- Знакомство: из ИИ это код → в четыре сдвига') // current zone + transform
    expect(md).toContain('/exercises')                   // course experiential default
    expect(md).toContain('/ask')                         // accountability default
  })
})

describe('«Карта недели» в плане обучения', () => {
  const zones: ZoneVM[] = [
    { slug: '00', order: 0, zoneName: 'Старт', questTitle: '', moduleTitle: '', durationLabel: '', status: 'current', isNiche: false, href: '#' },
  ]
  const ru = buildWeekMapContent('ru')
  const en = buildWeekMapContent('en')
  const mod = ru.moduleByKind
  const titles = Object.fromEntries(Object.values(mod).map(s => [s, `Название ${s}`]))
  const profileWith = (week: unknown) => ({ answers: JSON.stringify({ F3: 'цель', V_WEEK_MAP: week }), char_level: 1, world_skin: 'wanderer' })
  const full = ['ai_does|еженедельный отчёт', 'ai_helps|писать посты', 'keep|разговор с мамой']

  it('есть карта: раздел маршрута по корзинам, дело → модуль со ссылкой, своя подпись у «оставляю себе»', () => {
    const md = profileToLearningPlan(profileWith(full), zones, 'ru', titles)
    expect(md).toContain(`## 🗺 ${ru.routeHeading}`)
    expect(md).toContain(`**${ru.buckets.ai_does.label}**`)
    expect(md).toContain(`- еженедельный отчёт — ${ru.buckets.ai_does.moduleLead} Название ${mod.data} (/lessons/${mod.data}/)`)
    expect(md).toContain(`- разговор с мамой — ${ru.buckets.keep.moduleLead} Название ${mod.other} (/lessons/${mod.other}/)`)
    // порядок корзин: ИИ делает → ИИ помогает → оставляю себе; раздел — до «Шагов через опыт»
    expect(md.indexOf(ru.buckets.ai_does.label)).toBeLessThan(md.indexOf(ru.buckets.ai_helps.label))
    expect(md.indexOf(ru.buckets.ai_helps.label)).toBeLessThan(md.indexOf(ru.buckets.keep.label))
    expect(md.indexOf(ru.routeHeading)).toBeLessThan(md.indexOf('## 🛠 Шаги через опыт'))
  })

  it('EN: English labels and /en links', () => {
    const md = profileToLearningPlan(profileWith(full), zones, 'en', titles)
    expect(md).toContain(`## 🗺 ${en.routeHeading}`)
    expect(md).toContain(`(/en/lessons/${mod.data}/)`)
  })

  it('нет карты / мусор / меньше трёх дел / ничего не разложено — раздела нет', () => {
    for (const week of [undefined, 'ai_does|отчёт', ['ai_does|отчёт', 'keep|посты'], ['-|отчёт', '-|посты', '-|созвоны']]) {
      const p = profileWith(week)
      expect(profileWeekRoute(p, 'ru'), JSON.stringify(week)).toBeNull()
      expect(profileToLearningPlan(p, zones, 'ru', titles)).not.toContain(ru.routeHeading)
    }
    expect(profileWeekRoute({ answers: '{битый json' }, 'ru')).toBeNull()
    expect(profileWeekRoute(null, 'ru')).toBeNull()
  })

  it('частично разложена: маршрут по разложенным + сколько осталось без корзины', () => {
    const p = profileWith(['ai_does|еженедельный отчёт', '-|писать посты', '-|созвон с командой'])
    const route = profileWeekRoute(p, 'ru')!
    expect(route.items.map(i => i.text)).toEqual(['еженедельный отчёт'])
    expect(route.unsortedCount).toBe(2)
    const md = profileToLearningPlan(p, zones, 'ru', titles)
    expect(md).toContain('- еженедельный отчёт')
    expect(md).not.toContain('- писать посты')
    expect(md).toContain(ru.unsortedInPlan(2))
  })

  it('без переданных названий берёт moduleTitle зон, иначе слаг', () => {
    const z: ZoneVM[] = [{ ...zones[0], slug: mod.data, moduleTitle: 'Из зоны' }]
    const md = profileToLearningPlan(profileWith(full), z, 'ru')
    expect(md).toContain(`Из зоны (/lessons/${mod.data}/)`)
  })
})
